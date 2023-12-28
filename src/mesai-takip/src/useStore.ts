import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { npointStorage } from './utils/npointStorage';

export type ItemType = {
  id: string;
  date: string;
  note?: string;
  hour: number;
  minute: number;
};

type StoreType = {
  items: ItemType[];
  addItem: (item: ItemType) => void;
  updateItem: (id: string, item: Partial<Omit<ItemType, 'id'>>) => void;
  removeItem: (id: string) => void;
};

const npointId = '200f1ae3421c0a2561d5';
export const useStore = create(
  persist(
    persist<StoreType>(
      (set) => ({
        items: [],
        addItem: (item) =>
          set((prev) => ({
            items: [...prev.items, item],
          })),
        updateItem: (id, item) =>
          set((prev) => ({
            items: prev.items.map((i) => (i.id === id ? { ...i, item } : i)),
          })),
        removeItem: (id) =>
          set((prev) => ({
            items: prev.items.filter((i) => i.id !== id),
          })),
      }),
      {
        name: npointId,
      }
    ),
    {
      name: npointId,
      storage: createJSONStorage(() => npointStorage(npointId)),
    }
  )
);
