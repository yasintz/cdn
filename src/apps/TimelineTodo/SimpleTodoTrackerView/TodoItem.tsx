import { useStore } from '../store';
import {
  BanIcon,
  CheckCircleIcon,
  FolderIcon,
  MoreHorizontalIcon,
  NotepadTextIcon,
  PlayIcon,
  SquareArrowOutUpRightIcon,
  TrashIcon,
} from 'lucide-react';
import { SimpleTodoType } from '../store/simple-todo-slice';
import { useStore as useTimeTrackerStore } from '@/apps/TimeTracker/store';
import { uid } from '@/utils/uid';
import useNow from '@/hooks/useNow';
import dayjs from 'dayjs';
import ms from 'ms';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import DropdownItem from '../DropdownItem';
import { getTagColor } from '../utils/tags';
import { useSharedStore } from './store';
import React from 'react';

const formatDuration = (diff: number, completed: boolean) => {
  const format = diff > ms('1 hour') || completed ? 'HH:mm:ss' : 'mm:ss';

  return dayjs.duration(diff).format(format);
};

type TodoItemProps = {
  todo: SimpleTodoType;
  selectedDate: string;
};

const TodoItem = ({ todo, selectedDate }: TodoItemProps) => {
  const { setSharedState } = useSharedStore();
  const {
    projects: timeTrackerProjects,
    tasks: timeTrackerTasks,
    createTask: createTimeTrackerTask,
    stopTask: stopTimeTrackerTask,
  } = useTimeTrackerStore();
  const project = timeTrackerProjects.find((i) => i.id === todo.projectId);
  const isEstimate = todo.text.includes('Estimate:');
  const estimateLongPressTimeout = React.useRef<NodeJS.Timeout | undefined>(
    undefined
  );

  const timeTrackerTask = timeTrackerTasks.find(
    (t) => t.id === todo.timeTrackerId
  );

  const now = useNow();
  const diff = timeTrackerTask
    ? timeTrackerTask?.endTime
      ? timeTrackerTask.endTime - timeTrackerTask.startTime
      : now - timeTrackerTask.startTime
    : 0;

  const { deleteSimpleTodo: deleteTodo, toggleTask, updateTask } = useStore();

  const completeTask = () => {
    updateTask(todo.id, {
      completed: !todo.completed,
      date: selectedDate,
    });

    if (timeTrackerTask && !timeTrackerTask.endTime) {
      stopTimeTrackerTask(timeTrackerTask.id);
    }
  };

  const handleDeleteTask = () => {
    if (confirm('Are you sure you want to delete?')) {
      deleteTodo(todo.id);
    }
  };

  const handleStartTask = () => {
    const project = timeTrackerProjects.find((i) =>
      todo.projectId
        ? i.id === todo.projectId
        : todo.text.toLowerCase().includes(i.name.toLowerCase())
    );

    const title = project
      ? todo.text.replace(`${project.name}:`, '').trim()
      : todo.text;

    const timeTrackerTaskId = uid();
    createTimeTrackerTask(timeTrackerTaskId, {
      projectId: project?.id || '',
      startTime: Date.now(),
      title,
    });

    updateTask(todo.id, {
      timeTrackerId: timeTrackerTaskId,
    });
  };

  if (isEstimate) {
    const estimate = todo.text.split('Estimate:')[1].trim();
    return (
      <div
        className="flex items-center gap-2 mb-2"
        onMouseDown={() => {
          estimateLongPressTimeout.current = setTimeout(() => {
            handleDeleteTask();
          }, 1000);
        }}
        onMouseUp={() => clearTimeout(estimateLongPressTimeout.current)}
        onMouseMove={() => clearTimeout(estimateLongPressTimeout.current)}
      >
        <div className="flex-1 h-[1px] bg-gray-300" />
        <div className="text-sm text-gray-400">{estimate}</div>
        <div className="flex-1 h-[1px] bg-gray-300" />
      </div>
    );
  }

  return (
    <div className="bg-white p-2 mb-2 rounded shadow cursor-pointer">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {todo.reference && (
            <Button
              variant="ghost"
              className="flex h-6 w-6 p-0 data-[state=open]:bg-muted outline-none ring-0"
              onClick={() => window.open(todo.reference, '_blank')}
            >
              <SquareArrowOutUpRightIcon className="size-3" />
            </Button>
          )}

          <div className="flex items-center">
            {project && (
              <span
                style={getTagColor(project.name)}
                className="px-1 py-0.5 rounded-sm mr-1 opacity-85"
              >
                {project.name}:
              </span>
            )}
            {todo.text}
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <NotepadTextIcon
            className="size-3 cursor-pointer"
            onClick={() => setSharedState({ selectedTodoId: todo.id })}
          />
          {timeTrackerTask && (
            <span className="text-xs text-gray-500">
              {formatDuration(diff, todo.completed)}
            </span>
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex h-6 w-6 p-0 data-[state=open]:bg-muted outline-none ring-0"
              >
                <MoreHorizontalIcon className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownItem
                title="Start Timer"
                icon={PlayIcon}
                onClick={handleStartTask}
                hidden={Boolean(timeTrackerTask)}
              />
              <DropdownItem
                title={todo.blocked ? 'Unblocked' : 'Blocked'}
                icon={BanIcon}
                onClick={() => updateTask(todo.id, { blocked: !todo.blocked })}
              />
              <DropdownItem
                className="text-red-500"
                icon={TrashIcon}
                title="Delete"
                onClick={() => handleDeleteTask()}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default TodoItem;
