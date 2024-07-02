import { SessionType, useStore } from '../store';
import DropdownItem from '../DropdownItem';
import {
  ArchiveIcon,
  AreaChartIcon,
  ArrowUpNarrowWideIcon,
  BoxesIcon,
  CalendarIcon,
  Columns3Icon,
  CopyIcon,
  EllipsisIcon,
  FilePenLineIcon,
  FolderKanbanIcon,
  NotebookIcon,
  ReplaceIcon,
  SendToBackIcon,
  TrashIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUrlState } from '../useUrlState';
import { useNavigate } from 'react-router-dom';
import SubMenu from './SubMenu';
import { useState } from 'react';
import SessionSelect from '../components/SessionSelect';
import SessionDialog, { SessionDialogInput } from '../components/SessionDialog';

type DropdownProps = {
  activeSession?: SessionType;
};

const TimelineOptions = ({ activeSession }: DropdownProps) => {
  const navigate = useNavigate();
  const [showUpdateSessionDialog, setShowUpdateSessionDialog] = useState(false);
  const [showSessionsDropdown, setShowSessionsDropdown] = useState(false);
  const initialCreateSessionInput: SessionDialogInput & {
    parentId?: string;
    duplicateSessionId?: string;
    open: boolean;
  } = {
    open: false,
    name: '',
    tooltip: '',
  };
  const [createSessionInput, setCreateSessionInput] = useState(
    initialCreateSessionInput
  );
  const {
    setSearchParams,
    archivedSessionsShown,
    batchTimeUpdatingEnabled,
    sessionSortingEnabled,
  } = useUrlState();

  const {
    sessions,
    duplicateSession,
    createSession,
    deleteSession,
    archiveSession,
    changeParent,
    updateSession,
  } = useStore();

  const handleCreateSession = () => {
    if (createSessionInput.duplicateSessionId) {
      duplicateSession(
        createSessionInput.duplicateSessionId,
        createSessionInput
      );
    } else {
      createSession(createSessionInput);
    }
    setCreateSessionInput(initialCreateSessionInput);
  };

  const handleUpdateSession = (value: SessionDialogInput) => {
    if (!activeSession) return;

    updateSession(activeSession.id, {
      name: value.name,
      tooltipText: value.tooltip || '',
    });
  };

  return (
    <>
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
          <SubMenu title="Actions">
            <DropdownItem
              title="Add Session"
              icon={FolderKanbanIcon}
              onClick={() =>
                setCreateSessionInput({
                  ...initialCreateSessionInput,
                  open: true,
                })
              }
            />
            <DropdownItem
              title="Add Sub Session"
              icon={ReplaceIcon}
              hidden={!activeSession}
              onClick={() =>
                setCreateSessionInput({
                  ...initialCreateSessionInput,
                  open: true,
                  parentId: activeSession?.parentId || activeSession?.id,
                })
              }
            />
            <DropdownItem
              title="Duplicate Session"
              hidden={!activeSession}
              icon={CopyIcon}
              onClick={() =>
                setCreateSessionInput({
                  ...initialCreateSessionInput,
                  open: true,
                  duplicateSessionId: activeSession?.id,
                })
              }
            />
            <DropdownItem
              title="Update Session"
              hidden={!activeSession}
              icon={FilePenLineIcon}
              onClick={() => setShowUpdateSessionDialog(true)}
            />
          </SubMenu>
          <SubMenu title="Archive">
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
          </SubMenu>
          {activeSession && (
            <SubMenu title="View">
              <DropdownItem
                title="Note View"
                icon={NotebookIcon}
                onClick={() =>
                  updateSession(activeSession.id, { view: 'note' })
                }
              />
              <DropdownItem
                title="Day View"
                icon={CalendarIcon}
                onClick={() =>
                  updateSession(activeSession.id, { view: 'day-view' })
                }
              />
            </SubMenu>
          )}
          <SubMenu title="Move">
            <DropdownItem
              title="Move to base"
              icon={ArrowUpNarrowWideIcon}
              hidden={!activeSession || !activeSession?.parentId}
              onClick={() => changeParent(activeSession!.id, undefined)}
            />
            <DropdownItem
              title="Move under to"
              icon={SendToBackIcon}
              hidden={!activeSession}
              onClick={() => setShowSessionsDropdown(true)}
            />
          </SubMenu>

          <DropdownItem
            title={
              sessionSortingEnabled
                ? 'Disable Session Sorting'
                : 'Enable Session Sorting'
            }
            icon={Columns3Icon}
            onClick={() =>
              setSearchParams((prev) => {
                prev.set('sessionSorting', `${!sessionSortingEnabled}`);
                return prev;
              })
            }
          />
          <DropdownItem
            title="Analytics"
            hidden={!activeSession}
            icon={AreaChartIcon}
            onClick={() => navigate('analytics')}
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
        </DropdownMenuContent>
      </DropdownMenu>
      {showSessionsDropdown && (
        <SessionSelect
          open
          onOpenChange={() => setShowSessionsDropdown(false)}
          sessions={sessions.filter(
            (s) => !s.parentId && activeSession?.id !== s.id
          )}
          onSelect={(s) => changeParent(activeSession!.id, s.id)}
        />
      )}
      <SessionDialog
        title="Create Session"
        buttonText="Create"
        onChange={setCreateSessionInput}
        value={createSessionInput}
        onSubmit={handleCreateSession}
        open={createSessionInput.open}
        onOpenChange={(open) =>
          setCreateSessionInput((prev) => ({ ...prev, open }))
        }
      />
      {activeSession && (
        <SessionDialog
          title="Update Session"
          onChange={handleUpdateSession}
          value={{
            name: activeSession.name,
            tooltip: activeSession.tooltipText,
          }}
          open={showUpdateSessionDialog}
          onOpenChange={setShowUpdateSessionDialog}
        />
      )}
    </>
  );
};

export default TimelineOptions;
