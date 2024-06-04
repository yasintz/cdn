import { useRef } from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import { cn } from '@/lib/utils';
import { EntryType, useStore } from './store';
import ms from 'ms';
import { PlusCircleIcon, PlusIcon, XCircleIcon } from 'lucide-react';
import Todo from './Todo';

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
  isPreview: boolean;
  entry: EntryType & {
    diff: number;
    active: boolean;
  };
  onEntryCreate: () => void;
};

const Entry = ({ isLast, entry, isPreview, onEntryCreate }: EntryProps) => {
  const { updateEntryTime, deleteEntry, todos, createTodo } = useStore();
  const allTodosRef = useRef<Record<string, HTMLInputElement>>({});

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

        <input
          className="font-bold text-purple-500 hidden-icon focus:outline-none"
          type="time"
          value={dayjs.duration(entry.time).format('HH:mm')}
          onChange={(event) => {
            const [h, m] = event.target.value.split(':');
            updateEntryTime(entry.id, ms(`${h}h`) + ms(`${m}m`));
          }}
          onClick={(event) => (event.target as any).showPicker()}
        />
        <PlusCircleIcon
          size={13}
          className={cn('cursor-pointer', isPreview && 'hidden')}
          onClick={handleCreateTodo}
        />
        <XCircleIcon
          className={cn('cursor-pointer', isPreview && 'hidden')}
          onClick={() => deleteEntry(entry.id)}
          size={13}
        />
      </div>
      <div className="ml-8 my-2">
        {entryTodos.length > 0 && (
          <ul>
            {entryTodos.map((todo) => (
              <Todo
                key={todo.id}
                allTodosRef={allTodosRef}
                isPreview={isPreview}
                onEnterPress={handleCreateTodo}
                todo={todo}
              />
            ))}
          </ul>
        )}
        {entryTodos.length === 0 && (
          <div
            className="text-sm flex gap-1 items-center py-4 opacity-5 cursor-pointer"
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
