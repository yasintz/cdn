import React from 'react';
import { getHours, hourSize, msSize } from './utils';
import HourItem from './HourItem';
import dayjs from '@/helpers/dayjs';

type DayViewProps = {
  startTime: number;
  endTime: number;
  children?: React.ReactNode;
  now?: number;
};

const DayView = ({ startTime, endTime, now, children }: DayViewProps) => {
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
      {typeof now === 'number' && (
        <div
          className="absolute flex w-full justify-between"
          style={{
            top: now * msSize,
            zIndex: 2,
          }}
        >
          <div className="-translate-y-1/2 pr-1 bg-white text-black">
            {dayjs.duration(now).format('HH:mm')}
          </div>
          <div
            className="bg-red-300"
            style={{
              height: 1,
              width: 'calc(100% - 54px)',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default DayView;
