import React from 'react';
import { EntryWithRelation } from './store/relations';
import DayView from './DayView';
import DayViewEntry from './Entry/DayViewEntry';

type SessionDayViewProps = {
  sessionEntries: EntryWithRelation[];
  startOfDayDiff: number;
};

const SessionDayView = ({
  sessionEntries,
  startOfDayDiff,
}: SessionDayViewProps) => {
  return (
    <>
      <DayView
        startTime={sessionEntries[0].time}
        endTime={sessionEntries[sessionEntries.length - 1].time}
        now={startOfDayDiff}
      >
        {sessionEntries.map((entry) => (
          <DayViewEntry key={entry.id} entry={entry} />
        ))}
      </DayView>
    </>
  );
};

export default SessionDayView;
