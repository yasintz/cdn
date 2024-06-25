import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TaskType, useStore } from './store';
import dayjs from '@/helpers/dayjs';
import { Input } from '@/components/ui/input';
import { PencilIcon, Trash2Icon, XCircleIcon } from 'lucide-react';
import Tag from '../TimelineTodo/Tag';
import { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import _ from 'lodash';
import ms from 'ms';

type PropsType = {
  tasks: TaskType[];
};
const TaskTable = ({ tasks }: PropsType) => {
  const { updateTask, deleteTask } = useStore();
  const [editingTaskId, setEditingTaskId] = useState<string>();
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-72 md:w-auto">Title</TableHead>
            <TableHead className="w-28">Date</TableHead>
            <TableHead className="w-28">Duration</TableHead>
            <TableHead className="w-20" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {_.orderBy(tasks, 'startTime')
            .toReversed()
            .map((task) => {
              const duration = (task.endTime || 0) - task.startTime;
              const isBiggerThanOneDay = duration > ms('24 hours');
              return (
                <TableRow key={task.id}>
                  <TableCell>
                    {editingTaskId === task.id ? (
                      <Input
                        value={task.title}
                        ringDisabled
                        className="border-none"
                        onChange={(e) =>
                          updateTask(task.id, { title: e.target.value })
                        }
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
                  <TableCell>
                    {dayjs(task.startTime).format('MM/DD/YYYY')}
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <div>
                            {isBiggerThanOneDay && (
                              <>{Math.floor(duration / ms('1 hour'))}:</>
                            )}
                            {dayjs
                              .duration(duration)
                              .format(
                                isBiggerThanOneDay ? 'mm:ss' : 'HH:mm:ss'
                              )}
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
                        onClick={() =>
                          confirm('Are you sure?') && deleteTask(task.id)
                        }
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
            })}
        </TableBody>
      </Table>
    </div>
  );
};

export default TaskTable;
