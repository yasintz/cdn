import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

type UrlsStates = {
  showArchived: boolean;
  sessionSortingEnabled: boolean;
  dayViewSelectedEntryId: string | undefined;
  editNoteEntryId: string | undefined;
};

export const searchParamKeys: {
  [K in keyof UrlsStates]: K;
} = {
  showArchived: 'showArchived',
  sessionSortingEnabled: 'sessionSortingEnabled',
  dayViewSelectedEntryId: 'dayViewSelectedEntryId',
  editNoteEntryId: 'editNoteEntryId',
};

const defaultConverter = (val: any) => val;

const booleanConverter = {
  get: (val: string) => val === 'true',
  set: (val: boolean) => `${!!val}`,
};

const converters: Partial<Record<keyof UrlsStates, any>> = {
  showArchived: booleanConverter,
  sessionSortingEnabled: booleanConverter,
};

export function useUrlQ(): UrlsStates & {
  setParams: (p: Partial<UrlsStates>) => void;
  deleteParam: (key: keyof UrlsStates) => void;
} {
  const [searchParams, setSearchParams] = useSearchParams();

  const state = useMemo<UrlsStates>(() => {
    const store: any = {};

    Object.keys(searchParamKeys).forEach((key) => {
      let val = searchParams.get(key);

      const converter = (converters as any)[key]?.get;

      if (converter) {
        val = converter(val) as any;
      }

      store[key] = val;
    });

    return store;
  }, [searchParams]);

  return {
    ...state,
    setParams: (p) => {
      setSearchParams((prev) => {
        Object.entries(p).forEach(([key, val]) => {
          const converter = (converters as any)[key]?.set || defaultConverter;
          prev.set(key, converter(val));
        });

        return prev;
      });
    },

    deleteParam: (key) => {
      setSearchParams((prev) => {
        prev.delete(key);
        return prev;
      });
    },
  };
}
