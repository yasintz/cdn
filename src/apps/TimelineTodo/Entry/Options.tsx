import dayjs from 'dayjs';
import { cn } from '@/lib/utils';
import ms from 'ms';
import {
  CalendarPlus2Icon,
  CalendarMinus2Icon,
  TagIcon,
  AlarmClockPlusIcon,
  EllipsisIcon,
  TrashIcon,
  RadioIcon,
  NotebookTextIcon,
  CopyIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import DropdownItem from '../DropdownItem';
import { EntryType, useStore } from '../store';
import SubMenu from '../Header/SubMenu';
import { useState } from 'react';
import SessionSelect from '../components/SessionSelect';

type OptionsProps = {
  entry: EntryType;
  onShowTags: () => void;
};

const Options = ({ entry, onShowTags }: OptionsProps) => {
  const {
    updateEntryTime,
    deleteEntry,
    createEntry,
    openEntryNote,
    duplicateEntry,
    sessions,
  } = useStore();

  const [showCopyToSectionList, setShowCopyToSectionList] = useState(false);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div
            className={cn(
              `min-h-5 min-w-5 rounded-full
            flex items-center justify-center cursor-pointer
            border border-input bg-background hover:bg-accent hover:text-accent-foreground
            `
            )}
          >
            <EllipsisIcon size={13} />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-50">
          <DropdownMenuGroup>
            <SubMenu title="Move / Copy">
              <DropdownItem
                title="Copy to"
                icon={CopyIcon}
                onClick={() => setShowCopyToSectionList(true)}
              />
            </SubMenu>
            <SubMenu title="Time">
              <DropdownItem
                title="Move to next day"
                hidden={entry.time > ms('24 hours')}
                icon={CalendarPlus2Icon}
                onClick={() =>
                  updateEntryTime(entry.id, entry.time + ms('24 hours'), false)
                }
              />

              <DropdownItem
                title="Move to today"
                hidden={entry.time < ms('24 hours')}
                icon={CalendarMinus2Icon}
                onClick={() =>
                  updateEntryTime(entry.id, entry.time - ms('24 hours'), false)
                }
              />

              <DropdownItem
                title="Set to now"
                icon={RadioIcon}
                onClick={() => {
                  const now = dayjs().diff(dayjs().startOf('day'));

                  updateEntryTime(
                    entry.id,
                    entry.time > ms('24 hours') ? now + ms('24 hours') : now,
                    false
                  );
                }}
              />
            </SubMenu>
            <DropdownItem
              title="Add Tag"
              icon={TagIcon}
              onClick={() => setTimeout(() => onShowTags(), 250)}
            />
            <DropdownItem
              title="Add Note"
              hidden={!!entry.note}
              icon={NotebookTextIcon}
              onClick={() => openEntryNote(entry.id)}
            />
            <DropdownItem
              title="Add entry below"
              icon={AlarmClockPlusIcon}
              onClick={() =>
                createEntry(entry.sessionId, entry.time + ms('10 minutes'))
              }
            />

            <DropdownItem
              title="Remove Entry"
              icon={TrashIcon}
              className="text-red-500"
              onClick={() => confirm('Are you sure?') && deleteEntry(entry.id)}
            />
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {showCopyToSectionList && (
        <SessionSelect
          open
          onOpenChange={() => setShowCopyToSectionList(false)}
          onSelect={(session) => duplicateEntry(entry.id, session.id)}
          sessions={sessions.filter((i) => !i.archived)}
        />
      )}
    </>
  );
};

export default Options;
