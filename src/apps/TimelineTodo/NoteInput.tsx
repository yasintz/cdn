import { cn } from '@/lib/utils';
import { useStore } from './store';
import { Trash2Icon, XCircleIcon } from 'lucide-react';
import NoteBook from '@/components/NoteBook';
import { useRef } from 'react';

type NoteInputProps = {
  entryId: string;
  className?: string;
};

const NoteInput = ({ entryId, className }: NoteInputProps) => {
  const { entries, closeEntryNote, updateEntryNote } = useStore();

  const openedEntry = entries.find((i) => i.id === entryId);
  const entryNote = useRef(openedEntry?.note).current;

  if (!openedEntry) {
    return null;
  }

  return (
    <div className={cn('flex-1 flex flex-col relative border-l', className)}>
      <div className="flex justify-between">
        <h3 className="text-lg font-bold">Notes</h3>
        <div className="flex gap-2">
          <Trash2Icon
            className="text-red-500 cursor-pointer"
            onClick={() => updateEntryNote(entryId, '')}
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
          id={openedEntry.id}
          initialDoc={entryNote}
          onChange={(doc) => updateEntryNote(openedEntry.id, doc)}
        />
      </div>
    </div>
  );
};

export default NoteInput;
