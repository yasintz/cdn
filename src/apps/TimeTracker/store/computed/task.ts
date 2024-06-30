import { useMemo } from 'react';
import { TaskType } from '..';
import _ from 'lodash';
import { isTag } from '../../helpers';

export function getTaskTags(task: TaskType) {
  return _.uniq(task.title.split(' ').filter(isTag));
}

export function getTaskComputed(task: TaskType) {
  return {
    ...task,
    duration: (task.endTime || 0) - task.startTime,
    tags: getTaskTags(task),
  };
}

export function useTaskComputed(task: TaskType) {
  return useMemo(() => getTaskComputed(task), [task]);
}
