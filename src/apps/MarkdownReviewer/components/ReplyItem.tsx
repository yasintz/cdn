import { Button } from '@/components/ui/button';

interface Reply {
  id: string;
  text: string;
  timestamp: number;
}

interface ReplyItemProps {
  reply: Reply;
  isEditing: boolean;
  isViewingHistory: boolean;
  editText: string;
  onEditTextChange: (text: string) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
}

export function ReplyItem({
  reply,
  isEditing,
  isViewingHistory,
  editText,
  onEditTextChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
}: ReplyItemProps) {
  if (isEditing) {
    return (
      <div className="p-3 bg-gray-50 rounded mb-2 last:mb-0">
        <div>
          <textarea
            className="w-full min-h-20 p-2 border border-gray-300 rounded text-sm resize-y mb-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            value={editText}
            onChange={(e) => onEditTextChange(e.target.value)}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button onClick={onCancelEdit} variant="ghost" size="sm">Cancel</Button>
            <Button onClick={onSaveEdit} size="sm">Save</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-gray-50 rounded mb-2 last:mb-0">
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
              onClick={onStartEdit}
            >
              ✏️
            </button>
            <button
              className="bg-transparent border-none p-1 cursor-pointer text-sm opacity-60 transition-opacity hover:opacity-100"
              onClick={onDelete}
            >
              🗑️
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

