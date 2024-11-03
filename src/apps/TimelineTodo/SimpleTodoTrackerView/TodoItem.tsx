import { cn } from '@/lib/utils';
import { useStore } from '../store';
import {
  CheckCircleIcon,
  FolderIcon,
  PlayIcon,
  PlusIcon,
  TrashIcon,
  XCircleIcon,
} from 'lucide-react';
import { SimpleTodoType } from '../store/simple-todo-slice';
import Tooltip from '@/components/Tooltip';
import { useStore as useTimeTrackerStore } from '@/apps/TimeTracker/store';
import { uid } from '@/utils/uid';
import useNow from '@/hooks/useNow';
import dayjs from 'dayjs';
import ms from 'ms';

const formatDuration = (diff: number, completed: boolean) => {
  const format = diff > ms('1 hour') || completed ? 'HH:mm:ss' : 'mm:ss';

  return dayjs.duration(diff).format(format);
};

type TodoItemProps = {
  todo: SimpleTodoType;
  selectedDate: string;
};

const TodoItem = ({ todo, selectedDate }: TodoItemProps) => {
  const {
    projects: timeTrackerProjects,
    tasks: timeTrackerTasks,
    createTask: createTimeTrackerTask,
    stopTask: stopTimeTrackerTask,
  } = useTimeTrackerStore();

  const subtasks = todo.subtasks || [];
  const timeTrackerTask = timeTrackerTasks.find(
    (t) => t.id === todo.timeTrackerId
  );

  const now = useNow();
  const diff = timeTrackerTask
    ? timeTrackerTask?.endTime
      ? timeTrackerTask.endTime - timeTrackerTask.startTime
      : now - timeTrackerTask.startTime
    : 0;

  const {
    deleteSimpleTodo: deleteTodo,
    addSubtask,
    toggleTask,
    toggleSubtask,
    deleteSubtask,
    updateTask,
  } = useStore();

  const completeTask = () => {
    updateTask(todo.id, {
      completed: !todo.completed,
      date: selectedDate,
    });

    if (todo.timeTrackerId) {
      stopTimeTrackerTask(todo.timeTrackerId);
    }
  };

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

  const handleStartTask = () => {
    const project = timeTrackerProjects.find((i) =>
      todo.text.toLowerCase().includes(i.name.toLowerCase())
    );

    const timeTrackerTaskId = uid();
    createTimeTrackerTask(timeTrackerTaskId, {
      projectId: project?.id || '',
      startTime: Date.now(),
      title: todo.text,
    });

    updateTask(todo.id, {
      timeTrackerId: timeTrackerTaskId,
    });
  };

  return (
    <div className="bg-white p-2 mb-2 rounded shadow cursor-pointer">
      <div className="flex justify-between items-center">
        <span>{todo.text}</span>
        <div className="flex gap-3 items-center">
          <Tooltip tooltip="Add Subtask">
            <PlusIcon
              className="size-3 cursor-pointer"
              onClick={handleAddSubtask}
            />
          </Tooltip>

          {timeTrackerTask ? (
            <span className="text-xs text-gray-500">
              {formatDuration(diff, todo.completed)}
            </span>
          ) : (
            <PlayIcon
              className="size-3 cursor-pointer"
              onClick={handleStartTask}
            />
          )}
          {todo.completed ? (
            <FolderIcon
              className="size-3 cursor-pointer"
              onClick={() => toggleTask(todo.id, selectedDate)}
            />
          ) : (
            <CheckCircleIcon
              className="size-3 cursor-pointer"
              onClick={completeTask}
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
