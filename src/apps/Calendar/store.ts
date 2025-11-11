import { computed } from 'zustand-computed-state';
import { gSheetStorage } from '@/utils/zustand/gsheet-storage';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { uid } from '@/utils/uid';
import { generateHourBlocks } from '@/apps/DayTracker/lib/hour-utils';
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

// Helper function to convert calendar event times to hour blocks
function eventToHourBlocks(start: string, end: string): string[] {
  const startDate = dayjs(start);
  const endDate = dayjs(end);
  const hours: string[] = [];
  
  // If event spans multiple days, handle each day separately
  if (startDate.isSame(endDate, 'day')) {
    // Same day: get all hours between start and end (end is exclusive)
    let current = startDate.startOf('hour');
    const endHourDate = endDate.startOf('hour');
    
    while (current.isBefore(endHourDate, 'hour')) {
      hours.push(current.format('HH:mm'));
      current = current.add(1, 'hour');
    }
  } else {
    // Multi-day: for the start day, get hours from start hour to end of day
    let current = startDate.startOf('hour');
    const endOfStartDay = startDate.endOf('day');
    
    while (current.isBefore(endOfStartDay, 'hour') || current.isSame(endOfStartDay, 'hour')) {
      hours.push(current.format('HH:mm'));
      current = current.add(1, 'hour');
    }
    
    // For the end day, get hours from start of day to end hour (end is exclusive)
    const startOfEndDay = endDate.startOf('day');
    current = startOfEndDay;
    const endHourDate = endDate.startOf('hour');
    
    while (current.isBefore(endHourDate, 'hour')) {
      const hourStr = current.format('HH:mm');
      if (!hours.includes(hourStr)) {
        hours.push(hourStr);
      }
      current = current.add(1, 'hour');
    }
  }
  
  return hours;
}

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

                  const [startHour, startMin] = group.startHour.split(':').map(Number);
                  const [endHour, endMin] = group.endHour.split(':').map(Number);
                  
                  // Calculate end time (add 1 hour to endHour to make it exclusive)
                  const endTimeHour = (endHour + 1) % 24;
                  const endTimeMin = endMin;

                  const startDateTime = dayjs(`${date} ${group.startHour}`).toISOString();
                  
                  // If end time wraps around (endTimeHour === 0 means we went from 23:00 to 00:00), add a day
                  // Also check if end time on the same day would be before start time (indicating wrap-around)
                  const endTimeSameDay = dayjs(`${date} ${endTimeHour.toString().padStart(2, '0')}:${endTimeMin.toString().padStart(2, '0')}`);
                  const startTime = dayjs(`${date} ${group.startHour}`);
                  const needsNextDay = endTimeHour === 0 || endTimeSameDay.isBefore(startTime);
                  
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

// Selector functions - these are reactive when used with useStore
export const selectVisibleEvents = (state: StoreType) => {
  // Filter out events with hidden labels
  const hiddenSet = new Set(state.hiddenLabelIds);
  return state.events.filter((event: EventType) => {
    if (!event.labels || event.labels.length === 0) return true;
    // Hide event if any of its labels are hidden
    return !event.labels.some((labelId: string) => hiddenSet.has(labelId));
  });
};

export const selectDayTrackerEvents = (state: StoreType) => {
  const dayTrackerLabel = state.labels.find((l: Label) => l.name === 'day-tracker');
  if (!dayTrackerLabel) {
    return [];
  }
  return state.events.filter((event: EventType) => 
    event.labels?.includes(dayTrackerLabel.id)
  );
};

// Selector functions for parameterized queries
export const selectDayData = (date: string) => (state: StoreType) => {
  const allHourBlocks = generateHourBlocks();
  const dayTrackerEvents = selectDayTrackerEvents(state);
  const hourMap = new Map<string, { activity: string; color: string }>();
  const targetDate = dayjs(date);
  const targetDateStart = targetDate.startOf('day');
  const targetDateEnd = targetDate.endOf('day');

  // Find all events that overlap with this date
  dayTrackerEvents.forEach((event) => {
    const eventStart = dayjs(event.start);
    const eventEnd = dayjs(event.end);
    
    // Check if event overlaps with target date
    if (eventStart.isBefore(targetDateEnd) && eventEnd.isAfter(targetDateStart)) {
      // Calculate the actual start and end times for this event on the target date
      const effectiveStart = eventStart.isBefore(targetDateStart) ? targetDateStart : eventStart;
      const effectiveEnd = eventEnd.isAfter(targetDateEnd) ? targetDateEnd : eventEnd;
      
      // Get hour blocks for the effective time range
      const hours = eventToHourBlocks(effectiveStart.toISOString(), effectiveEnd.toISOString());
      hours.forEach((hour) => {
        // Only add if this hour is in the generated hour blocks
        if (allHourBlocks.includes(hour)) {
          // If multiple events overlap the same hour, the later one overwrites
          hourMap.set(hour, {
            activity: event.title,
            color: event.color,
          });
        }
      });
    }
  });

  // Return day with all 24 hours, filling in missing ones with null
  return {
    date,
    hours: allHourBlocks.map((hour) => {
      const entry = hourMap.get(hour);
      return {
        hour,
        activity: entry?.activity ?? null,
      };
    }),
  };
};

export const selectSummary = (period: 'daily' | 'weekly' | 'monthly' | '3months' | '6months' | 'year') => 
  (state: StoreType) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let startDate: Date;
    const endDate: Date = today;

    switch (period) {
      case 'daily':
        startDate = today;
        break;
      case 'weekly':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 6);
        break;
      case 'monthly':
        startDate = new Date(today);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case '3months':
        startDate = new Date(today);
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case '6months':
        startDate = new Date(today);
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case 'year':
        startDate = new Date(today);
        startDate.setMonth(startDate.getMonth() - 12);
        break;
    }

    const dayTrackerEvents = selectDayTrackerEvents(state);
    
    // Filter events within the date range
    const filteredEvents = dayTrackerEvents.filter((event) => {
      const eventStart = dayjs(event.start);
      const eventDate = new Date(eventStart.format('YYYY-MM-DD'));
      return eventDate >= startDate && eventDate <= endDate;
    });

    // Group by activity (title) and count hours
    const activityHours = new Map<string, { hours: number; color: string }>();
    let totalHours = 0;

    filteredEvents.forEach((event) => {
      const hours = eventToHourBlocks(event.start, event.end);
      const hoursCount = hours.length;
      
      if (hoursCount > 0) {
        const current = activityHours.get(event.title) || { hours: 0, color: event.color };
        activityHours.set(event.title, {
          hours: current.hours + hoursCount,
          color: event.color,
        });
        totalHours += hoursCount;
      }
    });

    // Convert to array
    const summary = Array.from(activityHours.entries())
      .map(([activityName, data]) => ({
        activity: activityName,
        hours: data.hours,
        color: data.color,
        percentage: totalHours > 0 ? (data.hours / totalHours) * 100 : 0,
      }))
      .sort((a, b) => b.hours - a.hours);

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      period,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      totalHours,
      activities: summary,
    };
  };

gSheetStorage(
  'Calendar',
  '1gI4tbIt1ETMm6aPXNdk5ycHt8tHlJr-TxkbKuAKqBKc',
  '233614322'
).handleStore(useStore);
