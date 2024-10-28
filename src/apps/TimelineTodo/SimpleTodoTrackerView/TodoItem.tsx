import { SimpleTodoType, useStore } from '../store';
import { CheckCircleIcon, FolderIcon, XCircleIcon } from 'lucide-react';

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
        {todo.status === 'backlog' && (
          <CheckCircleIcon
            className="size-4 cursor-pointer"
            onClick={() => updateStatus(todo.id, 'done')}
          />
        )}
        {todo.status === 'done' && (
          <FolderIcon
            className="size-4 cursor-pointer"
            onClick={() => updateStatus(todo.id, 'backlog')}
          />
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
