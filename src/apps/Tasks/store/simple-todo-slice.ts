import dayjs from '@/helpers/dayjs';
import type { TodoStoreCreator } from '.';
import { SIMPLE_TODO_DATE_FORMAT } from './utils';

export type SimpleTodoType = {
  id: string;
  // projectId?: string;
  // name: string;
  // date: string;
  // subtasks?: SimpleTodoType[];
  // timeTrackerId?: string;
  // completed: boolean;
  // note?: string;
  // blocked?: boolean;
  // reference?: string;
  properties?: Record<string, any>;
};

export type SimpleTodoSlice = {
  tasks: SimpleTodoType[];
  // updateSimpleTodoList: (todos: SimpleTodoType[]) => void;
  updateTask: (id: string, task: Record<string, any>) => void;
  deleteTask: (id: string) => void;
  addTask: (task: SimpleTodoType) => void;
  // addSubtask: (id: string, subtask: SimpleTodoType) => void;
  // deleteSubtask: (id: string, subtaskId: string) => void;
  // toggleSubtask: (id: string, subtaskId: string) => void;
  addProperty: (id: string, property: string, value: any) => void;
  deleteProperty: (id: string, property: string) => void;
  updateProperty: (id: string, property: string, value: any) => void;
};

export const createSimpleTodoSlice: TodoStoreCreator<SimpleTodoSlice> = (
  set
) => ({
  tasks: [],
  updateTask: (id, task) => {
    set((prev) => {
      prev.simpleTodoList = prev.simpleTodoList.map((t) =>
        t.id === id
          ? {
              ...t,
              ...task,
            }
          : t
      );
    });
  },
  toggleTask: (id, selectedDate) => {
    set((prev) => {
      prev.simpleTodoList = prev.simpleTodoList.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              date: dayjs(selectedDate).format(SIMPLE_TODO_DATE_FORMAT),
            }
          : t
      );
    });
  },
  deleteSimpleTodo: (id) => {
    set((prev) => {
      prev.simpleTodoList = prev.simpleTodoList.filter((t) => t.id !== id);
    });
  },
  addSubtask: (id, subtask) => {
    set((prev) => {
      prev.simpleTodoList = prev.simpleTodoList.map((t) =>
        t.id === id
          ? {
              ...t,
              subtasks: [...(t.subtasks || []), subtask],
            }
          : t
      );
    });
  },

  deleteSubtask: (id, subtaskId) => {
    set((prev) => {
      prev.simpleTodoList = prev.simpleTodoList.map((t) =>
        t.id === id
          ? {
              ...t,
              subtasks: (t.subtasks || []).filter((s) => s.id !== subtaskId),
            }
          : t
      );
    });
  },

  toggleSubtask: (id, subtaskId) => {
    set((prev) => {
      prev.simpleTodoList = prev.simpleTodoList.map((t) =>
        t.id === id
          ? {
              ...t,
              subtasks: (t.subtasks || []).map((s) =>
                s.id === subtaskId ? { ...s, completed: !s.completed } : s
              ),
            }
          : t
      );
    });
  },

  addProperty: (id, property, value) => {
    set((prev) => {
      prev.simpleTodoList = prev.simpleTodoList.map((t) =>
        t.id === id
          ? {
              ...t,
              properties: {
                ...t.properties,
                [property]: value,
              },
            }
          : t
      );
    });
  },

  updateProperty: (id, property, value) => {
    set((prev) => {
      prev.simpleTodoList = prev.simpleTodoList.map((t) =>
        t.id === id
          ? {
              ...t,
              properties: {
                ...t.properties,
                [property]: value,
              },
            }
          : t
      );
    });
  },
  deleteProperty: (id, property) => {
    set((prev) => {
      prev.simpleTodoList = prev.simpleTodoList.map((t) =>
        t.id === id
          ? {
              ...t,
              properties: Object.fromEntries(
                Object.entries(t.properties || {}).filter(
                  ([key]) => key !== property
                )
              ),
            }
          : t
      );
    });
  },
});
