import { useStore } from '../store';
import TodoItem from './TodoItem';
import { ReactSortable } from 'react-sortablejs';
import { SimpleTodoType } from '../store/simple-todo-slice';
import { useMemo } from 'react';

type SortableTodosProps = {
  todos: SimpleTodoType[];
};

const SortableTodos = ({ todos }: SortableTodosProps) => {
  const { orderTodos } = useStore();
  const list = useMemo(() => structuredClone(todos), [todos]);

  return (
    <ReactSortable list={list} setList={orderTodos}>
      {list.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ReactSortable>
  );
};

export default SortableTodos;
