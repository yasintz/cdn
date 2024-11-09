import dayjs from '@/helpers/dayjs';
import type { TodoStoreCreator } from '.';
import { SIMPLE_TODO_DATE_FORMAT } from './utils';

export type SimpleTodoType = {
  id: string;
  text: string;
  date: string;
  subtasks?: SimpleTodoType[];
  timeTrackerId?: string;
  completed: boolean;
  note?: string;
  blocked?: boolean;
  reference?: string;
};

export type SimpleTodoSlice = {
  simpleTodoList: SimpleTodoType[];
  updateSimpleTodoList: (todos: SimpleTodoType[]) => void;
  updateTask: (id: string, task: Partial<SimpleTodoType>) => void;
  toggleTask: (id: string, selectedDate: string) => void;
  deleteSimpleTodo: (id: string) => void;
  addSubtask: (id: string, subtask: SimpleTodoType) => void;
  deleteSubtask: (id: string, subtaskId: string) => void;
  toggleSubtask: (id: string, subtaskId: string) => void;
};

export const createSimpleTodoSlice: TodoStoreCreator<SimpleTodoSlice> = (
  set
) => ({
  simpleTodoList: [],
  updateSimpleTodoList: (todos) => {
    set((prev) => {
      prev.simpleTodoList = todos;
    });
  },
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
});
