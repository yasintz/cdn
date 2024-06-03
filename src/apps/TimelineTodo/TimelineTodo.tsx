import { NavLink, useParams, useSearchParams } from 'react-router-dom';
import { useStore } from './store';
import { Button } from '@/components/ui/button';
import ms from 'ms';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CopyIcon,
  EyeIcon,
  PencilIcon,
  PlusCircleIcon,
  PlusIcon,
  TrashIcon,
  XCircleIcon,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import _ from 'lodash';
import { cn } from '@/lib/utils';
import React, { useEffect, useMemo, useState } from 'react';

dayjs.extend(duration);

const TimelineTodo = () => {
  const { sessionId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [time, setTime] = useState(Date.now());

  const isPreview = searchParams.get('preview') !== 'false';

  const {
    sessions,
    entries,
    todos,
    duplicateSession,
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
  const handleDuplicateSession = () => {
    const name = prompt('What is the session name?');

    if (name && session) {
      duplicateSession(session.id, name);
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
    const sessionEntriesRaw = _.orderBy(
      entries.filter((entry) => entry.sessionId === sessionId),
      'time'
    );

    const sessionEntriesData = sessionEntriesRaw.map((entry, index) => {
      const nextItem = sessionEntriesRaw[index + 1];
      const prevItem = sessionEntriesRaw[index - 1];
      const active = time > entry.time && time < nextItem?.time;

      return {
        ...entry,
        diff: nextItem?.time - entry.time,
        next: nextItem,
        prev: prevItem,
        active,
      };
    });

    return sessionEntriesData;
  }, [entries, sessionId, time]);

  useEffect(() => {
    setTime(dayjs().diff(dayjs().startOf('day')));
    const interval = setInterval(() => {
      setTime(dayjs().diff(dayjs().startOf('day')));
    }, ms('5 minutes'));

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="p-3">
      <div className="flex gap-2 pb-1">
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
          onClick={handleDuplicateSession}
          className={cn((isPreview || !session) && 'hidden')}
        >
          <CopyIcon size={14} className="mr-2" />
          Duplicate Session
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

      <ul
        className="py-4 px-4 overflow-y-auto relative"
        style={{
          height: 'calc(100vh - 3.5rem)',
        }}
      >
        {sessionEntries.map((entry, index) => (
          <React.Fragment key={entry.id}>
            <li className="my-2 relative min-h-20">
              {index < sessionEntries.length - 1 && (
                <div
                  className="absolute top-7 -bottom-2 bg-slate-300 flex items-center justify-center"
                  style={{
                    width: '1px',
                    left: 7,
                  }}
                >
                  <div className="px-0.5 bg-white rounded-lg border border-slate-300 text-xs text-gray-300 text-center">
                    {dayjs
                      .duration(entry.diff)
                      .format(entry.diff >= ms('1hour') ? 'H[h] m[m]' : 'm[m]')}
                  </div>
                </div>
              )}

              <div className="flex gap-2 items-center">
                <div className={cn('flex flex-col cursor-pointer', 'hidden')}>
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
                {entry.active && (
                  <div className="h-2 w-2 rounded-full bg-red-700 absolute -translate-x-3" />
                )}
                {isPreview ? (
                  <div className="font-bold text-purple-500 select-none">
                    {dayjs.duration(entry.time).format('HH:mm')}
                  </div>
                ) : (
                  <input
                    className="font-bold text-purple-500"
                    type="time"
                    value={dayjs.duration(entry.time).format('HH:mm')}
                    onChange={(event) => {
                      const [h, m] = event.target.value.split(':');
                      updateEntryTime(entry.id, ms(`${h}h`) + ms(`${m}m`));
                    }}
                  />
                )}
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
          </React.Fragment>
        ))}
      </ul>
    </div>
  );
};

export default TimelineTodo;
