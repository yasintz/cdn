import { SessionType, useStore } from './store';
import DropdownItem from './HeaderButton';
import {
  ArchiveIcon,
  BoxesIcon,
  CopyIcon,
  EllipsisIcon,
  FolderKanbanIcon,
  TagIcon,
  TrashIcon,
} from 'lucide-react';
import SessionButton from './SessionButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEffect, useRef } from 'react';
import { useUrlState } from './useUrlState';

type HeaderProps = {
  activeSession?: SessionType;
};

const Header = ({ activeSession }: HeaderProps) => {
  const scrollDivRef = useRef<HTMLDivElement>(null);
  const {
    setSearchParams,
    archivedSessionsShown,
    tagsShown,
    batchTimeUpdatingEnabled,
  } = useUrlState();
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
      {archivedSessionsShown &&
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
              title={tagsShown ? 'Hide Tags' : 'Show Tags'}
              icon={TagIcon}
              onClick={() =>
                setSearchParams((prev) => {
                  prev.set('tagsShown', `${!tagsShown}`);
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
              title={!archivedSessionsShown ? 'Show Archived' : 'Hide Archived'}
              icon={ArchiveIcon}
              onClick={() =>
                setSearchParams((prev) => {
                  prev.set('showArchived', `${!archivedSessionsShown}`);
                  return prev;
                })
              }
            />

            <DropdownItem
              title={
                batchTimeUpdatingEnabled
                  ? 'Disable batch update'
                  : 'Enable batch update'
              }
              icon={BoxesIcon}
              onClick={() =>
                setSearchParams((prev) => {
                  prev.set('batchTimeUpdating', `${!archivedSessionsShown}`);
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
