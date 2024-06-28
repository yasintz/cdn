import dayjs from '@/helpers/dayjs';
import React from 'react';

type HourItemProps = {
  hourMs: number;
  hourSize: number;
  printNext?: boolean;
};

const HourItem = ({ hourMs, hourSize, printNext }: HourItemProps) => {
  return (
    <div
      key={hourMs}
      className="w-full border-b box-border flex relative"
      style={{
        height: hourSize,
      }}
    >
      <div className="w-14 h-full -translate-y-4 bg-white">
        {dayjs.duration(hourMs).format('HH:mm')}
      </div>
      {printNext && (
        <div className="absolute bottom-0 w-14 h-full translate-y-3 bg-white flex items-end">
          {dayjs.duration(hourMs).add(1, 'hour').format('HH:mm')}
        </div>
      )}
    </div>
  );
};

export default HourItem;
