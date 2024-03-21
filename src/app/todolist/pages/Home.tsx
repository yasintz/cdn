import { useRef, useState } from 'react';
import { TodoType, useStore } from '../useStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

import dayjs from 'dayjs';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

type TodoItemPropsType = {
  todo: TodoType;
};
function TodoItem({ todo }: TodoItemPropsType) {
  const { updateTodo } = useStore();
  return (
    <div
      className={cn('items-top flex space-x-2', todo.completed && 'opacity-70')}
    >
      <Checkbox
        checked={!!todo.completed}
        onCheckedChange={() =>
          updateTodo(todo.id, { completed: !todo.completed })
        }
      />
      <div className="grid gap-1.5 leading-none">
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
    </div>
  );
}

const TaskInput = () => {
  const { addTodo } = useStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
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
    });
    setTimeout(() => inputRef.current?.focus(), 10);
  };

  if (!showExpanded) {
    return (
      <div
        className="flex items-center gap-3 cursor-pointer text-sm text-gray-300 hover:text-white pt-4 mt-4 border-t border-gray-400"
        onClick={() => setShowExpanded(true)}
      >
        <Plus className="size-4" /> Add Task
      </div>
    );
  }

  return (
    <div className="rounded-md border border-gray-400 mt-4">
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
      <div className="flex border-t border-gray-400 justify-end gap-4 p-2">
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
  );
};

const HomePage = () => {
  const { todoList } = useStore();
  return (
    <div className="max-w-3xl m-auto p-8">
      <div className="flex flex-col gap-4">
        {todoList.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </div>

      <TaskInput />
    </div>
  );
};

export default HomePage;
