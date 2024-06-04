import React from 'react';
import { cn } from '@/lib/utils';
import { TodoType, useStore } from './store';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

type TodoProps = {
  todo: TodoType;
  isPreview: boolean;
  onEnterPress: () => void;
  allTodosRef: React.MutableRefObject<Record<string, HTMLInputElement>>;
};

const Todo = ({ todo, isPreview, onEnterPress, allTodosRef }: TodoProps) => {
  const { reorderTodo, updateTodoText, deleteTodo, toggleTodo } = useStore();
  return (
    <li
      className={cn('flex gap-2 items-center', {
        'opacity-60': todo.completed,
      })}
    >
      <div
        className={cn('flex flex-col cursor-pointer', isPreview && 'hidden')}
      >
        <ChevronUpIcon size={15} onClick={() => reorderTodo(todo.id, 'up')} />
        <ChevronDownIcon
          size={15}
          onClick={() => reorderTodo(todo.id, 'down')}
        />
      </div>
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
