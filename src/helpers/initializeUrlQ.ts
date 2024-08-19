import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

const defaultConverter = (val: any) => val;

export const converters = {
  boolean: {
    get: (val: string) => val === 'true',
    set: (val: boolean) => `${!!val}`,
  },
  json: function <T>() {
    return {
      get: (val: string) => JSON.parse(val) as T,
      set: (val: T) => JSON.stringify(val),
    };
  },
};

export function initializeUrlQ<UrlsStates>(
  searchParamKeys: {
    [K in keyof UrlsStates]: K;
  },
  converters: Partial<Record<keyof UrlsStates, any>>
) {
  return function useUrlQ(): UrlsStates & {
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
          prev.delete(key as any);
          return prev;
        });
      },
    };
  };
}
