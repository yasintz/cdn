import { SessionType, useStore } from '../store';
import DropdownItem from '../DropdownItem';
import {
  ArchiveIcon,
  AreaChartIcon,
  BoxesIcon,
  CopyIcon,
  EllipsisIcon,
  FolderKanbanIcon,
  TrashIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUrlState } from '../useUrlState';
import { useNavigate } from 'react-router-dom';

type DropdownProps = {
  activeSession?: SessionType;
};

const TimelineOptions = ({ activeSession }: DropdownProps) => {
  const navigate = useNavigate();
  const { setSearchParams, archivedSessionsShown, batchTimeUpdatingEnabled } =
    useUrlState();

  const { duplicateSession, createSession, deleteSession, archiveSession } =
    useStore();

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
  return (
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
            title="Analytics"
            hidden={!activeSession}
            icon={AreaChartIcon}
            onClick={() => navigate('analytics')}
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
                prev.set('batchTimeUpdating', `${!batchTimeUpdatingEnabled}`);
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
  );
};

export default TimelineOptions;
