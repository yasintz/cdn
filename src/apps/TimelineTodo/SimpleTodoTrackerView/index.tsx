import { useStore } from '../store';
import Column from './Column';
import Header from './Header';
import { useSharedStore } from './store';
import SelectedTodoView from './SelectedTodoView';
import TodoItem from './TodoItem';
import dayjs from 'dayjs';
import { SIMPLE_TODO_DATE_FORMAT } from '../store/utils';
import _ from 'lodash';
import React from 'react';

const boardColumns = ['backlog', 'done'];

export default function SimpleTodoTracker() {
  const { simpleTodoList } = useStore();
  const { showAllTodos, selectedDate } = useSharedStore();

  const allDates = _.uniq(
    simpleTodoList
      .filter((i) => !i.completed)
      .map((todo) => dayjs(todo.date).format(SIMPLE_TODO_DATE_FORMAT))
  ).filter((i) => i !== selectedDate);

  const allTodos = simpleTodoList.filter((i) => !i.completed);

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
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    selectedDate={selectedDate}
                  />
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
