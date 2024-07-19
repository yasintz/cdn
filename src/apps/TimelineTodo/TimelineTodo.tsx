import { useParams } from 'react-router-dom';
import dayjs from '@/helpers/dayjs';
import { useStore } from './store';
import ms from 'ms';
import { useEffect, useMemo, useState } from 'react';
import Header from './Header';
import TagsTable from './TagsTable';
import { useUrlQ } from './useUrlState';
import SessionNoteView from './SessionNoteView';
import SessionDayView from './SessionDayView';
import './style.scss';
import EditNoteDialog from './EditNoteDialog';
import { cn } from '@/lib/utils';
import Entry from './Entry';

const TimelineTodo = () => {
  const { sessionId } = useParams();
  const [now, setNow] = useState(dayjs());

  const startOfDayDiff = useMemo(() => now.diff(now.startOf('day')), [now]);

  const { getRelations } = useStore();
  const { sessions } = getRelations();
  const { dayViewSelectedEntryId } = useUrlQ();

  const session = sessions.find((session) => session.id === sessionId);
  const sessionEntries = useMemo(() => session?.entries() || [], [session]);
  const dayViewSelectedEntry = sessionEntries.find(
    (i) => i.id === dayViewSelectedEntryId
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(dayjs());
    }, ms('30 seconds'));

    return () => {
      clearInterval(interval);
    };
  }, []);

  const detailPanel = (className: string) => (
    <div className={cn('flex-1 flex-col px-4', className)}>
      <TagsTable sessionEntries={sessionEntries} />
      {dayViewSelectedEntry && session?.view === 'day-view' && (
        <Entry entry={dayViewSelectedEntry} now={0} />
      )}
    </div>
  );

  return (
    <div className="relative flex-1 flex flex-col min-h-0">
      <div className="absolute -top-12 right-2 -z-10">
        {now.format('DD MMMM dddd')}
      </div>
      <Header activeSession={session} />

      {session && (
        <div className="flex gap-2 justify-between flex-1 min-h-0">
          <div className="py-4 px-6 overflow-y-scroll relative flex-1 pb-24">
            {detailPanel('flex md:hidden')}
            {session.view === 'day-view' && (
              <SessionDayView sessionEntries={sessionEntries} />
            )}

            {(!session.view || session.view === 'note') && (
              <SessionNoteView
                session={session}
                sessionEntries={sessionEntries}
                startOfDayDiff={startOfDayDiff}
              />
            )}
          </div>
          {detailPanel('hidden md:flex')}
          <EditNoteDialog />
        </div>
      )}
    </div>
  );
};

export default TimelineTodo;
