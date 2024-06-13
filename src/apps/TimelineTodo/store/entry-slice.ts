import _ from 'lodash';
import { compute } from 'zustand-computed-state';
import { TodoStoreCreator } from '.';
import { uid } from '@/utils/uid';

export type EntrySliceType = {
  entries: Array<{
    id: string;
    sessionId: string;
    time: number;
    tags: string[];
    note?: string;
  }>;
  allTags: Array<string>;

  openedEntryNoteId?: string;

  updateEntryNote: (id: string, value: string) => void;
  openEntryNote: (id: string) => void;
  closeEntryNote: () => void;

  createEntry: (sessionId: string, time?: number) => void;
  updateEntryTime: (id: string, time: number, batchUpdating: boolean) => void;
  deleteEntry: (id: string) => void;
  toggleEntryTag: (id: string, tag: string) => void;
};

export const createEntrySlice: TodoStoreCreator<EntrySliceType> = (
  set,
  get
) => ({
  entries: [],

  openEntryNote: (id) => set({ openedEntryNoteId: id }),
  closeEntryNote: () => set({ openedEntryNoteId: undefined }),
  updateEntryNote: (id, note) =>
    set((prev) => {
      const entry = prev.entries.find((e) => e.id === id);

      if (entry) {
        entry.note = note;
      }
    }),

  createEntry: (sessionId, time) =>
    set((prev) => {
      const sessionEntries = prev.entries.filter(
        (entry) => entry.sessionId === sessionId
      );

      const lastEntry = _.last(_.orderBy(sessionEntries, 'time'));

      return {
        entries: [
          ...prev.entries,
          {
            id: uid(),
            sessionId,
            time: time || (lastEntry?.time || 0) + 1000 * 60 * 5,
            tags: [],
          },
        ],
      };
    }),
  updateEntryTime: (id, time, batchUpdating) =>
    set((prev) => {
      const entry = prev.entries.find((entry) => entry.id === id);

      if (!entry) {
        return;
      }

      if (batchUpdating) {
        const diff = time - entry.time;
        const sessionEntries = _.orderBy(
          prev.entries.filter((entry) => entry.sessionId === entry.sessionId),
          'time'
        );

        const entryIndex = sessionEntries.findIndex((e) => e.id === entry.id);
        sessionEntries.forEach((sessionEntry, index) => {
          if (index > entryIndex) {
            sessionEntry.time += diff;
          }
        });
      }

      entry.time = time;
    }),

  deleteEntry: (id) =>
    set((prev) => ({
      entries: prev.entries.filter((session) => session.id !== id),
    })),

  toggleEntryTag: (id, tag) =>
    set((prev) => {
      const entry = prev.entries.find((e) => e.id === id);

      if (!entry) {
        return;
      }

      if (entry.tags.includes(tag)) {
        entry.tags = entry.tags.filter((t) => t !== tag);
      } else {
        entry.tags = [...(entry.tags || []), tag];
      }
    }),

  ...compute('entry', get, (state) => ({
    allTags: _.uniq(
      state.entries.reduce(
        (acc, entry) => [...acc, ...entry.tags],
        [] as string[]
      )
    ),
  })),
});
