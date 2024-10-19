import { useMemo } from 'react';
import { TaskType } from '..';
import _ from 'lodash';
import { isTag } from '../../helpers';
import ms from 'ms';

export function getTagsFromString(value: string) {
  return _.uniq(value.split(' ').filter(isTag));
}

export function getTaskTotalPrice(task: TaskType, endTime?: number) {
  const duration = getTaskDuration(task, endTime);
  return task.priceHr ? (duration / ms('1 hour')) * task.priceHr : undefined;
}
export function getTaskDuration(task: TaskType, endTime?: number) {
  const duration = (task.endTime || endTime || 0) - task.startTime;
  return duration;
}

export function getTaskComputed(task: TaskType, now = Date.now()) {
  return {
    ...task,
    duration: getTaskDuration(task, task.endTime || now),
    tags: getTagsFromString(task.title),
    totalPrice: getTaskTotalPrice(task, now),
  };
}

export function useTaskComputed(task: TaskType, now?: number) {
  return useMemo(() => getTaskComputed(task, now), [task, now]);
}
