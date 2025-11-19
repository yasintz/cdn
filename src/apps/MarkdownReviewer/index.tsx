import { useMemo, useEffect, useState } from 'react';
import { marked } from 'marked';
import { PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import { useMarkdownReviewerStore } from './store';
import { useFileWatcher } from './hooks/useFileWatcher';
import { useFileMode } from './hooks/useFileMode';
import { useTextSelection } from './hooks/useTextSelection';
import { useComments } from './hooks/useComments';
import { generateMarkdownExport, copyMarkdownToClipboard, downloadMarkdown } from './utils/exportUtils';
import { FileListDialog } from './components/FileListDialog';
import { TableOfContents } from './components/TableOfContents';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

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
    setMarkdownContent,
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
  } = store;

  // File watching hook
  const { isWatching, startWatching, stopWatching } = useFileWatcher(setMarkdownContent);

  // File mode hook
  const { 
    fileMode, 
    setFileMode, 
    handleFileUpload, 
    handleSelectFileForWatch,
    showFileList,
    setShowFileList,
    handleSelectNewFile,
  } = useFileMode(
    setMarkdownContent,
    startWatching,
    isWatching,
    stopWatching
  );

  // Sync file mode when watching state changes (e.g., when saved handle loads)
  useEffect(() => {
    if (isWatching && fileMode !== 'watch') {
      setFileMode('watch');
    }
  }, [isWatching, fileMode, setFileMode]);

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
    const commentsToShow = selectedHistoryId
      ? commentHistory.find(h => h.id === selectedHistoryId)?.comments || []
      : rawComments;
      
    return commentsToShow.map((comment) => ({
      ...comment,
      replies: comment.replies || [],
    }));
  }, [rawComments, commentHistory, selectedHistoryId]);
  
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
        addReplyToComment(existingComment.id, reply);
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
        addComment(newComment);
      }

      clearCommentDialog();
      clearSelection();
    }
  };

  const handleExportComments = () => {
    setShowExportDialog(true);
  };

  const handleCopyMarkdown = () => {
    const markdown = generateMarkdownExport(comments);
    copyMarkdownToClipboard(markdown);
  };

  const handleDownloadMarkdown = () => {
    const markdown = generateMarkdownExport(comments);
    downloadMarkdown(markdown);
  };

  const handleDeleteComment = (id: string) => {
    deleteComment(id);
  };

  const htmlContent = useMemo(() => {
    if (!markdownContent) return '';
    return marked.parse(markdownContent) as string;
  }, [markdownContent]);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="bg-white px-8 py-6 border-b border-gray-200 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">Markdown Reviewer</h1>
        <div className="flex justify-between items-center gap-8 flex-wrap">
          <div className="flex gap-4 items-center">
            <Label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-800">
              <input
                type="radio"
                name="fileMode"
                value="upload"
                checked={fileMode === 'upload'}
                onChange={(e) => setFileMode(e.target.value as 'upload' | 'watch')}
                className="cursor-pointer"
              />
              <span className={fileMode === 'upload' ? 'text-blue-600 font-medium' : ''}>Upload File</span>
            </Label>
            <Label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-800">
              <input
                type="radio"
                name="fileMode"
                value="watch"
                checked={fileMode === 'watch'}
                onChange={(e) => setFileMode(e.target.value as 'upload' | 'watch')}
                className="cursor-pointer"
              />
              <span className={fileMode === 'watch' ? 'text-blue-600 font-medium' : ''}>Watch File</span>
            </Label>
          </div>
          <div className="flex gap-4 items-center flex-wrap">
            {fileMode === 'upload' ? (
              <Label className="inline-block">
                <input
                  type="file"
                  accept=".md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button asChild>
                  <span className="cursor-pointer">Upload Markdown File</span>
                </Button>
              </Label>
            ) : (
              <div className="flex gap-4 items-center">
                {!isWatching ? (
                  <Button onClick={handleSelectFileForWatch} variant="default" className="bg-green-600 hover:bg-green-700">
                    Select File to Watch
                  </Button>
                ) : (
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-green-600 font-medium flex items-center gap-2">
                      🔄 Watching {markdownContent ? currentFileName : 'file'}...
                    </span>
                    <Button
                      onClick={handleSelectFileForWatch}
                      variant="secondary"
                      size="sm"
                      title="Change file"
                    >
                      📁
                    </Button>
                    <Button
                      onClick={stopWatching}
                      variant="destructive"
                      size="sm"
                    >
                      Stop Watching
                    </Button>
                  </div>
                )}
              </div>
            )}
            {comments.length > 0 && (
              <Button
                onClick={handleExportComments}
                variant="default"
                className="bg-green-600 hover:bg-green-700"
              >
                Export Comments ({comments.length})
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className={`flex-1 grid ${markdownContent && isTocExpanded ? 'grid-cols-[250px_1fr_400px]' : 'grid-cols-[1fr_400px]'} gap-6 p-6 overflow-hidden`}>
        {markdownContent && isTocExpanded && (
          <div className="overflow-hidden">
            <TableOfContents htmlContent={htmlContent} previewRef={previewRef} />
          </div>
        )}

        <Card className="bg-white rounded-lg p-6 shadow-sm flex flex-col overflow-hidden">
          <CardHeader className="p-0 pb-4">
            <div className="flex items-center gap-2 border-b-2 border-blue-600 pb-2">
              {markdownContent && (
                <button
                  onClick={() => setIsTocExpanded(!isTocExpanded)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title={isTocExpanded ? 'Hide table of contents' : 'Show table of contents'}
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
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-0">
            {markdownContent ? (
              <div className="flex-1 relative overflow-auto">
                <div
                  ref={previewRef}
                  className="flex-1 overflow-auto p-4 leading-relaxed select-text cursor-text prose prose-sm max-w-none [&_h1]:mt-6 [&_h1]:mb-2 [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:leading-tight [&_h1]:border-b [&_h1]:border-gray-200 [&_h1]:pb-1 [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:leading-tight [&_h2]:border-b [&_h2]:border-gray-200 [&_h2]:pb-1 [&_h3]:mt-4 [&_h3]:mb-1 [&_h3]:text-lg [&_h3]:font-semibold [&_h4]:mt-4 [&_h4]:mb-1 [&_h4]:text-base [&_h5]:mt-4 [&_h5]:mb-1 [&_h5]:text-sm [&_h6]:mt-4 [&_h6]:mb-1 [&_h6]:text-xs [&_h6]:text-gray-500 [&_p]:mb-4 [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&_pre]:bg-gray-100 [&_pre]:p-4 [&_pre]:rounded-md [&_pre]:overflow-x-auto [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:text-gray-600 [&_blockquote]:my-4 [&_ul]:pl-8 [&_ul]:mb-4 [&_ul]:list-disc [&_ol]:pl-8 [&_ol]:mb-4 [&_ol]:list-decimal [&_li]:mb-1 [&_a]:text-blue-600 [&_a]:no-underline hover:[&_a]:underline [&_img]:max-w-full [&_img]:h-auto [&_table]:border-collapse [&_table]:w-full [&_table]:mb-4 [&_th]:border [&_th]:border-gray-300 [&_th]:px-4 [&_th]:py-2 [&_th]:text-left [&_th]:bg-gray-100 [&_th]:font-semibold [&_td]:border [&_td]:border-gray-300 [&_td]:px-4 [&_td]:py-2 [&_hr]:border-0 [&_hr]:border-t-2 [&_hr]:border-gray-200 [&_hr]:my-8 [&_::selection]:bg-blue-200"
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                  onMouseUp={handleTextSelection}
                />
                {commentIconPosition && (
                  <button
                    className="absolute w-9 h-9 rounded-full bg-blue-600 text-white border-2 border-white shadow-lg cursor-pointer flex items-center justify-center text-xl transition-all z-10 animate-in fade-in zoom-in hover:bg-blue-700 hover:scale-110 hover:shadow-xl active:scale-95"
                    style={{
                      top: `${commentIconPosition.top}px`,
                      left: `${commentIconPosition.left}px`,
                    }}
                    onClick={handleCommentIconClickWithDialog}
                    onMouseDown={(e) => e.preventDefault()}
                    title="Add comment"
                  >
                    💬
                  </button>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 italic">
                <p>Upload a markdown file to start reviewing</p>
              </div>
            )}
          </CardContent>
        </Card>

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
                    <SelectItem value="current">Current ({rawComments.length})</SelectItem>
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
                  <div key={comment.id} className="border border-gray-200 rounded-md p-4 bg-gray-50 transition-shadow hover:shadow-md">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-600 font-semibold bg-blue-100 px-2 py-1 rounded">
                        Line {comment.line}, Col {comment.column}
                      </span>
                      {!isViewingHistory && (
                        <button
                          className="bg-transparent border-none text-xl text-gray-400 cursor-pointer p-0 w-6 h-6 flex items-center justify-center rounded transition-all hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleDeleteComment(comment.id)}
                          title="Delete comment"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    <div className="text-sm text-gray-700 italic mb-2 px-2 py-2 bg-white border-l-4 border-blue-600 rounded">
                      "{comment.selectedText}"
                    </div>

                    {editingCommentId === comment.id && !editingReplyId ? (
                      <div className="mt-2">
                        <textarea
                          className="w-full min-h-20 p-2 border border-gray-300 rounded text-sm resize-y mb-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          autoFocus
                        />
                        <div className="flex justify-end gap-2">
                          <Button onClick={handleCancelEdit} variant="ghost" size="sm">Cancel</Button>
                          <Button
                            onClick={() => handleSaveEdit(updateComment, updateReply)}
                            disabled={!editText.trim()}
                            size="sm"
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm text-gray-800 mb-2 leading-relaxed">
                          {comment.text}
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-400">
                            {new Date(comment.timestamp).toLocaleString()}
                          </span>
                          {!isViewingHistory && (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="xs"
                                onClick={() =>
                                  handleStartEdit(comment.id, comment.text)
                                }
                              >
                                ✏️ Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="xs"
                                onClick={() => handleStartReply(comment.id)}
                              >
                                💬 Reply
                              </Button>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {comment.replies.length > 0 && (
                      <div className="mt-4 pl-4 border-l-4 border-blue-100">
                        {comment.replies.map((reply) => (
                          <div
                            key={reply.id}
                            className="p-3 bg-gray-50 rounded mb-2 last:mb-0"
                          >
                            {editingCommentId === comment.id &&
                            editingReplyId === reply.id ? (
                              <div>
                                <textarea
                                  className="w-full min-h-20 p-2 border border-gray-300 rounded text-sm resize-y mb-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  autoFocus
                                />
                                <div className="flex justify-end gap-2">
                                  <Button onClick={handleCancelEdit} variant="ghost" size="sm">Cancel</Button>
                                  <Button onClick={() => handleSaveEdit(updateComment, updateReply)} size="sm">Save</Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="text-sm text-gray-800 leading-relaxed mb-2">
                                  {reply.text}
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-gray-400">
                                    {new Date(reply.timestamp).toLocaleString()}
                                  </span>
                                  {!isViewingHistory && (
                                    <div className="flex gap-1">
                                      <button
                                        className="bg-transparent border-none p-1 cursor-pointer text-sm opacity-60 transition-opacity hover:opacity-100"
                                        onClick={() =>
                                          handleStartEditReply(
                                            comment.id,
                                            reply.id,
                                            reply.text
                                          )
                                        }
                                      >
                                        ✏️
                                      </button>
                                      <button
                                        className="bg-transparent border-none p-1 cursor-pointer text-sm opacity-60 transition-opacity hover:opacity-100"
                                        onClick={() =>
                                          deleteReply(comment.id, reply.id)
                                        }
                                      >
                                        🗑️
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {!isViewingHistory && replyingToCommentId === comment.id && (
                      <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                        <textarea
                          className="w-full min-h-20 p-2 border border-gray-300 rounded text-sm resize-y mb-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write a reply..."
                          autoFocus
                        />
                        <div className="flex justify-end gap-2">
                          <Button onClick={handleCancelReply} variant="ghost" size="sm">Cancel</Button>
                          <Button
                            onClick={() => handleSaveReply(comment.id, addReplyToComment)}
                            disabled={!replyText.trim()}
                            size="sm"
                          >
                            Reply
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Comment</DialogTitle>
          </DialogHeader>
          <div className="mb-4 p-3 bg-gray-50 rounded border-l-4 border-blue-600">
            <strong className="block mb-2 text-sm text-gray-600">Selected text:</strong>
            <p className="m-0 italic text-gray-800">"{selectedText}"</p>
          </div>
          <div className="text-sm text-gray-600 mb-4 font-medium">
            Position: Line {selectionPosition?.line}, Column {selectionPosition?.column}
          </div>
          <textarea
            className="w-full min-h-[120px] p-3 border border-gray-300 rounded text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Enter your comment..."
            autoFocus
          />
          <DialogFooter>
            <Button onClick={clearCommentDialog} variant="ghost">Cancel</Button>
            <Button
              onClick={handleAddComment}
              disabled={!commentText.trim()}
            >
              Save Comment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader className="flex flex-row justify-between items-center pb-4 border-b bg-gray-50 -mx-6 -mt-6 px-6 pt-6 rounded-t-lg">
            <DialogTitle>Export Comments</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto p-8 bg-gray-50 -mx-6">
            <pre className="m-0 p-6 bg-white border border-gray-200 rounded-md font-mono text-sm leading-relaxed whitespace-pre-wrap break-words text-gray-800">
              {generateMarkdownExport(comments)}
            </pre>
          </div>
          <DialogFooter className="flex gap-4 pt-4 border-t bg-gray-50 -mx-6 -mb-6 px-6 pb-6 rounded-b-lg">
            <Button
              onClick={handleCopyMarkdown}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              📋 Copy to Clipboard
            </Button>
            <Button
              onClick={handleDownloadMarkdown}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              💾 Download as .md
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
