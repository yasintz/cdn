import { computed } from 'zustand-computed-state';
import { gSheetStorage } from '@/utils/zustand/gsheet-storage';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { uid } from '@/utils/uid';
import dayjs from '@/helpers/dayjs';

export type FileSystemItem = {
  id: string;
  name: string;
  parentId?: string;
  type: 'file' | 'folder';
  content?: string;
  deletedAt?: string;
};

type StoreType = {
  items: Array<FileSystemItem>;
  createItem: (file: Omit<FileSystemItem, 'id'>) => string;
  updateItem: (id: string, file: Partial<Omit<FileSystemItem, 'id'>>) => void;
  deleteItem: (id: string) => void;
  cleanExpiredTrashItems: () => void;
};

export const useStore = create<StoreType>()(
  computed(
    immer(
      persist(
        (set) => ({
          items: [],
          createItem: (file) => {
            const id = uid();
            set((prev) => {
              prev.items.push({
                id,
                ...file,
              });
            });
            return id;
          },
          updateItem: (id, file) => {
            set((prev) => {
              const index = prev.items.findIndex((file) => file.id === id);
              prev.items[index] = {
                ...prev.items[index],
                ...file,
                id,
              };
            });
          },

          deleteItem: (id) => {
            set((prev) => {
              prev.items = prev.items.filter((file) => file.id !== id);
            });
          },

          cleanExpiredTrashItems: () => {
            set((prev) => {
              prev.items = prev.items.filter(
                (file) =>
                  !file.deletedAt || dayjs().diff(file.deletedAt, 'day') > 30
              );
            });
          },
        }),
        { name: 'code-snippets' }
      )
    )
  )
);

gSheetStorage(
  'Code Snippets',
  '1UDIGbQOBi2xYl8EvJ5jMMRnFwMJ6y0jPVQF-c65zZtU',
  '0'
).handleStore(useStore);
