import { computed, compute } from 'zustand-computed-state';
import { gSheetStorage } from '@/utils/zustand/gsheet-storage';
import _ from 'lodash';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export type StoreType = {
  isLoading: boolean;
  sessions: Array<{
    id: string;
    name: string;
    archived?: boolean;
  }>;

  entries: Array<{
    id: string;
    sessionId: string;
    time: number;
    tags: string[];
  }>;

  todos: Array<{
    id: string;
    text: string;
    completed: boolean;
    entryId: string;
  }>;

  allTags: Array<string>;

  createSession: (name: string) => void;
  duplicateSession: (id: string, name: string) => void;
  archiveSession: (id: string, archived: boolean) => void;
  createEntry: (sessionId: string, time?: number) => void;
  updateEntryTime: (id: string, time: number, batchUpdating: boolean) => void;
  createTodo: (entryId: string, text: string) => string;
  toggleTodo: (id: string) => void;
  updateTodoText: (id: string, text: string) => void;
  deleteSession: (id: string) => void;
  deleteEntry: (id: string) => void;
  deleteTodo: (id: string) => void;
  reorderTodo: (id: string, direction: 'up' | 'down') => void;
  toggleEntryTag: (id: string, tag: string) => void;
};

export type SessionType = StoreType['sessions'][number];
export type EntryType = StoreType['entries'][number];
export type TodoType = StoreType['todos'][number];

const uid = () => Math.random().toString(36).substring(2, 9);

export const useStore = create<StoreType>()(
  computed(
    immer(
      persist(
        (set, get) =>
          ({
            isLoading: true,
            entries: [],
            todos: [],
            sessions: [],
            createSession: (name) =>
              set((prev) => ({
                sessions: [
                  ...prev.sessions,
                  {
                    id: uid(),
                    name,
                  },
                ],
              })),
            duplicateSession: (sessionId, name) =>
              set((prev) => {
                const newSession = {
                  id: uid(),
                  name,
                };

                prev.sessions.push(newSession);

                const entries = prev.entries
                  .filter((entry) => entry.sessionId === sessionId)
                  .map((entry) => ({
                    entry,
                    todos: prev.todos.filter(
                      (todo) => todo.entryId === entry.id
                    ),
                  }));

                entries.forEach(({ entry, todos }) => {
                  const newEntry: EntryType = {
                    ...entry,
                    id: uid(),
                    sessionId: newSession.id,
                  };
                  prev.entries.push(newEntry);

                  todos.forEach((todo) => {
                    const newTodo: TodoType = {
                      ...todo,
                      id: uid(),
                      entryId: newEntry.id,
                    };
                    prev.todos.push(newTodo);
                  });
                });
              }),
            archiveSession: (id, archived) =>
              set((prev) => {
                const session = prev.sessions.find(
                  (session) => session.id === id
                );
                if (session) {
                  session.archived = archived;
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
                    prev.entries.filter(
                      (entry) => entry.sessionId === entry.sessionId
                    ),
                    'time'
                  );

                  const entryIndex = sessionEntries.findIndex(
                    (e) => e.id === entry.id
                  );
                  sessionEntries.forEach((sessionEntry, index) => {
                    if (index > entryIndex) {
                      sessionEntry.time += diff;
                    }
                  });
                }

                entry.time = time;
              }),

            createTodo: (entryId, text) => {
              const id = uid();
              set((prev) => ({
                todos: [
                  ...prev.todos,
                  {
                    id,
                    entryId,
                    text,
                    completed: false,
                  },
                ],
              }));

              return id;
            },

            toggleTodo: (id) =>
              set((prev) => ({
                todos: prev.todos.map((todo) =>
                  todo.id === id
                    ? {
                        ...todo,
                        completed: !todo.completed,
                      }
                    : todo
                ),
              })),
            updateTodoText: (id, text) =>
              set((prev) => {
                const todo = prev.todos.find((todo) => todo.id === id);

                if (todo) {
                  todo.text = text;
                }
              }),
            deleteSession: (id) =>
              set((prev) => {
                prev.sessions = prev.sessions.filter(
                  (session) => session.id !== id
                );
                const deletedEntryIds = prev.entries
                  .filter((entry) => entry.sessionId === id)
                  .map((i) => i.id);

                prev.entries = prev.entries.filter(
                  (entry) => entry.sessionId !== id
                );

                prev.todos = prev.todos.filter(
                  (todo) => !deletedEntryIds.includes(todo.entryId)
                );
              }),
            deleteEntry: (id) =>
              set((prev) => ({
                entries: prev.entries.filter((session) => session.id !== id),
              })),
            deleteTodo: (id) =>
              set((prev) => ({
                todos: prev.todos.filter((session) => session.id !== id),
              })),
            reorderTodo: (id, direction: 'up' | 'down') => {
              set((prev) => {
                const todo = prev.todos.find((todo) => todo.id === id);
                const entry = prev.entries.find(
                  (entry) => entry.id === todo?.entryId
                );
                const entryTodos = prev.todos.filter(
                  (todo) => todo.entryId === entry?.id
                );

                if (!entry || !todo) {
                  return prev;
                }

                const todoIndex = entryTodos.indexOf(todo);
                prev.todos.splice(todoIndex, 1);

                if (direction === 'up') {
                  const prevItem = entryTodos[todoIndex - 1];
                  const prevItemIndex = prev.todos.indexOf(prevItem);
                  prev.todos.splice(prevItemIndex, 0, todo);
                } else {
                  const nextItem = entryTodos[todoIndex + 1];
                  const nextItemIndex = prev.todos.indexOf(nextItem);
                  prev.todos.splice(nextItemIndex + 1, 0, todo);
                }
              });
            },
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
            ...compute(get, (state) => ({
              allTags: _.uniq(
                state.entries.reduce(
                  (acc, entry) => [...acc, ...entry.tags],
                  [] as StoreType['allTags']
                )
              ),
            })),
          } as StoreType),
        {
          name: 'timeline-todo',
        }
      )
    )
  )
);

gSheetStorage('1gI4tbIt1ETMm6aPXNdk5ycHt8tHlJr-TxkbKuAKqBKc').handleStore(
  useStore
);
