import React, { useState } from 'react';
import TaskTable from './TaskTable';
import { useStore } from './store';
import useNow from '@/hooks/useNow';
import { Input } from '@/components/ui/input';
import dayjs from '@/helpers/dayjs';
import { PlayCircleIcon, StopCircleIcon } from 'lucide-react';

const TimeTracker = () => {
  const [title, setTitle] = useState('');
  const now = useNow();
  const { createTask, stopTask, tasks, updateTaskTitle } = useStore();

  const currentTask = tasks.find((i) => !i.endTime);

  const diff = now - (currentTask?.startTime || 0);

  const handleStartStop = () => {
    if (currentTask) {
      stopTask(currentTask.id);
    } else {
      createTask({
        title,
        startTime: Date.now(),
      });
    }
  };

  return (
    <div className="time-tracker p-4">
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
      </div>
      <TaskTable
        tasks={tasks.filter((i) => i.id !== currentTask?.id).toReversed()}
      />
    </div>
  );
};

export default TimeTracker;
