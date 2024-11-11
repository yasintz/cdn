import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import React from 'react';
import NoteInput from './NoteInput';
import { useSearchParams } from 'react-router-dom';
import { searchParamKeys } from './useUrlState';

const EditNoteDialog = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const openedEntryNoteId =
    searchParams.get(searchParamKeys.editNoteEntryId) || undefined;
  const closeEntryNote = () =>
    setSearchParams((prev) => {
      prev.delete(searchParamKeys.editNoteEntryId);
      return prev;
    });

  return (
    <Dialog open={!!openedEntryNoteId} onOpenChange={() => closeEntryNote()}>
      <DialogContent className="h-full max-w-full md:h-[400px] md:max-w-[800px] px-0">
        <div>
          <DialogHeader className="px-4 mb-2">
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          <NoteInput entryId={openedEntryNoteId} simple />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditNoteDialog;
