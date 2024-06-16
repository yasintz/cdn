import { useStore } from './store';
import { Input } from '@/components/ui/input';
import dayjs from '@/helpers/dayjs';
import { PlayCircleIcon, StopCircleIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';

type StartTaskProps = {
  now: number;
  id: string;
};

const TaskInput = ({ id, now }: StartTaskProps) => {
  const [title, setTitle] = useState('');
  const { createTask, stopTask, tasks, updateTaskTitle, removeInput } =
    useStore();
  const currentTask = tasks.find((i) => i.id === id);

  const diff = now - (currentTask?.startTime || 0);

  const handleStartStop = () => {
    if (currentTask) {
      stopTask(id);
    } else {
      createTask(id, {
        title,
        startTime: Date.now(),
      });
      setTitle('');
    }
  };

  return (
    <div className="flex items-center gap-3 mb-3">
      <Input
        value={currentTask?.title || title}
        onChange={(e) =>
          currentTask
            ? updateTaskTitle(currentTask.id, e.target.value)
            : setTitle(e.target.value)
        }
        placeholder="Task Title"
        ringDisabled
      />
      <span>{dayjs.duration(currentTask ? diff : 0).format('HH:mm:ss')}</span>
      {currentTask ? (
        <StopCircleIcon
          className="text-red-500 cursor-pointer"
          onClick={handleStartStop}
        />
      ) : (
        <PlayCircleIcon
          className="text-primary cursor-pointer"
          onClick={handleStartStop}
        />
      )}
      {!currentTask && (
        <Trash2Icon
          className="text-primary cursor-pointer"
          onClick={() => removeInput(id)}
        />
      )}
    </div>
  );
};

export default TaskInput;
