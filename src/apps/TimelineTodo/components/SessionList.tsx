import { ReactSortable } from 'react-sortablejs';
import { SessionType, useStore } from '../store';
import SessionButton from '../SessionButton';
import { useMemo } from 'react';
import { ReplaceIcon } from 'lucide-react';
import { ButtonProps } from '@/components/ui/button';

type SessionListProps = {
  sessions: SessionType[];
  activeSession?: SessionType;
  sortEnabled?: boolean;
  reorderSessions?: (ids: string[]) => void;
  size?: ButtonProps['size'];
};

const SessionList = ({
  sessions,
  sortEnabled,
  activeSession,
  reorderSessions,
  size,
}: SessionListProps) => {
  const { sessions: allSessions } = useStore();
  const sessionIds = useMemo(
    () => sessions.map((i) => ({ id: i.id })),
    [sessions]
  );

  return (
    <ReactSortable
      list={sessionIds}
      setList={(newList) => reorderSessions?.(newList.map((i) => i.id))}
      disabled={!sortEnabled}
      className="sessions flex gap-2"
    >
      {sessions.map((session) => {
        const childSessions = allSessions.filter(
          (s) => s.parentId === session.id
        );
        const isSessionActive =
          session.id === activeSession?.id ||
          session.id === activeSession?.parentId;

        const button = (
          <SessionButton
            session={session}
            isActive={isSessionActive}
            key={session.id}
            size={size}
          >
            {childSessions.length > 0 && (
              <ReplaceIcon className="ml-2 size-4" />
            )}
          </SessionButton>
        );

        if (childSessions.length === 0 || !isSessionActive) {
          return button;
        }

        return (
          <div
            key={session.id}
            className="flex gap-2 rounded-md items-center pr-2 shadow-border"
          >
            {button}
            <div>
              <SessionList
                sessions={childSessions}
                activeSession={activeSession}
                size="xs"
              />
            </div>
          </div>
        );
      })}
    </ReactSortable>
  );
};

export default SessionList;
