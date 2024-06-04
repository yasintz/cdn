import { useParams, useSearchParams } from 'react-router-dom';
import { useStore } from './store';
import ms from 'ms';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PlusCircleIcon,
  XCircleIcon,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import _ from 'lodash';
import { cn } from '@/lib/utils';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Header from './Header';
import Entry from './Entry';

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
    updateEntryTime,
    createTodo,
    toggleTodo,
    deleteEntry,
    deleteTodo,
    reorderTodo,
    updateTodoText,
  } = useStore();
  const allTodosRef = useRef<Record<string, HTMLInputElement>>({});

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
    }, ms('1 minute'));

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div>
      <Header isPreview={isPreview} activeSession={session} />

      <ul
        className="py-4 px-6 overflow-y-auto relative"
        style={{
          height: 'calc(100vh - 3.6rem)',
        }}
      >
        {sessionEntries.map((entry, index) => (
          <Entry
            key={entry.id}
            entry={entry}
            isLast={index === sessionEntries.length - 1}
            isPreview={isPreview}
          />
        ))}
      </ul>
    </div>
  );
};

export default TimelineTodo;
