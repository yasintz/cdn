import { useStore } from './store';
import { Input } from '@/components/ui/input';
import dayjs from '@/helpers/dayjs';
import { PlayCircleIcon, StopCircleIcon, Trash2Icon } from 'lucide-react';
import ms from 'ms';
import { useState } from 'react';
import Tag from '../TimelineTodo/Tag';
import { parseTagsFromTitle } from './helpers';
import { getTaskTotalPrice } from './store/computed/task';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

type StartTaskProps = {
  now: number;
  id: string;
};

const TaskInput = ({ id, now }: StartTaskProps) => {
  const [title, setTitle] = useState('');
  const { createTask, stopTask, tasks, updateTask, removeInput } = useStore();
  const currentTask = tasks.find((i) => i.id === id);

  const diff = now - (currentTask?.startTime || 0);
  const currentTaskTotalPrice =
    currentTask && getTaskTotalPrice(currentTask, now);

  const { tags } = parseTagsFromTitle(currentTask?.title || title);

  const currentTaskDuration = dayjs.duration(currentTask ? diff : 0);

  const setStartTime = (time: string, type: string) => {
    if (!currentTask) {
      return;
    }

    const formatKey = {
      hour: 'H',
      minute: 'm',
    }[type];

    const timeByType = parseInt(currentTaskDuration.format(formatKey), 10);
    const newValue = ms(`${time} ${type}`);
    const adjusted = currentTask.startTime + ms(`${timeByType} ${type}`);
    const startTime = adjusted - newValue;

    updateTask(currentTask.id, { startTime });
  };

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
        <div className="flex flex-1 gap-2">
          <Input
            style={{ flex: 20 }}
            value={currentTask?.title || title}
            onChange={(e) =>
              currentTask
                ? updateTask(currentTask.id, { title: e.target.value })
                : setTitle(e.target.value)
            }
            placeholder="Task Title"
            ringDisabled
          />
          <Input
            style={{ flex: 1 }}
            value={currentTask?.priceHr?.toString() || ''}
            type="number"
            onChange={(e) =>
              currentTask &&
              updateTask(currentTask.id, { priceHr: Number(e.target.value) })
            }
            placeholder="$/hr"
            ringDisabled
          />
        </div>
        <div className="flex gap-2 items-center cursor-pointer select-none">
          {currentTask && (
            <span
              onClick={() =>
                updateTask(currentTask.id, {
                  startTime: currentTask.startTime + ms('10 minute'),
                })
              }
            >
              -
            </span>
          )}
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild disabled={!currentTaskTotalPrice}>
                <div className="flex">
                  <input
                    className="w-7 text-center focus:outline-none"
                    value={currentTaskDuration.format('HH')}
                    onChange={(e) => setStartTime(e.target.value, 'hour')}
                  />
                  :
                  <input
                    className="w-7 text-center focus:outline-none"
                    value={currentTaskDuration.format('mm')}
                    onChange={(e) => setStartTime(e.target.value, 'minute')}
                  />
                  :
                  <input
                    className="w-7 text-center focus:outline-none"
                    value={currentTaskDuration.format('ss')}
                    onChange={() => null}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                ${currentTaskTotalPrice?.toFixed(2)}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
