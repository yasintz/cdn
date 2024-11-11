import { useState } from 'react';
import { cn } from '@/lib/utils';
import { EntryType, useStore } from '../store';
import { NotebookTextIcon } from 'lucide-react';
import { TagInput } from '../TagInput';
import Tag from '../Tag';
import Options from './Options';
import EntryTime from './EntryTime';
import EntryDuration from './EntryDuration';
import EmptySlot from './EmptySlot';
import EntryTodos from './EntryTodos';
import { useUrlQ } from '../useUrlState';

type EntryProps = {
  entry: EntryType;
  now: number;
  showEndTime?: boolean;
};

const Entry = ({ entry: entryProp, now, showEndTime }: EntryProps) => {
  const { toggleEntryTag, allTags, getRelations, updateEntry, createEntry } =
    useStore();
  const { editNoteEntryId, setParams } = useUrlQ();
  const [tagSelectOpened, setTagSelectOpened] = useState(false);
  const { entries } = getRelations();
  const entry = entries.find((e) => e.id === entryProp.id)!;
  const nextEntry = entry.next();

  const entryEndTime = entry.time + entry.duration;

  return (
    <>
      <div className="relative min-h-20 my-2">
        <EntryDuration
          duration={entry.duration}
          onChange={(duration) => updateEntry(entry.id, { duration })}
          editable
        />
        <div className="flex gap-2 items-center">
          {entry.active(now) && (
            <div className="h-2 w-2 rounded-full bg-red-700 absolute -translate-x-3" />
          )}

          <EntryTime
            time={entry.time}
            editable
            onChange={(time) => updateEntry(entry.id, { time })}
          />
          {entry.note && (
            <NotebookTextIcon
              size={13}
              color={editNoteEntryId === entry.id ? 'blue' : 'black'}
              className="cursor-pointer"
              onClick={() => setParams({ editNoteEntryId: entry.id })}
            />
          )}
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
        <EntryTodos entryId={entry.id} />
      </div>
      {(!nextEntry || nextEntry.time !== entryEndTime || showEndTime) && (
        <EmptySlot
          duration={nextEntry ? nextEntry.time - entryEndTime : undefined}
          time={entryEndTime}
          onChange={(time) =>
            updateEntry(entry.id, { duration: time - entry.time })
          }
          onFill={
            nextEntry &&
            nextEntry.time !== entryEndTime &&
            (() =>
              createEntry(
                entry.sessionId,
                entryEndTime,
                nextEntry.time - entryEndTime
              ))
          }
        />
      )}
    </>
  );
};

export default Entry;
