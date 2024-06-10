import { computed } from 'zustand-computed-state';
import { gSheetStorage } from '@/utils/zustand/gsheet-storage';
import _ from 'lodash';
import { StateCreator, create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { SessionSliceType, createSessionSlice } from './session-slice';
import { EntrySliceType, createEntrySlice } from './entry-slice';
import { TodoSliceType, createTodoSlice } from './todo-slice';

export type StoreType = SessionSliceType & EntrySliceType & TodoSliceType;

export type SessionType = StoreType['sessions'][number];
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
          } as StoreType),
        {
          name: 'timeline-todo',
        }
      )
    )
  )
);

gSheetStorage('1gI4tbIt1ETMm6aPXNdk5ycHt8tHlJr-TxkbKuAKqBKc').handleStore(
  useStore
);
