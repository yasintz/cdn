import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ColorPicker } from '@/components/ui/color-picker';
import { useStore, selectDayTrackerEvents } from '@/apps/Calendar/store';

interface ActivitySelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (activity: string | null) => void;
}

export function ActivitySelector({
  open,
  onOpenChange,
  onSelect,
}: ActivitySelectorProps) {
  const dayTrackerEvents = useStore(selectDayTrackerEvents);
  const updateEvent = useStore((state) => state.updateEvent);
  const [newActivityName, setNewActivityName] = useState('');
  
  // Get unique activity names from day-tracker events only (by title uniqueness)
  const activities = useMemo(() => {
    const uniqueTitles = Array.from(new Set(dayTrackerEvents.map(e => e.title).filter(Boolean)));
    return uniqueTitles.map(title => {
      const event = dayTrackerEvents.find(e => e.title === title);
      return {
        name: title,
        color: event?.color || '#808080',
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [dayTrackerEvents]);

  const handleColorChange = (activityName: string, newColor: string) => {
    // Update all events with this activity name to the new color
    dayTrackerEvents
      .filter(event => event.title === activityName)
      .forEach(event => {
        updateEvent(event.id, {
          ...event,
          color: newColor,
        });
      });
  };

  const handleCreateAndSelect = () => {
    if (newActivityName.trim()) {
      onSelect(newActivityName.trim());
      setNewActivityName('');
      onOpenChange(false);
    }
  };

  const handleSelectExisting = (activityName: string) => {
    onSelect(activityName);
    setNewActivityName('');
    onOpenChange(false);
  };

  const handleClear = () => {
    onSelect(null);
    setNewActivityName('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select or Create Activity</DialogTitle>
          <DialogDescription>
            Choose an existing activity or create a new one by typing its name.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Create new activity input */}
          <div className="flex gap-2">
            <Input
              placeholder="Type new activity name..."
              value={newActivityName}
              onChange={(e) => setNewActivityName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newActivityName.trim()) {
                  handleCreateAndSelect();
                }
              }}
              autoFocus
            />
            <Button
              onClick={handleCreateAndSelect}
              disabled={!newActivityName.trim()}
            >
              Create
            </Button>
          </div>

          {/* Existing activities */}
          <div className="grid grid-cols-1 gap-2">
            <Button
              variant="outline"
              onClick={handleClear}
              className="w-full justify-start"
            >
              <div className="mr-2 h-4 w-4 rounded border border-gray-300 bg-white" />
              Clear / No Activity
            </Button>
            {activities.map((activity) => (
              <div key={activity.name} className="flex gap-2 items-center">
                <Button
                  variant="outline"
                  onClick={() => handleSelectExisting(activity.name)}
                  className="flex-1 justify-start"
                >
                  <div
                    className="mr-2 h-4 w-4 rounded"
                    style={{ backgroundColor: activity.color }}
                  />
                  {activity.name}
                </Button>
                <ColorPicker
                  value={activity.color}
                  onChange={(newColor) => handleColorChange(activity.name, newColor)}
                  quickColors={[
                    '#8f8f8f',
                    '#f44336',
                    '#e91e63',
                    '#9c27b0',
                    '#673ab7',
                    '#3f51b5',
                    '#2196f3',
                    '#03a9f4',
                    '#00bcd4',
                    '#009688',
                    '#4caf50',
                    '#8bc34a',
                    '#cddc39',
                    '#ffeb3b',
                    '#ffc107',
                    '#ff9800',
                    '#ff5722',
                    '#795548',
                    '#607d8b',
                  ]}
                />
              </div>
            ))}
            {activities.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-4">
                No existing activities. Type a name above to create one.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

