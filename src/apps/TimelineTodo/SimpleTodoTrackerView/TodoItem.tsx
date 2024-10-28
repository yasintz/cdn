import React from 'react';
import { SimpleTodoType, useStore } from '../store';
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  XCircleIcon,
} from 'lucide-react';

const statusRight: Record<SimpleTodoType['status'], SimpleTodoType['status']> =
  {
    backlog: 'inProgress',
    inProgress: 'done',
    done: 'done',
  };

const statusLeft: Record<SimpleTodoType['status'], SimpleTodoType['status']> = {
  backlog: 'backlog',
  inProgress: 'backlog',
  done: 'inProgress',
};

type TodoItemProps = {
  todo: SimpleTodoType;
};

const TodoItem = ({ todo }: TodoItemProps) => {
  const updateStatus = useStore((s) => s.updateSimpleTodoStatus);
  const deleteTodo = useStore((s) => s.deleteSimpleTodo);

  return (
    <div
      key={todo.id}
      className="bg-white p-2 mb-2 rounded shadow cursor-pointer flex justify-between items-center"
    >
      <span>{todo.text}</span>
      <div className="flex gap-3">
        {todo.status !== 'backlog' && (
          <>
            <ChevronLeftIcon
              className="size-4 cursor-pointer hidden md:block"
              onClick={() => updateStatus(todo.id, statusLeft[todo.status])}
            />
            <ChevronUpIcon
              className="size-4 cursor-pointer md:hidden"
              onClick={() => updateStatus(todo.id, statusLeft[todo.status])}
            />
          </>
        )}
        {todo.status !== 'done' && (
          <>
            <ChevronDownIcon
              className="size-4 cursor-pointer md:hidden"
              onClick={() => updateStatus(todo.id, statusRight[todo.status])}
            />
            <ChevronRightIcon
              className="size-4 cursor-pointer hidden md:block"
              onClick={() => updateStatus(todo.id, statusRight[todo.status])}
            />
          </>
        )}
        <XCircleIcon
          className="size-4 cursor-pointer"
          onClick={() => deleteTodo(todo.id)}
        />
      </div>
    </div>
  );
};

export default TodoItem;
