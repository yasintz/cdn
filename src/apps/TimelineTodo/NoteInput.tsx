import { cn } from '@/lib/utils';
import { useStore } from './store';
import { Trash2Icon, XCircleIcon } from 'lucide-react';

type NoteInputProps = {
  entryId: string;
  className?: string;
};

const NoteInput = ({ entryId, className }: NoteInputProps) => {
  const { entries, closeEntryNote, updateEntryNote } = useStore();

  const openedEntry = entries.find((i) => i.id === entryId);

  if (!openedEntry) {
    return null;
  }

  return (
    <div className={cn('flex-1 flex flex-col relative', className)}>
      <div className="absolute top-14 right-7 flex gap-2">
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
      <h3 className="text-lg font-bold">Notes</h3>
      <textarea
        className="flex-1 p-2 border focus:outline-none rounded-md"
        value={openedEntry.note || ''}
        onChange={(e) => updateEntryNote(openedEntry.id, e.target.value)}
      />
    </div>
  );
};

export default NoteInput;
