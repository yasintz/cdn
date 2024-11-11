import { uid } from '@/utils/uid';
import { TodoStoreCreator } from '.';

export type TodoSliceType = {
  todos: Array<{
    id: string;
    text: string;
    completed: boolean;
    entryId: string;
  }>;

  createTodo: (entryId: string, text: string) => string;
  toggleTodo: (id: string) => void;
  updateTodoText: (id: string, text: string) => void;
  deleteTodo: (id: string) => void;
  reorderTodo: (id: string, direction: 'up' | 'down') => void;
};
export const createTodoSlice: TodoStoreCreator<TodoSliceType> = (set) => ({
  todos: [],
  createTodo: (entryId, text) => {
    const id = uid();
    set((prev) => ({
      todos: [
        ...prev.todos,
        {
          id,
          entryId,
          text,
          completed: false,
        },
      ],
    }));

    return id;
  },

  toggleTodo: (id) =>
    set((prev) => ({
      todos: prev.todos.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              completed: !todo.completed,
            }
          : todo
      ),
    })),

  updateTodoText: (id, text) =>
    set((prev) => {
      const todo = prev.todos.find((todo) => todo.id === id);

      if (todo) {
        todo.text = text;
      }
    }),
  deleteTodo: (id) =>
    set((prev) => ({
      todos: prev.todos.filter((session) => session.id !== id),
    })),
  reorderTodo: (id, direction: 'up' | 'down') => {
    set((prev) => {
      const todo = prev.todos.find((todo) => todo.id === id);
      const entry = prev.entries.find((entry) => entry.id === todo?.entryId);
      const entryTodos = prev.todos.filter(
        (todo) => todo.entryId === entry?.id
      );

      if (!entry || !todo) {
        return prev;
      }

      const todoIndex = entryTodos.indexOf(todo);
      prev.todos.splice(todoIndex, 1);

      if (direction === 'up') {
        const prevItem = entryTodos[todoIndex - 1];
        const prevItemIndex = prev.todos.indexOf(prevItem);
        prev.todos.splice(prevItemIndex, 0, todo);
      } else {
        const nextItem = entryTodos[todoIndex + 1];
        const nextItemIndex = prev.todos.indexOf(nextItem);
        prev.todos.splice(nextItemIndex + 1, 0, todo);
      }
    });
  },
});
