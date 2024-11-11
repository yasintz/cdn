import React, { useMemo } from 'react';
import { SessionWithRelation } from './store/relations';
import DayView from './DayView';
import DayViewEntry from './Entry/DayViewEntry';

type SessionWeekViewProps = {
  session: SessionWithRelation;
  startOfDayDiff: number;
};

const SessionWeekView = ({ session, startOfDayDiff }: SessionWeekViewProps) => {
  const childSessions = useMemo(
    () =>
      session.children().map((session) => ({
        session,
        entries: session.entries(),
      })),
    [session]
  );
  const startTime = Math.min(
    ...childSessions.map(({ entries }) =>
      Math.min(...entries.map((entry) => entry.time))
    )
  );

  const endTime = Math.max(
    ...childSessions.map(({ entries }) =>
      Math.max(...entries.map((entry) => entry.time + entry.duration))
    )
  );

  return (
    <div
      className="flex"
      style={{
        minWidth: 1200,
      }}
    >
      {childSessions.map(({ session, entries }, index) => {
        return (
          <div className="flex-1 flex flex-col gap-4">
            <div className="text-center">{session.name}</div>
            <DayView
              key={session.id}
              startTime={startTime}
              endTime={endTime}
              now={startOfDayDiff}
              className="flex-1"
              hideHours={index > 0}
            >
              {entries.map((entry) => (
                <DayViewEntry key={entry.id} entry={entry} />
              ))}
            </DayView>
          </div>
        );
      })}
    </div>
  );
};

export default SessionWeekView;
