import { useStore } from './store';
import { Input } from '@/components/ui/input';
import dayjs from '@/helpers/dayjs';
import { PlayCircleIcon, StopCircleIcon, Trash2Icon } from 'lucide-react';
import ms from 'ms';
import { useState } from 'react';
import Tag from '../TimelineTodo/Tag';
import { parseTagsFromTitle } from './helpers';

type StartTaskProps = {
  now: number;
  id: string;
};

const TaskInput = ({ id, now }: StartTaskProps) => {
  const [title, setTitle] = useState('');
  const { createTask, stopTask, tasks, updateTask, removeInput } = useStore();
  const currentTask = tasks.find((i) => i.id === id);

  const diff = now - (currentTask?.startTime || 0);

  const { tags } = parseTagsFromTitle(currentTask?.title || title);

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
    <>
      <div className="flex items-center gap-3 mb-3">
        <Input
          value={currentTask?.title || title}
          onChange={(e) =>
            currentTask
              ? updateTask(currentTask.id, { title: e.target.value })
              : setTitle(e.target.value)
          }
          placeholder="Task Title"
          ringDisabled
        />
        <div className="flex gap-2 items-center cursor-pointer select-none">
          {currentTask && (
            <span
              onClick={() =>
                updateTask(currentTask.id, {
                  startTime: currentTask.startTime + ms('1 minute'),
                })
              }
            >
              -
            </span>
          )}
          <span>
            {dayjs.duration(currentTask ? diff : 0).format('HH:mm:ss')}
          </span>
          {currentTask && (
            <span
              onClick={() =>
                updateTask(currentTask.id, {
                  startTime: currentTask.startTime - ms('1 minute'),
                })
              }
            >
              +
            </span>
          )}
        </div>
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

      <div className="flex gap-2 my-2">
        {tags.map((tag) => (
          <Tag key={tag} tag={tag} />
        ))}
      </div>
    </>
  );
};

export default TaskInput;
