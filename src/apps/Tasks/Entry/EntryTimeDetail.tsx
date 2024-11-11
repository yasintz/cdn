import React, { useState } from 'react';
import { EntryType, useStore } from '../store';
import EntryTime from './EntryTime';
import { showDiff } from './utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import ListTimePicker from '@/components/ListTimePicker';
import Options from './Options';
import { TagInput } from '../TagInput';
import Tag from '../Tag';
import { cn } from '@/lib/utils';

type EntryTimeDetailProps = {
  entry: EntryType;
};

const EntryTimeDetail = ({ entry }: EntryTimeDetailProps) => {
  const { updateEntry, allTags, toggleEntryTag } = useStore();
  const entryEndTime = entry.time + entry.duration;
  const [tagSelectOpened, setTagSelectOpened] = useState(false);

  return (
    <div className="flex relative gap-2">
      <EntryTime
        time={entry.time}
        editable
        onChange={(time) => updateEntry(entry.id, { time })}
      />
      <div className="w-20 border-b border-gray-300 absolute translate-x-14 mt-3 z-0" />
      <Popover>
        <PopoverTrigger asChild>
          <div className="px-0.5 bg-white rounded-lg border border-slate-300 text-xs text-gray-300 text-center min-w-8 cursor-pointer flex items-center justify-center mx-8 relative z-10">
            {showDiff(entry.duration)}
          </div>
        </PopoverTrigger>
        <PopoverContent className="ml-4 h-64 p-0 w-auto">
          <ListTimePicker
            time={entry.duration}
            setTime={(result) => updateEntry(entry.id, { duration: result })}
          />
        </PopoverContent>
      </Popover>
      <EntryTime
        time={entryEndTime}
        editable
        onChange={(time) =>
          updateEntry(entry.id, { duration: time - entry.time })
        }
      />
      <Options entry={entry} onShowTags={() => setTagSelectOpened(true)} />
      <TagInput
        allTags={allTags}
        entryTags={entry.tags}
        onTagClick={(tag) => toggleEntryTag(entry.id, tag)}
        open={tagSelectOpened}
        onOpenChange={setTagSelectOpened}
      >
        <div />
      </TagInput>
      <div className={cn('flex gap-2 items-center')}>
        {entry.tags.map((tag) => (
          <Tag
            key={tag}
            tag={tag}
            onClick={() => setTimeout(() => setTagSelectOpened(true), 250)}
          />
        ))}
      </div>
    </div>
  );
};

export default EntryTimeDetail;
