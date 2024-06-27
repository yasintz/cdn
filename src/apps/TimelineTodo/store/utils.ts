import { uid } from '@/utils/uid';
import { EntryWithRelation } from './relations';
import { EntryType } from '.';

export function cloneEntry(entry: EntryWithRelation) {
  const newEntry: EntryType = {
    ...entry.entryData(),
    id: uid(),
  };

  const todos = entry.todos().map((t) => ({
    ...t.todo(),
    entryId: newEntry.id,
    id: uid(),
  }));

  return {
    entry: newEntry,
    todos,
  };
}
