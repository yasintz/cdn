import { NavLink, useParams, useSearchParams } from 'react-router-dom';
import { useStore } from './store';
import { Button } from '@/components/ui/button';
import ms from 'ms';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import _ from 'lodash';
import { cn } from '@/lib/utils';
import { withStoreLoading } from '@/utils/zustand/gsheet-storage';

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
  const sessionEntries = _.orderBy(
    entries.filter((entry) => entry.sessionId === sessionId),
    'time'
  );

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

      <ul className="my-4">
        {sessionEntries.map((entry, index) => (
          <li key={entry.id} className="my-2">
            <div className="flex gap-2">
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
            </div>
            <ul className="ml-6 my-2">
              {todos
                .filter((todo) => todo.entryId === entry.id)
                .map((todo) => (
                  <li
                    key={todo.id}
                    className={cn({
                      'opacity-60': todo.completed,
                    })}
                  >
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => toggleTodo(todo.id)}
                      className="mr-2"
                    />
                    {todo.completed ? <s>{todo.text}</s> : todo.text}
                  </li>
                ))}

              <li className={cn(isPreview && 'hidden')}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleCreateTodo(entry.id)}
                >
                  <PlusIcon size={14} className="mr-2" />
                  Add Todo
                </Button>
              </li>
            </ul>
          </li>
        ))}
      </ul>

      {session && (
        <div className={cn(isPreview && 'hidden')}>
          <Button variant="secondary" size="sm" onClick={handleCreateEntry}>
            <PlusIcon size={14} className="mr-2" />
            Add Entry
          </Button>
        </div>
      )}
    </div>
  );
};

export default withStoreLoading(TimelineTodo, useStore, 'isLoading');
