import React from 'react';
import { EntryWithRelation } from './store/relations';
import { Button } from '@/components/ui/button';
import { SessionType, useStore } from './store';
import Entry from './Entry';

type SessionNoteViewProps = {
  sessionEntries: EntryWithRelation[];
  session: SessionType;
  startOfDayDiff: number;
};

const SessionNoteView = ({
  sessionEntries,
  session,
  startOfDayDiff,
}: SessionNoteViewProps) => {
  const { createEntry } = useStore();

  return (
    <>
      {sessionEntries.map((entry) => (
        <Entry key={entry.id} entry={entry} now={startOfDayDiff} />
      ))}
      {sessionEntries.length === 0 && (
        <Button
          onClick={() => createEntry(session.id)}
          size="sm"
          variant="ghost"
        >
          Create Entry
        </Button>
      )}
    </>
  );
};

export default SessionNoteView;
