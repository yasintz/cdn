import React from 'react';
import { ReactSortable } from 'react-sortablejs';
import { TaskType, useStore, ViewType } from '../../store';
import AddTaskInput from './AddTaskInput';
import './style.scss';
import { GripVerticalIcon } from 'lucide-react';

type ListViewProps = {
  tasks: TaskType[];
  view: ViewType;
  onAddTask: (name: string) => void;
  onTaskClick: (id: string) => void;
};

const ListView = ({ tasks, onAddTask, view, onTaskClick }: ListViewProps) => {
  const { updateTask, orderTasks } = useStore();
  const clonedTask = React.useMemo(
    () => tasks.map((i) => ({ id: i.id })),
    [tasks]
  );

  return (
    <div className="list-view">
      <div className="table">
        <ReactSortable
          list={clonedTask}
          setList={(orderedTasks) => orderTasks(orderedTasks.map((i) => i.id))}
          handle=".react-sortable-handle"
        >
          {tasks.map((task) => {
            return (
              <div key={task.id} className="table-row bg-white cursor-pointer">
                <div className="w-full table-cell td group/name">
                  <div className="flex gap-2 items-center">
                    <GripVerticalIcon className="react-sortable-handle mr-3 size-4 cursor-grab text-gray-400" />
                    <div
                      className="w-full flex gap-2 items-center"
                      onClick={() => onTaskClick(task.id)}
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() =>
                          updateTask(task.id, { completed: !task.completed })
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                      <input
                        type="text"
                        className="px-1 py-[2px] outline-none border border-transparent group-hover/name:border-gray-300 rounded-sm"
                        value={task.name}
                        onChange={(e) =>
                          updateTask(task.id, { name: e.target.value })
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                </div>
                {view.visibleProperties.map((key) => (
                  <div className="table-cell td" key={key}>
                    {task.properties[key] || ''}
                  </div>
                ))}
              </div>
            );
          })}
        </ReactSortable>
        <div className='mt-2'>
          <AddTaskInput onAddTask={onAddTask} />
        </div>
      </div>
    </div>
  );
};

export default ListView;
