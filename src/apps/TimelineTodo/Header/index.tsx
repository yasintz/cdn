import { useEffect, useRef } from 'react';
import { SessionType, useStore } from '../store';
import SessionButton from '../SessionButton';
import { useUrlState } from '../useUrlState';
import TimelineOptions from './Dropdown';
import SessionList from '../components/SessionList';

type HeaderProps = {
  activeSession?: SessionType;
};

const Header = ({ activeSession }: HeaderProps) => {
  const scrollDivRef = useRef<HTMLDivElement>(null);
  const { archivedSessionsShown, sessionSortingEnabled } = useUrlState();
  const { sessions, reorderSessions } = useStore();

  const parentSessions = sessions.filter((i) => !i.parentId);
  const archivedSessions = parentSessions.filter((i) => i.archived);
  const unarchivedSessions = parentSessions.filter((i) => !i.archived);

  const sessionChilds = sessions.filter(
    (i) => i.parentId === (activeSession?.parentId || activeSession?.id)
  );

  useEffect(() => {
    if (scrollDivRef.current) {
      scrollDivRef.current.scrollTo({
        left: 99999,
      });
    }
  }, []);

  return (
    <div
      className="flex flex-col gap-3 px-3 pt-3 pb-2 overflow-x-auto w-full"
      ref={scrollDivRef}
    >
      <div className="flex gap-2 w-full">
        <SessionList
          sessions={unarchivedSessions}
          reorderSessions={reorderSessions}
          activeSessionId={activeSession?.parentId || activeSession?.id}
          sortEnabled={sessionSortingEnabled}
        />
        {archivedSessionsShown &&
          archivedSessions.map((session) => (
            <SessionButton
              session={session}
              isActive={session.id === activeSession?.id}
              key={session.id}
            />
          ))}

        <TimelineOptions activeSession={activeSession} />
      </div>
      {activeSession && sessionChilds.length > 0 && (
        <SessionList
          sessions={sessionChilds}
          reorderSessions={reorderSessions}
          activeSessionId={activeSession?.id}
          sortEnabled={sessionSortingEnabled}
        />
      )}
    </div>
  );
};

export default Header;
