import { TaskType, useStore } from './store';
import { Input } from '@/components/ui/input';
import dayjs from '@/helpers/dayjs';
import { PlayCircleIcon, StopCircleIcon, Trash2Icon } from 'lucide-react';
import ms from 'ms';
import { useState } from 'react';
import Tag from '../TimelineTodo/Tag';
import { getTagsFromString, getTaskTotalPrice } from './store/computed/task';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { uid } from '@/utils/uid';
import SelectProject from './SelectProject';

type StartTaskProps = {
  now: number;
  id: string;
};

type TaskInputValues = Pick<TaskType, 'title' | 'priceHr' | 'projectId'>;

const TaskInput = ({ id, now }: StartTaskProps) => {
  const [taskInput, setTaskInput] = useState<TaskInputValues>({
    title: '',
    priceHr: 0,
    projectId: '',
  });
  const { createTask, stopTask, tasks, updateTask, removeInput } = useStore();
  const currentTask = tasks.find((i) => i.id === id);
  const projectId = currentTask?.projectId || taskInput.projectId;
  const title = currentTask?.title || taskInput.title;
  const priceHr = currentTask?.priceHr || taskInput.priceHr;

  const diff = now - (currentTask?.startTime || 0);
  const currentTaskTotalPrice =
    currentTask && getTaskTotalPrice(currentTask, now);

  const taskTitle = currentTask?.title || taskInput.title;
  const tags = getTagsFromString(taskTitle);

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

  const updateTaskTitle = (value: string) => {
    currentTask
      ? updateTask(currentTask.id, { title: value, projectId })
      : setTaskInput((prev) => ({ ...prev, title: value }));
  };

  const updateProjectId = (id?: string) => {
    if (currentTask) {
      updateTask(currentTask.id, { projectId: id });
    } else {
      setTaskInput((prev) => ({ ...prev, projectId: id! }));
    }
  };

  const updatePriceHr = (value: number) => {
    if (currentTask) {
      updateTask(currentTask.id, { priceHr: value });
    } else {
      setTaskInput((prev) => ({ ...prev, priceHr: value }));
    }
  };

  const handleStartStop = () => {
    if (currentTask) {
      stopTask(id);
    } else {
      createTask(uid(), {
        title,
        startTime: Date.now(),
        projectId,
        priceHr,
      });
      setTaskInput((prev) => ({
        ...prev,
        title: '',
        projectId: '',
        priceHr: 0,
      }));
    }
  };

  return (
    <div className="flex flex-col mb-3 border-b pb-3 last:border-b-0 last:mb-0">
      <div className="flex items-center gap-3">
        <div className="flex flex-1 gap-2 flex-col lg:flex-row">
          <div className="flex flex-1 gap-2 lg:flex-4">
            <SelectProject onChange={updateProjectId} projectId={projectId} />

            <Input
              className="flex-8"
              value={taskTitle}
              onChange={(e) => updateTaskTitle(e.target.value)}
              placeholder="Task Title"
              ringDisabled
            />
          </div>

          <div className="flex flex-1 gap-2 items-center">
            <Input
              style={{ flex: 1 }}
              value={priceHr || ''}
              type="number"
              onChange={(e) => updatePriceHr(Number(e.target.value))}
              placeholder="$/hr"
              ringDisabled
            />
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
        </div>
      </div>

      {tags.length > 0 && (
        <div className="flex gap-2 my-2">
          {tags.map((tag) => (
            <Tag key={tag} tag={tag} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskInput;
