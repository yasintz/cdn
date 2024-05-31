import {
  gSheetStorage,
  handleStoreLoadingState,
} from '@/utils/zustand/gsheet-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

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
  }>;

  todos: Array<{
    id: string;
    text: string;
    completed: boolean;
    entryId: string;
  }>;

  createSession: (name: string) => void;
  createEntry: (sessionId: string) => void;
  updateEntryTime: (id: string, time: number) => void;
  createTodo: (entryId: string, text: string) => void;
  toggleTodo: (id: string) => void;

  deleteSession: (id: string) => void;
  deleteEntry: (id: string) => void;
  deleteTodo: (id: string) => void;
};

const uid = () => Math.random().toString(36).substring(2, 9);

export const useStore = create<StoreType>()(
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

        createEntry: (sessionId) =>
          set((prev) => ({
            entries: [
              ...prev.entries,
              {
                id: uid(),
                sessionId,
                time:
                  (prev.entries[prev.entries.length - 1]?.time || 0) +
                  1000 * 60 * 5,
              },
            ],
          })),

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

        createTodo: (entryId, text) =>
          set((prev) => ({
            todos: [
              ...prev.todos,
              {
                id: uid(),
                entryId,
                text,
                completed: false,
              },
            ],
          })),

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
        deleteSession: (id) =>
          set((prev) => ({
            sessions: prev.sessions.filter((session) => session.id !== id),
          })),
        deleteEntry: (id) =>
          set((prev) => ({
            entries: prev.entries.filter((session) => session.id !== id),
          })),
        deleteTodo: (id) =>
          set((prev) => ({
            todos: prev.todos.filter((session) => session.id !== id),
          })),
      } as StoreType),
    {
      name: 'timeline-todo',
      storage: createJSONStorage(() =>
        gSheetStorage('1gI4tbIt1ETMm6aPXNdk5ycHt8tHlJr-TxkbKuAKqBKc')
      ),
    }
  )
);

handleStoreLoadingState(useStore, 'isLoading');
