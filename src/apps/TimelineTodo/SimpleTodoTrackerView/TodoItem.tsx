import React from 'react';
import { SimpleTodoType, useStore } from '../store';
import { ChevronLeftIcon, ChevronRightIcon, XCircleIcon } from 'lucide-react';

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
        <ChevronLeftIcon
          className="size-4 cursor-pointer"
          onClick={() => updateStatus(todo.id, statusLeft[todo.status])}
        />
        <ChevronRightIcon
          className="size-4 cursor-pointer"
          onClick={() => updateStatus(todo.id, statusRight[todo.status])}
        />
        <XCircleIcon
          className="size-4 cursor-pointer"
          onClick={() => deleteTodo(todo.id)}
        />
      </div>
    </div>
  );
};

export default TodoItem;
