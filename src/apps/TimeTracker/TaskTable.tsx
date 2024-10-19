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
import { useEffect, useState } from 'react';
import _ from 'lodash';
import TaskRow from './TaskRow';
import ms from 'ms';
import dayjs from '@/helpers/dayjs';
import { getTaskComputed } from './store/computed/task';

type TaskTableComProps = {
  tasks: TaskType[];
  editingTaskId: string | undefined;
  setEditingTaskId: React.Dispatch<React.SetStateAction<string | undefined>>;
  className?: string;
};
const TableCom = ({
  editingTaskId,
  tasks,
  setEditingTaskId,
  className,
}: TaskTableComProps) => {
  const allTasks = tasks.map((t) => getTaskComputed(t));
  const total = allTasks.reduce((acc, cur) => acc + cur.duration, 0);
  const totalPrice = allTasks.reduce(
    (acc, cur) => acc + (cur.totalPrice || 0),
    0
  );
  const isBiggerThanOneDay = total >= ms('1 day');

  return (
    <Table containerClassName={className}>
      <TableHeader>
        <TableRow>
          <TableHead className="w-28">Project</TableHead>
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
          <TableCell>${totalPrice.toFixed(2)}</TableCell>
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

  useEffect(() => {
    // @ts-expect-error defined
    window.syncscroll?.reset();
  }, []);

  return (
    <>
      <div className="flex flex-col flex-1 relative">
        <div className="h-[49px] overflow-hidden rounded-t-md border bg-white z-10 relative">
          <TableCom
            tasks={tasks}
            editingTaskId={editingTaskId}
            setEditingTaskId={setEditingTaskId}
            className="syncscroll syncscroll:scroll-table"
          />
        </div>
        <div className="overflow-y-scroll rounded-md border absolute top-0 left-0 right-0 bottom-0">
          <TableCom
            tasks={tasks}
            editingTaskId={editingTaskId}
            setEditingTaskId={setEditingTaskId}
            className="syncscroll syncscroll:scroll-table"
          />
        </div>
      </div>
    </>
  );
};

export default TaskTable;
