import { cn } from '@/lib/utils';
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
import { useState } from 'react';
import MarkdownInput from '@/components/MarkdownInput';

const formatDuration = (diff: number, completed: boolean) => {
  const format = diff > ms('1 hour') || completed ? 'HH:mm:ss' : 'mm:ss';

  return dayjs.duration(diff).format(format);
};

type TodoItemProps = {
  todo: SimpleTodoType;
  selectedDate: string;
};

const TodoItem = ({ todo, selectedDate }: TodoItemProps) => {
  const [showNote, setShowNote] = useState(false);
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

    if (timeTrackerTask && !timeTrackerTask.endTime) {
      stopTimeTrackerTask(timeTrackerTask.id);
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
  const onBookmarkAdd = () => {
    const link = prompt('Add Link');
    if (link) {
      updateTask(todo.id, {
        reference: link,
      });
    }
  };

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

          <span>{todo.text}</span>
        </div>
        <div className="flex gap-3 items-center">
          {(todo.note || showNote) && (
            <NotepadTextIcon
              className="size-3 cursor-pointer"
              onClick={() => setShowNote(!showNote)}
            />
          )}

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
                title="Add Note"
                icon={NotepadTextIcon}
                onClick={() => setShowNote(true)}
                hidden={Boolean(todo.note)}
              />
              <DropdownItem
                title={todo.blocked ? 'Unblocked' : 'Blocked'}
                icon={BanIcon}
                onClick={() => updateTask(todo.id, { blocked: !todo.blocked })}
              />
              <DropdownItem
                title="Add Reference"
                icon={SquareArrowOutUpRightIcon}
                onClick={onBookmarkAdd}
              />
              <DropdownItem
                className="text-red-500"
                icon={TrashIcon}
                title="Delete"
                onClick={() => deleteTodo(todo.id)}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {showNote && (
        <MarkdownInput
          onChange={(value) => updateTask(todo.id, { note: value })}
          value={todo.note || ''}
          className="mt-2 border rounded text-sm"
        />
      )}
      {subtasks.length > 0 && (
        <div className="flex flex-col gap-1 mt-2 ml-4 text-sm text-gray-700">
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
