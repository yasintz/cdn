import TaskTable from './TaskTable';
import { DateRange } from 'react-day-picker';
import { useStore } from './store';
import useNow from '@/hooks/useNow';
import TaskInput from './TaskInput';
import CreateInput from './CreateInput';
import { useState } from 'react';
import _ from 'lodash';
import Tag from '../TimelineTodo/Tag';
import { XIcon } from 'lucide-react';
import { DateRangeFilter } from './CalendarFilter';

const TimeTracker = () => {
  const now = useNow();
  const { tasks, inputs, addInput, projects, deleteProject } = useStore();
  const [projectFilters, setProjectFilters] = useState<string[]>([]);
  const [range, setRange] = useState<DateRange>();

  return (
    <div className="time-tracker p-4 flex flex-col h-full">
      <div className="flex flex-col">
        {inputs.map((inputId) => (
          <TaskInput key={inputId} id={inputId} now={now} />
        ))}
      </div>

      <CreateInput onAdd={addInput} />

      <div className="w-full overflow-x-scroll flex gap-2 mb-2 items-center py-2 scrollbar-hidden">
        <DateRangeFilter range={range} onChange={setRange} />
        {projects.map((project) => (
          <Tag
            key={project.id}
            tag={project.name}
            className="flex items-center justify-between gap-2 group"
            onClick={() =>
              setProjectFilters((prev) => _.xor(prev, [project.id]))
            }
            showBorder
            customBorderColor={
              projectFilters.includes(project.id) ? undefined : 'transparent'
            }
            actions={
              <XIcon
                className="size-3 hidden group-hover:block"
                onClick={(e) => {
                  e.stopPropagation();
                  if (
                    confirm('Are you sure you want to delete this project?')
                  ) {
                    deleteProject(project.id);
                  }
                }}
              />
            }
          />
        ))}
      </div>

      <TaskTable
        tasks={tasks
          .filter(
            (task) =>
              projectFilters.length === 0 ||
              projectFilters.includes(task.projectId)
          )
          .filter(
            (task) =>
              (range?.from ? task.startTime >= range.from.getTime() : true) &&
              (range?.to ? task.startTime <= range.to.getTime() : true)
          )
          .toReversed()}
      />
    </div>
  );
};

export default TimeTracker;

export { TimeTracker as Component };
