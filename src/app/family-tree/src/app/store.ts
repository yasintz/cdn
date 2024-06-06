import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import _debounce from 'lodash/debounce';
import _orderBy from 'lodash/orderBy';
import { StoreType } from '../types';
import { gSheetStorage } from '@/utils/zustand/gsheet-storage';

type StateType = {
  store: StoreType;
  setStore: (store: StoreType) => void;
};

export const useStore = create(
  persist<StateType>(
    (set) => ({
      store: {
        metadata: [],
        person: [],
        relation: [],
      },
      setStore: (store) => set({ store }),
    }),
    {
      name: 'family_tree_store_1',
    }
  )
);

gSheetStorage('1BiqlwaBsUdyQIZU2wy0dMv7HkA7E0WpOZjyR3rWTr6E').handleStore(
  useStore
);
