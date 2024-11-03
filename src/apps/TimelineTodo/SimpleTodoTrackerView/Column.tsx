import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import React, { useMemo, useState } from 'react';
import { useStore } from '../store';
import TodoItem from './TodoItem';
import { ReactSortable } from 'react-sortablejs';
import dayjs from '@/helpers/dayjs';
import _ from 'lodash';
import { ChevronsUpDownIcon } from 'lucide-react';
import { SimpleTodoType } from '../store/simple-todo-slice';
import './style.scss';

type ColumnProps = {
  status: string;
  selectedDate: string;
  updateSelectedDate: (date: string) => void;
};

const Column = ({ status, selectedDate, updateSelectedDate }: ColumnProps) => {
  const { simpleTodoList: todos, updateSimpleTodoList: setTodos } = useStore();
  const [newTodo, setNewTodo] = useState('');

  const allPreviousBacklogItems = todos.filter(
    (todo) => !todo.completed && dayjs(todo.date).isBefore(selectedDate)
  );
  const previousBacklogItems = _.groupBy(allPreviousBacklogItems, 'date');

  const columnTodos = useMemo(
    () =>
      structuredClone(
        todos.filter(
          (todo) =>
            (status === 'done' ? todo.completed : !todo.completed) &&
            todo.date === selectedDate
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
          date: selectedDate,
          completed: false,
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
            <div className="group">
              <h2 className="text-lg font-semibold mb-4 capitalize flex gap-2 items-center">
                {dayjs(date).format('D MMMM')}
                <ChevronsUpDownIcon
                  className="size-3 cursor-pointer hidden group-hover:block rotate-45"
                  onClick={() => updateSelectedDate(date)}
                />
              </h2>
              {previousBacklogItems[date]
                .map((id) => todos.find((i) => i.id === id.id)!)
                .map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    selectedDate={selectedDate}
                  />
                ))}
            </div>
          ))}
        </div>
      )}
      <ReactSortable list={columnTodos} setList={orderTodos}>
        {columnTodos
          .map((id) => todos.find((i) => i.id === id.id)!)
          .map((todo) => (
            <TodoItem key={todo.id} todo={todo} selectedDate={selectedDate} />
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
