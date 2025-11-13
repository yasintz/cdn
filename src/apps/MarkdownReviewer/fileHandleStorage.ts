// Utility for storing and retrieving FileSystemFileHandle from IndexedDB
const DB_NAME = 'markdown-reviewer-db';
const STORE_NAME = 'file-handles';
const KEY = 'markdown-file-handle';

export async function saveFileHandle(handle: FileSystemFileHandle): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // FileSystemFileHandle can be stored directly using structured clone
    return new Promise<void>((resolve, reject) => {
      const request = store.put(handle, KEY);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error('Failed to save file handle:', error);
    throw error;
  }
}

export async function getFileHandle(): Promise<FileSystemFileHandle | null> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise<FileSystemFileHandle | null>((resolve, reject) => {
      const request = store.get(KEY);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error('Failed to get file handle:', error);
    return null;
  }
}

export async function removeFileHandle(): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise<void>((resolve, reject) => {
      const request = store.delete(KEY);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error('Failed to remove file handle:', error);
    throw error;
  }
}

async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

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

