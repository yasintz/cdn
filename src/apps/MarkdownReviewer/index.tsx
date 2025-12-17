import { useMemo, useEffect, useState, useRef } from 'react';
import { marked } from 'marked';
import { MessageSquare, PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import { useMarkdownReviewerStore } from './store';
import { useFileWatcher } from './hooks/useFileWatcher';
import { useFolderWatcher } from './hooks/useFolderWatcher';
import { useFileMode } from './hooks/useFileMode';
import { useTextSelection } from './hooks/useTextSelection';
import { useComments } from './hooks/useComments';
import { FileListDialog } from './components/FileListDialog';
import { FileTree } from './components/FileTree';
import { TableOfContents } from './components/TableOfContents';
import { Header } from './components/Header';
import { AddCommentDialog } from './components/AddCommentDialog';
import { ExportCommentsDialog } from './components/ExportCommentsDialog';
import { CommentItem } from './components/CommentItem';
import { MarkdownPreview } from './components/MarkdownPreview';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MarkdownReviewer() {
  console.log('MarkdownReviewer');

  const [isTocExpanded, setIsTocExpanded] = useState(true);

  const store = useMarkdownReviewerStore();
  const {
    markdownContent,
    currentFileName,
    comments: rawComments,
    commentHistory,
    selectedHistoryId,
    selectedText: storeSelectedText,
    showCommentDialog,
    showExportDialog,
    commentText,
    selectionPosition: storeSelectionPosition,
    commentsSidebarCollapsed,
    isFolderMode,
    folderHandle: storeFolderHandle,
    folderName,
    fileTree,
    currentFilePath,
    setMarkdownContent,
    setFolderMode,
    setCurrentFile,
    addComment,
    addReplyToComment,
    deleteComment,
    deleteReply,
    updateComment,
    updateReply,
    setSelectedText,
    setShowCommentDialog,
    setShowExportDialog,
    setCommentText,
    setSelectionPosition,
    setSelectedHistoryId,
    clearCommentDialog,
    setCommentsSidebarCollapsed,
    getCurrentFileComments,
  } = store;

  // File watching hook (for single file mode)
  const { isWatching, startWatching, stopWatching } = useFileWatcher(setMarkdownContent);

  // Folder watching hook (for folder mode)
  const folderWatcher = useFolderWatcher();
  const syncedHandleRef = useRef<FileSystemDirectoryHandle | null>(null);

  // Sync store's folderHandle with hook when it's available
  useEffect(() => {
    if (storeFolderHandle && storeFolderHandle !== syncedHandleRef.current) {
      folderWatcher.startWatching(storeFolderHandle);
      syncedHandleRef.current = storeFolderHandle;
    } else if (!storeFolderHandle && syncedHandleRef.current) {
      folderWatcher.stopWatching();
      syncedHandleRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeFolderHandle]);

  // Handle folder selection
  const handleFolderSelected = async (
    folderHandle: FileSystemDirectoryHandle,
    folderName: string,
    tree: any[]
  ) => {
    await folderWatcher.startWatching(folderHandle);
    setFolderMode(folderHandle, folderName, tree);
  };

  // File mode hook
  const { 
    fileMode, 
    setFileMode, 
    handleFileUpload, 
    handleSelectFileForWatch,
    handleSelectFolder,
    showFileList,
    setShowFileList,
    handleSelectNewFile,
  } = useFileMode(
    setMarkdownContent,
    startWatching,
    handleFolderSelected,
    isWatching,
    stopWatching
  );

  // Handle file selection in folder mode
  const handleFileSelect = async (filePath: string) => {
    if (!isFolderMode) return;

    // Use store's folderHandle as fallback if hook doesn't have it
    const handleToUse = folderWatcher.folderHandle || storeFolderHandle;
    if (!handleToUse) {
      alert('Error loading file: No folder selected. Please select a folder again.');
      // Reset folder mode since handle is missing
      setFolderMode(null, '', []);
      setFileMode('upload');
      return;
    }

    // If hook doesn't have the handle, sync it
    if (!folderWatcher.folderHandle && storeFolderHandle) {
      await folderWatcher.startWatching(storeFolderHandle);
    }

    const result = await folderWatcher.loadFile(filePath);
    if (result.error) {
      alert(`Error loading file: ${result.error}`);
      return;
    }

    if (result.content !== null) {
      setCurrentFile(filePath);
      setMarkdownContent(result.content, result.fileName);
    }
  };

  // Sync file mode when watching state changes (e.g., when saved handle loads)
  useEffect(() => {
    if (isWatching && fileMode !== 'watch') {
      setFileMode('watch');
    }
  }, [isWatching, fileMode, setFileMode]);

  // Reset folder mode if we're in folder mode but don't have a handle (e.g., after page reload)
  useEffect(() => {
    if (isFolderMode && !storeFolderHandle && fileTree.length === 0) {
      // Folder handle was lost (can't be persisted), reset folder mode
      setFolderMode(null, '', []);
      setFileMode('upload');
    }
  }, [isFolderMode, storeFolderHandle, fileTree.length, setFolderMode, setFileMode]);

  // Text selection hook
  const {
    previewRef,
    commentIconPosition,
    selectedText: hookSelectedText,
    selectionPosition: hookSelectionPosition,
    handleTextSelection,
    handleCommentIconClick,
    clearSelection,
  } = useTextSelection((text, position) => {
    setSelectedText(text);
    setSelectionPosition(position);
  }, markdownContent);

  // Use hook values, fallback to store values for compatibility
  const selectedText = hookSelectedText || storeSelectedText;
  const selectionPosition = hookSelectionPosition || storeSelectionPosition;

  // Comments hook
  const {
    editingCommentId,
    editingReplyId,
    editText,
    replyingToCommentId,
    replyText,
    setEditText,
    setReplyText,
    handleStartEdit,
    handleStartEditReply,
    handleSaveEdit,
    handleCancelEdit,
    handleStartReply,
    handleSaveReply,
    handleCancelReply,
  } = useComments();

  // Ensure all comments have replies array (migration for old data)
  const comments = useMemo(() => {
    const currentComments = isFolderMode ? getCurrentFileComments() : rawComments;
    const commentsToShow = selectedHistoryId
      ? commentHistory.find(h => h.id === selectedHistoryId)?.comments || []
      : currentComments;
      
    return commentsToShow.map((comment) => ({
      ...comment,
      replies: comment.replies || [],
    }));
  }, [rawComments, commentHistory, selectedHistoryId, isFolderMode, getCurrentFileComments]);
  
  const isViewingHistory = selectedHistoryId !== null;

  const handleCommentIconClickWithDialog = (e: React.MouseEvent) => {
    handleCommentIconClick(e);
    setShowCommentDialog(true);
  };

  const handleAddComment = () => {
    if (commentText.trim() && selectedText && selectionPosition) {
      const existingComment = comments.find(
        (c) =>
          c.selectedText === selectedText &&
          c.line === selectionPosition.line &&
          c.column === selectionPosition.column
      );

      if (existingComment) {
        const reply = {
          id: Date.now().toString(),
          text: commentText,
          timestamp: Date.now(),
        };
        addReplyToComment(existingComment.id, reply, currentFilePath || undefined);
      } else {
        const newComment = {
          id: Date.now().toString(),
          text: commentText,
          selectedText: selectedText,
          line: selectionPosition.line,
          column: selectionPosition.column,
          timestamp: Date.now(),
          replies: [],
        };
        addComment(newComment, currentFilePath || undefined);
      }

      clearCommentDialog();
      clearSelection();
    }
  };

  const handleExportComments = () => {
    setShowExportDialog(true);
  };

  const handleCloseFolder = () => {
    folderWatcher.stopWatching();
    setFolderMode(null, '', []);
    setFileMode('upload');
  };

  const handleDeleteComment = (id: string) => {
    deleteComment(id, currentFilePath || undefined);
  };

  const htmlContent = useMemo(() => {
    if (!markdownContent) return '';
    return marked.parse(markdownContent) as string;
  }, [markdownContent]);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Header
        fileMode={fileMode}
        setFileMode={setFileMode}
        isFolderMode={isFolderMode}
        isWatching={isWatching}
        folderName={folderName}
        markdownContent={markdownContent}
        currentFileName={currentFileName}
        commentsCount={comments.length}
        handleFileUpload={handleFileUpload}
        handleSelectFolder={handleSelectFolder}
        handleSelectFileForWatch={handleSelectFileForWatch}
        stopWatching={stopWatching}
        handleCloseFolder={handleCloseFolder}
        handleExportComments={handleExportComments}
      />

      <div className={`flex-1 grid gap-6 p-6 overflow-hidden ${
        isTocExpanded && isFolderMode && fileTree.length > 0 && markdownContent && !commentsSidebarCollapsed
          ? 'grid-cols-[250px_1fr_400px]'
          : isTocExpanded && isFolderMode && fileTree.length > 0 && markdownContent && commentsSidebarCollapsed
          ? 'grid-cols-[250px_1fr]'
          : isTocExpanded && isFolderMode && fileTree.length > 0 && !markdownContent
          ? 'grid-cols-[250px_1fr]'
          : isTocExpanded && markdownContent && !commentsSidebarCollapsed
          ? 'grid-cols-[250px_1fr_400px]'
          : isTocExpanded && markdownContent && commentsSidebarCollapsed
          ? 'grid-cols-[250px_1fr]'
          : !isTocExpanded && markdownContent && !commentsSidebarCollapsed
          ? 'grid-cols-[1fr_400px]'
          : !isTocExpanded && markdownContent && commentsSidebarCollapsed
          ? 'grid-cols-1'
          : commentsSidebarCollapsed
          ? 'grid-cols-1'
          : 'grid-cols-[1fr_400px]'
      }`}>
        {isTocExpanded && ((isFolderMode && fileTree.length > 0) || markdownContent) ? (
          <div className="h-full overflow-hidden flex flex-col gap-6">
            {isFolderMode && fileTree.length > 0 && (
              <div className="h-1/2 overflow-hidden flex-shrink-0">
                <FileTree
                  fileTree={fileTree}
                  currentFilePath={currentFilePath}
                  onFileSelect={handleFileSelect}
                />
              </div>
            )}
            {markdownContent && (
              <div className={`overflow-hidden ${isFolderMode && fileTree.length > 0 ? 'h-1/2 flex-shrink-0' : 'flex-1'}`}>
                <TableOfContents htmlContent={htmlContent} previewRef={previewRef} />
              </div>
            )}
          </div>
        ) : null}

        <Card className="bg-white rounded-lg p-6 shadow-sm flex flex-col overflow-hidden">
          <CardHeader className="p-0 pb-4">
            <div className="flex items-center justify-between border-b-2 border-blue-600 pb-2">
              <div className="flex items-center gap-2">
                {markdownContent && (
                  <button
                    onClick={() => setIsTocExpanded(!isTocExpanded)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title={isTocExpanded ? 'Hide left sidebar' : 'Show left sidebar'}
                  >
                    {isTocExpanded ? (
                      <PanelLeftClose className="w-5 h-5 text-gray-600" />
                    ) : (
                      <PanelLeftOpen className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                )}
                <CardTitle className="text-lg text-gray-800">Preview</CardTitle>
              </div>
              <button
                onClick={() => setCommentsSidebarCollapsed(!commentsSidebarCollapsed)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title={commentsSidebarCollapsed ? 'Show comments sidebar' : 'Hide comments sidebar'}
              >
                {commentsSidebarCollapsed ? (
                  <MessageSquare className="w-5 h-5 text-gray-600" />
                ) : (
                  <MessageSquare className="w-5 h-5 text-gray-600" fill="currentColor" />
                )}
              </button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-0">
            <MarkdownPreview
              htmlContent={htmlContent}
              previewRef={previewRef}
              commentIconPosition={commentIconPosition}
              isFolderMode={isFolderMode}
              fileTreeLength={fileTree.length}
              onTextSelection={handleTextSelection}
              onCommentIconClick={handleCommentIconClickWithDialog}
            />
          </CardContent>
        </Card>

        {!commentsSidebarCollapsed && (
          <Card className="bg-white rounded-lg p-6 shadow-sm flex flex-col overflow-hidden">
          <CardHeader className="p-0 pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg text-gray-800 border-b-2 border-blue-600 pb-2 m-0">Comments</CardTitle>
              {commentHistory.length > 0 && (
                <Select
                  value={selectedHistoryId || 'current'}
                  onValueChange={(value) => {
                    if (value === 'current') {
                      setSelectedHistoryId(null);
                    } else {
                      setSelectedHistoryId(value);
                    }
                  }}
                >
                  <SelectTrigger className="w-[200px] h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Current ({comments.length})</SelectItem>
                    {commentHistory
                      .sort((a, b) => b.savedAt - a.savedAt)
                      .map((history) => (
                        <SelectItem key={history.id} value={history.id}>
                          {new Date(history.savedAt).toLocaleString()} ({history.comments.length})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
            {isViewingHistory && (
              <div className="bg-yellow-50 border border-yellow-400 text-yellow-800 px-3 py-2 rounded mb-4 text-sm text-center">
                📜 Viewing history - Comments are read-only
              </div>
            )}
            
            {comments.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 italic">
                <p>
                  {isViewingHistory 
                    ? 'No comments in this history.'
                    : 'No comments yet. Select text in the preview to add comments.'}
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto flex flex-col gap-4">
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    isViewingHistory={isViewingHistory}
                    isEditing={editingCommentId === comment.id}
                    editingReplyId={editingReplyId}
                    replyingToCommentId={replyingToCommentId}
                    editText={editText}
                    replyText={replyText}
                    onEditTextChange={setEditText}
                    onReplyTextChange={setReplyText}
                    onStartEdit={handleStartEdit}
                    onStartEditReply={handleStartEditReply}
                    onSaveEdit={() => handleSaveEdit(
                      (id, text) => updateComment(id, text, currentFilePath || undefined),
                      (commentId, replyId, text) => updateReply(commentId, replyId, text, currentFilePath || undefined)
                    )}
                    onCancelEdit={handleCancelEdit}
                    onStartReply={handleStartReply}
                    onSaveReply={() => handleSaveReply(
                      comment.id,
                      (commentId, reply) => addReplyToComment(commentId, reply, currentFilePath || undefined)
                    )}
                    onCancelReply={handleCancelReply}
                    onDeleteComment={handleDeleteComment}
                    onDeleteReply={(commentId, replyId) => deleteReply(commentId, replyId, currentFilePath || undefined)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        )}
      </div>

      <AddCommentDialog
        open={showCommentDialog}
        onOpenChange={setShowCommentDialog}
        selectedText={selectedText}
        selectionPosition={selectionPosition}
        commentText={commentText}
        onCommentTextChange={setCommentText}
        onSave={handleAddComment}
        onCancel={clearCommentDialog}
      />

      <ExportCommentsDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        comments={comments}
      />

      <FileListDialog
        isOpen={showFileList}
        onClose={() => setShowFileList(false)}
        onSelectFile={async (handle) => {
          await startWatching(handle);
          setFileMode('watch');
        }}
        onSelectNewFile={handleSelectNewFile}
      />
    </div>
  );
}

export { MarkdownReviewer as Component };
