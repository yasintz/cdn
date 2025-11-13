import { useState, useRef, useEffect, useCallback } from 'react';
import { saveFileHandle, getFileHandle, removeFileHandle } from '../fileHandleStorage';

interface UseFileWatcherResult {
  watchHandle: FileSystemFileHandle | null;
  isWatching: boolean;
  startWatching: (handle: FileSystemFileHandle) => Promise<void>;
  stopWatching: () => Promise<void>;
  readFileContent: (handle: FileSystemFileHandle) => Promise<{ content: string | null; error: string | null }>;
}

const hashContent = (content: string): string => {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
};

export function useFileWatcher(
  onContentChange: (content: string, fileName: string) => void
): UseFileWatcherResult {
  const [watchHandle, setWatchHandle] = useState<FileSystemFileHandle | null>(null);
  const [isWatching, setIsWatching] = useState(false);
  const watchIntervalRef = useRef<number | null>(null);
  const lastContentHashRef = useRef<string>('');

  const readFileContent = useCallback(async (handle: FileSystemFileHandle): Promise<{ content: string | null; error: string | null }> => {
    try {
      const file = await handle.getFile();
      const content = await file.text();
      return { content, error: null };
    } catch (error: any) {
      console.error('Error reading file:', error);
      if (error.name === 'NotAllowedError' || error.name === 'NotFoundError') {
        return { content: null, error: error.name };
      }
      return { content: null, error: 'UnknownError' };
    }
  }, []);

  const stopWatching = useCallback(async () => {
    if (watchIntervalRef.current) {
      clearInterval(watchIntervalRef.current);
      watchIntervalRef.current = null;
    }
    setIsWatching(false);
    setWatchHandle(null);
    await removeFileHandle();
    lastContentHashRef.current = '';
  }, []);

  const startWatching = useCallback(async (handle: FileSystemFileHandle) => {
    await saveFileHandle(handle);
    setWatchHandle(handle);
    setIsWatching(true);

    // Read initial content
    const file = await handle.getFile();
    const content = await file.text();
    const hash = hashContent(content);
    lastContentHashRef.current = hash;
    onContentChange(content, file.name);
  }, [onContentChange]);

  // Effect to load saved file handle on mount
  useEffect(() => {
    const loadSavedHandle = async () => {
      const handle = await getFileHandle();
      if (handle) {
        setWatchHandle(handle);
        setIsWatching(true);
        const result = await readFileContent(handle);
        if (result.content) {
          const hash = hashContent(result.content);
          lastContentHashRef.current = hash;
          try {
            const file = await handle.getFile();
            onContentChange(result.content, file.name);
          } catch (error) {
            console.error('Error getting file name:', error);
            onContentChange(result.content, 'watched-file.md');
          }
        } else if (result.error) {
          await stopWatching();
          alert('File access was denied or file not found. Watching has been stopped.');
        }
      }
    };
    loadSavedHandle();
  }, [readFileContent, stopWatching, onContentChange]);

  // Effect to poll file when watching
  useEffect(() => {
    if (isWatching && watchHandle) {
      const pollFile = async () => {
        if (!watchHandle) return;
        
        const result = await readFileContent(watchHandle);
        if (result.error) {
          await stopWatching();
          alert('File access was denied or file not found. Watching has been stopped.');
          return;
        }
        
        if (result.content !== null) {
          const hash = hashContent(result.content);
          if (hash !== lastContentHashRef.current) {
            lastContentHashRef.current = hash;
            try {
              const file = await watchHandle.getFile();
              onContentChange(result.content, file.name);
            } catch (error) {
              console.error('Error getting file name:', error);
              onContentChange(result.content, 'watched-file.md');
            }
          }
        }
      };

      watchIntervalRef.current = window.setInterval(pollFile, 5000);
      pollFile();

      return () => {
        if (watchIntervalRef.current) {
          clearInterval(watchIntervalRef.current);
        }
      };
    }
  }, [isWatching, watchHandle, readFileContent, stopWatching, onContentChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIntervalRef.current) {
        clearInterval(watchIntervalRef.current);
      }
    };
  }, []);

  return {
    watchHandle,
    isWatching,
    startWatching,
    stopWatching,
    readFileContent,
  };
}

