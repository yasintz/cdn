import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { gSheetStorage } from '@/utils/zustand/gsheet-storage';
import {
  computedCreator,
  computedMiddleware,
} from '@/utils/zustand/zustand-computed';

export type TodoType = {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  completed?: boolean;
};

type NonUpdateAbleProperties = 'id' | 'createdAt';

type StoreType = {
  todoList: TodoType[];
  todoLength: number;
  addTodo: (todo: TodoType) => void;
  updateTodo: (
    id: string,
    todo: Partial<Omit<TodoType, NonUpdateAbleProperties>>
  ) => void;
};

const computed = computedCreator<StoreType>();

const sheetTabId = window.location.href.includes('localhost')
  ? '311739416'
  : '311739416';

export const useStore = create<StoreType>()(
  computedMiddleware(
    immer(
      persist(
        (set) => ({
          todoList: [],
          addTodo: (todo) =>
            set((prev) => {
              prev.todoList.push(todo);
            }),
          updateTodo: (id, values) => {
            set((prev) => {
              const todo = prev.todoList.find((t) => t.id === id);
              if (todo) {
                Object.assign(todo, values);
              }
            });
          },

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
