import { useMemo } from 'react';
import { TaskType } from '..';
import _ from 'lodash';
import { isTag } from '../../helpers';
import ms from 'ms';

export function getTaskTags(task: TaskType) {
  return _.uniq(task.title.split(' ').filter(isTag));
}

export function getTaskTotalPrice(task: TaskType, endTime?: number) {
  const duration = getTaskDuration(task, endTime);
  return task.priceHr ? (duration / ms('1 hour')) * task.priceHr : undefined;
}
export function getTaskDuration(task: TaskType, endTime?: number) {
  const duration = (task.endTime || endTime || 0) - task.startTime;
  return duration;
}

export function getTaskComputed(task: TaskType) {
  return {
    ...task,
    duration: getTaskDuration(task),
    tags: getTaskTags(task),
    totalPrice: getTaskTotalPrice(task),
  };
}

export function useTaskComputed(task: TaskType) {
  return useMemo(() => getTaskComputed(task), [task]);
}
