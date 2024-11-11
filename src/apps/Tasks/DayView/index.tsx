import React from 'react';
import { getHours, hourSize, msSize } from './utils';
import HourItem from './HourItem';
import dayjs from '@/helpers/dayjs';
import { DayViewContext } from './context';
import { positiveNumber } from '@/utils';
import ms from 'ms';
import { cn } from '@/lib/utils';

type DayViewProps = {
  startTime: number;
  endTime: number;
  children?: React.ReactNode;
  now?: number;
  className?: string;
  hideHours?: boolean;
};

const DayView = ({
  startTime,
  endTime,
  now,
  children,
  className,
  hideHours,
}: DayViewProps) => {
  const { hours, startHourMs, endHourMs, totalSize } = getHours(
    Math.min(startTime, now || startTime),
    Math.max(endTime, now || endTime)
  );

  return (
    <DayViewContext.Provider
      value={{
        startHourMs,
        endHourMs,
      }}
    >
      <div
        style={{
          height: totalSize,
        }}
        className={cn('border-y box-border relative', className)}
      >
        {hours.map(({ hourMs }, index) => (
          <HourItem
            key={hourMs}
            hourMs={hourMs}
            hourSize={hourSize}
            printNext={index === hours.length - 1}
            hidden={
              hideHours ||
              (typeof now === 'number' &&
                positiveNumber(hourMs - now) < ms('15 minutes'))
            }
          />
        ))}
        {children}
        {typeof now === 'number' && (
          <div
            className="absolute flex w-full justify-between"
            style={{
              top: (now - startHourMs) * msSize,
              zIndex: 2,
            }}
          >
            <div
              className={cn('-translate-y-1/2 pr-1 bg-white text-black', {
                'opacity-0': hideHours,
              })}
            >
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
    </DayViewContext.Provider>
  );
};

export default DayView;
