import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AddCommentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedText: string | null;
  selectionPosition: { line: number; column: number } | null;
  commentText: string;
  onCommentTextChange: (text: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function AddCommentDialog({
  open,
  onOpenChange,
  selectedText,
  selectionPosition,
  commentText,
  onCommentTextChange,
  onSave,
  onCancel,
}: AddCommentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          onChange={(e) => onCommentTextChange(e.target.value)}
          placeholder="Enter your comment..."
          autoFocus
        />
        <DialogFooter>
          <Button onClick={onCancel} variant="ghost">Cancel</Button>
          <Button
            onClick={onSave}
            disabled={!commentText.trim()}
          >
            Save Comment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

