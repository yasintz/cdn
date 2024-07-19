import React from 'react';
import { getHours, hourSize } from './utils';
import HourItem from './HourItem';

type DayViewProps = {
  startTime: number;
  endTime: number;
  children?: React.ReactNode;
};

const DayView = ({ startTime, endTime, children }: DayViewProps) => {
  const { hours, startHour, endHour } = getHours(startTime, endTime);

  const totalSize = (endHour - startHour + 1) * hourSize;

  return (
    <div
      style={{
        height: totalSize,
      }}
      className="border-y box-border relative"
    >
      {hours.map(({ hourMs }, index) => (
        <HourItem
          key={hourMs}
          hourMs={hourMs}
          hourSize={hourSize}
          printNext={index === hours.length - 1}
        />
      ))}
      {children}
    </div>
  );
};

export default DayView;
