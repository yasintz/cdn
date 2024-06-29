import React from 'react';
import EntryDuration from './EntryDuration';
import EntryTime from './EntryTime';

type EmptySlotProps = {
  duration?: number;
  time: number;
  onChange: (time: number) => void;
  onFill?: () => void;
};

const EmptySlot = ({ duration, time, onChange, onFill }: EmptySlotProps) => {
  return (
    <div className="my-2 relative min-h-20">
      {duration && <EntryDuration duration={duration} />}
      <div className="flex">
        <EntryTime time={time} editable onChange={(t) => onChange(t)} />
      </div>
      <div className={'ml-8 my-2'}>
        <div
          className="text-sm flex gap-1 items-center py-3.5 opacity-5 cursor-pointer"
          onClick={onFill}
        >
          Fill the gap
        </div>
      </div>
    </div>
  );
};

export default EmptySlot;
