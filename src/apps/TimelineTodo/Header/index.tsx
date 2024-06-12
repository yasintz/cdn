import { useEffect, useMemo, useRef } from 'react';
import { ReactSortable } from 'react-sortablejs';
import { SessionType, useStore } from '../store';
import SessionButton from '../SessionButton';
import { useUrlState } from '../useUrlState';
import TimelineOptions from './Dropdown';

type HeaderProps = {
  activeSession?: SessionType;
};

const Header = ({ activeSession }: HeaderProps) => {
  const scrollDivRef = useRef<HTMLDivElement>(null);
  const { archivedSessionsShown } = useUrlState();
  const { sessions, reorderSessions } = useStore();

  const archivedSessions = sessions.filter((i) => i.archived);
  const unarchivedSessions = sessions.filter((i) => !i.archived);
  const unarchivedSessionIds = useMemo(
    () => unarchivedSessions.map(({ id }) => ({ id })),
    [unarchivedSessions]
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
      className="flex gap-2 px-3 pt-3 pb-2 overflow-x-auto w-full"
      ref={scrollDivRef}
    >
      <ReactSortable
        list={unarchivedSessionIds}
        setList={(newList) => reorderSessions(newList.map((i) => i.id))}
        className="sessions flex gap-2"
      >
        {unarchivedSessions.map((session) => (
          <SessionButton
            session={session}
            isActive={session.id === activeSession?.id}
            key={session.id}
          />
        ))}
      </ReactSortable>
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
  );
};

export default Header;
