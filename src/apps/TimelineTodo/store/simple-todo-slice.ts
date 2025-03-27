import type { TodoStoreCreator } from '.';

export type SimpleTodoType = {
  id: string;
  projectId?: string;
  text: string;
  date: string;
  subtasks?: SimpleTodoType[];
  timeTrackerId?: string;
  completedAt: string | null;
  note?: string;
  blocked?: boolean;
  reference?: string;
  tags?: string[];
};

export type SimpleTodoSlice = {
  simpleTodoList: SimpleTodoType[];
  showByTags: boolean;
  selectedTags: string[];
  setShowByTags: (showByTags: boolean) => void;
  setSelectedTags: (selectedTags: string[]) => void;
  updateSimpleTodoList: (todos: SimpleTodoType[]) => void;
  addTodo: (todo: SimpleTodoType) => void;
  orderTodos: (todos: SimpleTodoType[]) => void;
  createTodos: (todos: SimpleTodoType[]) => void;
  updateTask: (id: string, task: Partial<SimpleTodoType>) => void;
  toggleTask: (id: string) => void;
  deleteSimpleTodo: (id: string) => void;
  addSubtask: (id: string, subtask: SimpleTodoType) => void;
  deleteSubtask: (id: string, subtaskId: string) => void;
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
  orderTodos: (todos) => {
    set((prev) => {
      prev.simpleTodoList = prev.simpleTodoList.sort((a, b) => {
        const aIndex = todos.findIndex((t) => t.id === a.id);
        const bIndex = todos.findIndex((t) => t.id === b.id);
        return aIndex - bIndex;
      });
    });
  },
  addTodo: (todo) => {
    set((prev) => {
      prev.simpleTodoList = [...prev.simpleTodoList, todo];
    });
  },
  showByTags: true,
  selectedTags: ['main'],
  setShowByTags: (showByTags) => {
    set({ showByTags });
  },
  setSelectedTags: (selectedTags) => {
    set({ selectedTags });
  },
  createTodos: (todos) => {
    set((prev) => {
      prev.simpleTodoList = [...prev.simpleTodoList, ...todos];
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
  toggleTask: (id) => {
    set((prev) => {
      prev.simpleTodoList = prev.simpleTodoList.map((t) =>
        t.id === id
          ? {
              ...t,
              completedAt: t.completedAt ? null : new Date().toISOString(),
              // completed: !t.completed,
              // date: dayjs(selectedDate).format(SIMPLE_TODO_DATE_FORMAT),
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
});
