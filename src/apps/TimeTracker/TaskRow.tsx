import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { TaskType, useStore } from './store';
import dayjs from '@/helpers/dayjs';
import { Input } from '@/components/ui/input';
import { PencilIcon, Trash2Icon, XCircleIcon } from 'lucide-react';
import Tag from '../TimelineTodo/Tag';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import ms from 'ms';
import { useTaskComputed } from './store/computed/task';

type TaskRowProps = {
  task: TaskType;
  editingTaskId: string | undefined;
  setEditingTaskId: React.Dispatch<React.SetStateAction<string | undefined>>;
};

const TaskRow = ({
  task: taskData,
  editingTaskId,
  setEditingTaskId,
}: TaskRowProps) => {
  const { updateTask, deleteTask } = useStore();
  const task = useTaskComputed(taskData);
  const isBiggerThanOneDay = task.duration > ms('24 hours');
  return (
    <TableRow key={task.id}>
      <TableCell>
        {editingTaskId === task.id ? (
          <Input
            value={task.title}
            ringDisabled
            className="border-none"
            onChange={(e) => updateTask(task.id, { title: e.target.value })}
          />
        ) : (
          <div className="flex gap-1">
            {task.title
              .split(' ')
              .map((part) =>
                part.startsWith('#') ? (
                  <Tag tag={part} key={part} />
                ) : (
                  <span key={part}>{part}</span>
                )
              )}
          </div>
        )}
      </TableCell>
      <TableCell>{dayjs(task.startTime).format('MM/DD/YYYY')}</TableCell>
      <TableCell>
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div>
                {isBiggerThanOneDay && (
                  <>{Math.floor(task.duration / ms('1 hour'))}:</>
                )}
                {dayjs
                  .duration(task.duration)
                  .format(isBiggerThanOneDay ? 'mm:ss' : 'HH:mm:ss')}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {dayjs(task.startTime).format('HH:mm')}
                {' - '}
                {dayjs(task.endTime).format('HH:mm')}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell>
        <div className="flex gap-2 items-center justify-center">
          <Trash2Icon
            className="cursor-pointer size-4"
            onClick={() => confirm('Are you sure?') && deleteTask(task.id)}
          />
          {editingTaskId === task.id ? (
            <XCircleIcon
              className="cursor-pointer size-4"
              onClick={() => setEditingTaskId(undefined)}
            />
          ) : (
            <PencilIcon
              className="cursor-pointer size-4"
              onClick={() => setEditingTaskId(task.id)}
            />
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default TaskRow;
