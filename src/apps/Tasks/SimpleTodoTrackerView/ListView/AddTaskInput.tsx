import { Input } from '@/components/ui/input';
import React from 'react';

type AddTaskInputProps = {
  onAddTask: (task: string) => void;
};

const AddTaskInput = ({ onAddTask }: AddTaskInputProps) => {
  const [value, setValue] = React.useState('');
  const addTask = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim() !== '') {
      onAddTask(value);
    }
  };

  return (
    <Input
      type="text"
      placeholder="Add task..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyPress={addTask}
      className="flex-8"
    />
  );
};

export default AddTaskInput;
