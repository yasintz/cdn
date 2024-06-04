import {
  gSheetStorage,
  handleStoreLoadingState,
} from '@/utils/zustand/gsheet-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

type StoreType = {
  isLoading: boolean;
  sessions: Array<{
    id: string;
    name: string;
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

  createSession: (name: string) => void;
  duplicateSession: (id: string, name: string) => void;
  createEntry: (sessionId: string) => void;
  updateEntryTime: (id: string, time: number) => void;
  createTodo: (entryId: string, text: string) => string;
  toggleTodo: (id: string) => void;
  updateTodoText: (id: string, text: string) => void;

  deleteSession: (id: string) => void;
  deleteEntry: (id: string) => void;
  deleteTodo: (id: string) => void;
  reorderTodo: (id: string, direction: 'up' | 'down') => void;
};

export type SessionType = StoreType['sessions'][number];
export type EntryType = StoreType['entries'][number];
export type TodoType = StoreType['todos'][number];

const uid = () => Math.random().toString(36).substring(2, 9);

export const useStore = create<StoreType>()(
  immer(
    persist(
      (set) =>
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
                  todos: prev.todos.filter((todo) => todo.entryId === entry.id),
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

          createEntry: (sessionId) =>
            set((prev) => {
              const sessionEntries = prev.entries.filter(
                (entry) => entry.sessionId === sessionId
              );
              return {
                entries: [
                  ...prev.entries,
                  {
                    id: uid(),
                    sessionId,
                    time:
                      (sessionEntries[sessionEntries.length - 1]?.time || 0) +
                      1000 * 60 * 5,
                    tags: [],
                  },
                ],
              };
            }),

          updateEntryTime: (id, time) =>
            set((prev) => ({
              entries: prev.entries.map((entry) =>
                entry.id === id
                  ? {
                      ...entry,
                      time,
                    }
                  : entry
              ),
            })),

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
        } as StoreType),
      {
        name: 'timeline-todo',
        storage: createJSONStorage(() =>
          gSheetStorage('1gI4tbIt1ETMm6aPXNdk5ycHt8tHlJr-TxkbKuAKqBKc')
        ),
      }
    )
  )
);

handleStoreLoadingState(useStore, 'isLoading');
