import React from 'react';
import { EntryWithRelation } from './store/relations';
import DayView from './DayView';
import DayViewEntry from './Entry/DayViewEntry';
import ms from 'ms';

type SessionDayViewProps = {
  sessionEntries: EntryWithRelation[];
  startOfDayDiff: number;
};

const SessionDayView = ({
  sessionEntries,
  startOfDayDiff,
}: SessionDayViewProps) => {
  const startTime = sessionEntries.length ? sessionEntries[0].time : 0;
  const endTime = sessionEntries.length
    ? sessionEntries[sessionEntries.length - 1].time
    : ms('24 hours');
  return (
    <>
      <DayView startTime={startTime} endTime={endTime} now={startOfDayDiff}>
        {sessionEntries.map((entry) => (
          <DayViewEntry key={entry.id} entry={entry} />
        ))}
      </DayView>
    </>
  );
};

export default SessionDayView;
