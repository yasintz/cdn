import { useState, useMemo, useImperativeHandle, forwardRef } from 'react';
import { format } from 'date-fns';
import { generateHourBlocks } from '../lib/hour-utils';
import { useStore } from '../store';

interface DailyTrackerProps {
  date: Date;
  onSelectionChange?: (date: string, selectedHours: Set<string>) => void;
}

export interface DailyTrackerHandle {
  assignActivity: (activityName: string | null) => void;
}

export const DailyTracker = forwardRef<DailyTrackerHandle, DailyTrackerProps>(
  ({ date, onSelectionChange }, ref) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const [selectedHours, setSelectedHours] = useState<Set<string>>(new Set());

    const { settings, entries, getDayData, updateDayHours } = useStore();
    const dayData = useMemo(() => getDayData(dateString), [getDayData, dateString, entries]);

    const hourBlocks = useMemo(() => {
      if (!settings || !settings.startTime) return [];
      return generateHourBlocks(settings.startTime);
    }, [settings]);

    const handleHourClick = (hour: string) => {
      setSelectedHours((prev) => {
        const next = new Set(prev);
        if (next.has(hour)) {
          next.delete(hour);
        } else {
          next.add(hour);
        }
        // Notify parent of selection change
        onSelectionChange?.(dateString, next);
        return next;
      });
    };

    // Expose method to assign activity from parent
    useImperativeHandle(ref, () => ({
      assignActivity: (activityName: string | null) => {
        if (selectedHours.size === 0) return;

        const hoursToUpdate = Array.from(selectedHours).map((hour) => ({
          hour,
          activity: activityName,
        }));

        updateDayHours(dateString, hoursToUpdate);

        setSelectedHours(new Set());
        onSelectionChange?.(dateString, new Set());
      },
    }), [selectedHours, dateString, updateDayHours, onSelectionChange]);

    const getActivityForHour = (hour: string): string | null => {
      return dayData?.hours.find((h) => h.hour === hour)?.activity ?? null;
    };

    const getActivityColor = (activityName: string | null): string => {
      if (!activityName || !settings) return '#e5e7eb';
      const activity = settings.activities.find((a) => a.name === activityName);
      return activity?.color ?? '#e5e7eb';
    };

    if (!settings || !dayData) {
      return <div>Loading...</div>;
    }

    return (
      <div className="flex gap-1">
        {hourBlocks.map((hour) => {
          const isSelected = selectedHours.has(hour);
          const activity = getActivityForHour(hour);
          const color = getActivityColor(activity);

          return (
            <button
              key={hour}
              onClick={() => handleHourClick(hour)}
              className={`
                relative w-16 h-16 rounded-lg border-2 transition-all shrink-0
                ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                ${activity ? 'border-opacity-50' : 'border-gray-300'}
              `}
              style={{
                backgroundColor: activity ? color : '#ffffff',
                borderColor: isSelected ? '#3b82f6' : color,
              }}
              title={activity ? `${hour} - ${activity}` : hour}
            >
              <div className="flex h-full flex-col items-center justify-center p-1">
                <div className="text-xs font-medium">{hour}</div>
                {activity && (
                  <div className="mt-0.5 text-[10px] opacity-80 truncate w-full text-center">
                    {activity}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    );
  }
);

