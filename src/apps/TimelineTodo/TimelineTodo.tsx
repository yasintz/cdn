import { NavLink, useParams, useSearchParams } from 'react-router-dom';
import { useStore } from './store';
import { Button } from '@/components/ui/button';
import ms from 'ms';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  EyeIcon,
  PencilIcon,
  PlusCircleIcon,
  PlusIcon,
  TrashIcon,
  XCircle,
  XCircleIcon,
  XIcon,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import _ from 'lodash';
import { cn } from '@/lib/utils';
import { withStoreLoading } from '@/utils/zustand/gsheet-storage';
import { useMemo } from 'react';

dayjs.extend(duration);

const TimelineTodo = () => {
  const { sessionId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const isPreview = searchParams.get('preview') === 'true';

  const {
    sessions,
    entries,
    todos,
    createSession,
    createEntry,
    updateEntryTime,
    createTodo,
    toggleTodo,
    deleteSession,
    deleteEntry,
    deleteTodo,
    reorderTodo,
  } = useStore();

  const handleCreateSession = () => {
    const name = prompt('What is the session name?');

    if (name) {
      createSession(name);
    }
  };
  const handleCreateEntry = () => {
    if (!sessionId) {
      alert('Please open a session');
      return;
    }

    createEntry(sessionId);
  };

  const handleCreateTodo = (entryId: string) => {
    const text = prompt('I will complete...');

    if (text) {
      createTodo(entryId, text);
    }
  };

  const session = sessions.find((session) => session.id === sessionId);
  const sessionEntries = useMemo(() => {
    const sessionEntriesRaw = entries.filter(
      (entry) => entry.sessionId === sessionId
    );

    const sessionEntriesData = sessionEntriesRaw.map((item, index) => {
      const nextItem = sessionEntriesRaw[index + 1];

      return {
        ...item,
        diff: nextItem?.time - item.time,
      };
    });

    return _.orderBy(sessionEntriesData, 'time');
  }, [entries, sessionId]);

  return (
    <div className="p-3">
      <div className="flex gap-2">
        {sessions.map((session) => (
          <NavLink
            to={`/cdn/timeline-todo/${
              session.id
            }?preview=${isPreview.valueOf()}`}
            key={session.id}
          >
            <Button
              size="sm"
              className={cn(session.id === sessionId && 'underline')}
            >
              {session.name}
            </Button>
          </NavLink>
        ))}
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCreateSession}
          className={cn(isPreview && 'hidden')}
        >
          <PlusIcon size={14} className="mr-2" />
          Add Session
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCreateEntry}
          className={cn((isPreview || !session) && 'hidden')}
        >
          <PlusIcon size={14} className="mr-2" />
          Add Entry
        </Button>

        {session && (
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                setSearchParams((prev) => {
                  prev.set('preview', isPreview ? 'false' : 'true');
                  return prev;
                })
              }
            >
              {isPreview ? (
                <>
                  <PencilIcon size={14} className="mr-2" />
                  Edit
                </>
              ) : (
                <>
                  <EyeIcon size={14} className="mr-2" />
                  Preview
                </>
              )}
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteSession(session.id)}
              className={cn(isPreview && 'hidden')}
            >
              <TrashIcon size={14} className="mr-2" />
              Remove Session
            </Button>
          </>
        )}
      </div>

      <ul className="my-4 mx-4">
        {sessionEntries.map((entry, index) => (
          <li key={entry.id} className="my-2 relative">
            {index < sessionEntries.length - 1 && (
              <div
                className="absolute top-7 -bottom-2 bg-slate-300 flex items-center justify-center"
                style={{
                  width: '1px',
                  left: 7,
                }}
              >
                <div className="px-0.5 bg-white rounded-lg border border-slate-300 text-xs text-gray-300">
                  {dayjs
                    .duration(entry.diff)
                    .format(entry.diff > ms('1hour') ? 'H[h] m[m]' : 'm[m]')}
                </div>
              </div>
            )}

            <div className="flex gap-2 items-center">
              <div
                className={cn(
                  'flex flex-col cursor-pointer',
                  isPreview && 'hidden'
                )}
              >
                <ChevronUpIcon
                  size={15}
                  onClick={() =>
                    updateEntryTime(
                      entry.id,
                      Math.min(entry.time + ms('1 minute'), ms('24 hours'))
                    )
                  }
                  tabIndex={100 + index * 2}
                />
                <ChevronDownIcon
                  size={15}
                  tabIndex={101 + index * 2}
                  onClick={() =>
                    updateEntryTime(
                      entry.id,
                      Math.max(entry.time - ms('1 minute'), 0)
                    )
                  }
                />
              </div>
              <div className="font-bold text-purple-500 select-none">
                {dayjs.duration(entry.time).format('HH:mm')}
              </div>
              <PlusCircleIcon
                size={13}
                className={cn('cursor-pointer', isPreview && 'hidden')}
                onClick={() => handleCreateTodo(entry.id)}
              />
              <XCircleIcon
                className={cn('cursor-pointer', isPreview && 'hidden')}
                onClick={() => deleteEntry(entry.id)}
                size={13}
              />
            </div>
            <ul className="ml-8 my-2">
              {todos
                .filter((todo) => todo.entryId === entry.id)
                .map((todo) => (
                  <li
                    key={todo.id}
                    className={cn('flex gap-2 items-center', {
                      'opacity-60': todo.completed,
                    })}
                  >
                    <div
                      className={cn(
                        'flex flex-col cursor-pointer',
                        isPreview && 'hidden'
                      )}
                    >
                      <ChevronUpIcon
                        size={15}
                        onClick={() => reorderTodo(todo.id, 'up')}
                        tabIndex={100 + index * 2}
                      />
                      <ChevronDownIcon
                        size={15}
                        tabIndex={101 + index * 2}
                        onClick={() => reorderTodo(todo.id, 'down')}
                      />
                    </div>
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => toggleTodo(todo.id)}
                    />
                    <span>
                      {todo.completed ? <s>{todo.text}</s> : todo.text}
                    </span>
                    <XCircleIcon
                      className={cn('cursor-pointer', isPreview && 'hidden')}
                      onClick={() => deleteTodo(todo.id)}
                      size={13}
                    />
                  </li>
                ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TimelineTodo;
