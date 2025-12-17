import { useState, useCallback } from 'react';
import { buildFileTree } from '../utils/folderUtils';
import { FileTreeNode } from '../utils/folderUtils';

type FileMode = 'upload' | 'watch' | 'folder';

interface UseFileModeResult {
  fileMode: FileMode;
  setFileMode: (mode: FileMode) => void;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectFileForWatch: () => Promise<void>;
  handleSelectFolder: () => Promise<void>;
  showFileList: boolean;
  setShowFileList: (show: boolean) => void;
  handleSelectNewFile: () => Promise<void>;
}

export function useFileMode(
  onFileSelected: (content: string, fileName: string) => void,
  onWatchStart: (handle: FileSystemFileHandle) => Promise<void>,
  onFolderSelected: (folderHandle: FileSystemDirectoryHandle, folderName: string, fileTree: FileTreeNode[]) => Promise<void>,
  isWatching: boolean,
  stopWatching: () => Promise<void>
): UseFileModeResult {
  const [fileMode, setFileMode] = useState<FileMode>('upload');
  const [showFileList, setShowFileList] = useState(false);

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
    // Show file list dialog instead of file picker
    setShowFileList(true);
  }, []);

  const handleSelectNewFile = useCallback(async () => {
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
      setShowFileList(false);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error selecting file:', error);
        const errorMessage = error.message || 'Failed to select file. Please try again.';
        alert(errorMessage);
      }
    }
  }, [onWatchStart, setFileMode]);

  const handleSelectFolder = useCallback(async () => {
    try {
      if (!('showDirectoryPicker' in window)) {
        alert('File System Access API is not supported in this browser. Please use Chrome, Edge, or another Chromium-based browser.');
        return;
      }

      const folderHandle = await (window as any).showDirectoryPicker();
      const folderName = folderHandle.name;
      
      // Build file tree
      const fileTree = await buildFileTree(folderHandle);
      
      if (fileTree.length === 0) {
        alert('No markdown files found in the selected folder.');
        return;
      }

      await onFolderSelected(folderHandle, folderName, fileTree);
      setFileMode('folder');
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error selecting folder:', error);
        const errorMessage = error.message || 'Failed to select folder. Please try again.';
        alert(errorMessage);
      }
    }
  }, [onFolderSelected]);

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
    handleSelectFolder,
    showFileList,
    setShowFileList,
    handleSelectNewFile,
  };
}
