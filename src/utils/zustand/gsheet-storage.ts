import _debounce from 'lodash/debounce';
import { StateStorage } from 'zustand/middleware';
import { googleSheetDbDeprecated } from '../googleSheetDb';

export function gSheetStorage(sheetTabId: string): StateStorage {
  const db = googleSheetDbDeprecated(sheetTabId);
  const debouncedSync = _debounce((value: string) => {
    db.set(value);
  }, 500);

  return {
    getItem: db.get,
    removeItem: () => {},
    setItem: (name, value) => {
      debouncedSync(value);
    },
  };
}

export function handleIsLoadingState(store: any, loadingStateName: string) {
  const unsub = store.persist.onFinishHydration(() => {
    store.setState({ [loadingStateName]: false });

    unsub();
  });
}
