import _debounce from 'lodash/debounce';
import { StateStorage } from 'zustand/middleware';
import { googleSheetDB, googleSheetDbDeprecated } from '../googleSheetDb';
import Loading from '@/components/ui/loading';

export function gSheetStorageDeprecated(sheetTabId: string): StateStorage {
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

export function handleStoreLoadingState(store: any, loadingStateName: string) {
  const unsub = store.persist.onFinishHydration(() => {
    store.setState({ [loadingStateName]: false });

    unsub();
  });
}

export function gSheetStorage(sheetId: string, tabId?: string): StateStorage {
  const db = googleSheetDB(sheetId, tabId);
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

export function withStoreLoading<T>(
  Component: T,
  useStore: any,
  loadingStateName: string
): T {
  return ((props: any) => {
    const s = useStore();
    const isLoading = s[loadingStateName];

    if (isLoading) {
      return <Loading />;
    }

    // @ts-ignore
    return <Component {...props} />;
  }) as any;
}
