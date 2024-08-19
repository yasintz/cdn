import { computed } from 'zustand-computed-state';
import { gSheetStorage } from '@/utils/zustand/gsheet-storage';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { uid } from '@/utils/uid';

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
};

type StoreType = {
  events: Array<EventType>;

  createEvent: (event: Omit<EventType, 'id'>) => string;
  updateEvent: (id: string, event: Omit<EventType, 'id'>) => void;
  deleteEvent: (id: string) => void;
};

export const useStore = create<StoreType>()(
  computed(
    immer(
      persist(
        (set) => ({
          events: [],
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
              prev.events[index] = {
                ...prev.events[index],
                ...event,
              };
            });
          },

          deleteEvent: (id) => {
            set((prev) => {
              prev.events = prev.events.filter((event) => event.id !== id);
            });
          },
        }),
        { name: 'calendar' }
      )
    )
  )
);

gSheetStorage(
  'Calendar',
  '1gI4tbIt1ETMm6aPXNdk5ycHt8tHlJr-TxkbKuAKqBKc',
  '233614322'
).handleStore(useStore);
