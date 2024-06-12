import React from 'react';
import { cn } from '@/lib/utils';
import { TodoType, useStore } from './store';
import { Checkbox } from '@/components/ui/checkbox';

type TodoProps = {
  todo: TodoType;
  previousTodoId: string | undefined;
  onEnterPress: () => void;
  allTodosRef: React.MutableRefObject<Record<string, HTMLInputElement>>;
};

const Todo = ({
  todo,
  onEnterPress,
  allTodosRef,
  previousTodoId,
}: TodoProps) => {
  const { updateTodoText, deleteTodo, toggleTodo } = useStore();
  return (
    <li
      className={cn('flex gap-2 items-center', {
        'opacity-60': todo.completed,
      })}
    >
      <Checkbox
        checked={todo.completed}
        onCheckedChange={() => toggleTodo(todo.id)}
      />
      <input
        value={todo.text}
        className="focus:outline-none w-full"
        onChange={(e) => updateTodoText(todo.id, e.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            onEnterPress();
          }

          if (!todo.text && event.key === 'Backspace') {
            deleteTodo(todo.id);
            setTimeout(() => {
              if (previousTodoId) {
                allTodosRef.current[previousTodoId]?.focus();
              }
            }, 100);
          }
        }}
        ref={(item) => {
          if (item) {
            allTodosRef.current[todo.id] = item;
          }
        }}
      />
    </li>
  );
};

export default Todo;
