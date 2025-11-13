import { useMemo, useEffect } from 'react';
import { marked } from 'marked';
import { useMarkdownReviewerStore } from './store';
import { useFileWatcher } from './hooks/useFileWatcher';
import { useFileMode } from './hooks/useFileMode';
import { useTextSelection } from './hooks/useTextSelection';
import { useComments } from './hooks/useComments';
import { generateMarkdownExport, copyMarkdownToClipboard, downloadMarkdown } from './utils/exportUtils';
import './style.scss';

export default function MarkdownReviewer() {
  console.log('MarkdownReviewer');
  
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
  const { fileMode, setFileMode, handleFileUpload, handleSelectFileForWatch } = useFileMode(
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
    return marked(markdownContent);
  }, [markdownContent]);

  return (
    <div className="markdown-reviewer">
      <div className="markdown-reviewer__header">
        <h1>Markdown Reviewer</h1>
        <div className="markdown-reviewer__header-content">
          <div className="markdown-reviewer__mode-selector">
            <label className="markdown-reviewer__mode-option">
              <input
                type="radio"
                name="fileMode"
                value="upload"
                checked={fileMode === 'upload'}
                onChange={(e) => setFileMode(e.target.value as 'upload' | 'watch')}
              />
              <span>Upload File</span>
            </label>
            <label className="markdown-reviewer__mode-option">
              <input
                type="radio"
                name="fileMode"
                value="watch"
                checked={fileMode === 'watch'}
                onChange={(e) => setFileMode(e.target.value as 'upload' | 'watch')}
              />
              <span>Watch File</span>
            </label>
          </div>
          <div className="markdown-reviewer__actions">
            {fileMode === 'upload' ? (
              <label className="markdown-reviewer__upload-btn">
                <input
                  type="file"
                  accept=".md"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                Upload Markdown File
              </label>
            ) : (
              <div className="markdown-reviewer__watch-actions">
                {!isWatching ? (
                  <button
                    className="markdown-reviewer__watch-btn"
                    onClick={handleSelectFileForWatch}
                  >
                    Select File to Watch
                  </button>
                ) : (
                  <div className="markdown-reviewer__watching-info">
                    <span className="markdown-reviewer__watching-indicator">
                      🔄 Watching {markdownContent ? currentFileName : 'file'}...
                    </span>
                    <button
                      className="markdown-reviewer__stop-btn"
                      onClick={stopWatching}
                    >
                      Stop Watching
                    </button>
                  </div>
                )}
              </div>
            )}
            {comments.length > 0 && (
              <button
                className="markdown-reviewer__export-btn"
                onClick={handleExportComments}
              >
                Export Comments ({comments.length})
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="markdown-reviewer__content">
        <div className="markdown-reviewer__preview-section">
          <h2>Preview</h2>
          {markdownContent ? (
            <div className="markdown-reviewer__preview-wrapper">
              <div
                ref={previewRef}
                className="markdown-reviewer__preview"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
                onMouseUp={handleTextSelection}
              />
              {commentIconPosition && (
                <button
                  className="markdown-reviewer__comment-icon"
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
            <div className="markdown-reviewer__empty">
              <p>Upload a markdown file to start reviewing</p>
            </div>
          )}
        </div>

        <div className="markdown-reviewer__comments-section">
          <div className="markdown-reviewer__comments-header">
            <h2>Comments</h2>
            {commentHistory.length > 0 && (
              <select
                className="markdown-reviewer__history-select"
                value={selectedHistoryId || 'current'}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'current') {
                    setSelectedHistoryId(null);
                  } else {
                    setSelectedHistoryId(value);
                  }
                }}
              >
                <option value="current">Current ({rawComments.length})</option>
                {commentHistory
                  .sort((a, b) => b.savedAt - a.savedAt)
                  .map((history) => (
                    <option key={history.id} value={history.id}>
                      {new Date(history.savedAt).toLocaleString()} ({history.comments.length})
                    </option>
                  ))}
              </select>
            )}
          </div>
          
          {isViewingHistory && (
            <div className="markdown-reviewer__history-banner">
              📜 Viewing history - Comments are read-only
            </div>
          )}
          
          {comments.length === 0 ? (
            <div className="markdown-reviewer__empty">
              <p>
                {isViewingHistory 
                  ? 'No comments in this history.'
                  : 'No comments yet. Select text in the preview to add comments.'}
              </p>
            </div>
          ) : (
            <div className="markdown-reviewer__comments-list">
              {comments.map((comment) => (
                <div key={comment.id} className="markdown-reviewer__comment">
                  <div className="markdown-reviewer__comment-header">
                    <span className="markdown-reviewer__comment-position">
                      Line {comment.line}, Col {comment.column}
                    </span>
                    {!isViewingHistory && (
                      <button
                        className="markdown-reviewer__comment-delete"
                        onClick={() => handleDeleteComment(comment.id)}
                        title="Delete comment"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <div className="markdown-reviewer__comment-selected">
                    "{comment.selectedText}"
                  </div>

                  {editingCommentId === comment.id && !editingReplyId ? (
                    <div className="markdown-reviewer__comment-edit">
                      <textarea
                        className="markdown-reviewer__comment-edit-textarea"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        autoFocus
                      />
                      <div className="markdown-reviewer__comment-edit-actions">
                        <button onClick={handleCancelEdit}>Cancel</button>
                        <button
                          onClick={() => handleSaveEdit(updateComment, updateReply)}
                          disabled={!editText.trim()}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="markdown-reviewer__comment-text">
                        {comment.text}
                      </div>
                      <div className="markdown-reviewer__comment-footer">
                        <span className="markdown-reviewer__comment-timestamp">
                          {new Date(comment.timestamp).toLocaleString()}
                        </span>
                        {!isViewingHistory && (
                          <div className="markdown-reviewer__comment-actions">
                            <button
                              className="markdown-reviewer__comment-action-btn"
                              onClick={() =>
                                handleStartEdit(comment.id, comment.text)
                              }
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="markdown-reviewer__comment-action-btn"
                              onClick={() => handleStartReply(comment.id)}
                            >
                              💬 Reply
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {comment.replies.length > 0 && (
                    <div className="markdown-reviewer__comment-replies">
                      {comment.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="markdown-reviewer__comment-reply"
                        >
                          {editingCommentId === comment.id &&
                          editingReplyId === reply.id ? (
                            <div className="markdown-reviewer__comment-edit">
                              <textarea
                                className="markdown-reviewer__comment-edit-textarea"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                autoFocus
                              />
                              <div className="markdown-reviewer__comment-edit-actions">
                                <button onClick={handleCancelEdit}>
                                  Cancel
                                </button>
                                <button onClick={() => handleSaveEdit(updateComment, updateReply)}>Save</button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="markdown-reviewer__comment-reply-text">
                                {reply.text}
                              </div>
                              <div className="markdown-reviewer__comment-reply-footer">
                                <span className="markdown-reviewer__comment-timestamp">
                                  {new Date(reply.timestamp).toLocaleString()}
                                </span>
                                {!isViewingHistory && (
                                  <div className="markdown-reviewer__comment-reply-actions">
                                    <button
                                      className="markdown-reviewer__comment-action-btn"
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
                                      className="markdown-reviewer__comment-action-btn"
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
                    <div className="markdown-reviewer__comment-reply-input">
                      <textarea
                        className="markdown-reviewer__comment-edit-textarea"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        autoFocus
                      />
                      <div className="markdown-reviewer__comment-edit-actions">
                        <button onClick={handleCancelReply}>Cancel</button>
                        <button
                          onClick={() => handleSaveReply(comment.id, addReplyToComment)}
                          disabled={!replyText.trim()}
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCommentDialog && (
        <div
          className="markdown-reviewer__dialog-overlay"
          onClick={() => setShowCommentDialog(false)}
        >
          <div
            className="markdown-reviewer__dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Add Comment</h3>
            <div className="markdown-reviewer__dialog-selected">
              <strong>Selected text:</strong>
              <p>"{selectedText}"</p>
            </div>
            <div className="markdown-reviewer__dialog-position">
              Position: Line {selectionPosition?.line}, Column{' '}
              {selectionPosition?.column}
            </div>
            <textarea
              className="markdown-reviewer__dialog-textarea"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Enter your comment..."
              autoFocus
            />
            <div className="markdown-reviewer__dialog-actions">
              <button
                className="markdown-reviewer__dialog-cancel"
                onClick={clearCommentDialog}
              >
                Cancel
              </button>
              <button
                className="markdown-reviewer__dialog-save"
                onClick={handleAddComment}
                disabled={!commentText.trim()}
              >
                Save Comment
              </button>
            </div>
          </div>
        </div>
      )}

      {showExportDialog && (
        <div
          className="markdown-reviewer__dialog-overlay"
          onClick={() => setShowExportDialog(false)}
        >
          <div
            className="markdown-reviewer__export-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="markdown-reviewer__export-header">
              <h3>Export Comments</h3>
              <button
                className="markdown-reviewer__export-close"
                onClick={() => setShowExportDialog(false)}
              >
                ×
              </button>
            </div>
            <div className="markdown-reviewer__export-content">
              <pre>{generateMarkdownExport(comments)}</pre>
            </div>
            <div className="markdown-reviewer__export-actions">
              <button
                className="markdown-reviewer__export-copy"
                onClick={handleCopyMarkdown}
              >
                📋 Copy to Clipboard
              </button>
              <button
                className="markdown-reviewer__export-download"
                onClick={handleDownloadMarkdown}
              >
                💾 Download as .md
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { MarkdownReviewer as Component };
