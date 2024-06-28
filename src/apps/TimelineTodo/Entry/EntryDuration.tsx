import React from 'react';
import { showDiff } from './utils';
import { EntryWithRelation } from '../store/relations';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import ListTimePicker from '@/components/ListTimePicker';
import { useStore } from '../store';

type EntryDurationProps = {
  entry: EntryWithRelation;
  editable?: boolean;
};

const EntryDuration = ({ entry, editable }: EntryDurationProps) => {
  const { updateEntry } = useStore();
  const component = (
    <div className="px-0.5 bg-white rounded-lg border border-slate-300 text-xs text-gray-300 text-center min-w-8 cursor-pointer">
      {showDiff(entry.duration)}
    </div>
  );

  return (
    <div
      className="absolute top-7 -bottom-2 bg-slate-300 flex items-center justify-center"
      style={{
        width: '1px',
        left: 7,
      }}
    >
      {editable ? (
        <Popover>
          <PopoverTrigger asChild disabled={!editable}>
            {component}
          </PopoverTrigger>
          <PopoverContent className="ml-4 h-64 p-0 w-auto">
            <ListTimePicker
              time={entry.duration}
              setTime={(result) => updateEntry(entry.id, { duration: result })}
            />
          </PopoverContent>
        </Popover>
      ) : (
        component
      )}
    </div>
  );
};

export default EntryDuration;
