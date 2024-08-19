import useNow from '@/hooks/useNow';
import dayjs from 'dayjs';
import ms from 'ms';
import React from 'react';

type NowPresenterProps = {
  itemSize: number;
};

const NowPresenter = ({ itemSize }: NowPresenterProps) => {
  const now = useNow(ms('1 minute'));
  const djs = dayjs(now);
  const dayTime = djs.diff(djs.startOf('day'));
  const hour = dayTime / ms('1h');

  return (
    <div
      className="flex"
      style={{
        position: 'absolute',
        top: `${hour * itemSize}px`,
        left: 0,
        right: 0,
        zIndex: 1,
      }}
    >
      <div className="-translate-y-1/2 bg-white px-2">
        {djs.format('HH:mm')}
      </div>
      <div
        className="flex-1"
        style={{
          minHeight: 1,
          maxHeight: 1,
          backgroundColor: 'red',
        }}
      />
    </div>
  );
};

export default NowPresenter;
