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
  recurring?: string;
};

type NonUpdateAbleProperties = 'id' | 'createdAt';

type StoreType = {
  todoList: TodoType[];
  todoLength: number;
  addTodo: (todo: TodoType) => void;
  removeTodo: (id: string) => void;
  updateTodo: (
    id: string,
    todo: Partial<Omit<TodoType, NonUpdateAbleProperties>>
  ) => void;
  updateOrder: (items: string[]) => void;
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
          updateOrder: (todoList) =>
            set((prev) => {
              prev.todoList = todoList.map(
                (id) => prev.todoList.find((todo) => todo.id === id)!
              );
            }),
          removeTodo: (id) =>
            set((prev) => {
              prev.todoList = prev.todoList.filter((i) => i.id !== id);
            }),

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
