import TaskTable from './TaskTable';
import { useStore } from './store';
import useNow from '@/hooks/useNow';
import TaskInput from './TaskInput';
import { PlusCircleIcon } from 'lucide-react';

const TimeTracker = () => {
  const now = useNow();
  const { tasks, inputs, addInput } = useStore();

  return (
    <div className="time-tracker p-4">
      {inputs.map((inputId) => (
        <TaskInput key={inputId} id={inputId} now={now} />
      ))}

      <div className="flex items-center gap-2 my-2">
        <div className="border-b border-gray-300 flex-1" />
        <PlusCircleIcon
          size={16}
          className="text-gray-300 cursor-pointer"
          onClick={() => addInput()}
        />
        <div className="border-b border-gray-300 flex-1" />
      </div>

      <TaskTable tasks={tasks.filter((i) => i.endTime).toReversed()} />
    </div>
  );
};

export default TimeTracker;
