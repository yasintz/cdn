import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import _debounce from 'lodash/debounce';
import _orderBy from 'lodash/orderBy';
import { googleSheetDb } from 'src/utils/googleSheetDb';
import { StoreType } from '../types';

type StateType = {
  store: StoreType;
  setStore: (store: StoreType) => void;
};

const db = googleSheetDb('0');
// const db = googleSheetDb('1945192592');

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
      name: 'family_tree_store',
    }
  )
);

db.handleStorage(useStore);
