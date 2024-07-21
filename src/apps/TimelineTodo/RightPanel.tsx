import { cn } from '@/lib/utils';
import React from 'react';
import { EntryWithRelation, SessionWithRelation } from './store/relations';
import { Input } from '@/components/ui/input';
import NoteInput from './NoteInput';
import TagsTable from './TagsTable';
import { Button } from '@/components/ui/button';
import { useStore } from './store';
import EntryTimeDetail from './Entry/EntryTimeDetail';

type RightPanelProps = {
  className?: string;
  dayViewSelectedEntry: EntryWithRelation | undefined;
  session: SessionWithRelation | undefined;
  sessionEntries: EntryWithRelation[];
};

const RightPanel = ({
  className,
  dayViewSelectedEntry,
  session,
  sessionEntries,
}: RightPanelProps) => {
  const { createEntry, updateEntry } = useStore();
  return (
    <div
      className={cn('flex-1 flex-col px-4 gap-3 overflow-y-scroll', className)}
    >
      {dayViewSelectedEntry && session?.view !== 'note' ? (
        <>
          <EntryTimeDetail entry={dayViewSelectedEntry} />
          <Input
            value={dayViewSelectedEntry.title || ''}
            onChange={(e) =>
              updateEntry(dayViewSelectedEntry.id, { title: e.target.value })
            }
            ringDisabled
          />
          <NoteInput
            key={dayViewSelectedEntry.id}
            entryId={dayViewSelectedEntry.id}
            simple
          />
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
