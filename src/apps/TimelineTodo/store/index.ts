import { computed } from 'zustand-computed-state';
import { gSheetStorage } from '@/utils/zustand/gsheet-storage';
import { StateCreator, create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { SessionSliceType, createSessionSlice } from './session/session-slice';
import { EntrySliceType, createEntrySlice } from './entry-slice';
import { TodoSliceType, createTodoSlice } from './todo-slice';
import { StoreRelations, createStoreRelations } from './relations';
export type { SessionType } from './session/session-slice';

export type StoreType = SessionSliceType &
  EntrySliceType &
  TodoSliceType & {
    getRelations: () => StoreRelations;
  };

export type EntryType = StoreType['entries'][number];
export type TodoType = StoreType['todos'][number];

export type TodoStoreCreator<S> = StateCreator<
  StoreType,
  [['zustand/immer', never]],
  [['zustand/persist', StoreType]],
  S
>;

export const useStore = create<StoreType>()(
  computed(
    immer(
      persist(
        (...store) =>
          ({
            ...createSessionSlice(...store),
            ...createEntrySlice(...store),
            ...createTodoSlice(...store),
            getRelations: () => createStoreRelations(store[1]()),
          } as StoreType),
        {
          name: 'timeline-todo',
        }
      )
    )
  )
);

gSheetStorage(
  '1gI4tbIt1ETMm6aPXNdk5ycHt8tHlJr-TxkbKuAKqBKc'
  // window.location.href.includes('localhost') ? '1803964356' : '0'
).handleStore(useStore);
