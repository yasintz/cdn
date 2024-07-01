import { cn } from '@/lib/utils';
import { useStore } from './store';
import { Trash2Icon, XCircleIcon } from 'lucide-react';
import NoteBook from '@/components/NoteBook';
import { useRef } from 'react';

type NoteInputProps = {
  entryId?: string;
  className?: string;
  simple?: boolean;
};

const NoteInput = ({ entryId, className, simple }: NoteInputProps) => {
  const { entries, closeEntryNote, updateEntryNote } = useStore();

  const entry = entries.find((i) => i.id === entryId);
  const entryNote = useRef(entry?.note).current;

  if (!entry) {
    return null;
  }

  if (simple) {
    return (
      <NoteBook
        id={entry.id}
        initialDoc={entryNote}
        onChange={(doc) => updateEntryNote(entry.id, doc)}
      />
    );
  }

  return (
    <div className={cn('flex-1 flex flex-col relative border-l', className)}>
      <div className="flex justify-between">
        <h3 className="text-lg font-bold">Notes</h3>
        <div className="flex gap-2">
          <Trash2Icon
            className="text-red-500 cursor-pointer"
            onClick={() => updateEntryNote(entry.id, '')}
            size={14}
          />
          <XCircleIcon
            className="cursor-pointer"
            onClick={closeEntryNote}
            size={14}
          />
        </div>
      </div>
      <div className="flex flex-col flex-1 max-h-96">
        <NoteBook
          id={entry.id}
          initialDoc={entryNote}
          onChange={(doc) => updateEntryNote(entry.id, doc)}
        />
      </div>
    </div>
  );
};

export default NoteInput;
