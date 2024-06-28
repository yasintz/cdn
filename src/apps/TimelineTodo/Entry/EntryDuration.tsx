import React from 'react';
import { showDiff } from './utils';
import { EntryWithRelation } from '../store/relations';

type EntryDurationProps = {
  entry: EntryWithRelation;
};

const EntryDuration = ({ entry }: EntryDurationProps) => {
  return (
    <div
      className="absolute top-7 -bottom-2 bg-slate-300 flex items-center justify-center"
      style={{
        width: '1px',
        left: 7,
      }}
    >
      <div className="px-0.5 bg-white rounded-lg border border-slate-300 text-xs text-gray-300 text-center min-w-8 cursor-pointer">
        {showDiff(entry.durationDeprecated())}
      </div>
    </div>
  );
};

export default EntryDuration;
