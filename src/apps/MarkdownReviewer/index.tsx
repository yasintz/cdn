import { useMemo, useEffect, useRef, useState } from 'react';
import { MarkdownViewer } from '@yasintz/md-viewer';
import '@yasintz/md-viewer/styles';
import type { Comment, CommentReply, ComponentVisibilityConfig } from '@yasintz/md-viewer';
import { useMarkdownReviewerStore } from './store';
import { useFileWatcher } from './hooks/useFileWatcher';
import { useFolderWatcher } from './hooks/useFolderWatcher';
import { useFileMode } from './hooks/useFileMode';
import { FileListDialog } from './components/FileListDialog';
import { Header } from './components/Header';

export default function MarkdownReviewer() {
  console.log('MarkdownReviewer');

  const store = useMarkdownReviewerStore();
  const {
    markdownContent,
    currentFileName,
    comments: rawComments,
    commentHistory,
    selectedHistoryId,
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
    getCurrentFileComments,
  } = store;

  // File watching hook (for single file mode)
  const { isWatching, startWatching, stopWatching } =
    useFileWatcher(setMarkdownContent);

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
      alert(
        'Error loading file: No folder selected. Please select a folder again.'
      );
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
  }, [
    isFolderMode,
    storeFolderHandle,
    fileTree.length,
    setFolderMode,
    setFileMode,
  ]);

  // Ensure all comments have replies array (migration for old data)
  const comments = useMemo(() => {
    const currentComments = isFolderMode
      ? getCurrentFileComments()
      : rawComments;
    const commentsToShow = selectedHistoryId
      ? commentHistory.find((h) => h.id === selectedHistoryId)?.comments || []
      : currentComments;

    return commentsToShow.map((comment) => ({
      ...comment,
      replies: comment.replies || [],
    }));
  }, [
    rawComments,
    commentHistory,
    selectedHistoryId,
    isFolderMode,
    getCurrentFileComments,
  ]);

  const handleCommentAdd = (comment: Comment) => {
    addComment(comment, currentFilePath || undefined);
  };

  const handleCommentDelete = (id: string) => {
    deleteComment(id, currentFilePath || undefined);
  };

  const handleCommentUpdate = (id: string, text: string) => {
    updateComment(id, text, currentFilePath || undefined);
  };

  const handleCommentReply = (commentId: string, reply: CommentReply) => {
    addReplyToComment(commentId, reply, currentFilePath || undefined);
  };

  const handleReplyUpdate = (
    commentId: string,
    replyId: string,
    text: string
  ) => {
    updateReply(commentId, replyId, text, currentFilePath || undefined);
  };

  const handleReplyDelete = (commentId: string, replyId: string) => {
    deleteReply(commentId, replyId, currentFilePath || undefined);
  };

  const handleCloseFolder = () => {
    folderWatcher.stopWatching();
    setFolderMode(null, '', []);
    setFileMode('upload');
  };

  // Panel visibility state
  const [fileTreeOpen, setFileTreeOpen] = useState(true);
  const [tableOfContentsOpen, setTableOfContentsOpen] = useState(true);
  const [commentsSidebarOpen, setCommentsSidebarOpen] = useState(true);

  // Panel visibility configs
  const fileTreeConfig: ComponentVisibilityConfig = {
    open: fileTreeOpen,
    onOpenChange: setFileTreeOpen,
    showCloseIcon: true,
  };

  const tableOfContentsConfig: ComponentVisibilityConfig = {
    open: tableOfContentsOpen,
    onOpenChange: setTableOfContentsOpen,
    showCloseIcon: true,
  };

  const commentsSidebarConfig: ComponentVisibilityConfig = {
    open: commentsSidebarOpen,
    onOpenChange: setCommentsSidebarOpen,
    showCloseIcon: true,
  };

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
        handleFileUpload={handleFileUpload}
        handleSelectFolder={handleSelectFolder}
        handleSelectFileForWatch={handleSelectFileForWatch}
        stopWatching={stopWatching}
        handleCloseFolder={handleCloseFolder}
      />

      <MarkdownViewer
        folderTree={fileTree}
        markdownContent={markdownContent}
        comments={comments}
        onCommentAdd={handleCommentAdd}
        onCommentDelete={handleCommentDelete}
        onCommentUpdate={handleCommentUpdate}
        onCommentReply={handleCommentReply}
        onReplyUpdate={handleReplyUpdate}
        onReplyDelete={handleReplyDelete}
        selectedFilePath={currentFilePath}
        onFileSelect={handleFileSelect}
        fileTreeConfig={fileTreeConfig}
        tableOfContentsConfig={tableOfContentsConfig}
        commentsSidebarConfig={commentsSidebarConfig}
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
