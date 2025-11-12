import { generateHourBlocks } from '@/apps/DayTracker/lib/hour-utils';
import dayjs from '@/helpers/dayjs';
import type { EventType, Label } from './index';

type StoreType = {
  events: Array<EventType>;
  labels: Array<Label>;
  hiddenLabelIds: string[];
};

// Helper function to convert calendar event times to hour blocks
function eventToHourBlocks(start: string, end: string): string[] {
  const startDate = dayjs(start);
  const endDate = dayjs(end);
  const hours: string[] = [];
  
  // Get all hours between start and end (end is exclusive, but we need to handle end-of-day properly)
  let current = startDate.startOf('hour');
  const endHourDate = endDate.startOf('hour');
  
  // If end time is at the start of an hour, it's exclusive
  // If end time has minutes/seconds, we need to include that hour
  const shouldIncludeEndHour = endDate.minute() > 0 || endDate.second() > 0 || endDate.millisecond() > 0;
  
  while (current.isBefore(endHourDate, 'hour') || (shouldIncludeEndHour && current.isSame(endHourDate, 'hour'))) {
    hours.push(current.format('HH:mm'));
    current = current.add(1, 'hour');
  }
  
  return hours;
}

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
    const now = dayjs();
    const today = now.format('YYYY-MM-DD');

    let startDate: string;
    let endDate: string = today;

    switch (period) {
      case 'daily':
        startDate = today;
        break;
      case 'weekly':
        startDate = now.subtract(6, 'day').format('YYYY-MM-DD');
        break;
      case 'monthly':
        startDate = now.subtract(1, 'month').format('YYYY-MM-DD');
        break;
      case '3months':
        startDate = now.subtract(3, 'month').format('YYYY-MM-DD');
        break;
      case '6months':
        startDate = now.subtract(6, 'month').format('YYYY-MM-DD');
        break;
      case 'year':
        startDate = now.subtract(1, 'year').format('YYYY-MM-DD');
        break;
    }

    const dayTrackerEvents = selectDayTrackerEvents(state);
    
    // Filter events within the date range
    const filteredEvents = dayTrackerEvents.filter((event) => {
      const eventStart = dayjs(event.start);
      const eventDate = eventStart.format('YYYY-MM-DD');
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

    return {
      period,
      startDate,
      endDate,
      totalHours,
      activities: summary,
    };
  };

