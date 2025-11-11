import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useStore, type Activity } from '../store';

interface ActivitySelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (activity: string | null) => void;
  activities: Activity[];
}

export function ActivitySelector({
  open,
  onOpenChange,
  onSelect,
  activities,
}: ActivitySelectorProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Activity</DialogTitle>
          <DialogDescription>
            Choose an activity to assign to the selected hours
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-2 py-4">
          <Button
            variant="outline"
            onClick={() => {
              onSelect(null);
              onOpenChange(false);
            }}
            className="w-full justify-start"
          >
            <div className="mr-2 h-4 w-4 rounded border border-gray-300 bg-white" />
            Clear / No Activity
          </Button>
          {activities.map((activity) => (
            <Button
              key={activity.name}
              variant="outline"
              onClick={() => {
                onSelect(activity.name);
                onOpenChange(false);
              }}
              className="w-full justify-start"
            >
              <div
                className="mr-2 h-4 w-4 rounded"
                style={{ backgroundColor: activity.color }}
              />
              {activity.name}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

