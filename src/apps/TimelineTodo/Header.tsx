import React from 'react';
import { SessionType, useStore } from './store';
import { NavLink, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import HeaderButton from './HeaderButton';
import {
  AlarmClockPlusIcon,
  CopyIcon,
  EyeIcon,
  FolderKanbanIcon,
  PencilIcon,
  TrashIcon,
} from 'lucide-react';

type HeaderProps = {
  isPreview: boolean;
  activeSession?: SessionType;
};

const Header = ({ isPreview, activeSession }: HeaderProps) => {
  const [, setSearchParams] = useSearchParams();
  const {
    sessions,
    duplicateSession,
    createSession,
    createEntry,
    deleteSession,
  } = useStore();

  const handleCreateSession = () => {
    const name = prompt('What is the session name?');

    if (name) {
      createSession(name);
    }
  };
  const handleDuplicateSession = () => {
    const name = prompt('What is the session name?');

    if (name && activeSession) {
      duplicateSession(activeSession.id, name);
    }
  };
  const handleCreateEntry = () => {
    if (!activeSession?.id) {
      alert('Please open a session');
      return;
    }

    createEntry(activeSession.id);
  };

  return (
    <div className="flex gap-2 px-3 pt-3 pb-2 overflow-x-auto w-full">
      {sessions.map((session) => (
        <NavLink
          to={`/cdn/timeline-todo/${session.id}?preview=${isPreview.valueOf()}`}
          key={session.id}
        >
          <Button
            size="sm"
            className={cn(session.id === activeSession?.id && 'underline')}
          >
            {session.name}
          </Button>
        </NavLink>
      ))}
      <HeaderButton
        title="Edit"
        hidden={!isPreview || !activeSession}
        icon={PencilIcon}
        onClick={() =>
          setSearchParams((prev) => {
            prev.set('preview', 'false');
            return prev;
          })
        }
      />
      <HeaderButton
        title="Preview"
        hidden={isPreview || !activeSession}
        icon={EyeIcon}
        onClick={() =>
          setSearchParams((prev) => {
            prev.set('preview', 'true');
            return prev;
          })
        }
      />
      <HeaderButton
        title="Add Entry"
        hidden={isPreview || !activeSession}
        icon={AlarmClockPlusIcon}
        onClick={handleCreateEntry}
      />
      <HeaderButton
        title="Add Session"
        hidden={isPreview}
        icon={FolderKanbanIcon}
        onClick={handleCreateSession}
      />

      <HeaderButton
        title="Duplicate Session"
        hidden={isPreview || !activeSession}
        icon={CopyIcon}
        onClick={handleDuplicateSession}
      />

      <HeaderButton
        title="Remove Session"
        hidden={isPreview || !activeSession}
        icon={TrashIcon}
        variant="destructive"
        onClick={() => deleteSession(activeSession!.id)}
      />
    </div>
  );
};

export default Header;
