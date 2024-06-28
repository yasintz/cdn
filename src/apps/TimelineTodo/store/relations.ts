import _ from 'lodash';
import type { EntryType, SessionType, StoreType, TodoType } from '.';
import ms from 'ms';

type RequiredStore = Pick<StoreType, 'sessions' | 'entries' | 'todos'>;

type SessionWithRelation = SessionType & {
  entries: () => EntryWithRelation[];
  todos: () => TodoWithRelation[];
};

export type EntryWithRelation = EntryType & {
  entryData: () => EntryType;
  session: () => SessionWithRelation | undefined;
  todos: () => TodoWithRelation[];
  next: () => EntryWithRelation | undefined;
  prev: () => EntryWithRelation | undefined;
  durationDeprecated: () => number;
  active: (now: number) => boolean;
};

type TodoWithRelation = TodoType & {
  entry: () => EntryWithRelation | undefined;
  todo: () => TodoType;
};

export type StoreRelations = {
  sessions: SessionWithRelation[];
  entries: EntryWithRelation[];
  todos: TodoWithRelation[];
};

export function createStoreRelations(store: RequiredStore): StoreRelations {
  function createSessionRelation(session: SessionType): SessionWithRelation {
    const entries = () =>
      _.orderBy(
        store.entries
          .filter((i) => i.sessionId === session.id)
          .map((entry) => createEntryRelation(entry)),
        'time'
      );

    const todos = () => _.flatten(entries().map((i) => i.todos()));
    return {
      ...session,
      entries,
      todos,
    };
  }

  function createEntryRelation(entry: EntryType): EntryWithRelation {
    const todos = () =>
      store.todos
        .filter((i) => i.entryId === entry.id)
        .map((todo) => createTodoRelation(todo));

    const session = () => {
      const s = store.sessions.find(
        (session) => session.id === entry.sessionId
      );

      if (s) {
        return createSessionRelation(s);
      }
      return undefined;
    };
    const indexInEntries = () => {
      const allSiblings = session()?.entries();

      return allSiblings?.findIndex((e) => e.id === entry.id);
    };

    const prev = () => session()?.entries()[(indexInEntries() || 0) - 1];
    const next = () => session()?.entries()[(indexInEntries() || 0) + 1];
    const durationDeprecated = () => (next()?.time || 0) - entry.time;
    const active = (now: number) => {
      const dayCalc = (t: number) =>
        t > ms('24 hours') - 1 ? t - ms('24 hours') : t;

      return now > dayCalc(entry.time) && now < dayCalc(next()?.time || 0);
    };

    return {
      ...entry,
      todos,
      session,
      durationDeprecated,
      next,
      prev,
      active,
      entryData: () => entry,
    };
  }

  function createTodoRelation(todo: TodoType): TodoWithRelation {
    const entry = () => {
      const entry = store.entries.find((entry) => entry.id === todo.entryId);

      if (entry) {
        return createEntryRelation(entry);
      }

      return undefined;
    };
    return {
      ...todo,
      entry,
      todo: () => todo,
    };
  }

  return {
    sessions: store.sessions.map((i) => createSessionRelation(i)),
    entries: store.entries.map((i) => createEntryRelation(i)),
    todos: store.todos.map((i) => createTodoRelation(i)),
  };
}
