import { useRef, useState } from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import { cn } from '@/lib/utils';
import { EntryType, useStore } from '../store';
import ms from 'ms';
import { PlusIcon, NotebookTextIcon } from 'lucide-react';
import Todo from '../Todo';
import { TagInput } from '../TagInput';
import Tag from '../Tag';
import { useUrlState } from '../useUrlState';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import ListTimePicker from '@/components/ListTimePicker';
import Options from './Options';

dayjs.extend(duration);
dayjs.extend(relativeTime);

function showDiff(diff: number) {
  const duration = dayjs.duration(diff);

  if (diff < ms('1 hour')) {
    return duration.format('m[m]');
  }

  if (duration.minutes() > 0) {
    return duration.format('H[h] m[m]');
  }

  return duration.format('H[h]');
}

type EntryProps = {
  isLast: boolean;
  entry: EntryType;
  onEntryCreate: () => void;
  now: number;
};

const Entry = ({
  isLast,
  entry: entryProp,
  onEntryCreate,
  now,
}: EntryProps) => {
  const {
    updateEntryTime,
    createTodo,
    toggleEntryTag,
    allTags,
    openEntryNote,
    getRelations,
    openedEntryNoteId,
  } = useStore();
  const allTodosRef = useRef<Record<string, HTMLInputElement>>({});
  const [tagSelectOpened, setTagSelectOpened] = useState(false);
  const { batchTimeUpdatingEnabled } = useUrlState();
  const { entries } = getRelations();
  const entry = entries.find((e) => e.id === entryProp.id)!;

  const handleCreateTodo = () => {
    const newTodoId = createTodo(entry.id, '');
    setTimeout(() => {
      allTodosRef.current[newTodoId]?.focus();
    }, 100);
  };
  const entryTodos = entry.todos();

  return (
    <div className="my-2 relative min-h-20">
      {!isLast && (
        <div
          className="absolute top-7 -bottom-2 bg-slate-300 flex items-center justify-center"
          style={{
            width: '1px',
            left: 7,
          }}
        >
          <div className="px-0.5 bg-white rounded-lg border border-slate-300 text-xs text-gray-300 text-center min-w-8">
            {showDiff(entry.duration())}
          </div>
        </div>
      )}

      <div className="flex gap-2 items-center">
        {entry.active(now) && (
          <div className="h-2 w-2 rounded-full bg-red-700 absolute -translate-x-3" />
        )}

        <Popover>
          <PopoverTrigger asChild>
            <div className="font-bold text-purple-500 cursor-pointer">
              {dayjs.duration(entry.time).format('HH:mm')}
            </div>
          </PopoverTrigger>
          <PopoverContent className="ml-4 h-64 p-0 w-auto">
            <ListTimePicker
              time={entry.time}
              setTime={(result) => {
                const isBelongsToNextDay = entry.time > ms('24 hours') - 1;
                updateEntryTime(
                  entry.id,
                  isBelongsToNextDay ? result + ms('24 hours') : result,
                  batchTimeUpdatingEnabled
                );
              }}
            />
          </PopoverContent>
        </Popover>
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
      <div className="ml-8 my-2">
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
            onClick={isLast ? onEntryCreate : handleCreateTodo}
          >
            <PlusIcon size={12} /> Add {isLast ? 'entry' : 'todo'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Entry;
