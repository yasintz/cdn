import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Settings({
  open,
  onOpenChange,
}: SettingsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Activities are managed through Calendar labels.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="text-sm text-muted-foreground text-center py-4">
            No settings available at this time.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

