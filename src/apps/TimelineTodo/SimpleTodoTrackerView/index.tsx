import { useStore } from '../store';
import Column from './Column';
import Header from './Header';
import { useSharedStore } from './store';
import SelectedTodoView from './SelectedTodoView';
import { useStore as useTimeTrackerStore } from '@/apps/TimeTracker/store';
import TodoItem from './TodoItem';
import dayjs from 'dayjs';
import { SIMPLE_TODO_DATE_FORMAT } from '../store/utils';
import _ from 'lodash';
import React, { useEffect, useMemo } from 'react';
import { uid } from '@/utils/uid';
import './style.scss';
import SortableTodos from './SortableTodos';
import { NewTodoInput } from './NewTodoInput';
import ms from 'ms';

const boardColumns = ['backlog', 'done'];

export default function SimpleTodoTracker() {
  const { simpleTodoList, createTodos, showByTags, selectedTags } = useStore();
  const { showAllTodos, selectedDate } = useSharedStore();
  const { projects: timeTrackerProjects } = useTimeTrackerStore();

  const allDates = _.uniq(
    simpleTodoList
      .filter((i) => !i.completedAt)
      .map((todo) => dayjs(todo.date).format(SIMPLE_TODO_DATE_FORMAT))
  ).filter((i) => i !== selectedDate);

  const allTodos = simpleTodoList.filter((i) => !i.completedAt);

  useEffect(() => {
    const pasteListener = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text');
      if (text) {
        const lines = text.split('- [ ]').join('').split('\n');
        const todos = lines.map((line) => {
          const project = timeTrackerProjects.find((i) =>
            line.toLowerCase().includes(i.name.toLowerCase())
          );

          return {
            id: uid(),
            text: line.replace('- [x]', '').trim(),
            projectId: project?.id,
            date: selectedDate,
            completedAt: line.startsWith('- [x]')
              ? new Date().toISOString()
              : null,
          };
        });
        createTodos(todos);
      }
    };
    window.addEventListener('paste', pasteListener);
    return () => window.removeEventListener('paste', pasteListener);
  }, [createTodos, selectedDate, timeTrackerProjects]);

  const filteredTodos = useMemo(
    () =>
      _.orderBy(
        simpleTodoList
          .filter((i) => i.tags?.some((t) => selectedTags.includes(t)))
          .filter(
            (i) => !i.completedAt || dayjs().diff(i.completedAt) < ms('1 day')
          ),
        ['completedAt'],
        ['desc']
      ),
    [selectedTags, simpleTodoList]
  );

  if (showByTags) {
    return (
      <div className="container mx-auto p-4 todo-column bg-gray-100 rounded-lg">
        <Header />
        <SortableTodos todos={filteredTodos} />
        <NewTodoInput selectedDate={selectedDate} />
        <SelectedTodoView />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Header />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {boardColumns.map((status) => (
          <Column key={status} status={status} selectedDate={selectedDate} />
        ))}
      </div>
      {showAllTodos && (
        <div className="w-1/2 mt-2 todo-column bg-gray-100 p-4 rounded-lg">
          {allDates.map((date) => (
            <React.Fragment key={date}>
              <div className="my-2">{dayjs(date).format('DD MMMM')}</div>
              {allTodos
                .filter((i) => i.date === date)
                .map((todo) => (
                  <TodoItem key={todo.id} todo={todo} />
                ))}
            </React.Fragment>
          ))}
        </div>
      )}
      <SelectedTodoView />
    </div>
  );
}

export { SimpleTodoTracker as Component };
