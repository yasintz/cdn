import ms from 'ms';
import React, { useState } from 'react';

import './style.scss';
import dayjs from '@/helpers/dayjs';
import { cn } from '@/lib/utils';

function caclculate(containerWidth: number, size: number, index: number) {
  const radius = containerWidth / 2;
  const centerX = radius;
  const centerY = radius;
  const offset = radius - 15;

  const angle = ((index - 3) / 12) * 2 * Math.PI;
  const x = centerX + offset * Math.cos(angle) - size / 2;
  const y = centerY + offset * Math.sin(angle) - size / 2;

  return {
    left: x,
    top: y,
  };
}

type AnalogTimePickerProps = {
  time: number;
  setTime: (time: number) => void;
};

const hours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const hoursPM = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

const AnalogTimePicker = ({ time, setTime }: AnalogTimePickerProps) => {
  const isAM = time < ms('12 hours');
  const [showMinutes, setShowMinutes] = useState(false);
  const duration = dayjs.duration(time);

  const activeHour = parseInt(duration.format('H'), 10);
  const activeMinute = parseInt(duration.format('m'), 10);

  return (
    <div className="clock">
      <div className="clock-border">
        <div className="cursor-pointer">
          <span
            className={cn(!showMinutes && 'text-orange-300')}
            onClick={() => setShowMinutes(false)}
          >
            {duration.format('HH')}
          </span>
          :
          <span
            className={cn(showMinutes && 'text-orange-300')}
            onClick={() => setShowMinutes(true)}
          >
            {duration.format('mm')}
          </span>
        </div>
        <div className="flex mt-2 text-xs gap-1 cursor-pointer">
          <div
            className={cn(
              'border p-1',
              isAM ? 'shadow-sm rounded-sm' : 'border-transparent'
            )}
            onClick={() => !isAM && setTime(time - ms('12 hours'))}
          >
            AM
          </div>
          <div
            onClick={() => isAM && setTime(time + ms('12 hours'))}
            className={cn(
              'border p-1',
              !isAM ? 'shadow-sm rounded-sm' : 'border-transparent'
            )}
          >
            PM
          </div>
        </div>
      </div>
      {(showMinutes ? minutes : isAM ? hours : hoursPM).map((item, i) => (
        <div
          key={item}
          className={cn(
            'clock-item border border-black text-sm',
            ((showMinutes && activeMinute === item) ||
              (!showMinutes && activeHour === item)) &&
              'border-orange-300 text-orange-300'
          )}
          style={{
            ...caclculate(250, 30, i),
          }}
          onClick={() => {
            const [h, m] = duration.format('H:m').split(':');
            const result = ms(`${item} ${showMinutes ? 'minutes' : 'hours'}`);

            setTime(ms(!showMinutes ? `${m} minutes` : `${h} hours`) + result);
          }}
        >
          {item}
        </div>
      ))}
    </div>
  );
};

export default AnalogTimePicker;
