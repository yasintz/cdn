import { describe, it, expect, beforeEach } from 'vitest';
import { useStore, selectDayData, selectDayTrackerEvents } from '.';
import dayjs from '@/helpers/dayjs';

describe('Calendar Store - DayTracker', () => {
  beforeEach(() => {
    // Reset store before each test
    const state = useStore.getState();
    state.events = [];
    state.labels = [];
    state.hiddenLabelIds = [];
  });

  describe('eventToHourBlocks - via createDayTrackerEvent', () => {
    it('should create hour blocks for same-day event', () => {
      const date = '2024-01-01';
      const hours = [
        { hour: '10:00', activity: 'Work' },
        { hour: '11:00', activity: 'Work' },
        { hour: '12:00', activity: 'Work' },
      ];

      useStore.getState().createDayTrackerEvent(date, hours);

      const state = useStore.getState();
      const dayData = selectDayData(date)(state);

      expect(dayData.hours.find((h) => h.hour === '10:00')?.activity).toBe('Work');
      expect(dayData.hours.find((h) => h.hour === '11:00')?.activity).toBe('Work');
      expect(dayData.hours.find((h) => h.hour === '12:00')?.activity).toBe('Work');
      expect(dayData.hours.find((h) => h.hour === '09:00')?.activity).toBe(null);
      expect(dayData.hours.find((h) => h.hour === '13:00')?.activity).toBe(null);
    });

    it('should handle event spanning to next day (22:00 - 00:00)', () => {
      const date = '2024-01-01';
      const hours = [
        { hour: '22:00', activity: 'Sleep' },
        { hour: '23:00', activity: 'Sleep' },
      ];

      useStore.getState().createDayTrackerEvent(date, hours);

      const state = useStore.getState();
      const dayData = selectDayData(date)(state);

      // Both 22:00 and 23:00 should be filled on the first day
      expect(dayData.hours.find((h) => h.hour === '22:00')?.activity).toBe('Sleep');
      expect(dayData.hours.find((h) => h.hour === '23:00')?.activity).toBe('Sleep');
      expect(dayData.hours.find((h) => h.hour === '21:00')?.activity).toBe(null);

      // Check that the event was created correctly
      const events = selectDayTrackerEvents(state);
      expect(events.length).toBe(1);
      expect(events[0].title).toBe('Sleep');
      
      // The event should start at 22:00 on day 1
      const eventStart = dayjs(events[0].start);
      expect(eventStart.format('YYYY-MM-DD HH:mm')).toBe('2024-01-01 22:00');
      
      // The event should end at 00:00 on day 2
      const eventEnd = dayjs(events[0].end);
      expect(eventEnd.format('YYYY-MM-DD HH:mm')).toBe('2024-01-02 00:00');
    });

    it('should show no hours on next day when event ends at 00:00', () => {
      const date = '2024-01-01';
      const hours = [
        { hour: '22:00', activity: 'Sleep' },
        { hour: '23:00', activity: 'Sleep' },
      ];

      useStore.getState().createDayTrackerEvent(date, hours);

      const state = useStore.getState();
      const nextDayData = selectDayData('2024-01-02')(state);

      // No hours should be filled on the next day since event ends at 00:00 (exclusive)
      expect(nextDayData.hours.find((h) => h.hour === '00:00')?.activity).toBe(null);
      expect(nextDayData.hours.find((h) => h.hour === '01:00')?.activity).toBe(null);
    });

    it('should handle event spanning multiple hours across midnight', () => {
      const date = '2024-01-01';
      const hours = [
        { hour: '20:00', activity: 'Party' },
        { hour: '21:00', activity: 'Party' },
        { hour: '22:00', activity: 'Party' },
        { hour: '23:00', activity: 'Party' },
      ];

      useStore.getState().createDayTrackerEvent(date, hours);

      const state = useStore.getState();
      const dayData = selectDayData(date)(state);

      // All hours should be filled
      expect(dayData.hours.find((h) => h.hour === '20:00')?.activity).toBe('Party');
      expect(dayData.hours.find((h) => h.hour === '21:00')?.activity).toBe('Party');
      expect(dayData.hours.find((h) => h.hour === '22:00')?.activity).toBe('Party');
      expect(dayData.hours.find((h) => h.hour === '23:00')?.activity).toBe('Party');
    });

    it('should handle event ending at end of day (23:59)', () => {
      const date = '2024-01-01';
      const hours = [
        { hour: '22:00', activity: 'Work' },
        { hour: '23:00', activity: 'Work' },
      ];

      useStore.getState().createDayTrackerEvent(date, hours);

      const state = useStore.getState();
      const events = selectDayTrackerEvents(state);
      
      expect(events.length).toBe(1);
      
      // Event should end at 00:00 next day (23:00 + 1 hour)
      const eventEnd = dayjs(events[0].end);
      expect(eventEnd.format('YYYY-MM-DD HH:mm')).toBe('2024-01-02 00:00');
    });

    it('should handle multiple activities in one day', () => {
      const date = '2024-01-01';
      const hours = [
        { hour: '09:00', activity: 'Work' },
        { hour: '10:00', activity: 'Work' },
        { hour: '11:00', activity: 'Work' },
        { hour: '12:00', activity: 'Lunch' },
        { hour: '13:00', activity: 'Work' },
        { hour: '14:00', activity: 'Work' },
        { hour: '15:00', activity: null },
        { hour: '16:00', activity: 'Meeting' },
      ];

      useStore.getState().createDayTrackerEvent(date, hours);

      const state = useStore.getState();
      const dayData = selectDayData(date)(state);

      expect(dayData.hours.find((h) => h.hour === '09:00')?.activity).toBe('Work');
      expect(dayData.hours.find((h) => h.hour === '10:00')?.activity).toBe('Work');
      expect(dayData.hours.find((h) => h.hour === '11:00')?.activity).toBe('Work');
      expect(dayData.hours.find((h) => h.hour === '12:00')?.activity).toBe('Lunch');
      expect(dayData.hours.find((h) => h.hour === '13:00')?.activity).toBe('Work');
      expect(dayData.hours.find((h) => h.hour === '14:00')?.activity).toBe('Work');
      expect(dayData.hours.find((h) => h.hour === '15:00')?.activity).toBe(null);
      expect(dayData.hours.find((h) => h.hour === '16:00')?.activity).toBe('Meeting');

      // Should create 4 separate events (3 work blocks, 1 lunch, 1 meeting)
      const events = selectDayTrackerEvents(state);
      expect(events.length).toBe(4);
    });

    it('should handle single hour activity', () => {
      const date = '2024-01-01';
      const hours = [
        { hour: '14:00', activity: 'Meeting' },
      ];

      useStore.getState().createDayTrackerEvent(date, hours);

      const state = useStore.getState();
      const dayData = selectDayData(date)(state);

      expect(dayData.hours.find((h) => h.hour === '14:00')?.activity).toBe('Meeting');
      expect(dayData.hours.find((h) => h.hour === '13:00')?.activity).toBe(null);
      expect(dayData.hours.find((h) => h.hour === '15:00')?.activity).toBe(null);

      const events = selectDayTrackerEvents(state);
      expect(events.length).toBe(1);
      
      // Event should span from 14:00 to 15:00
      const event = events[0];
      expect(dayjs(event.start).format('HH:mm')).toBe('14:00');
      expect(dayjs(event.end).format('HH:mm')).toBe('15:00');
    });

    it('should handle early morning hours (00:00 - 06:00)', () => {
      const date = '2024-01-01';
      const hours = [
        { hour: '00:00', activity: 'Sleep' },
        { hour: '01:00', activity: 'Sleep' },
        { hour: '02:00', activity: 'Sleep' },
        { hour: '03:00', activity: 'Sleep' },
        { hour: '04:00', activity: 'Sleep' },
        { hour: '05:00', activity: 'Sleep' },
      ];

      useStore.getState().createDayTrackerEvent(date, hours);

      const state = useStore.getState();
      const dayData = selectDayData(date)(state);

      for (let i = 0; i <= 5; i++) {
        const hour = `${i.toString().padStart(2, '0')}:00`;
        expect(dayData.hours.find((h) => h.hour === hour)?.activity).toBe('Sleep');
      }
    });

    it('should replace existing events for the same date', () => {
      const date = '2024-01-01';
      
      // Create first event
      useStore.getState().createDayTrackerEvent(date, [
        { hour: '10:00', activity: 'Work' },
        { hour: '11:00', activity: 'Work' },
      ]);

      let state = useStore.getState();
      let events = selectDayTrackerEvents(state);
      expect(events.length).toBe(1);

      // Update with new event
      useStore.getState().createDayTrackerEvent(date, [
        { hour: '10:00', activity: 'Meeting' },
        { hour: '11:00', activity: 'Meeting' },
        { hour: '12:00', activity: 'Meeting' },
      ]);

      state = useStore.getState();
      events = selectDayTrackerEvents(state);
      
      // Should still have only 1 event (replaced)
      expect(events.length).toBe(1);
      expect(events[0].title).toBe('Meeting');

      const dayData = selectDayData(date)(state);
      expect(dayData.hours.find((h) => h.hour === '10:00')?.activity).toBe('Meeting');
      expect(dayData.hours.find((h) => h.hour === '11:00')?.activity).toBe('Meeting');
      expect(dayData.hours.find((h) => h.hour === '12:00')?.activity).toBe('Meeting');
    });

    it('should preserve colors when updating events', () => {
      const date = '2024-01-01';
      
      // Create first event with a specific color
      useStore.getState().createDayTrackerEvent(date, [
        { hour: '10:00', activity: 'Work' },
      ]);

      let state = useStore.getState();
      let events = selectDayTrackerEvents(state);
      const originalColor = events[0].color;

      // Update event but keep same activity name
      useStore.getState().createDayTrackerEvent(date, [
        { hour: '10:00', activity: 'Work' },
        { hour: '11:00', activity: 'Work' },
      ]);

      state = useStore.getState();
      events = selectDayTrackerEvents(state);
      
      // Color should be preserved
      expect(events[0].color).toBe(originalColor);
    });

    it('should handle clearing all activities for a day', () => {
      const date = '2024-01-01';
      
      // Create event
      useStore.getState().createDayTrackerEvent(date, [
        { hour: '10:00', activity: 'Work' },
        { hour: '11:00', activity: 'Work' },
      ]);

      let state = useStore.getState();
      let events = selectDayTrackerEvents(state);
      expect(events.length).toBe(1);

      // Clear all activities
      const allHours = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i.toString().padStart(2, '0')}:00`,
        activity: null,
      }));
      useStore.getState().createDayTrackerEvent(date, allHours);

      state = useStore.getState();
      events = selectDayTrackerEvents(state);
      
      // Should have no events
      expect(events.length).toBe(0);

      const dayData = selectDayData(date)(state);
      dayData.hours.forEach((h) => {
        expect(h.activity).toBe(null);
      });
    });
  });

  describe('selectDayData', () => {
    it('should return all 24 hours for a day', () => {
      const date = '2024-01-01';
      const state = useStore.getState();
      const dayData = selectDayData(date)(state);

      expect(dayData.hours.length).toBe(24);
      expect(dayData.date).toBe(date);
    });

    it('should handle events that span across multiple days', () => {
      // Create an event that starts on day 1 and ends on day 3
      let state = useStore.getState();
      
      // Manually create a multi-day event
      let dayTrackerLabel = state.labels.find((l) => l.name === 'day-tracker');
      if (!dayTrackerLabel) {
        state.createLabel({ name: 'day-tracker', color: '#808080' });
        state = useStore.getState(); // Refresh state after creating label
        dayTrackerLabel = state.labels.find((l) => l.name === 'day-tracker');
      }
      
      const labelId = dayTrackerLabel!.id;
      
      state.createEvent({
        title: 'Conference',
        start: dayjs('2024-01-01 09:00').toISOString(),
        end: dayjs('2024-01-03 17:00').toISOString(),
        color: '#ff0000',
        labels: [labelId],
      });

      // Refresh state after creating event
      state = useStore.getState();

      // Check day 1 - should have hours from 09:00 to 23:00
      const day1Data = selectDayData('2024-01-01')(state);
      expect(day1Data.hours.find((h) => h.hour === '09:00')?.activity).toBe('Conference');
      expect(day1Data.hours.find((h) => h.hour === '23:00')?.activity).toBe('Conference');
      expect(day1Data.hours.find((h) => h.hour === '08:00')?.activity).toBe(null);

      // Check day 2 - should have all 24 hours filled
      const day2Data = selectDayData('2024-01-02')(state);
      expect(day2Data.hours.find((h) => h.hour === '00:00')?.activity).toBe('Conference');
      expect(day2Data.hours.find((h) => h.hour === '12:00')?.activity).toBe('Conference');
      expect(day2Data.hours.find((h) => h.hour === '23:00')?.activity).toBe('Conference');

      // Check day 3 - should have hours from 00:00 to 16:00 (17:00 is exclusive)
      const day3Data = selectDayData('2024-01-03')(state);
      expect(day3Data.hours.find((h) => h.hour === '00:00')?.activity).toBe('Conference');
      expect(day3Data.hours.find((h) => h.hour === '16:00')?.activity).toBe('Conference');
      expect(day3Data.hours.find((h) => h.hour === '17:00')?.activity).toBe(null);
    });
  });

  describe('Edge cases', () => {
    it('should handle event at exact midnight (00:00)', () => {
      const date = '2024-01-01';
      const hours = [
        { hour: '00:00', activity: 'Midnight' },
      ];

      useStore.getState().createDayTrackerEvent(date, hours);

      const state = useStore.getState();
      const dayData = selectDayData(date)(state);

      expect(dayData.hours.find((h) => h.hour === '00:00')?.activity).toBe('Midnight');
    });

    it('should handle event at 23:00 (last hour of day)', () => {
      const date = '2024-01-01';
      const hours = [
        { hour: '23:00', activity: 'Late Night' },
      ];

      useStore.getState().createDayTrackerEvent(date, hours);

      const state = useStore.getState();
      const dayData = selectDayData(date)(state);

      expect(dayData.hours.find((h) => h.hour === '23:00')?.activity).toBe('Late Night');
      
      const events = selectDayTrackerEvents(state);
      const eventEnd = dayjs(events[0].end);
      
      // Should end at 00:00 next day
      expect(eventEnd.format('YYYY-MM-DD HH:mm')).toBe('2024-01-02 00:00');
    });

    it('should handle consecutive days with different activities', () => {
      // Day 1
      useStore.getState().createDayTrackerEvent('2024-01-01', [
        { hour: '22:00', activity: 'Work' },
        { hour: '23:00', activity: 'Work' },
      ]);

      // Day 2
      useStore.getState().createDayTrackerEvent('2024-01-02', [
        { hour: '00:00', activity: 'Sleep' },
        { hour: '01:00', activity: 'Sleep' },
      ]);

      const state = useStore.getState();
      
      const day1Data = selectDayData('2024-01-01')(state);
      expect(day1Data.hours.find((h) => h.hour === '22:00')?.activity).toBe('Work');
      expect(day1Data.hours.find((h) => h.hour === '23:00')?.activity).toBe('Work');

      const day2Data = selectDayData('2024-01-02')(state);
      expect(day2Data.hours.find((h) => h.hour === '00:00')?.activity).toBe('Sleep');
      expect(day2Data.hours.find((h) => h.hour === '01:00')?.activity).toBe('Sleep');
    });
  });
});

