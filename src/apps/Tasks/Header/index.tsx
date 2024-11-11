import { useEffect, useRef } from 'react';
import { SessionType, useStore } from '../store';
import SessionButton from '../SessionButton';
import { useUrlQ } from '../useUrlState';
import TimelineOptions from './TimelineOptions';
import SessionList from '../components/SessionList';

type HeaderProps = {
  activeSession?: SessionType;
};

const Header = ({ activeSession }: HeaderProps) => {
  const scrollDivRef = useRef<HTMLDivElement>(null);
  const { sessions, reorderSessions } = useStore();
  const { showArchived, sessionSortingEnabled } = useUrlQ();

  const parentSessions = sessions.filter((i) => !i.parentId);
  const archivedSessions = parentSessions.filter((i) => i.archived);
  const unarchivedSessions = parentSessions.filter((i) => !i.archived);

  const isChildSession = !!activeSession?.parentId;

  const childSessionSiblings = sessions.filter(
    (s) => s.parentId === activeSession?.parentId
  );
  useEffect(() => {
    if (scrollDivRef.current) {
      scrollDivRef.current.scrollTo({
        left: 99999,
      });
    }
  }, []);

  return (
    <div className="flex">
      <div
        className="flex flex-col gap-3 px-3 pt-3 pb-2 overflow-x-auto w-full"
        ref={scrollDivRef}
      >
        <div className="flex gap-2 w-full">
          <SessionList
            sessions={
              isChildSession && sessionSortingEnabled
                ? childSessionSiblings
                : unarchivedSessions
            }
            reorderSessions={reorderSessions}
            activeSession={activeSession}
            sortEnabled={sessionSortingEnabled}
          />
          {showArchived &&
            archivedSessions.map((session) => (
              <SessionButton
                session={session}
                isActive={session.id === activeSession?.id}
                key={session.id}
              />
            ))}
        </div>
      </div>
      <div className="pt-3 px-2">
        <TimelineOptions activeSession={activeSession} />
      </div>
    </div>
  );
};

export default Header;
