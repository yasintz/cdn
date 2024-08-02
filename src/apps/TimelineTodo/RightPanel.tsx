import { cn } from '@/lib/utils';
import { EntryWithRelation, SessionWithRelation } from './store/relations';
import { Input } from '@/components/ui/input';
import NoteInput from './NoteInput';
import TagsTable from './TagsTable';
import { Button } from '@/components/ui/button';
import { useStore } from './store';
import EntryTimeDetail from './Entry/EntryTimeDetail';

type RightPanelProps = {
  className?: string;
  selectedEntry: EntryWithRelation | undefined;
  session: SessionWithRelation | undefined;
  sessionEntries: EntryWithRelation[];
};

const RightPanel = ({
  className,
  selectedEntry,
  session,
  sessionEntries,
}: RightPanelProps) => {
  const { createEntry, updateEntry } = useStore();
  return (
    <div
      className={cn('flex-1 flex-col px-4 gap-3 overflow-y-scroll', className)}
    >
      {selectedEntry && session?.view !== 'note' ? (
        <>
          <EntryTimeDetail entry={selectedEntry} />
          <Input
            value={selectedEntry.title || ''}
            onChange={(e) =>
              updateEntry(selectedEntry.id, { title: e.target.value })
            }
            ringDisabled
          />
          <NoteInput key={selectedEntry.id} entryId={selectedEntry.id} simple />
        </>
      ) : (
        <TagsTable sessionEntries={sessionEntries} />
      )}
      {sessionEntries.length === 0 && session && (
        <Button onClick={() => createEntry(session.id, 0, 10)}>
          Create Entry
        </Button>
      )}
    </div>
  );
};

export default RightPanel;
