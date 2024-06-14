import { ReactSortable } from 'react-sortablejs';
import { SessionType } from '../store';
import SessionButton from '../SessionButton';
import { useMemo } from 'react';

type SessionListProps = {
  sessions: SessionType[];
  activeSessionId?: string;
  sortEnabled?: boolean;
  reorderSessions: (ids: string[]) => void;
};

const SessionList = ({
  sessions,
  sortEnabled,
  activeSessionId,
  reorderSessions,
}: SessionListProps) => {
  const sessionIds = useMemo(
    () => sessions.map((i) => ({ id: i.id })),
    [sessions]
  );
  return (
    <ReactSortable
      list={sessionIds}
      setList={(newList) => reorderSessions(newList.map((i) => i.id))}
      disabled={!sortEnabled}
      className="sessions flex gap-2"
    >
      {sessions.map((session) => (
        <SessionButton
          session={session}
          isActive={session.id === activeSessionId}
          key={session.id}
        />
      ))}
    </ReactSortable>
  );
};

export default SessionList;
