import { SessionType, useStore } from './store';
import { useSearchParams } from 'react-router-dom';
import DropdownItem from './HeaderButton';
import {
  AlarmClockPlusIcon,
  ArchiveIcon,
  CopyIcon,
  EllipsisIcon,
  EyeIcon,
  FolderKanbanIcon,
  PencilIcon,
  TagIcon,
  TrashIcon,
} from 'lucide-react';
import SessionButton from './SessionButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useEffect, useRef } from 'react';

type HeaderProps = {
  isPreview: boolean;
  activeSession?: SessionType;
};

const Header = ({ isPreview, activeSession }: HeaderProps) => {
  const scrollDivRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    sessions,
    duplicateSession,
    createSession,
    deleteSession,
    archiveSession,
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

  const showArchivedSessions = searchParams.get('showArchived') === 'true';
  const archivedSessions = sessions.filter((i) => i.archived);

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
      {sessions
        .filter((i) => !i.archived)
        .map((session) => (
          <SessionButton
            session={session}
            isActive={session.id === activeSession?.id}
            key={session.id}
          />
        ))}
      {showArchivedSessions &&
        archivedSessions.map((session) => (
          <SessionButton
            session={session}
            isActive={session.id === activeSession?.id}
            key={session.id}
          />
        ))}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div
            className="min-h-9 min-w-9 rounded-full
            flex items-center justify-center cursor-pointer
            border border-input bg-background hover:bg-accent hover:text-accent-foreground
            "
          >
            <EllipsisIcon size={16} />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuGroup>
            <DropdownItem
              title={isPreview ? 'Show Tags' : 'Hide Tags'}
              icon={TagIcon}
              onClick={() =>
                setSearchParams((prev) => {
                  prev.set('preview', `${!isPreview}`);
                  return prev;
                })
              }
            />
            <DropdownItem
              title="Add Session"
              icon={FolderKanbanIcon}
              onClick={handleCreateSession}
            />

            <DropdownItem
              title="Duplicate Session"
              hidden={!activeSession}
              icon={CopyIcon}
              onClick={handleDuplicateSession}
            />

            <DropdownItem
              title={activeSession?.archived ? 'Unarchive' : 'Archive'}
              hidden={!activeSession}
              icon={ArchiveIcon}
              onClick={() =>
                archiveSession(activeSession!.id, !activeSession?.archived)
              }
            />
            <DropdownItem
              title={!showArchivedSessions ? 'Show Archived' : 'Hide Archived'}
              icon={ArchiveIcon}
              onClick={() =>
                setSearchParams((prev) => {
                  prev.set('showArchived', `${!showArchivedSessions}`);
                  return prev;
                })
              }
            />

            <DropdownItem
              title="Remove Session"
              hidden={!activeSession}
              icon={TrashIcon}
              className="text-red-500"
              onClick={() =>
                confirm('Are you sure?') && deleteSession(activeSession!.id)
              }
            />
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Header;
