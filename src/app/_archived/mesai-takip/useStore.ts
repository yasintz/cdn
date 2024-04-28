import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import _debounce from 'lodash/debounce';
import { googleSheetDb } from './utils/googleSheetDb';

export type ItemType = {
  id: string;
  date: string;
  note?: string;
  hour: number;
  minute: number;
  isPublicHoliday?: boolean;
};

export type PricesType = {
  weekdays: number;
  weekends: number;
  publicHolidays: number;
};

type StoreType = {
  items: ItemType[];
  prices: PricesType;
  setPrices: (prices: Partial<PricesType>) => void;
  addItem: (item: ItemType) => void;
  updateItem: (id: string, item: Partial<Omit<ItemType, 'id'>>) => void;
  removeItem: (id: string) => void;
};

const sheetTabId = window.location.href.includes('localhost')
  ? '728138143'
  : '0';

export const useStore = create(
  persist<StoreType>(
    (set) => ({
      items: [],
      prices: {
        weekdays: 0,
        weekends: 0,
        publicHolidays: 0,
      },
      setPrices: (prices) =>
        set((prev) => ({
          prices: {
            ...prev.prices,
            ...prices,
          },
        })),
      addItem: (item) =>
        set((prev) => ({
          items: [...prev.items, item],
        })),
      updateItem: (id, item) =>
        set((prev) => ({
          items: prev.items.map((i) => (i.id === id ? { ...i, ...item } : i)),
        })),
      removeItem: (id) =>
        set((prev) => ({
          items: prev.items.filter((i) => i.id !== id),
        })),
    }),
    {
      name: '200f1ae3421c0a2561d5',
    }
  )
);

const throttledReSync = _debounce((store: StoreType) => {
  const storageData = {
    ...store,
    items: store.items.map((i) => ({
      ...i,
      item: undefined,
    })),
  };

  googleSheetDb(sheetTabId).set(JSON.stringify(storageData));
}, 500);

googleSheetDb(sheetTabId)
  .get()
  .then((res) => {
    const json = JSON.parse(res);

    useStore.setState(json);

    useStore.subscribe(throttledReSync);

    googleSheetDb(sheetTabId).set(res);
  });
