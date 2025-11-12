import { useState, useMemo, useImperativeHandle, forwardRef } from 'react';
import Color from 'color';
import { generateHourBlocks } from '../lib/hour-utils';
import {
  useStore,
  selectDayData,
  selectDayTrackerEvents,
} from '@/apps/Calendar/store';
import useNow from '@/hooks/useNow';
import dayjs from '@/helpers/dayjs';
import { cn } from '@/lib/utils';

interface DailyTrackerProps {
  date: Date;
  onSelectionChange?: (date: string, selectedHours: Set<string>) => void;
}

export interface DailyTrackerHandle {
  assignActivity: (activityName: string | null) => void;
}

export const DailyTracker = forwardRef<DailyTrackerHandle, DailyTrackerProps>(
  ({ date, onSelectionChange }, ref) => {
    const dateString = dayjs(date).format('YYYY-MM-DD');
    const [selectedHours, setSelectedHours] = useState<Set<string>>(new Set());
    const now = useNow({ interval: '1 minute' });

    const dayData = useStore(selectDayData(dateString));
    const createDayTrackerEvent = useStore(
      (state) => state.createDayTrackerEvent
    );
    const dayTrackerEvents = useStore(selectDayTrackerEvents);

    const hourBlocks = useMemo(() => {
      return generateHourBlocks();
    }, []);

    // Calculate current active hour
    const isToday = useMemo(() => {
      return dayjs(date).isSame(dayjs(now), 'day');
    }, [date, now]);
    const currentHour = useMemo(() => {
      if (!isToday) return null;
      const hour = dayjs(now).hour();
      return `${hour.toString().padStart(2, '0')}:00`;
    }, [now, isToday]);

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

    const getShadowClass = (hour: string) => {
      const isSelected = selectedHours.has(hour);
      const isActiveHour = isToday && currentHour === hour;
      const activity = getActivityForHour(hour);
      if (isSelected) {
        return 'ring-2 ring-blue-500 ring-offset-2';
      }
      if (isActiveHour) {
        return 'ring-2 ring-green-500 ring-offset-2';
      }

      if (activity) {
        return 'ring-0 ring-offset-0';
      }
      return 'ring-1 ring-gray-300 ring-offset-1';
    };

    if (!dayData) {
      return <div>Loading...</div>;
    }

    return (
      <div className="flex gap-2">
        {hourBlocks.map((hour) => {
          const activity = getActivityForHour(hour);
          const color = getActivityColor(activity);
          const shadowClass = getShadowClass(hour);
          const backgroundColor = activity
            ? getLightBackgroundColor(color)
            : '#ffffff';

          return (
            <button
              key={hour}
              onClick={() => handleHourClick(hour)}
              className={cn(
                'relative w-16 h-16 rounded-lg transition-all shrink-0 overflow-hidden',
                shadowClass
              )}
              style={{ backgroundColor }}
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
