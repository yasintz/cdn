import _ from 'lodash';
import { compute } from 'zustand-computed-state';
import { EntryType, TodoStoreCreator } from '.';
import { uid } from '@/utils/uid';
import { tagsChildGroupMap, tagsGroup } from '../utils/tags';
import { cloneEntry } from './utils';

export type EntrySliceType = {
  entries: Array<{
    id: string;
    title: string;
    sessionId: string;
    time: number;
    duration: number;
    tags: string[];
    note?: string;
    externalCalendarEventId?: string;
  }>;
  allTags: Array<string>;

  // openedEntryNoteId?: string;

  updateEntry: (id: string, value: Partial<Omit<EntryType, 'id'>>) => void;
  updateEntryNote: (id: string, value: string) => void;
  // openEntryNote: (id: string) => void;
  stickEntryToPrev: (id: string) => void;
  // closeEntryNote: () => void;

  createEntry: (sessionId: string, time?: number, duration?: number) => void;
  updateEntryTimeWithPrev: (id: string, time: number) => void;
  deleteEntry: (id: string) => void;
  toggleEntryTag: (id: string, tag: string) => void;
  duplicateEntry: (id: string, newSessionId?: string) => void;
};

export const createEntrySlice: TodoStoreCreator<EntrySliceType> = (
  set,
  get
) => ({
  entries: [],

  // openEntryNote: (id) => set({ openedEntryNoteId: id }),
  // closeEntryNote: () => set({ openedEntryNoteId: undefined }),
  updateEntryNote: (id, note) =>
    set((prev) => {
      const entry = prev.entries.find((e) => e.id === id);

      if (entry) {
        entry.note = note;
      }
    }),

  updateEntry: (id, newValues) =>
    set((prev) => {
      const entry = prev.entries.find((e) => e.id === id);

      if (entry) {
        Object.assign(entry, newValues);
      }
    }),

  createEntry: (sessionId, time, duration) =>
    set((prev) => {
      const sessionEntries = prev.entries.filter(
        (entry) => entry.sessionId === sessionId
      );

      const lastEntry = _.last(_.orderBy(sessionEntries, 'time'));

      prev.entries.push({
        id: uid(),
        sessionId,
        time: time || (lastEntry?.time || 0) + 1000 * 60 * 5,
        tags: [],
        duration: duration || 0,
        title: '',
      });
    }),
  updateEntryTimeWithPrev: (id, time) =>
    set((prev) => {
      const entry = prev.entries.find((entry) => entry.id === id);
      const relations = prev.getRelations();
      const prevEntryId = relations.entries
        .find((i) => i.id === id)
        ?.prev()?.id;
      const prevEntry = prev.entries.find((e) => e.id === prevEntryId);

      if (!entry) {
        return;
      }

      if (prevEntry) {
        const prevEntryEndTime = prevEntry.time + prevEntry.duration;
        if (prevEntryEndTime === entry.time) {
          prevEntry.duration = time - prevEntry.time;
        }
      }
      entry.time = time;
    }),

  stickEntryToPrev: (id) =>
    set((prev) => {
      const entry = prev.entries.find((entry) => entry.id === id);
      const relations = prev.getRelations();
      const prevEntry = relations.entries.find((i) => i.id === id)?.prev();

      if (!entry) {
        return;
      }

      if (prevEntry) {
        entry.time = prevEntry.time + prevEntry.duration;
      }
    }),

  deleteEntry: (id) =>
    set((prev) => ({
      entries: prev.entries.filter((session) => session.id !== id),
    })),

  duplicateEntry: (entryId, newSessionId) =>
    set((prev) => {
      const relations = get().getRelations();
      const entry = relations.entries.find((entry) => entry.id === entryId);
      const session = entry?.session();

      if (!entry || !session) {
        return;
      }

      const sessionEntries = session.entries();
      const entryIndex = sessionEntries.findIndex((e) => e.id === entry.id);
      const nextEntry = sessionEntries[entryIndex + 1];

      const newEntry = cloneEntry(entry);
      const newNextEntry = cloneEntry(nextEntry);

      if (newSessionId) {
        newEntry.entry.sessionId = newSessionId;
        newNextEntry.entry.sessionId = newSessionId;
      }

      prev.todos.push(...newEntry.todos, ...newNextEntry.todos);
      prev.entries.push(newEntry.entry, newNextEntry.entry);
    }),

  toggleEntryTag: (id, tag) =>
    set((prev) => {
      const entry = prev.entries.find((e) => e.id === id);

      if (!entry) {
        return;
      }
      const tagParent = tagsChildGroupMap[tag];

      if (entry.tags.includes(tag)) {
        entry.tags = entry.tags.filter((t) => t !== tag);

        const isThereAnotherChild = tagsGroup[tagParent]?.some((t) =>
          entry.tags.includes(t)
        );

        if (tagParent && !isThereAnotherChild) {
          entry.tags = entry.tags.filter((t) => t !== tagParent);
        }

        return;
      }

      if (tagParent && !entry.tags.includes(tagParent)) {
        entry.tags = [...(entry.tags || []), tagParent];
      }

      entry.tags = [...(entry.tags || []), tag];
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
