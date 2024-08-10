import { computed, compute } from 'zustand-computed-state';
import { persist } from 'zustand/middleware';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { gSheetStorage } from '@/utils/zustand/gsheet-storage';
import { uid } from '@/utils/uid';
import { parseTagsFromTitle } from '../helpers';
import { getTagsFromString } from './computed/task';

export type TaskType = {
  id: string;
  title: string;
  titleRaw: string;
  startTime: number;
  endTime?: number;
  priceHr?: number;
  projectId: string;
};

export type ProjectType = {
  id: string;
  name: string;
};

type StoreType = {
  tasks: TaskType[];
  projects: ProjectType[];
  taskTags: Record<string, string[]>;
  inputs: string[];
  createTask: (
    inputId: string,
    task: Pick<TaskType, 'title' | 'startTime' | 'priceHr' | 'projectId'>
  ) => void;
  stopTask: (id: string) => void;
  updateTask: (id: string, task: Partial<Omit<TaskType, 'id'>>) => void;
  deleteTask: (id: string) => void;
  addInput: () => void;
  removeInput: (id: string) => void;
};

export const useStore = create<StoreType>()(
  computed(
    immer(
      persist(
        (set, get) =>
          ({
            tasks: [],
            projects: [],
            inputs: [],
            addInput: () =>
              set((prev) => {
                prev.inputs.push(uid());
              }),
            removeInput: (id) =>
              set((prev) => {
                prev.inputs = prev.inputs.filter((i) => i !== id);
              }),
            updateTask: (id, updates) =>
              set((prev) => {
                const task = prev.tasks.find((i) => i.id === id);
                if (task) {
                  Object.assign(task, {
                    ...updates,
                    ...parseTagsFromTitle(updates.title || task.title),
                  });
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
                  ...parseTagsFromTitle(task.title),
                });

                if (!prev.inputs.includes(inputId)) {
                  prev.inputs.push(inputId);
                }
              }),

            ...compute(get, (state) => ({
              taskTags: Object.fromEntries(
                state.tasks.map((task) => [
                  task.id,
                  getTagsFromString(task.title),
                ])
              ),
            })),
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
