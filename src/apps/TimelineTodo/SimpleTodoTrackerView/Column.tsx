import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { useStore } from '../store';
import TodoItem from './TodoItem';
import ms from 'ms';
import dayjs from '@/helpers/dayjs';
import SortableTodos from './SortableTodos';
import { NewTodoInput } from './NewTodoInput';

type ColumnProps = {
  status: string;
  selectedDate: string;
};

const Column = ({ status, selectedDate }: ColumnProps) => {
  const { simpleTodoList: todos } = useStore();
  const isBacklog = status === 'backlog';

  const columnTodos = useMemo(
    () =>
      todos.filter(
        (todo) =>
          (status === 'done' ? todo.completedAt : !todo.completedAt) &&
          todo.date === selectedDate
      ),
    [selectedDate, status, todos]
  );

  const totalTime = columnTodos
    .filter((i) => i.text.endsWith(')'))
    .map((a) => a.text.split('(')[1].trim().replace(')', ''))
    .map((a) => ms(a))
    .reduce((a, b) => a + b, 0);

  const nonBlockedTodos = useMemo(
    () => columnTodos.filter((todo) => !todo.blocked),
    [columnTodos]
  );

  const blockedTodos = columnTodos.filter((i) => i.blocked);

  return (
    <div
      key={status}
      className={cn(
        'todo-column bg-gray-100 p-4 rounded-lg',
        status === 'done' && 'opacity-70'
      )}
    >
      <h2 className="text-lg font-semibold mb-4 capitalize">
        {status} {isBacklog && dayjs.duration(totalTime).format('H [h] m [m]')}
      </h2>
      <SortableTodos todos={nonBlockedTodos} />
      {blockedTodos.length > 0 && (
        <div className="mt-2 opacity-70">
          <h3 className="mb-2">Blocked Todos</h3>
          {blockedTodos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </div>
      )}

      {isBacklog && <NewTodoInput selectedDate={selectedDate} />}
    </div>
  );
};

export default Column;
