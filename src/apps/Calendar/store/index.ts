import { computed } from 'zustand-computed-state';
import { gSheetStorage } from '@/utils/zustand/gsheet-storage';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { uid } from '@/utils/uid';
import dayjs from '@/helpers/dayjs';

export type Label = {
  id: string;
  name: string;
  color: string;
};

export type EventType = {
  id: string;
  key?: string;
  title: string;
  start: string;
  end: string;
  allDay?: boolean;
  note?: string;
  isGroup?: boolean;
  color: string;
  labels?: string[]; // Array of label IDs
};

type StoreType = {
  events: Array<EventType>;
  labels: Array<Label>;
  hiddenLabelIds: string[]; // Stored as array for persistence, converted to Set when needed

  // Event methods
  createEvent: (event: Omit<EventType, 'id'>) => string;
  updateEvent: (id: string, event: Omit<EventType, 'id'>) => void;
  deleteEvent: (id: string) => void;

  // Label methods
  createLabel: (label: Omit<Label, 'id'>) => string;
  updateLabel: (id: string, label: Partial<Omit<Label, 'id'>>) => void;
  deleteLabel: (id: string) => void;
  toggleLabelVisibility: (id: string) => void;

  // DayTracker methods
  createDayTrackerEvent: (date: string, hours: Array<{ hour: string; activity: string | null }>) => void;
};

export const useStore = create<StoreType>()(
  computed(
    immer(
      persist(
        (set) => ({
          events: [],
          labels: [],
          hiddenLabelIds: [],

          createEvent: (event) => {
            const id = uid();
            set((prev) => {
              prev.events.push({
                id,
                ...event,
              });
            });
            return id;
          },

          updateEvent: (id, event) => {
            set((prev) => {
              const index = prev.events.findIndex((event) => event.id === id);
              if (index !== -1) {
                prev.events[index] = {
                  ...prev.events[index],
                  ...event,
                };
              }
            });
          },

          deleteEvent: (id) => {
            set((prev) => {
              prev.events = prev.events.filter((event) => event.id !== id);
            });
          },

          createLabel: (label) => {
            const id = uid();
            set((prev) => {
              prev.labels.push({
                id,
                ...label,
              });
            });
            return id;
          },

          updateLabel: (id, label) => {
            set((prev) => {
              const index = prev.labels.findIndex((l) => l.id === id);
              if (index !== -1) {
                prev.labels[index] = {
                  ...prev.labels[index],
                  ...label,
                };
              }
            });
          },

          deleteLabel: (id) => {
            set((prev) => {
              prev.labels = prev.labels.filter((l) => l.id !== id);
              // Remove label from all events
              prev.events.forEach((event) => {
                if (event.labels) {
                  event.labels = event.labels.filter((labelId) => labelId !== id);
                }
              });
            });
          },

          toggleLabelVisibility: (id) => {
            set((prev) => {
              const index = prev.hiddenLabelIds.indexOf(id);
              if (index === -1) {
                prev.hiddenLabelIds.push(id);
              } else {
                prev.hiddenLabelIds.splice(index, 1);
              }
            });
          },

          createDayTrackerEvent: (date, hours) => {
            set((prev) => {
              // Ensure "day-tracker" label exists
              let dayTrackerLabel = prev.labels.find((l) => l.name === 'day-tracker');
              if (!dayTrackerLabel) {
                const labelId = uid();
                prev.labels.push({
                  id: labelId,
                  name: 'day-tracker',
                  color: '#808080',
                });
                dayTrackerLabel = prev.labels.find((l) => l.id === labelId)!;
              }

              // Group consecutive hours with same activity
              const groups: Array<{ startHour: string; endHour: string; activity: string | null }> = [];
              let currentGroup: { startHour: string; endHour: string; activity: string | null } | null = null;

              hours.forEach((hour) => {
                if (hour.activity === null) {
                  // End current group if exists
                  if (currentGroup) {
                    groups.push(currentGroup);
                    currentGroup = null;
                  }
                } else {
                  if (currentGroup && currentGroup.activity === hour.activity) {
                    // Extend current group
                    currentGroup.endHour = hour.hour;
                  } else {
                    // End previous group and start new one
                    if (currentGroup) {
                      groups.push(currentGroup);
                    }
                    currentGroup = {
                      startHour: hour.hour,
                      endHour: hour.hour,
                      activity: hour.activity,
                    };
                  }
                }
              });

              // Add last group if exists
              if (currentGroup) {
                groups.push(currentGroup);
              }

              // Before deleting events, preserve colors from existing events that overlap with this date
              const dayTrackerLabelId = dayTrackerLabel!.id;
              const targetDateForPreserve = dayjs(date);
              const targetDateStartForPreserve = targetDateForPreserve.startOf('day');
              const targetDateEndForPreserve = targetDateForPreserve.endOf('day');
              
              const existingEventsForDate = prev.events.filter((event) => {
                if (!event.labels?.includes(dayTrackerLabelId)) return false;
                const eventStart = dayjs(event.start);
                const eventEnd = dayjs(event.end);
                return eventStart.isBefore(targetDateEndForPreserve) && eventEnd.isAfter(targetDateStartForPreserve);
              });
              
              // Create a map of activity names to their colors from existing events
              const activityColorMap = new Map<string, string>();
              existingEventsForDate.forEach((event) => {
                if (event.title && !activityColorMap.has(event.title)) {
                  activityColorMap.set(event.title, event.color);
                }
              });

              // Delete existing day-tracker events that overlap with this date
              const targetDate = dayjs(date);
              const targetDateStart = targetDate.startOf('day');
              const targetDateEnd = targetDate.endOf('day');
              
              prev.events = prev.events.filter((event) => {
                if (!event.labels?.includes(dayTrackerLabelId)) return true;
                const eventStart = dayjs(event.start);
                const eventEnd = dayjs(event.end);
                // Keep event if it doesn't overlap with the target date
                return !(eventStart.isBefore(targetDateEnd) && eventEnd.isAfter(targetDateStart));
              });

              // Create new events for each group
              groups.forEach((group) => {
                if (group.activity) {
                  // Determine color from preserved colors or existing events on other dates
                  const preservedColor = activityColorMap.get(group.activity);
                  const existingEventOnOtherDate = prev.events.find((e) => e.title === group.activity);
                  const colorToUse = preservedColor || existingEventOnOtherDate?.color || '#808080';

                  const [endHour, endMin] = group.endHour.split(':').map(Number);
                  
                  // Calculate end time (add 30 minutes to make it exclusive)
                  let endTimeHour = endHour;
                  let endTimeMin = endMin + 30;
                  
                  // Handle minute overflow
                  if (endTimeMin >= 60) {
                    endTimeMin = endTimeMin % 60;
                    endTimeHour = (endTimeHour + 1) % 24;
                  }

                  const startDateTime = dayjs(`${date} ${group.startHour}`).toISOString();
                  
                  // If end time wraps around (endTimeHour === 0 and we went from 23:30 to 00:00), add a day
                  // Also check if end time on the same day would be before start time (indicating wrap-around)
                  const endTimeSameDay = dayjs(`${date} ${endTimeHour.toString().padStart(2, '0')}:${endTimeMin.toString().padStart(2, '0')}`);
                  const startTime = dayjs(`${date} ${group.startHour}`);
                  const needsNextDay = (endHour === 23 && endMin === 30) || endTimeSameDay.isBefore(startTime);
                  
                  const endDate = needsNextDay
                    ? dayjs(date).add(1, 'day').format('YYYY-MM-DD')
                    : date;
                  
                  const endDateTime = dayjs(`${endDate} ${endTimeHour.toString().padStart(2, '0')}:${endTimeMin.toString().padStart(2, '0')}`).toISOString();

                  prev.events.push({
                    id: uid(),
                    title: group.activity,
                    start: startDateTime,
                    end: endDateTime,
                    color: colorToUse,
                    labels: [dayTrackerLabel!.id],
                  });
                }
              });
            });
          },
        }),
        { name: 'calendar' }
      )
    )
  )
);

// Re-export selectors
export {
  selectVisibleEvents,
  selectDayTrackerEvents,
  selectDayData,
  selectSummary,
} from './selectors';

gSheetStorage(
  'Calendar',
  '1gI4tbIt1ETMm6aPXNdk5ycHt8tHlJr-TxkbKuAKqBKc',
  '233614322'
).handleStore(useStore);
