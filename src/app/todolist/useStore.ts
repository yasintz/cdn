import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { gSheetStorage } from '@/utils/zustand/gsheet-storage';
import {
  computedCreator,
  computedMiddleware,
} from '@/utils/zustand/zustand-computed';

type TodoType = {};

type NonUpdateAbleProperties = 'id' | 'createdAt';

type StoreType = {
  todoList: TodoType[];
  todoLength: number;
  //   addTodo: (todo: TodoType) => void;
  //   removeTodo: (todo: TodoType) => void;
  //   updateTodo: (
  //     id: string,
  //     todo: Partial<Omit<TodoType, NonUpdateAbleProperties>>
  //   ) => void;
};

const computed = computedCreator<StoreType>();

const sheetTabId = window.location.href.includes('localhost')
  ? '311739416'
  : '311739416';

export const useStore = create(
  computedMiddleware(
    immer(
      persist<StoreType>(
        (set) => ({
          todoList: [],
          ...computed((s) => ({
            todoLength: s.todoList.length,
          })),
        }),
        {
          name: 'todolist',
          storage: createJSONStorage(() => gSheetStorage(sheetTabId)),
        }
      )
    )
  )
);
