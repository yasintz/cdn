import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { EntryType, useStore } from '../store';
import { PlusIcon, NotebookTextIcon } from 'lucide-react';
import Todo from '../Todo';
import { TagInput } from '../TagInput';
import Tag from '../Tag';
import Options from './Options';
import EntryTime from './EntryTime';
import EntryDuration from './EntryDuration';
import NoteInput from '../NoteInput';

type EntryProps = {
  isLast: boolean;
  entry: EntryType;
  onEntryCreate: () => void;
  now: number;
};

const Entry = ({ entry: entryProp, now }: EntryProps) => {
  const {
    createTodo,
    toggleEntryTag,
    allTags,
    openEntryNote,
    getRelations,
    openedEntryNoteId,
    updateEntry,
  } = useStore();
  const allTodosRef = useRef<Record<string, HTMLInputElement>>({});
  const [tagSelectOpened, setTagSelectOpened] = useState(false);
  const { entries } = getRelations();
  const entry = entries.find((e) => e.id === entryProp.id)!;
  const entrySession = entry.session();
  const nextEntry = entry.next();

  const handleCreateTodo = () => {
    const newTodoId = createTodo(entry.id, '');
    setTimeout(() => {
      allTodosRef.current[newTodoId]?.focus();
    }, 100);
  };
  const entryTodos = entry.todos();
  const isDayView = entrySession?.view === 'day-view';

  return (
    <>
      <div className="my-2 relative min-h-20">
        <EntryDuration entry={entry} editable />
        <div className="flex gap-2 items-center">
          {entry.active(now) && (
            <div className="h-2 w-2 rounded-full bg-red-700 absolute -translate-x-3" />
          )}

          <EntryTime
            time={entry.time}
            editable
            onChange={(time) => updateEntry(entry.id, { time })}
          />
          {entry.note && (
            <NotebookTextIcon
              size={13}
              color={openedEntryNoteId === entry.id ? 'blue' : 'black'}
              className="cursor-pointer"
              onClick={() => openEntryNote(entry.id)}
            />
          )}
          <Options entry={entry} onShowTags={() => setTagSelectOpened(true)} />
          <TagInput
            allTags={allTags}
            entryTags={entry.tags}
            onTagClick={(tag) => toggleEntryTag(entry.id, tag)}
            open={tagSelectOpened}
            onOpenChange={setTagSelectOpened}
          >
            <div />
          </TagInput>
          <div className={cn('flex gap-2 items-center')}>
            {entry.tags.map((tag) => (
              <Tag
                key={tag}
                tag={tag}
                onClick={() => setTimeout(() => setTagSelectOpened(true), 250)}
              />
            ))}
          </div>
        </div>
        {isDayView && <NoteInput entryId={entry.id} simple />}
        <div className={cn('ml-8 my-2', isDayView && 'hidden')}>
          {entryTodos.length > 0 && (
            <ul className={cn(entryTodos.length === 1 && 'py-3')}>
              {entryTodos.map((todo, index) => (
                <Todo
                  key={todo.id}
                  allTodosRef={allTodosRef}
                  onEnterPress={handleCreateTodo}
                  todo={todo}
                  previousTodoId={entryTodos[index - 1]?.id}
                />
              ))}
            </ul>
          )}
          {entryTodos.length === 0 && (
            <div
              className="text-sm flex gap-1 items-center py-3.5 opacity-5 cursor-pointer"
              onClick={handleCreateTodo}
            >
              <PlusIcon size={12} /> Add todo
            </div>
          )}
        </div>
      </div>
      {(!nextEntry || nextEntry.time !== entry.time + entry.duration) && (
        <div className="flex">
          <EntryTime
            time={entry.time + entry.duration}
            editable
            onChange={(time) =>
              updateEntry(entry.id, { duration: time - entry.time })
            }
          />
        </div>
      )}
    </>
  );
};

export default Entry;
