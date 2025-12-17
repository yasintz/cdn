import { ReplyItem } from './ReplyItem';

interface Reply {
  id: string;
  text: string;
  timestamp: number;
}

interface RepliesListProps {
  replies: Reply[];
  commentId: string;
  editingCommentId: string | null;
  editingReplyId: string | null;
  isViewingHistory: boolean;
  editText: string;
  onEditTextChange: (text: string) => void;
  onStartEditReply: (commentId: string, replyId: string, replyText: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDeleteReply: (commentId: string, replyId: string) => void;
}

export function RepliesList({
  replies,
  commentId,
  editingCommentId,
  editingReplyId,
  isViewingHistory,
  editText,
  onEditTextChange,
  onStartEditReply,
  onSaveEdit,
  onCancelEdit,
  onDeleteReply,
}: RepliesListProps) {
  if (replies.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 pl-4 border-l-4 border-blue-100">
      {replies.map((reply) => (
        <ReplyItem
          key={reply.id}
          reply={reply}
          isEditing={editingCommentId === commentId && editingReplyId === reply.id}
          isViewingHistory={isViewingHistory}
          editText={editText}
          onEditTextChange={onEditTextChange}
          onStartEdit={() => onStartEditReply(commentId, reply.id, reply.text)}
          onSaveEdit={onSaveEdit}
          onCancelEdit={onCancelEdit}
          onDelete={() => onDeleteReply(commentId, reply.id)}
        />
      ))}
    </div>
  );
}

