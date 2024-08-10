import TaskTable from './TaskTable';
import { useStore } from './store';
import useNow from '@/hooks/useNow';
import TaskInput from './TaskInput';
import CreateInput from './CreateInput';
import { useState } from 'react';
import _ from 'lodash';
import Tag from '../TimelineTodo/Tag';
import { toast } from 'sonner';

const TimeTracker = () => {
  const now = useNow();
  const { tasks, inputs, addInput, taskTags } = useStore();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const allTags = _.uniq(_.flatten(Object.values(taskTags))).sort();

  const onTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((i) => i !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="time-tracker p-4">
      {inputs.map((inputId) => (
        <TaskInput
          key={inputId}
          id={inputId}
          now={now}
          selectedTags={selectedTags}
        />
      ))}

      <CreateInput onAdd={addInput} />

      {allTags.length > 0 && (
        <div className="flex gap-2 mb-2">
          {allTags.map((tag) => (
            <Tag
              key={tag}
              tag={tag}
              onDoubleClick={() => onTagToggle(tag)}
              onClick={async () => {
                await navigator.clipboard.writeText(tag);
                toast('Tag copied to clipboard');
              }}
              showBorder
              customBorderColor={
                selectedTags.includes(tag) ? undefined : 'transparent'
              }
            />
          ))}
        </div>
      )}

      <TaskTable
        tasks={tasks
          .filter(
            (task) =>
              selectedTags.length === 0 ||
              _.intersection(taskTags[task.id] || [], selectedTags).length > 0
          )
          .filter((i) => i.endTime)
          .toReversed()}
      />
    </div>
  );
};

export default TimeTracker;
