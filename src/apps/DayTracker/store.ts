import { computed } from 'zustand-computed-state';
import { gSheetStorage } from '@/utils/zustand/gsheet-storage';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { uid } from '@/utils/uid';
import { generateHourBlocks } from './lib/hour-utils';

export interface Activity {
  name: string;
  color: string;
}

export interface Settings {
  startTime: string;
  activities: Activity[];
}

export interface TimeEntry {
  id: string;
  time: string; // Format: 'YYYY-MM-DD HH:mm'
  activity: string | null;
}

export interface TrackerData {
  settings: Settings;
  entries: TimeEntry[];
}

const defaultSettings: Settings = {
  startTime: '08:00',
  activities: [
    { name: 'Work', color: '#4CAF50' },
    { name: 'Exercise', color: '#2196F3' },
    { name: 'Reading', color: '#FFC107' },
  ],
};

type StoreType = {
  settings: Settings;
  entries: TimeEntry[];

  // Settings methods
  updateSettings: (settings: Partial<Settings>) => void;
  updateStartTime: (startTime: string) => void;
  updateActivities: (activities: Activity[]) => void;

  // Entry methods
  updateDayHours: (date: string, hours: Array<{ hour: string; activity: string | null }>) => void;
  getDayData: (date: string) => {
    date: string;
    hours: Array<{ hour: string; activity: string | null }>;
  };
  getSummary: (period: 'daily' | 'weekly' | 'monthly' | '3months' | '6months' | 'year') => {
    period: string;
    startDate: string;
    endDate: string;
    totalHours: number;
    activities: Array<{
      activity: string;
      hours: number;
      color: string;
      percentage: number;
    }>;
  };
};

export const useStore = create<StoreType>()(
  computed(
    immer(
      persist(
        (set, get) => ({
          settings: defaultSettings,
          entries: [],

          updateSettings: (newSettings) => {
            set((prev) => {
              prev.settings = {
                ...prev.settings,
                ...newSettings,
              };
            });
          },

          updateStartTime: (startTime) => {
            set((prev) => {
              prev.settings.startTime = startTime;
            });
          },

          updateActivities: (activities) => {
            set((prev) => {
              prev.settings.activities = activities;
            });
          },

          updateDayHours: (date, hours) => {
            set((prev) => {
              // Create a map of existing entries for this date
              const existingHourMap = new Map<string, TimeEntry>();
              prev.entries.forEach((entry) => {
                const [entryDate, entryHour] = entry.time.split(' ');
                if (entryDate === date) {
                  existingHourMap.set(entryHour, entry);
                }
              });

              // Update the map with new hours
              hours.forEach((hour) => {
                if (hour.activity !== null) {
                  existingHourMap.set(hour.hour, {
                    id: `${date}-${hour.hour}`,
                    time: `${date} ${hour.hour}`,
                    activity: hour.activity,
                  });
                } else {
                  // Remove entry if activity is null
                  existingHourMap.delete(hour.hour);
                }
              });

              // Remove all existing entries for this date
              prev.entries = prev.entries.filter((entry) => {
                const [entryDate] = entry.time.split(' ');
                return entryDate !== date;
              });

              // Add back all entries (existing + updated)
              existingHourMap.forEach((entry) => {
                prev.entries.push(entry);
              });
            });
          },

          getDayData: (date) => {
            const state = get();
            const allHourBlocks = generateHourBlocks(state.settings.startTime);
            const hourMap = new Map<string, string | null>();

            // Find all entries for this date
            state.entries.forEach((entry) => {
              const [entryDate, entryHour] = entry.time.split(' ');
              if (entryDate === date) {
                hourMap.set(entryHour, entry.activity);
              }
            });

            // Return day with all 24 hours, filling in missing ones with null
            return {
              date,
              hours: allHourBlocks.map((hour) => ({
                hour,
                activity: hourMap.get(hour) ?? null,
              })),
            };
          },

          getSummary: (period) => {
            const state = get();
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            let startDate: Date;
            const endDate: Date = today;

            switch (period) {
              case 'daily':
                startDate = today;
                break;
              case 'weekly':
                // Last 7 days including today
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

            // Filter entries within the date range
            const filteredEntries = state.entries.filter((entry) => {
              const [entryDate] = entry.time.split(' ');
              const entryDateObj = new Date(entryDate);
              return entryDateObj >= startDate && entryDateObj <= endDate;
            });

            // Group by activity and count hours
            const activityHours = new Map<string, number>();
            let totalHours = 0;

            filteredEntries.forEach((entry) => {
              if (entry.activity) {
                const current = activityHours.get(entry.activity) || 0;
                activityHours.set(entry.activity, current + 1);
                totalHours++;
              }
            });

            // Convert to array with activity details
            const summary = Array.from(activityHours.entries())
              .map(([activityName, hours]) => {
                const activity = state.settings.activities.find(
                  (a) => a.name === activityName
                );
                return {
                  activity: activityName,
                  hours,
                  color: activity?.color || '#808080',
                  percentage: totalHours > 0 ? (hours / totalHours) * 100 : 0,
                };
              })
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
          },
        }),
        { name: 'day-tracker' }
      )
    )
  )
);

// Google Sheets integration
// Sheet ID: 18V9-Sd-JQtEgcuxtW43VRqt_bzJr9Q9Y78qBer1ewJ4
// Tab ID: 0
gSheetStorage(
  'Day Tracker',
  '18V9-Sd-JQtEgcuxtW43VRqt_bzJr9Q9Y78qBer1ewJ4',
  '0'
).handleStore(useStore);

