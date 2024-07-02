import type { EntryType, TodoStoreCreator, TodoType } from '..';
import { uid } from '@/utils/uid';

type ViewType = 'note' | 'day-view';

export type SessionType = {
  id: string;
  name: string;
  archived?: boolean;
  parentId?: string;
  view?: ViewType;
  createdAt: number;
  tooltipText?: string;
};

export type SessionSliceType = {
  sessions: SessionType[];

  createSession: (
    params: Pick<SessionType, 'name' | 'parentId' | 'tooltipText'>
  ) => void;
  changeParent: (name: string, parentId?: string) => void;
  duplicateSession: (
    id: string,
    params: Pick<SessionType, 'name' | 'parentId' | 'tooltipText'>
  ) => void;
  updateSession: (id: string, values: Partial<Omit<SessionType, 'id'>>) => void;
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
  createSession: (params) =>
    set((prev) => {
      prev.sessions.push({
        id: uid(),
        ...params,
        createdAt: Date.now(),
      });
    }),
  updateSession: (id, values) =>
    set((prev) => {
      const session = prev.sessions.find((i) => i.id === id);
      if (session) {
        Object.assign(session, values);
      }
    }),
  changeParent: (id, parentId) =>
    set((prev) => {
      const session = prev.sessions.find((i) => i.id === id);
      if (session) {
        session.parentId = parentId;
      }
    }),
  duplicateSession: (sessionId, params) =>
    set((prev) => {
      const newSession: SessionType = {
        id: uid(),
        ...params,
        createdAt: Date.now(),
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
