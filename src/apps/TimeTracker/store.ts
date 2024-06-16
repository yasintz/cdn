import { computed } from 'zustand-computed-state';
import { persist } from 'zustand/middleware';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { gSheetStorage } from '@/utils/zustand/gsheet-storage';
import { uid } from '@/utils/uid';

export type TaskType = {
  id: string;
  title: string;
  startTime: number;
  endTime?: number;
};

type StoreType = {
  tasks: TaskType[];
  inputs: string[];
  createTask: (
    inputId: string,
    task: Pick<TaskType, 'title' | 'startTime'>
  ) => void;
  stopTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTaskTitle: (id: string, title: string) => void;
  addInput: () => void;
  removeInput: (id: string) => void;
};

export const useStore = create<StoreType>()(
  computed(
    immer(
      persist(
        (set) =>
          ({
            tasks: [],
            inputs: [],
            addInput: () =>
              set((prev) => {
                prev.inputs.push(uid());
              }),
            removeInput: (id) =>
              set((prev) => {
                prev.inputs = prev.inputs.filter((i) => i !== id);
              }),
            updateTaskTitle: (id, title) =>
              set((prev) => {
                const task = prev.tasks.find((i) => i.id === id);
                if (task) {
                  task.title = title;
                }
              }),
            stopTask: (id) =>
              set((prev) => {
                const task = prev.tasks.find((i) => i.id === id);
                if (task) {
                  prev.inputs[prev.inputs.indexOf(id)] = uid();
                  task.endTime = Date.now();
                }
              }),
            deleteTask: (id) =>
              set((prev) => {
                prev.tasks = prev.tasks.filter((i) => i.id !== id);
              }),
            createTask: (inputId, task) =>
              set((prev) => {
                prev.tasks.push({
                  id: inputId,
                  ...task,
                });
              }),
          } as StoreType),
        {
          name: 'time-tracker',
        }
      )
    )
  )
);

gSheetStorage('1KvjSCdlFvJqE-SoJOLpfOiuGlwqM5aSqwZJy7uAM4zQ').handleStore(
  useStore
);
