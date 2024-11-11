import { computed } from 'zustand-computed-state';
import { gSheetStorage } from '@/utils/zustand/gsheet-storage';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { uid } from '@/utils/uid';

export type { SessionType } from './session/session-slice';

export type PropertyTypeValue =
  | 'text'
  | 'number'
  | 'date'
  | 'rich-text'
  | 'boolean'
  | 'select';

export type PropertyConfigType = {
  id: string;
  type: PropertyTypeValue;
  label: string;
} & Record<string, any>;

export type TaskType = {
  id: string;
  name: string;
  completed?: boolean;
  description?: string;
  workspaceId: string;
  properties: Record<string, any>;
};

type WorkspaceType = {
  id: string;
  name: string;
  properties: Array<PropertyConfigType>;
};

type ViewTypeValue = 'list' | 'kanban';
export type ViewType = {
  name: string;
  id: string;
  type: ViewTypeValue;
  visibleProperties: string[];
};

type TaskStore = {
  tasks: TaskType[];
  addTask: (workspaceId: string, name: string) => string;
  updateTaskProperties: (id: string, properties: Record<string, any>) => void;
  updateTask: (id: string, task: Partial<Omit<TaskType, 'id'>>) => void;
  deleteTask: (id: string) => void;
};

type WorkspaceStore = {
  workspaces: WorkspaceType[];
  addWorkspace: (name: string) => void;
  deleteWorkspace: (id: string) => void;
};

type ViewStore = {
  views: ViewType[];
};

type PropertyStore = {
  addProperty: (id: string, property: string, value: any) => void;
  deleteProperty: (id: string, property: string) => void;
  updateProperty: (id: string, property: string, value: any) => void;
  orderTasks: (ids: string[]) => void;
};

export type StoreType = TaskStore & WorkspaceStore & PropertyStore & ViewStore;

export const useStore = create<StoreType>()(
  computed(
    immer(
      persist(
        (set) => ({
          tasks: [],
          workspaces: [],
          orderTasks: (ids) => {
            //   setTodos(
            //     todos
            //       .filter((i) => !newState.map((j) => j.id).includes(i.id))
            //       .concat(newState.map((i) => todos.find((j) => j.id === i.id)!))
            // // }

            set((state) => {
              state.tasks = state.tasks
                .filter((i) => !ids.includes(i.id))
                .concat(ids.map((i) => state.tasks.find((j) => j.id === i)!));
            });
          },

          views: [
            {
              id: 'default',
              name: 'Default',
              type: 'list',
              visibleProperties: ['name'],
            },
          ],
          addTask: (workspaceId, name) => {
            const id = uid();
            set((state) => {
              state.tasks.push({
                id,
                workspaceId,
                name,
                properties: {},
              });
            });

            return id;
          },
          updateTask: (id, task) => {
            set((state) => {
              const currentTask = state.tasks.find((t) => t.id === id);

              if (currentTask) {
                Object.assign(currentTask, task);
              }
            });
          },
          updateTaskProperties: (id, properties) => {
            set((state) => {
              const task = state.tasks.find((t) => t.id === id);

              if (task) {
                Object.assign(task.properties, properties);
              }
            });
          },

          deleteTask: (id) => {
            set((state) => {
              state.tasks = state.tasks.filter((t) => t.id !== id);
            });
          },

          addProperty: (id, property, value) => {
            set((state) => {
              const task = state.tasks.find((t) => t.id === id);

              if (task) {
                task.properties[property] = value;
              }
            });
          },

          deleteProperty: (id, property) => {
            set((state) => {
              const task = state.tasks.find((t) => t.id === id);

              if (task) {
                delete task.properties[property];
              }
            });
          },

          updateProperty: (id, property, value) => {
            set((state) => {
              const task = state.tasks.find((t) => t.id === id);

              if (task) {
                task.properties[property] = value;
              }
            });
          },
          addWorkspace: (name) => {
            const id = uid();
            set((state) => {
              state.workspaces.push({
                id,
                name,
                properties: [
                  {
                    id: 'description',
                    type: 'rich-text',
                    label: 'Description',
                  },
                  {
                    id: 'due-date',
                    type: 'date',
                    label: 'Due Date',
                  },
                  {
                    id: 'priority',
                    type: 'select',
                    label: 'Priority',
                    options: [
                      { value: 'low', label: 'Low' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'high', label: 'High' },
                    ],
                  },
                  {
                    id: 'completed',
                    type: 'boolean',
                    label: 'Completed',
                  },
                ],
              });
            });
          },

          deleteWorkspace: (id) => {
            set((state) => {
              state.workspaces = state.workspaces.filter((w) => w.id !== id);
            });
          },
        }),
        {
          name: 'tasks',
        }
      )
    )
  )
);

gSheetStorage(
  'Tasks',
  '1rDwN7gx2ARdczpIhJHjDjugZzmysjcOHy_k9rSb0keY'
).handleStore(useStore);
