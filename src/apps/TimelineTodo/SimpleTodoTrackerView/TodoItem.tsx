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
import { cn } from '@/lib/utils';
import Estimate from './Estimate';

const formatDuration = (diff: number, completed: boolean) => {
  const format = diff > ms('1 hour') || completed ? 'HH:mm:ss' : 'mm:ss';

  return dayjs.duration(diff).format(format);
};

type TodoItemProps = {
  todo: SimpleTodoType;
};

const TodoItem = ({ todo }: TodoItemProps) => {
  const { setSharedState } = useSharedStore();
  const {
    projects: timeTrackerProjects,
    tasks: timeTrackerTasks,
    createTask: createTimeTrackerTask,
    stopTask: stopTimeTrackerTask,
  } = useTimeTrackerStore();
  const project = timeTrackerProjects.find((i) => i.id === todo.projectId);
  const isEstimate = todo.text.includes('Estimate:');

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
      completedAt: new Date().toISOString(),
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
    return <Estimate todo={todo} deleteEstimate={handleDeleteTask} />;
  }

  return (
    <div
      className={cn(
        'bg-white p-2 mb-2 rounded shadow cursor-pointer overflow-hidden relative',
        todo.completedAt && 'opacity-50'
      )}
    >
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

          <div className={cn('flex flex-col', project && 'pt-2.5')}>
            {project && (
              <div className="absolute top-[-6px] left-0">
                <span
                  style={getTagColor(project.name)}
                  className="text-xs px-1 py-0.5 opacity-85 rounded-br-sm"
                >
                  {project.name}
                </span>
              </div>
            )}
            <span>{todo.text}</span>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <NotepadTextIcon
            className="size-3 cursor-pointer"
            onClick={() => setSharedState({ selectedTodoId: todo.id })}
          />
          {timeTrackerTask && (
            <span className="text-xs text-gray-500">
              {formatDuration(diff, !!todo.completedAt)}
            </span>
          )}
          {todo.completedAt ? (
            <FolderIcon
              className="size-3 cursor-pointer"
              onClick={() => toggleTask(todo.id)}
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
