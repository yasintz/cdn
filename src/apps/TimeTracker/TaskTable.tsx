import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TaskType } from './store';
import { useState } from 'react';
import _ from 'lodash';
import TaskRow from './TaskRow';
import ms from 'ms';
import dayjs from '@/helpers/dayjs';
import { getTaskDuration } from './store/computed/task';

type TaskTableComProps = {
  tasks: TaskType[];
  editingTaskId: string | undefined;
  setEditingTaskId: React.Dispatch<React.SetStateAction<string | undefined>>;
};
const TableCom = ({
  editingTaskId,
  tasks,
  setEditingTaskId,
}: TaskTableComProps) => {
  const total = tasks.reduce((acc, cur) => acc + getTaskDuration(cur), 0);
  const isBiggerThanOneDay = total >= ms('1 day');
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-72 md:w-auto">Title</TableHead>
          <TableHead className="w-28">Date</TableHead>
          <TableHead className="w-28">Duration</TableHead>
          <TableHead className="w-28">Price</TableHead>
          <TableHead className="w-20" />
        </TableRow>
      </TableHeader>

      <TableBody>
        {_.orderBy(tasks, 'startTime')
          .toReversed()
          .map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              editingTaskId={editingTaskId}
              setEditingTaskId={setEditingTaskId}
            />
          ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>Total</TableCell>
          <TableCell></TableCell>
          <TableCell>
            <div>
              {isBiggerThanOneDay && <>{Math.floor(total / ms('1 hour'))}:</>}
              {dayjs
                .duration(total)
                .format(isBiggerThanOneDay ? 'mm:ss' : 'HH:mm:ss')}
            </div>
          </TableCell>
          <TableCell></TableCell>
          <TableCell></TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
};

type PropsType = {
  tasks: TaskType[];
};
const TaskTable = ({ tasks }: PropsType) => {
  const [editingTaskId, setEditingTaskId] = useState<string>();

  return (
    <>
      <div className="h-[49px] overflow-hidden rounded-t-md border bg-white z-10 relative">
        <TableCom
          tasks={tasks}
          editingTaskId={editingTaskId}
          setEditingTaskId={setEditingTaskId}
        />
      </div>
      <div
        style={{ transform: 'translateY(-50px)', maxHeight: 'calc(100vh - 145px)' }}
        className="relative overflow-y-scroll h-full rounded-md border"
      >
        <TableCom
          tasks={tasks}
          editingTaskId={editingTaskId}
          setEditingTaskId={setEditingTaskId}
        />
      </div>
    </>
  );
};

export default TaskTable;
