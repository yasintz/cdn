import _debounce from 'lodash/debounce';
import { create } from 'zustand';
import { StateStorage } from 'zustand/middleware';
import { googleSheetDB, googleSheetDbDeprecated } from '../googleSheetDb';
import ms from 'ms';
import _ from 'lodash';
// @ts-expect-error type definition
import { diffString } from 'json-diff';
import { toast } from 'sonner';

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

export function gSheetStorage(name: string, sheetId: string, tabId?: string) {
  const db = googleSheetDB(sheetId, tabId);
  let syncedResponse: any;
  let promise: Promise<any> | undefined = undefined;

  const debouncedSet = _debounce(async (value: string) => {
    await promise;
    promise = undefined;
    const latest = await db.get();

    if (!_.isEqual(syncedResponse, latest)) {
      toast.error(`${name} db is updated somewhere else.`);
      console.log(diffString(latest, syncedResponse));
      return;
    }

    syncedResponse = JSON.parse(value);
    await db.set(value);
  }, 1000);

  async function handleStore<S extends ReturnType<typeof create>>(
    store: S,
    keepState?: boolean
  ) {
    // @ts-expect-error keep database info in store
    store.__dbModule = {
      name,
      sheetId,
      tabId,
    };

    const sync = () => {
      return db.get().then((response) => {
        syncedResponse = structuredClone(response);
        store.setState(response.state ? response.state : response);
      });
    };

    let interval: any;

    function restartInterval() {
      clearInterval(interval);
      interval = setInterval(sync, ms('2 minute'));
    }

    try {
      await sync();
      restartInterval();

      store.subscribe((state) => {
        promise = debouncedSet(JSON.stringify(keepState ? { state } : state));
        restartInterval();
      });
    } catch (error) {
      toast.error(`${name} db is not working`);
    }
  }

  return {
    handleStore,
  };
}
