import { cn } from '@/lib/utils';
import { useStore } from '../store';
import {
  CheckCircleIcon,
  FolderIcon,
  PlusIcon,
  TrashIcon,
  XCircleIcon,
} from 'lucide-react';
import { SimpleTodoType } from '../store/simple-todo-slice';
import Tooltip from '@/components/Tooltip';

type TodoItemProps = {
  todo: SimpleTodoType;
  selectedDate: string;
};

const TodoItem = ({ todo, selectedDate }: TodoItemProps) => {
  const subtasks = todo.subtasks || [];
  const {
    deleteSimpleTodo: deleteTodo,
    addSubtask,
    toggleTask,
    toggleSubtask,
    deleteSubtask,
  } = useStore();

  const handleAddSubtask = () => {
    const title = prompt('Enter subtask title');
    if (title) {
      addSubtask(todo.id, {
        id: Date.now().toString(),
        text: title,
        completed: false,
        date: todo.date,
      });
    }
  };

  const handleSubtaskDelete = (e: React.MouseEvent, subtaskId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this subtask?')) {
      deleteSubtask(todo.id, subtaskId);
    }
  };

  return (
    <div className="bg-white p-2 mb-2 rounded shadow cursor-pointer">
      <div className="flex justify-between items-center">
        <span>{todo.text}</span>
        <div className="flex gap-3">
          <Tooltip tooltip="Add Subtask">
            <PlusIcon
              className="size-3 cursor-pointer"
              onClick={handleAddSubtask}
            />
          </Tooltip>
          {todo.completed ? (
            <FolderIcon
              className="size-3 cursor-pointer"
              onClick={() => toggleTask(todo.id, selectedDate)}
            />
          ) : (
            <CheckCircleIcon
              className="size-3 cursor-pointer"
              onClick={() => toggleTask(todo.id, selectedDate)}
            />
          )}

          <XCircleIcon
            className="size-3 cursor-pointer"
            onClick={() => deleteTodo(todo.id)}
          />
        </div>
      </div>
      {subtasks.length > 0 && (
        <div className="mt-2 ml-4 text-sm text-gray-700">
          {subtasks.map((subtask) => (
            <div
              key={subtask.id}
              onClick={() => toggleSubtask(todo.id, subtask.id)}
              className={cn(
                'group/subtask flex gap-2 items-center',
                subtask.completed && 'line-through'
              )}
            >
              {subtask.text}
              <TrashIcon
                className="size-2 cursor-pointer hidden group-hover/subtask:block"
                onClick={(e) => handleSubtaskDelete(e, subtask.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TodoItem;
