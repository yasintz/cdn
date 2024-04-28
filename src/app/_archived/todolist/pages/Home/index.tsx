import { useEffect, useRef, useState } from 'react';
import { TodoType, useStore } from '../../useStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ReactSortable, ItemInterface } from 'react-sortablejs';

import dayjs from 'dayjs';
import { GripVertical, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import _ from 'lodash';
import { ComboboxDemo } from './Recurring';

type TodoItemPropsType = {
  todo: TodoType;
};

function TodoItem({ todo }: TodoItemPropsType) {
  const { updateTodo, removeTodo } = useStore();
  return (
    <div className={cn('flex space-x-2 group items-center')}>
      <GripVertical className="size-4 cursor-move opacity-0 group-hover:opacity-100" />
      <div
        className={cn(
          'todo flex flex-1 gap-2 border-b border-gray-600 group-hover:border-gray-600 px-2 py-4 group-last:border-b-0',
          todo.completed && 'opacity-70'
        )}
      >
        <Checkbox
          checked={!!todo.completed}
          onCheckedChange={() =>
            updateTodo(todo.id, { completed: !todo.completed })
          }
        />
        <div className="grid gap-1.5 leading-none flex-1">
          <label
            htmlFor="terms1"
            className={cn(
              'text-sm font-medium leading-none',
              todo.completed && 'line-through'
            )}
          >
            {todo.title}
          </label>
          {todo.description && (
            <p className="text-sm text-muted-foreground">{todo.description}</p>
          )}
        </div>
        <X
          className="size-4 opacity-0 group-hover:opacity-100 cursor-pointer"
          onClick={() => removeTodo(todo.id)}
        />
      </div>
    </div>
  );
}

const TaskInput = () => {
  const { addTodo } = useStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [recurring, setRecurring] = useState('never');
  const [showExpanded, setShowExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onAddTask = () => {
    setTitle('');
    setDescription('');

    addTodo({
      id: Math.random().toString(),
      title,
      description,
      dueDate: dayjs().endOf('day').add(6, 'hour').toISOString(),
      recurring,
    });
    setTimeout(() => inputRef.current?.focus(), 10);
  };

  if (!showExpanded) {
    return (
      <div
        className="flex items-center gap-3 cursor-pointer text-sm text-gray-300 hover:text-white pt-4 border-t border-gray-600"
        onClick={() => setShowExpanded(true)}
      >
        <Plus className="size-4" /> Add Task
      </div>
    );
  }

  return (
    <div className="rounded-md border border-gray-600">
      <Input
        placeholder="Task name"
        className="border-none placeholder:text-gray-400"
        ringDisabled
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        ref={inputRef}
        autoFocus
      />
      <Input
        placeholder="Description"
        ringDisabled
        className="border-none placeholder:text-gray-400 text-sm"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="flex border-t border-gray-600 justify-between gap-4 p-2">
        <ComboboxDemo onRecurringChange={setRecurring} />
        <div className="flex gap-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowExpanded(false)}
          >
            Cancel
          </Button>
          <Button variant="destructive" size="sm" onClick={onAddTask}>
            Add task
          </Button>
        </div>
      </div>
    </div>
  );
};

const HomePage = () => {
  const { todoList, updateOrder } = useStore();

  const [items, setItems] = useState<ItemInterface[]>(
    todoList.map((todo) => ({ id: todo.id }))
  );

  const updateList = (list: typeof items) => {
    setItems(list);
    updateOrder(list.map((i) => i.id as string));
  };

  useEffect(() => {
    setItems((prev) =>
      _.uniqBy(prev.concat(todoList.map((todo) => ({ id: todo.id }))), 'id')
    );
  }, [todoList.length]);

  const todos = items
    .map((item) => todoList.find((todo) => item?.id === todo?.id)!)
    .filter((i) => i)
    .map((i) => Object.assign({}, i));

  return (
    <div className="max-w-3xl m-auto p-8">
      <ReactSortable
        list={todos}
        setList={updateList}
        className="flex flex-col toolbar-items-builder"
      >
        {todos.map((todo, index) => (
          <TodoItem key={`${todo.id}_${index}`} todo={todo} />
        ))}
      </ReactSortable>

      <div className="pl-8">
        <TaskInput />
      </div>
    </div>
  );
};

export default HomePage;
