import _ from 'lodash';
import { useStore } from '../store';
import Column from './Column';
import Header from './Header';
import { useSharedStore } from './store';
import dayjs from '@/helpers/dayjs';
import { SIMPLE_TODO_DATE_FORMAT } from '../store/utils';

const boardColumns = ['backlog', 'done'];

export default function SimpleTodoTracker() {
  const { simpleTodoList } = useStore();
  const { showAllTodos, selectedDate, setSharedState } = useSharedStore();

  if (showAllTodos) {
    const allDates = _.uniq(
      simpleTodoList
        .filter((i) => !i.completed)
        .map((todo) => dayjs(todo.date).format(SIMPLE_TODO_DATE_FORMAT))
    );

    return (
      <div className="container mx-auto p-4">
        <Header />
        {allDates.map((date) => (
          <div className="mb-2" key={date}>
            <h2
              className="text-xl font-bold mb-2 cursor-pointer"
              onClick={() => {
                setSharedState({
                  selectedDate: dayjs(date).format(SIMPLE_TODO_DATE_FORMAT),
                  showAllTodos: false,
                });
              }}
            >
              {dayjs(date).format('MMMM D, YYYY')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {boardColumns.map((status) => (
                <Column key={status} status={status} selectedDate={date} />
              ))}
            </div>
          </div>
        ))}
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
    </div>
  );
}

export { SimpleTodoTracker as Component };
