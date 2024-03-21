import _debounce from 'lodash/debounce';
import { StateStorage } from 'zustand/middleware';
import { googleSheetDb } from '../googleSheetDb';

const ONE_HOUR = 3.6e6;

export function gSheetStorage(sheetTabId: string): StateStorage {
  const db = googleSheetDb(sheetTabId);
  const localStorageKey = `ls_${sheetTabId}`;
  const debouncedSync = _debounce((value: string) => {
    db.set(value);
  }, 500);

  async function getFromDb() {
    const value = await db.get();
    localStorage.setItem(
      localStorageKey,
      JSON.stringify({ value, updatedAt: Date.now() })
    );

    return value;
  }

  return {
    getItem: async () => {
      const localStorageData = localStorage.getItem(localStorageKey);

      if (!localStorageData) {
        return getFromDb();
      }

      const { updatedAt, value } = JSON.parse(localStorageData);

      if (Date.now() - updatedAt > ONE_HOUR) {
        return getFromDb();
      }

      return value;
    },
    removeItem: () => {},
    setItem: (name, value) => {
      debouncedSync(value);
      localStorage.setItem(
        localStorageKey,
        JSON.stringify({ value, updatedAt: Date.now() })
      );
    },
  };
}
