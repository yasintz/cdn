import { useMemo, useState } from 'react';
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
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { useStore, selectDayTrackerEvents } from '@/apps/Calendar/store';
import { QUICK_COLORS } from '../constants';

interface SettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Settings({
  open,
  onOpenChange,
}: SettingsProps) {
  const dayTrackerEvents = useStore(selectDayTrackerEvents);
  const updateEvent = useStore((state) => state.updateEvent);
  const deleteEvent = useStore((state) => state.deleteEvent);
  const [editingActivity, setEditingActivity] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');

  // Get unique activity names from day-tracker events only (by title uniqueness)
  const activities = useMemo(() => {
    const uniqueTitles = Array.from(new Set(dayTrackerEvents.map(e => e.title).filter(Boolean)));
    return uniqueTitles.map(title => {
      const event = dayTrackerEvents.find(e => e.title === title);
      return {
        name: title,
        color: event?.color || '#808080',
        eventCount: dayTrackerEvents.filter(e => e.title === title).length,
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

  const handleStartEdit = (activityName: string) => {
    setEditingActivity(activityName);
    setEditedName(activityName);
  };

  const handleCancelEdit = () => {
    setEditingActivity(null);
    setEditedName('');
  };

  const handleSaveEdit = (oldName: string) => {
    const trimmedName = editedName.trim();
    if (trimmedName && trimmedName !== oldName) {
      // Update all events with this activity name to the new name
      dayTrackerEvents
        .filter(event => event.title === oldName)
        .forEach(event => {
          updateEvent(event.id, {
            ...event,
            title: trimmedName,
          });
        });
    }
    setEditingActivity(null);
    setEditedName('');
  };

  const handleDeleteActivity = (activityName: string) => {
    if (confirm(`Are you sure you want to delete "${activityName}"? This will remove ${dayTrackerEvents.filter(e => e.title === activityName).length} event(s).`)) {
      // Delete all events with this activity name
      dayTrackerEvents
        .filter(event => event.title === activityName)
        .forEach(event => {
          deleteEvent(event.id);
        });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Activity Settings</DialogTitle>
          <DialogDescription>
            Manage your activities: edit names, change colors, or delete activities.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {activities.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              No activities yet. Create activities by assigning them to hours in the tracker.
            </div>
          ) : (
            <div className="space-y-2">
              {activities.map((activity) => (
                <div 
                  key={activity.name} 
                  className="flex gap-2 items-center p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  {/* Color Picker */}
                  <ColorPicker
                    value={activity.color}
                    onChange={(newColor) => handleColorChange(activity.name, newColor)}
                    quickColors={QUICK_COLORS}
                  />

                  {/* Activity Name / Edit Input */}
                  <div className="flex-1 min-w-0">
                    {editingActivity === activity.name ? (
                      <Input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveEdit(activity.name);
                          } else if (e.key === 'Escape') {
                            handleCancelEdit();
                          }
                        }}
                        autoFocus
                        className="h-8"
                      />
                    ) : (
                      <div>
                        <div className="font-medium truncate">{activity.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {activity.eventCount} event{activity.eventCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-1">
                    {editingActivity === activity.name ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleSaveEdit(activity.name)}
                          disabled={!editedName.trim()}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleStartEdit(activity.name)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteActivity(activity.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

