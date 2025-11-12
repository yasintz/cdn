import { useMemo, useRef, useState } from 'react';
import { marked } from 'marked';
import { useMarkdownReviewerStore } from './store';
import './style.scss';

export default function MarkdownReviewer() {
  console.log('MarkdownReviewer');
  const previewRef = useRef<HTMLDivElement>(null);
  const [commentIconPosition, setCommentIconPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(
    null
  );
  const [replyText, setReplyText] = useState('');

  const store = useMarkdownReviewerStore();

  const {
    markdownContent,
    comments: rawComments,
    commentHistory,
    selectedHistoryId,
    selectedText,
    showCommentDialog,
    showExportDialog,
    commentText,
    selectionPosition,
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

  // Ensure all comments have replies array (migration for old data)
  const comments = useMemo(() => {
    // If viewing history, show history comments, otherwise show current comments
    const commentsToShow = selectedHistoryId
      ? commentHistory.find(h => h.id === selectedHistoryId)?.comments || []
      : rawComments;
      
    return commentsToShow.map((comment) => ({
      ...comment,
      replies: comment.replies || [],
    }));
  }, [rawComments, commentHistory, selectedHistoryId]);
  
  const isViewingHistory = selectedHistoryId !== null;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setMarkdownContent(content, file.name);
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a valid markdown (.md) file');
    }
  };

  const handleTextSelection = () => {
    // Use setTimeout to ensure selection is stable after mouseup
    setTimeout(() => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        const text = selection.toString();
        const range = selection.getRangeAt(0);

        // Calculate line and column from the selection
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(previewRef.current!);
        preCaretRange.setEnd(range.startContainer, range.startOffset);
        const textBeforeSelection = preCaretRange.toString();

        const lines = textBeforeSelection.split('\n');
        const line = lines.length;
        const column = lines[lines.length - 1].length + 1;

        // Get the position of the selection to show the comment icon
        const rect = range.getBoundingClientRect();
        const previewRect = previewRef.current!.getBoundingClientRect();

        // Batch state updates to prevent multiple re-renders
        setSelectedText(text);
        setSelectionPosition({ line, column });
        setCommentIconPosition({
          top: rect.top - previewRect.top - 40, // Position above the selection
          left: rect.right - previewRect.left,
        });
      } else {
        // Clear the icon if no text is selected
        setCommentIconPosition(null);
        setSelectedText('');
        setSelectionPosition(null);
      }
    }, 10);
  };

  const handleCommentIconClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowCommentDialog(true);
    setCommentIconPosition(null);
  };

  const handleAddComment = () => {
    if (commentText.trim() && selectedText && selectionPosition) {
      // Check if there's already a comment for this exact selection
      const existingComment = comments.find(
        (c) =>
          c.selectedText === selectedText &&
          c.line === selectionPosition.line &&
          c.column === selectionPosition.column
      );

      if (existingComment) {
        // Add as a reply to existing comment
        const reply = {
          id: Date.now().toString(),
          text: commentText,
          timestamp: Date.now(),
        };
        addReplyToComment(existingComment.id, reply);
      } else {
        // Create new comment
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
    }
  };

  const handleStartEdit = (commentId: string, text: string) => {
    setEditingCommentId(commentId);
    setEditText(text);
  };

  const handleStartEditReply = (
    commentId: string,
    replyId: string,
    text: string
  ) => {
    setEditingCommentId(commentId);
    setEditingReplyId(replyId);
    setEditText(text);
  };

  const handleSaveEdit = () => {
    if (editText.trim()) {
      if (editingReplyId) {
        updateReply(editingCommentId!, editingReplyId, editText);
      } else {
        updateComment(editingCommentId!, editText);
      }
    }
    setEditingCommentId(null);
    setEditingReplyId(null);
    setEditText('');
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingReplyId(null);
    setEditText('');
  };

  const handleStartReply = (commentId: string) => {
    setReplyingToCommentId(commentId);
    setReplyText('');
  };

  const handleSaveReply = (commentId: string) => {
    console.log('handleSaveReply called', { commentId, replyText });
    if (replyText.trim()) {
      const reply = {
        id: Date.now().toString(),
        text: replyText,
        timestamp: Date.now(),
      };
      console.log('Adding reply:', reply);
      addReplyToComment(commentId, reply);
      setReplyingToCommentId(null);
      setReplyText('');
    } else {
      console.log('Reply text is empty');
    }
  };

  const handleCancelReply = () => {
    setReplyingToCommentId(null);
    setReplyText('');
  };

  const generateMarkdownExport = () => {
    let markdown = '# Comments\n\n';

    comments.forEach((comment, index) => {
      markdown += `## Comment ${index + 1}\n`;
      markdown += `**Selected Text:**\n> ${comment.selectedText}\n`;
      markdown += `**Position:** Line ${comment.line}, Column ${comment.column}\n`;
      markdown += `**Comment:**\n${comment.text}\n`;

      if (comment.replies.length > 0) {
        comment.replies.forEach((reply) => {
          markdown += `${reply.text}\n`;
        });
      }

      markdown += '---\n\n';
    });

    return markdown;
  };

  const handleExportComments = () => {
    setShowExportDialog(true);
  };

  const handleCopyMarkdown = () => {
    const markdown = generateMarkdownExport();
    navigator.clipboard.writeText(markdown).then(() => {
      alert('Markdown copied to clipboard!');
    });
  };

  const handleDownloadMarkdown = () => {
    const markdown = generateMarkdownExport();
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `markdown-review-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
        <div className="markdown-reviewer__actions">
          <label className="markdown-reviewer__upload-btn">
            <input
              type="file"
              accept=".md"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            Upload Markdown File
          </label>
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
                  onClick={handleCommentIconClick}
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
                          onClick={handleSaveEdit}
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
                                <button onClick={handleSaveEdit}>Save</button>
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
                          onClick={() => handleSaveReply(comment.id)}
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
              <pre>{generateMarkdownExport()}</pre>
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
