import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TaskType } from './store';
import { useState } from 'react';
import _ from 'lodash';
import TaskRow from './TaskRow';

type PropsType = {
  tasks: TaskType[];
};
const TaskTable = ({ tasks }: PropsType) => {
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
            .map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                editingTaskId={editingTaskId}
                setEditingTaskId={setEditingTaskId}
              />
            ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TaskTable;
