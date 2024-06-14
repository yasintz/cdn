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
  createTask: (task: Pick<TaskType, 'title' | 'startTime'>) => void;
  stopTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTaskTitle: (id: string, title: string) => void;
};

export const useStore = create<StoreType>()(
  computed(
    immer(
      persist(
        (set) =>
          ({
            tasks: [],
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
                  task.endTime = Date.now();
                }
              }),
            deleteTask: (id) =>
              set((prev) => {
                prev.tasks = prev.tasks.filter((i) => i.id !== id);
              }),
            createTask: (task) =>
              set((prev) => {
                prev.tasks.push({
                  id: uid(),
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
