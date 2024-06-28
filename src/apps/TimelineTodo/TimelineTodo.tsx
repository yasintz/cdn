import { useParams } from 'react-router-dom';
import { useStore } from './store';
import ms from 'ms';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useEffect, useMemo, useState } from 'react';
import Header from './Header';
import Entry from './Entry';
import TagsTable from './TagsTable';
import NoteInput from './NoteInput';
import { Button } from '@/components/ui/button';
import './style.scss';
import DayView, { getDayViewItemStyle } from './DayView';

dayjs.extend(duration);

const TimelineTodo = () => {
  const { sessionId } = useParams();
  const [now, setNow] = useState(dayjs());

  const startOfDayDiff = useMemo(() => now.diff(now.startOf('day')), [now]);

  const { createEntry, openedEntryNoteId, getRelations } = useStore();
  const { sessions } = getRelations();

  const session = sessions.find((session) => session.id === sessionId);
  const sessionEntries = useMemo(() => session?.entries() || [], [session]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(dayjs());
    }, ms('30 seconds'));

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="relative flex-1 flex flex-col min-h-0">
      <div className="absolute -top-12 right-2 -z-10">
        {now.format('DD MMMM dddd')}
      </div>
      <Header activeSession={session} />

      <div className="flex gap-2 justify-between flex-1 min-h-0">
        <div className="py-4 px-6 overflow-y-scroll relative flex-1 pb-24">
          {openedEntryNoteId && (
            <NoteInput
              entryId={openedEntryNoteId}
              className="md:hidden min-h-96"
            />
          )}
          {session && !openedEntryNoteId && (
            <TagsTable
              className="md:hidden flex"
              sessionEntries={sessionEntries}
            />
          )}
          {session?.view === 'day-view' && (
            <DayView
              startTime={sessionEntries[0].time}
              endTime={sessionEntries[sessionEntries.length - 1].time}
            >
              {sessionEntries.map((entry, index) => (
                <div
                  key={entry.id}
                  style={getDayViewItemStyle({
                    startTime: entry.time,
                    endTime: entry.time + entry.durationDeprecated(),
                  })}
                  className="border p-4 rounded-md"
                >
                  <Entry
                    entry={entry}
                    isLast={index === sessionEntries.length - 1}
                    onEntryCreate={() => createEntry(session!.id)}
                    now={startOfDayDiff}
                  />
                </div>
              ))}
            </DayView>
          )}
          {(!session?.view || session.view === 'note') &&
            sessionEntries.map((entry, index) => (
              <Entry
                key={entry.id}
                entry={entry}
                isLast={index === sessionEntries.length - 1}
                onEntryCreate={() => createEntry(session!.id)}
                now={startOfDayDiff}
              />
            ))}
          {session && sessionEntries.length === 0 && (
            <Button
              onClick={() => createEntry(session.id)}
              size="sm"
              variant="ghost"
            >
              Create Entry
            </Button>
          )}
        </div>

        {session && !openedEntryNoteId && (
          <TagsTable
            className="hidden md:flex"
            sessionEntries={sessionEntries}
          />
        )}

        {openedEntryNoteId && (
          <NoteInput
            entryId={openedEntryNoteId}
            className="hidden md:flex p-4"
          />
        )}
      </div>
    </div>
  );
};

export default TimelineTodo;
