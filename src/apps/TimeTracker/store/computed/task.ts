import { useMemo } from 'react';
import type { ProjectType, TaskType } from '..';
import _ from 'lodash';
import { isTag } from '../../helpers';
import ms from 'ms';

export function getTagsFromString(value: string) {
  return _.uniq(value.split(' ').filter(isTag));
}

export function getTaskTotalPrice(
  task: TaskType,
  project: ProjectType | undefined,
  endTime?: number
) {
  const duration = getTaskDuration(task, endTime);
  return project?.priceHr
    ? (duration / ms('1 hour')) * project.priceHr
    : undefined;
}

export function getTaskDuration(task: TaskType, endTime?: number) {
  const duration = (task.endTime || endTime || 0) - task.startTime;
  return duration;
}

export function getTaskComputed(
  task: TaskType,
  project: ProjectType | undefined,
  now = Date.now()
) {
  return {
    ...task,
    duration: getTaskDuration(task, task.endTime || now),
    tags: getTagsFromString(task.title),
    totalPrice: getTaskTotalPrice(task, project, now),
  };
}

export function useTaskComputed(...args: Parameters<typeof getTaskComputed>) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => getTaskComputed(...args), args);
}
