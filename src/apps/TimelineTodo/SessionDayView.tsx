import React from 'react';
import { EntryWithRelation } from './store/relations';
import DayView from './DayView';
import DayViewEntry from './Entry/DayViewEntry';

type SessionDayViewProps = {
  sessionEntries: EntryWithRelation[];
};

const SessionDayView = ({ sessionEntries }: SessionDayViewProps) => {
  return (
    <>
      <DayView
        startTime={sessionEntries[0].time}
        endTime={sessionEntries[sessionEntries.length - 1].time}
      >
        {sessionEntries.map((entry) => (
          <DayViewEntry key={entry.id} entry={entry} />
        ))}
      </DayView>
    </>
  );
};

export default SessionDayView;
