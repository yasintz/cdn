import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import SelectProject from '@/apps/TimeTracker/SelectProject';
import { useStore } from '../store';

type NewTodoInputProps = {
  selectedDate: string;
};

export const NewTodoInput = ({ selectedDate }: NewTodoInputProps) => {
  const [projectId, setProjectId] = useState<string | undefined>();
  const [newTodo, setNewTodo] = useState('');
  const { addTodo: addNewTodo, selectedTags } = useStore();

  const addTodo = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTodo.trim() !== '') {
      addNewTodo({
        id: Date.now().toString(),
        text: newTodo,
        date: selectedDate,
        completedAt: null,
        projectId,
        tags: selectedTags,
      });
      setNewTodo('');
    }
  };

  return (
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
        onKeyDown={addTodo}
        className="flex-8"
      />
    </div>
  );
};
