// Utility for storing and retrieving FileSystemFileHandle from IndexedDB
const DB_NAME = 'markdown-reviewer-db';
const STORE_NAME = 'file-handles';
const CONFIG_KEY = 'config';
const FILES_KEY = 'files';

export interface SavedFileHandle {
  handle: FileSystemFileHandle;
  fileName: string;
  lastAccessed: number;
  id: string;
}

export interface FileHandlesConfig {
  currentFileId: string | null;
  files: SavedFileHandle[];
}

async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

async function getConfig(): Promise<FileHandlesConfig> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise<FileHandlesConfig>((resolve, reject) => {
      const request = store.get(CONFIG_KEY);
      request.onsuccess = () => {
        const config = request.result;
        resolve(config || { currentFileId: null, files: [] });
      };
      request.onerror = () => reject(request.error);
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error('Failed to get config:', error);
    return { currentFileId: null, files: [] };
  }
}

async function saveConfig(config: FileHandlesConfig): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise<void>((resolve, reject) => {
      const request = store.put(config, CONFIG_KEY);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error('Failed to save config:', error);
    throw error;
  }
}

export async function saveFileHandle(handle: FileSystemFileHandle): Promise<string> {
  try {
    const config = await getConfig();
    const file = await handle.getFile();
    const fileName = file.name;
    const fileId = Date.now().toString();
    
    // Check if file already exists (by name)
    const existingFileIndex = config.files.findIndex(f => f.fileName === fileName);
    
    const savedFile: SavedFileHandle = {
      handle,
      fileName,
      lastAccessed: Date.now(),
      id: fileId,
    };

    if (existingFileIndex >= 0) {
      // Update existing file
      config.files[existingFileIndex] = savedFile;
    } else {
      // Add new file
      config.files.push(savedFile);
    }

    // Set as current file
    config.currentFileId = savedFile.id;
    
    await saveConfig(config);
    return savedFile.id;
  } catch (error) {
    console.error('Failed to save file handle:', error);
    throw error;
  }
}

export async function getCurrentFileHandle(): Promise<FileSystemFileHandle | null> {
  try {
    const config = await getConfig();
    if (!config.currentFileId) {
      return null;
    }

    const currentFile = config.files.find(f => f.id === config.currentFileId);
    if (!currentFile) {
      return null;
    }

    // Update last accessed time
    currentFile.lastAccessed = Date.now();
    await saveConfig(config);

    return currentFile.handle;
  } catch (error) {
    console.error('Failed to get current file handle:', error);
    return null;
  }
}

export async function getAllSavedFiles(): Promise<SavedFileHandle[]> {
  try {
    const config = await getConfig();
    return config.files.sort((a, b) => b.lastAccessed - a.lastAccessed);
  } catch (error) {
    console.error('Failed to get saved files:', error);
    return [];
  }
}

export async function setCurrentFile(fileId: string): Promise<FileSystemFileHandle | null> {
  try {
    const config = await getConfig();
    const file = config.files.find(f => f.id === fileId);
    
    if (!file) {
      return null;
    }

    config.currentFileId = fileId;
    file.lastAccessed = Date.now();
    await saveConfig(config);

    return file.handle;
  } catch (error) {
    console.error('Failed to set current file:', error);
    return null;
  }
}

export async function clearCurrentFile(): Promise<void> {
  try {
    const config = await getConfig();
    config.currentFileId = null;
    await saveConfig(config);
  } catch (error) {
    console.error('Failed to clear current file:', error);
    throw error;
  }
}

export async function removeFileHandle(fileId?: string): Promise<void> {
  try {
    const config = await getConfig();
    
    if (fileId) {
      // Remove specific file from history
      config.files = config.files.filter(f => f.id !== fileId);
      if (config.currentFileId === fileId) {
        config.currentFileId = null;
      }
    } else {
      // Remove current file from history
      if (config.currentFileId) {
        config.files = config.files.filter(f => f.id !== config.currentFileId);
        config.currentFileId = null;
      }
    }
    
    await saveConfig(config);
  } catch (error) {
    console.error('Failed to remove file handle:', error);
    throw error;
  }
}

// Legacy support - for backward compatibility
export async function getFileHandle(): Promise<FileSystemFileHandle | null> {
  return getCurrentFileHandle();
}
