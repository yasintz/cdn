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

  const {
    markdownContent,
    comments,
    selectedText,
    showCommentDialog,
    showExportDialog,
    commentText,
    selectionPosition,
    setMarkdownContent,
    addComment,
    deleteComment,
    setSelectedText,
    setShowCommentDialog,
    setShowExportDialog,
    setCommentText,
    setSelectionPosition,
    resetComments,
    clearCommentDialog,
  } = useMarkdownReviewerStore();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setMarkdownContent(content);
        resetComments(); // Reset comments when new file is uploaded
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
      const newComment = {
        id: Date.now().toString(),
        text: commentText,
        selectedText: selectedText,
        line: selectionPosition.line,
        column: selectionPosition.column,
        timestamp: Date.now(),
      };

      addComment(newComment);
      clearCommentDialog();
    }
  };

  const generateMarkdownExport = () => {
    let markdown = '# Comments\n\n';
    
    comments.forEach((comment, index) => {
      markdown += `## Comment ${index + 1}\n\n`;
      markdown += `**Selected Text:**\n> ${comment.selectedText}\n\n`;
      markdown += `**Position:** Line ${comment.line}, Column ${comment.column}\n\n`;
      markdown += `**Comment:**\n${comment.text}\n\n`;
      markdown += `**Date:** ${new Date(comment.timestamp).toLocaleString()}\n\n`;
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
          <h2>Comments</h2>
          {comments.length === 0 ? (
            <div className="markdown-reviewer__empty">
              <p>
                No comments yet. Select text in the preview to add comments.
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
                    <button
                      className="markdown-reviewer__comment-delete"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      ×
                    </button>
                  </div>
                  <div className="markdown-reviewer__comment-selected">
                    "{comment.selectedText}"
                  </div>
                  <div className="markdown-reviewer__comment-text">
                    {comment.text}
                  </div>
                  <div className="markdown-reviewer__comment-timestamp">
                    {new Date(comment.timestamp).toLocaleString()}
                  </div>
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
