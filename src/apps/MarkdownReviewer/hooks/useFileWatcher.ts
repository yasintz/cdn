import { useState, useRef, useEffect, useCallback } from 'react';
import { saveFileHandle, getCurrentFileHandle, removeFileHandle, clearCurrentFile } from '../fileHandleStorage';

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

  const verifyPermission = useCallback(async (handle: FileSystemFileHandle, readWrite: boolean = false): Promise<boolean> => {
    // Type assertion for File System Access API methods
    const fileHandle = handle as any;
    const options: any = {};
    if (readWrite) {
      options.mode = 'readwrite';
    }
    
    // Check if we already have permission
    if (fileHandle.queryPermission && (await fileHandle.queryPermission(options)) === 'granted') {
      return true;
    }
    
    // Request permission if we don't have it
    if (fileHandle.requestPermission && (await fileHandle.requestPermission(options)) === 'granted') {
      return true;
    }
    
    // If methods don't exist, try to read the file directly (some browsers auto-grant)
    try {
      await handle.getFile();
      return true;
    } catch {
      return false;
    }
  }, []);

  const readFileContent = useCallback(async (handle: FileSystemFileHandle): Promise<{ content: string | null; error: string | null }> => {
    try {
      // Verify we have permission to read the file
      const hasPermission = await verifyPermission(handle, false);
      if (!hasPermission) {
        return { content: null, error: 'PermissionDenied' };
      }

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
  }, [verifyPermission]);

  const stopWatching = useCallback(async () => {
    if (watchIntervalRef.current) {
      clearInterval(watchIntervalRef.current);
      watchIntervalRef.current = null;
    }
    setIsWatching(false);
    setWatchHandle(null);
    // Clear current file selection but keep file in history
    await clearCurrentFile();
    lastContentHashRef.current = '';
  }, []);

  const startWatching = useCallback(async (handle: FileSystemFileHandle) => {
    // Verify permission before saving
    const hasPermission = await verifyPermission(handle, false);
    if (!hasPermission) {
      throw new Error('Permission denied. Please grant access to the file.');
    }

    await saveFileHandle(handle);
    setWatchHandle(handle);
    setIsWatching(true);

    // Read initial content
    const file = await handle.getFile();
    const content = await file.text();
    const hash = hashContent(content);
    lastContentHashRef.current = hash;
    onContentChange(content, file.name);
  }, [onContentChange, verifyPermission]);

  // Effect to load saved file handle on mount and auto-start watching
  useEffect(() => {
    const loadSavedHandle = async () => {
      const handle = await getCurrentFileHandle();
      if (handle) {
        // Verify permission first
        const hasPermission = await verifyPermission(handle, false);
        if (!hasPermission) {
          // Permission was revoked, remove the handle and let user select again
          await removeFileHandle();
          console.log('File permission was revoked. Please select the file again.');
          return;
        }

        // Permission granted, start watching automatically
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
        } else if (result.error === 'PermissionDenied') {
          // Permission denied, clean up
          await stopWatching();
          console.log('File access was denied. Please select the file again.');
        } else if (result.error) {
          await stopWatching();
          console.error('Error loading file:', result.error);
        }
      }
    };
    loadSavedHandle();
  }, [readFileContent, stopWatching, onContentChange, verifyPermission]);

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

