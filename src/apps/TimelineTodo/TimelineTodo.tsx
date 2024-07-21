import { useParams } from 'react-router-dom';
import dayjs from '@/helpers/dayjs';
import { useStore } from './store';
import ms from 'ms';
import { useEffect, useMemo, useState } from 'react';
import Header from './Header';
import { useUrlQ } from './useUrlState';
import SessionNoteView from './SessionNoteView';
import SessionDayView from './SessionDayView';
import EditNoteDialog from './EditNoteDialog';
import RightPanel from './RightPanel';
import './style.scss';

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

  return (
    <div className="relative flex-1 flex flex-col min-h-0">
      <div className="absolute -top-12 right-2 -z-10">
        {now.format('DD MMMM dddd')}
      </div>
      <Header activeSession={session} />

      {session && (
        <div className="flex gap-2 justify-between flex-1 min-h-0">
          <div className="py-4 px-6 overflow-y-scroll relative flex-1 pb-24">
            <RightPanel
              dayViewSelectedEntry={dayViewSelectedEntry}
              session={session}
              sessionEntries={sessionEntries}
              className="flex md:hidden"
            />
            {(!session.view || session.view === 'day-view') && (
              <SessionDayView
                sessionEntries={sessionEntries}
                startOfDayDiff={startOfDayDiff}
              />
            )}

            {session.view === 'note' && (
              <SessionNoteView
                session={session}
                sessionEntries={sessionEntries}
                startOfDayDiff={startOfDayDiff}
              />
            )}
          </div>
          <RightPanel
            dayViewSelectedEntry={dayViewSelectedEntry}
            session={session}
            sessionEntries={sessionEntries}
            className="hidden md:flex"
          />
          <EditNoteDialog />
        </div>
      )}
    </div>
  );
};

export default TimelineTodo;
