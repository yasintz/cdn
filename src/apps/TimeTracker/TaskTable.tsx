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
          {tasks.map((task) => (
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
                          <span>{part}</span>
                        )
                      )}
                  </div>
                )}
              </TableCell>
              <TableCell>
                {dayjs(task.startTime).format('MM/DD/YYYY')}
              </TableCell>
              <TableCell>
                {dayjs
                  .duration((task.endTime || 0) - task.startTime)
                  .format('HH:mm:ss')}
              </TableCell>
              <TableCell>
                <div className="flex gap-2 items-center justify-center">
                  <Trash2Icon
                    className="cursor-pointer size-4"
                    onClick={() =>
                      confirm('Are you sure?') && deleteTask(task.id)
                    }
                  />
                  {editingTaskId ? (
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TaskTable;
