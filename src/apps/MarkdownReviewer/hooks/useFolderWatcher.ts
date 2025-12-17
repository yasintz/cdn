import { useState, useCallback } from 'react';
import { getFileByPath } from '../utils/folderUtils';

interface UseFolderWatcherResult {
  folderHandle: FileSystemDirectoryHandle | null;
  startWatching: (handle: FileSystemDirectoryHandle) => Promise<void>;
  stopWatching: () => void;
  loadFile: (filePath: string) => Promise<{ content: string | null; fileName: string; error?: string }>;
}

export function useFolderWatcher(): UseFolderWatcherResult {
  const [folderHandle, setFolderHandle] = useState<FileSystemDirectoryHandle | null>(null);

  const startWatching = useCallback(async (handle: FileSystemDirectoryHandle) => {
    setFolderHandle(handle);
  }, []);

  const stopWatching = useCallback(() => {
    setFolderHandle(null);
  }, []);

  const loadFile = useCallback(async (filePath: string) => {
    if (!folderHandle) {
      return { content: null, fileName: '', error: 'No folder selected' };
    }

    try {
      const result = await getFileByPath(folderHandle, filePath);
      if (!result) {
        return { content: null, fileName: '', error: 'File not found' };
      }

      const content = await result.file.text();
      return { content, fileName: result.fileName };
    } catch (error: any) {
      console.error('Error loading file:', error);
      return {
        content: null,
        fileName: '',
        error: error.message || 'Failed to load file',
      };
    }
  }, [folderHandle]);

  return {
    folderHandle,
    startWatching,
    stopWatching,
    loadFile,
  };
}

