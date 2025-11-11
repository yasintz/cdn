import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStore } from '@/apps/Calendar/store';

interface SettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Settings({
  open,
  onOpenChange,
}: SettingsProps) {
  const { dayTrackerStartTime, updateDayTrackerStartTime } = useStore();

  const [startTime, setStartTime] = useState(dayTrackerStartTime || '08:00');

  // Sync state when settings change or dialog opens
  useEffect(() => {
    if (dayTrackerStartTime && open) {
      setStartTime(dayTrackerStartTime);
    }
  }, [dayTrackerStartTime, open]);

  const handleSave = () => {
    updateDayTrackerStartTime(startTime);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your start time. Activities are managed through Calendar labels.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Start Time</h3>
            <div className="space-y-2">
              <Label htmlFor="startTime">Day starts at (24 hours will be shown automatically)</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

