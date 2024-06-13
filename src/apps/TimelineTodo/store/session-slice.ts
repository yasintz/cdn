import type { EntryType, TodoStoreCreator, TodoType } from '.';
import { uid } from '@/utils/uid';

export type SessionType = {
  id: string;
  name: string;
  archived?: boolean;
};

export type SessionSliceType = {
  sessions: SessionType[];

  createSession: (name: string) => void;
  duplicateSession: (id: string, name: string) => void;
  archiveSession: (id: string, archived: boolean) => void;
  deleteSession: (id: string) => void;
  reorderSessions: (sessionIds: string[]) => void;
};

export const createSessionSlice: TodoStoreCreator<SessionSliceType> = (
  set
) => ({
  sessions: [],
  reorderSessions: (sessionIds) =>
    set((prev) => {
      prev.sessions.sort(
        (a, b) => sessionIds.indexOf(a.id) - sessionIds.indexOf(b.id)
      );
    }),
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
  archiveSession: (id, archived) =>
    set((prev) => {
      const session = prev.sessions.find((session) => session.id === id);
      if (session) {
        session.archived = archived;
      }
    }),
  deleteSession: (id) =>
    set((prev) => {
      prev.sessions = prev.sessions.filter((session) => session.id !== id);
      const deletedEntryIds = prev.entries
        .filter((entry) => entry.sessionId === id)
        .map((i) => i.id);

      prev.entries = prev.entries.filter((entry) => entry.sessionId !== id);

      prev.todos = prev.todos.filter(
        (todo) => !deletedEntryIds.includes(todo.entryId)
      );
    }),
});
