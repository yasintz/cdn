import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { generateMarkdownExport, copyMarkdownToClipboard, downloadMarkdown } from '../utils/exportUtils';

interface Comment {
  id: string;
  text: string;
  selectedText: string;
  line: number;
  column: number;
  timestamp: number;
  replies: Array<{
    id: string;
    text: string;
    timestamp: number;
  }>;
}

interface ExportCommentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comments: Comment[];
}

export function ExportCommentsDialog({
  open,
  onOpenChange,
  comments,
}: ExportCommentsDialogProps) {
  const handleCopyMarkdown = () => {
    const markdown = generateMarkdownExport(comments);
    copyMarkdownToClipboard(markdown);
  };

  const handleDownloadMarkdown = () => {
    const markdown = generateMarkdownExport(comments);
    downloadMarkdown(markdown);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
  );
}

