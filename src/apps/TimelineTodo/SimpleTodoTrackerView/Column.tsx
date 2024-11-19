import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import React, { useMemo, useState } from 'react';
import { useStore } from '../store';
import TodoItem from './TodoItem';
import { ReactSortable } from 'react-sortablejs';
import { SimpleTodoType } from '../store/simple-todo-slice';
import './style.scss';
import SelectProject from '@/apps/TimeTracker/SelectProject';
import ms from 'ms';
import dayjs from '@/helpers/dayjs';
// import { useSharedStore } from './store';

type ColumnProps = {
  status: string;
  selectedDate: string;
};

const Column = ({ status, selectedDate }: ColumnProps) => {
  // const { selectedDate } = useSharedStore();
  const { simpleTodoList: todos, updateSimpleTodoList: setTodos } = useStore();
  const [newTodo, setNewTodo] = useState('');
  const [projectId, setProjectId] = useState<string | undefined>();
  const isBacklog = status === 'backlog';

  const columnTodos = useMemo(
    () =>
      todos.filter(
        (todo) =>
          (status === 'done' ? todo.completed : !todo.completed) &&
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
    () => structuredClone(columnTodos.filter((todo) => !todo.blocked)),
    [columnTodos]
  );

  const blockedTodos = columnTodos.filter((i) => i.blocked);

  const addTodo = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTodo.trim() !== '') {
      setTodos([
        ...todos,
        {
          id: Date.now().toString(),
          text: newTodo,
          date: selectedDate,
          completed: false,
          projectId,
        },
      ]);
      setNewTodo('');
    }
  };

  const orderTodos = (newState: SimpleTodoType[]) => {
    setTodos(
      todos
        .filter((i) => !newState.map((j) => j.id).includes(i.id))
        .concat(newState.map((i) => todos.find((j) => j.id === i.id)!))
    );
  };

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
      <ReactSortable list={nonBlockedTodos} setList={orderTodos}>
        {nonBlockedTodos
          .map((id) => todos.find((i) => i.id === id.id)!)
          .map((todo) => (
            <TodoItem key={todo.id} todo={todo} selectedDate={selectedDate} />
          ))}
      </ReactSortable>

      {blockedTodos.length > 0 && (
        <div className="mt-2 opacity-70">
          <h3 className="mb-2">Blocked Todos</h3>
          {blockedTodos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} selectedDate={selectedDate} />
          ))}
        </div>
      )}

      {isBacklog && (
        <div className="flex gap-2 items-center mt-2">
          <SelectProject
            className="flex-1"
            projectId={projectId}
            onChange={setProjectId}
          />
          <Input
            type="text"
            placeholder="Add your todo..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={addTodo}
            className="flex-8"
          />
        </div>
      )}
    </div>
  );
};

export default Column;
