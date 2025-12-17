import { Button } from '@/components/ui/button';
import { RepliesList } from './RepliesList';
import { ReplyInput } from './ReplyInput';

interface Reply {
  id: string;
  text: string;
  timestamp: number;
}

interface Comment {
  id: string;
  text: string;
  selectedText: string;
  line: number;
  column: number;
  timestamp: number;
  replies: Reply[];
}

interface CommentItemProps {
  comment: Comment;
  isViewingHistory: boolean;
  isEditing: boolean;
  editingReplyId: string | null;
  replyingToCommentId: string | null;
  editText: string;
  replyText: string;
  onEditTextChange: (text: string) => void;
  onReplyTextChange: (text: string) => void;
  onStartEdit: (commentId: string, commentText: string) => void;
  onStartEditReply: (commentId: string, replyId: string, replyText: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onStartReply: (commentId: string) => void;
  onSaveReply: () => void;
  onCancelReply: () => void;
  onDeleteComment: (commentId: string) => void;
  onDeleteReply: (commentId: string, replyId: string) => void;
}

export function CommentItem({
  comment,
  isViewingHistory,
  isEditing,
  editingReplyId,
  replyingToCommentId,
  editText,
  replyText,
  onEditTextChange,
  onReplyTextChange,
  onStartEdit,
  onStartEditReply,
  onSaveEdit,
  onCancelEdit,
  onStartReply,
  onSaveReply,
  onCancelReply,
  onDeleteComment,
  onDeleteReply,
}: CommentItemProps) {
  return (
    <div className="border border-gray-200 rounded-md p-4 bg-gray-50 transition-shadow hover:shadow-md">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-600 font-semibold bg-blue-100 px-2 py-1 rounded">
          Line {comment.line}, Col {comment.column}
        </span>
        {!isViewingHistory && (
          <button
            className="bg-transparent border-none text-xl text-gray-400 cursor-pointer p-0 w-6 h-6 flex items-center justify-center rounded transition-all hover:bg-red-50 hover:text-red-600"
            onClick={() => onDeleteComment(comment.id)}
            title="Delete comment"
          >
            ×
          </button>
        )}
      </div>
      <div className="text-sm text-gray-700 italic mb-2 px-2 py-2 bg-white border-l-4 border-blue-600 rounded">
        "{comment.selectedText}"
      </div>

      {isEditing && !editingReplyId ? (
        <div className="mt-2">
          <textarea
            className="w-full min-h-20 p-2 border border-gray-300 rounded text-sm resize-y mb-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            value={editText}
            onChange={(e) => onEditTextChange(e.target.value)}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button onClick={onCancelEdit} variant="ghost" size="sm">Cancel</Button>
            <Button
              onClick={onSaveEdit}
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
                  onClick={() => onStartEdit(comment.id, comment.text)}
                >
                  ✏️ Edit
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => onStartReply(comment.id)}
                >
                  💬 Reply
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      <RepliesList
        replies={comment.replies}
        commentId={comment.id}
        editingCommentId={isEditing ? comment.id : null}
        editingReplyId={editingReplyId}
        isViewingHistory={isViewingHistory}
        editText={editText}
        onEditTextChange={onEditTextChange}
        onStartEditReply={onStartEditReply}
        onSaveEdit={onSaveEdit}
        onCancelEdit={onCancelEdit}
        onDeleteReply={onDeleteReply}
      />

      {!isViewingHistory && replyingToCommentId === comment.id && (
        <ReplyInput
          replyText={replyText}
          onReplyTextChange={onReplyTextChange}
          onCancel={onCancelReply}
          onSave={onSaveReply}
        />
      )}
    </div>
  );
}

