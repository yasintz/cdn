import { useRef, useState } from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import { cn } from '@/lib/utils';
import { EntryType, useStore } from './store';
import ms from 'ms';
import {
  CalendarPlus2Icon,
  CalendarMinus2Icon,
  PlusIcon,
  TagIcon,
  AlarmClockPlusIcon,
  Trash2Icon,
  EllipsisIcon,
  TrashIcon,
} from 'lucide-react';
import Todo from './Todo';
import { TagInput } from './TagInput';
import _ from 'lodash';
import Tag from './Tag';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import DropdownItem from './HeaderButton';
import { useUrlState } from './useUrlState';

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
  entry: EntryType & {
    diff: number;
    active: boolean;
  };
  onEntryCreate: () => void;
};

const Entry = ({ isLast, entry, onEntryCreate }: EntryProps) => {
  const {
    updateEntryTime,
    deleteEntry,
    todos,
    createTodo,
    toggleEntryTag,
    allTags,
    createEntry,
  } = useStore();
  const allTodosRef = useRef<Record<string, HTMLInputElement>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const [tagSelectOpened, setTagSelectOpened] = useState(false);
  const { tagsShown, batchTimeUpdatingEnabled } = useUrlState();

  const handleCreateTodo = () => {
    const newTodoId = createTodo(entry.id, '');
    setTimeout(() => {
      allTodosRef.current[newTodoId]?.focus();
    }, 100);
  };
  const entryTodos = todos.filter((todo) => todo.entryId === entry.id);

  return (
    <li className="my-2 relative min-h-20">
      {!isLast && (
        <div
          className="absolute top-7 -bottom-2 bg-slate-300 flex items-center justify-center"
          style={{
            width: '1px',
            left: 7,
          }}
        >
          <div className="px-0.5 bg-white rounded-lg border border-slate-300 text-xs text-gray-300 text-center min-w-8">
            {showDiff(entry.diff)}
          </div>
        </div>
      )}

      <div className="flex gap-2 items-center">
        {entry.active && (
          <div className="h-2 w-2 rounded-full bg-red-700 absolute -translate-x-3" />
        )}

        <div className="w-12 relative">
          <input
            className="absolute top-0 opacity-0 w-11"
            type="time"
            ref={inputRef}
            value={dayjs.duration(entry.time).format('HH:mm')}
            onChange={(event) => {
              const [h, m] = event.target.value.split(':');
              const isBelongsToNextDay = entry.time > ms('24 hours') - 1;
              const result = ms(`${h}h`) + ms(`${m}m`);
              updateEntryTime(
                entry.id,
                isBelongsToNextDay ? result + ms('24 hours') : result,
                batchTimeUpdatingEnabled
              );
            }}
            onClick={() => (inputRef?.current as any).showPicker()}
          />

          <div
            className="font-bold text-purple-500 cursor-pointer"
            onClick={() => (inputRef?.current as any).showPicker()}
          >
            {dayjs.duration(entry.time).format('HH:mm')}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              className={cn(
                `min-h-5 min-w-5 rounded-full
            flex items-center justify-center cursor-pointer
            border border-input bg-background hover:bg-accent hover:text-accent-foreground
            `,
                !tagsShown && 'opacity-50'
              )}
            >
              <EllipsisIcon size={13} />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-50">
            <DropdownMenuGroup>
              <DropdownItem
                title="Move to next day"
                hidden={entry.time > ms('24 hours')}
                icon={CalendarPlus2Icon}
                onClick={() =>
                  updateEntryTime(entry.id, entry.time + ms('24 hours'), false)
                }
              />
              <DropdownItem
                title="Move to today"
                hidden={entry.time < ms('24 hours')}
                icon={CalendarMinus2Icon}
                onClick={() =>
                  updateEntryTime(entry.id, entry.time - ms('24 hours'), false)
                }
              />
              <DropdownItem
                title="Add Tag"
                icon={TagIcon}
                onClick={() => setTimeout(() => setTagSelectOpened(true), 250)}
              />

              <DropdownItem
                title="Add entry below"
                icon={AlarmClockPlusIcon}
                onClick={() =>
                  createEntry(entry.sessionId, entry.time + ms('10 minutes'))
                }
              />

              <DropdownItem
                title="Remove Entry"
                icon={TrashIcon}
                className="text-red-500"
                onClick={() =>
                  confirm('Are you sure?') && deleteEntry(entry.id)
                }
              />
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <TagInput
          allTags={allTags}
          entryTags={entry.tags}
          onTagClick={(tag) => toggleEntryTag(entry.id, tag)}
          open={tagSelectOpened}
          onOpenChange={setTagSelectOpened}
        >
          <div />
        </TagInput>
        {tagsShown && (
          <div className={cn('flex gap-2 items-center')}>
            {entry.tags.map((tag) => (
              <Tag
                key={tag}
                tag={tag}
                onClick={() => setTimeout(() => setTagSelectOpened(true), 250)}
              />
            ))}
          </div>
        )}
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
    </li>
  );
};

export default Entry;
