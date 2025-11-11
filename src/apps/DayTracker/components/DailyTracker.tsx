import { useState, useMemo, useImperativeHandle, forwardRef } from 'react';
import { format } from 'date-fns';
import Color from 'color';
import { generateHourBlocks } from '../lib/hour-utils';
import {
  useStore,
  selectDayData,
  selectDayTrackerEvents,
} from '@/apps/Calendar/store';

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

    const dayTrackerStartTime = useStore((state) => state.dayTrackerStartTime);
    const dayData = useStore(selectDayData(dateString));
    const createDayTrackerEvent = useStore(
      (state) => state.createDayTrackerEvent
    );
    const dayTrackerEvents = useStore(selectDayTrackerEvents);

    const hourBlocks = useMemo(() => {
      if (!dayTrackerStartTime) return [];
      return generateHourBlocks(dayTrackerStartTime);
    }, [dayTrackerStartTime]);

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
    useImperativeHandle(
      ref,
      () => ({
        assignActivity: (activityName: string | null) => {
          if (selectedHours.size === 0) return;

          // Get current day data
          const state = useStore.getState();
          const currentDayTrackerEvents = selectDayTrackerEvents(state);
          const currentDayData =
            currentDayTrackerEvents.length > 0
              ? selectDayData(dateString)(state)
              : {
                  date: dateString,
                  hours: hourBlocks.map((h) => ({ hour: h, activity: null })),
                };

          // Create a map of all hours with their activities
          const hourMap = new Map<string, string | null>();
          currentDayData.hours.forEach((h) => {
            hourMap.set(h.hour, h.activity);
          });

          // Update selected hours
          selectedHours.forEach((hour) => {
            hourMap.set(hour, activityName);
          });

          // Convert to array format
          const hoursToUpdate = Array.from(hourMap.entries()).map(
            ([hour, activity]) => ({
              hour,
              activity,
            })
          );

          createDayTrackerEvent(dateString, hoursToUpdate);

          setSelectedHours(new Set());
          onSelectionChange?.(dateString, new Set());
        },
      }),
      [
        selectedHours,
        dateString,
        createDayTrackerEvent,
        hourBlocks,
        onSelectionChange,
      ]
    );

    const getActivityForHour = (hour: string): string | null => {
      return dayData?.hours.find((h) => h.hour === hour)?.activity ?? null;
    };

    const getActivityColor = (activityName: string | null): string => {
      if (!activityName) return '#e5e7eb';
      // Get color from calendar events
      const event = dayTrackerEvents.find((e) => e.title === activityName);
      return event?.color ?? '#e5e7eb';
    };

    const getLightBackgroundColor = (color: string): string => {
      return Color(color).mix(Color('white'), 0.8).hex();
    };

    if (!dayTrackerStartTime || !dayData) {
      return <div>Loading...</div>;
    }

    return (
      <div className="flex gap-2">
        {hourBlocks.map((hour) => {
          const isSelected = selectedHours.has(hour);
          const activity = getActivityForHour(hour);
          const color = getActivityColor(activity);

          const backgroundColor = activity
            ? getLightBackgroundColor(color)
            : '#ffffff';

          // Determine shadow based on state
          let boxShadow = 'none';
          if (isSelected) {
            boxShadow = '0 0 0 2px #3b82f6'; // Blue shadow if selected
          } else if (activity) {
            boxShadow = 'none'; // No shadow if activity
          } else {
            boxShadow = '0 0 0 1px #d1d5db'; // Gray shadow if no activity and not selected
          }

          return (
            <button
              key={hour}
              onClick={() => handleHourClick(hour)}
              className={`
                relative w-16 h-16 rounded-lg transition-all shrink-0 overflow-hidden
                ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
              `}
              style={{
                backgroundColor,
                boxShadow,
              }}
              title={activity ? `${hour} - ${activity}` : hour}
            >
              {activity && (
                <div
                  style={{
                    backgroundColor: color,
                    width: 4,
                    height: '100%',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                  }}
                />
              )}
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
