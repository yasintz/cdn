import React from 'react';
import { getHours } from './utils';
import ms from 'ms';
import HourItem from './HourItem';

const hourSize = 350;
const msSize = hourSize / ms('1 hour');

type DayViewItemStyleParams = {
  startTime: number;
  endTime: number;
};

export function getDayViewItemStyle({
  startTime,
  endTime,
}: DayViewItemStyleParams): React.CSSProperties {
  return {
    position: 'absolute',
    top: startTime * msSize,
    left: 75,
    height: (endTime - startTime) * msSize,
    width: 'calc(100% - 54px)'
  };
}

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
