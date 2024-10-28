import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import React, { useMemo, useState } from 'react';
import { SimpleTodoType, useStore } from '../store';
import TodoItem from './TodoItem';
import { ReactSortable } from 'react-sortablejs';
import './style.scss';
import dayjs from '@/helpers/dayjs';
import _ from 'lodash';

type ColumnProps = {
  status: SimpleTodoType['status'];
  selectedDate: string;
};

const Column = ({ status, selectedDate }: ColumnProps) => {
  const [todos, setTodos] = useStore((s) => [
    s.simpleTodoList,
    s.updateSimpleTodoList,
  ]);
  const [newTodo, setNewTodo] = useState('');

  const allPreviousBacklogItems = todos.filter(
    (todo) =>
      todo.status === 'backlog' && dayjs(todo.date).isBefore(selectedDate)
  );
  const previousBacklogItems = _.groupBy(allPreviousBacklogItems, 'date');

  const columnTodos = useMemo(
    () =>
      structuredClone(
        todos.filter(
          (todo) => todo.status === status && todo.date === selectedDate
        )
      ),
    [selectedDate, status, todos]
  );

  const addTodo = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTodo.trim() !== '') {
      setTodos([
        ...todos,
        {
          id: Date.now().toString(),
          text: newTodo,
          status: 'backlog',
          date: selectedDate,
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
      <h2 className="text-lg font-semibold mb-4 capitalize">{status}</h2>
      {allPreviousBacklogItems.length > 0 && status === 'backlog' && (
        <div className="border p-4 mb-2 rounded-md">
          {Object.keys(previousBacklogItems).map((date) => (
            <div>
              <h2 className="text-lg font-semibold mb-4 capitalize">{dayjs(date).format('D MMMM')}</h2>
              {previousBacklogItems[date]
                .map((id) => todos.find((i) => i.id === id.id)!)
                .map((todo) => (
                  <TodoItem key={todo.id} todo={todo} />
                ))}
            </div>
          ))}
        </div>
      )}
      <ReactSortable list={columnTodos} setList={orderTodos}>
        {columnTodos
          .map((id) => todos.find((i) => i.id === id.id)!)
          .map((todo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
      </ReactSortable>
      {status === 'backlog' && (
        <Input
          type="text"
          placeholder="Add your todo..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={addTodo}
          className="mt-2"
        />
      )}
    </div>
  );
};

export default Column;
