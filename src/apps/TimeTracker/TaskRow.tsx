import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { TaskType, useStore } from './store';
import dayjs from '@/helpers/dayjs';
import { Input } from '@/components/ui/input';
import {
  CopyIcon,
  PencilIcon,
  StopCircleIcon,
  Trash2Icon,
  XCircleIcon,
} from 'lucide-react';
import Tag from '../TimelineTodo/Tag';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import ms from 'ms';
import { useTaskComputed } from './store/computed/task';
import { uid } from '@/utils/uid';
import useNow from '@/hooks/useNow';
import { useCurrencies } from '@/hooks/useCurrencies';

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
  const currencies = useCurrencies();
  const now = useNow();
  const { createTask, updateTask, deleteTask, projects, stopTask } = useStore();
  const task = useTaskComputed(taskData, taskData.endTime ? 0 : now);
  const isBiggerThanOneDay = task.duration > ms('24 hours');
  const project = projects.find((p) => p.id === task.projectId);
  const priceTry = (task.totalPrice || 0) * currencies.TRY;

  return (
    <TableRow key={task.id}>
      <TableCell>{project?.name || '#'}</TableCell>
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
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <p>${(task.totalPrice || 0).toFixed(2)}</p>
            </TooltipTrigger>
            <TooltipContent>
              <p>{(priceTry || 0).toFixed(2)}₺</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell>
        <div className="flex gap-2 items-center justify-center">
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
          <CopyIcon
            className="cursor-pointer size-4"
            onClick={() =>
              createTask(uid(), {
                title: task.title,
                startTime: Date.now(),
                priceHr: task.priceHr,
                projectId: task.projectId,
              })
            }
          />
          {task.endTime ? (
            <Trash2Icon
              className="cursor-pointer size-4"
              onClick={() => confirm('Are you sure?') && deleteTask(task.id)}
            />
          ) : (
            <StopCircleIcon
              className="text-red-500 cursor-pointer size-4"
              onClick={() => stopTask(task.id)}
            />
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default TaskRow;
