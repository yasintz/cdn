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
import { Trash2Icon } from 'lucide-react';

type PropsType = {
  tasks: TaskType[];
};
const TaskTable = ({ tasks }: PropsType) => {
  const { updateTaskTitle, deleteTask } = useStore();
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
                <Input
                  value={task.title}
                  ringDisabled
                  className="border-none"
                  onChange={(e) => updateTaskTitle(task.id, e.target.value)}
                />
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
                <Trash2Icon
                  className="cursor-pointer size-4"
                  onClick={() =>
                    confirm('Are you sure?') && deleteTask(task.id)
                  }
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TaskTable;
