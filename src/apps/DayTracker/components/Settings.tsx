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
import { Plus, X } from 'lucide-react';
import { useStore, type Activity } from '../store';

interface SettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Settings({
  open,
  onOpenChange,
}: SettingsProps) {
  const { settings, updateSettings } = useStore();

  const [startTime, setStartTime] = useState(settings?.startTime || '08:00');
  const [activities, setActivities] = useState<Activity[]>(
    settings?.activities || [
      { name: 'Work', color: '#4CAF50' },
      { name: 'Exercise', color: '#2196F3' },
      { name: 'Reading', color: '#FFC107' },
    ]
  );

  // Sync state when settings change or dialog opens
  useEffect(() => {
    if (settings && open) {
      setStartTime(settings.startTime);
      setActivities(settings.activities);
    }
  }, [settings, open]);

  const handleSave = () => {
    updateSettings({
      startTime,
      activities,
    });
    onOpenChange(false);
  };

  const handleAddActivity = () => {
    setActivities([
      ...activities,
      { name: '', color: '#000000' },
    ]);
  };

  const handleRemoveActivity = (index: number) => {
    setActivities(activities.filter((_, i) => i !== index));
  };

  const handleActivityChange = (
    index: number,
    field: 'name' | 'color',
    value: string
  ) => {
    const updated = [...activities];
    updated[index] = { ...updated[index], [field]: value };
    setActivities(updated);
  };

  if (!settings) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your start time and activity types
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

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Activities</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddActivity}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Activity
              </Button>
            </div>
            <div className="space-y-2">
              {activities.map((activity, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={activity.color}
                    onChange={(e) =>
                      handleActivityChange(index, 'color', e.target.value)
                    }
                    className="h-10 w-20"
                  />
                  <Input
                    type="text"
                    placeholder="Activity name"
                    value={activity.name}
                    onChange={(e) =>
                      handleActivityChange(index, 'name', e.target.value)
                    }
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveActivity(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
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

