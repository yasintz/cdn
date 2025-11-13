import { useState, useCallback } from 'react';

type FileMode = 'upload' | 'watch';

interface UseFileModeResult {
  fileMode: FileMode;
  setFileMode: (mode: FileMode) => void;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectFileForWatch: () => Promise<void>;
}

export function useFileMode(
  onFileSelected: (content: string, fileName: string) => void,
  onWatchStart: (handle: FileSystemFileHandle) => Promise<void>,
  isWatching: boolean,
  stopWatching: () => Promise<void>
): UseFileModeResult {
  const [fileMode, setFileMode] = useState<FileMode>('upload');

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onFileSelected(content, file.name);
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a valid markdown (.md) file');
    }
  }, [onFileSelected]);

  const handleSelectFileForWatch = useCallback(async () => {
    try {
      if (!('showOpenFilePicker' in window)) {
        alert('File System Access API is not supported in this browser. Please use Chrome, Edge, or another Chromium-based browser.');
        return;
      }

      const [handle] = await (window as any).showOpenFilePicker({
        types: [{ description: 'Markdown files', accept: { 'text/markdown': ['.md'] } }]
      });

      const file = await handle.getFile();
      if (!file.name.endsWith('.md')) {
        alert('Please select a valid markdown (.md) file');
        return;
      }

      setFileMode('watch');
      await onWatchStart(handle);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error selecting file:', error);
        alert('Failed to select file. Please try again.');
      }
    }
  }, [onWatchStart, setFileMode]);

  const handleModeChange = useCallback((mode: FileMode) => {
    setFileMode(mode);
    if (mode === 'upload' && isWatching) {
      stopWatching();
    }
  }, [isWatching, stopWatching]);

  return {
    fileMode,
    setFileMode: handleModeChange,
    handleFileUpload,
    handleSelectFileForWatch,
  };
}

