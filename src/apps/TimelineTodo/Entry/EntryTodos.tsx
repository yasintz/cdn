import { cn } from '@/lib/utils';
import React, { useRef } from 'react';
import Todo from '../Todo';
import { useStore } from '../store';
import { PlusIcon } from 'lucide-react';

type EntryTodosProps = {
  entryId: string;
};

const EntryTodos = ({ entryId }: EntryTodosProps) => {
  const allTodosRef = useRef<Record<string, HTMLInputElement>>({});
  const { getRelations, createTodo } = useStore();
  const { entries } = getRelations();
  const entry = entries.find((e) => e.id === entryId)!;
  const entryTodos = entry.todos();

  const handleCreateTodo = () => {
    const newTodoId = createTodo(entry.id, '');
    setTimeout(() => {
      allTodosRef.current[newTodoId]?.focus();
    }, 100);
  };

  return (
    <div className="ml-8 my-2">
      {entryTodos.length > 0 && (
        <ul className={cn(entryTodos.length === 1 && 'py-3')}>
          {entryTodos.map((todo, index) => (
            <Todo
              key={todo.id}
              allTodosRef={allTodosRef}
              onEnterPress={handleCreateTodo}
              todo={todo}
              previousTodoId={entryTodos[index - 1]?.id}
            />
          ))}
        </ul>
      )}
      {entryTodos.length === 0 && (
        <div
          className="text-sm flex gap-1 items-center py-3.5 opacity-5 cursor-pointer"
          onClick={handleCreateTodo}
        >
          <PlusIcon size={12} /> Add todo
        </div>
      )}
    </div>
  );
};

export default EntryTodos;
