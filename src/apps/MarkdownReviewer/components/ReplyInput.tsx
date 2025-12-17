import { Button } from '@/components/ui/button';

interface ReplyInputProps {
  replyText: string;
  onReplyTextChange: (text: string) => void;
  onCancel: () => void;
  onSave: () => void;
}

export function ReplyInput({
  replyText,
  onReplyTextChange,
  onCancel,
  onSave,
}: ReplyInputProps) {
  return (
    <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
      <textarea
        className="w-full min-h-20 p-2 border border-gray-300 rounded text-sm resize-y mb-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
        value={replyText}
        onChange={(e) => onReplyTextChange(e.target.value)}
        placeholder="Write a reply..."
        autoFocus
      />
      <div className="flex justify-end gap-2">
        <Button onClick={onCancel} variant="ghost" size="sm">Cancel</Button>
        <Button
          onClick={onSave}
          disabled={!replyText.trim()}
          size="sm"
        >
          Reply
        </Button>
      </div>
    </div>
  );
}

