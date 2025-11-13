import React from 'react';
import { SavedFileHandle, getAllSavedFiles, setCurrentFile, removeFileHandle } from '../fileHandleStorage';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface FileListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFile: (handle: FileSystemFileHandle) => Promise<void>;
  onSelectNewFile?: () => Promise<void>;
}

export function FileListDialog({ isOpen, onClose, onSelectFile, onSelectNewFile }: FileListDialogProps) {
  const handleSelectFile = async (file: SavedFileHandle) => {
    try {
      // Set as current file (this updates lastAccessed)
      const handle = await setCurrentFile(file.id);
      if (handle) {
        await onSelectFile(handle);
        onClose();
      }
    } catch (error) {
      console.error('Error selecting file:', error);
      alert('Failed to load file. It may have been moved or deleted.');
    }
  };

  const handleRemoveFile = async (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Remove this file from the list?')) {
      await removeFileHandle(fileId);
      // Refresh the list by closing and reopening
      onClose();
    }
  };

  const [files, setFiles] = React.useState<SavedFileHandle[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getAllSavedFiles().then((savedFiles) => {
        setFiles(savedFiles);
        setLoading(false);
      });
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader className="flex flex-row justify-between items-center pb-4 border-b bg-gray-50 -mx-6 -mt-6 px-6 pt-6 rounded-t-lg">
          <DialogTitle>Select File to Watch</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : files.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p>No saved files. Select a new file to add it to the list.</p>
            </div>
          ) : (
            <ul className="list-none p-0 m-0">
              {files.map((file) => (
                <li
                  key={file.id}
                  className="flex justify-between items-center p-4 border border-gray-200 rounded-md mb-2 cursor-pointer transition-all bg-white hover:bg-gray-50 hover:border-blue-600 hover:shadow-md last:mb-0"
                  onClick={() => handleSelectFile(file)}
                >
                  <div className="flex flex-col gap-1 flex-1">
                    <span className="font-medium text-gray-800 text-sm">{file.fileName}</span>
                    <span className="text-xs text-gray-400">
                      Last accessed: {new Date(file.lastAccessed).toLocaleString()}
                    </span>
                  </div>
                  <button
                    className="bg-transparent border-none text-xl text-gray-400 cursor-pointer p-1 rounded transition-all ml-4 hover:bg-red-50 hover:text-red-600"
                    onClick={(e) => handleRemoveFile(file.id, e)}
                    title="Remove from list"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {onSelectNewFile && (
          <DialogFooter className="pt-4 border-t bg-gray-50 -mx-6 -mb-6 px-6 pb-6 rounded-b-lg justify-center">
            <Button
              onClick={async () => {
                await onSelectNewFile();
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              + Select New File
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

