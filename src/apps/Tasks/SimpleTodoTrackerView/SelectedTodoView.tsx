import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useSharedStore } from './store';
import { useStore } from '../store';
import PropertyRenderer from './PropertyRenderer';
import MarkdownInput from '@/components/MarkdownInput';
import { Button } from '@/components/ui/button';
import { TrashIcon } from 'lucide-react';

const SelectedTodoView = () => {
  const { selectedTodoId, setSharedState } = useSharedStore();
  const { tasks, updateProperty, workspaces, updateTask, deleteTask } =
    useStore();
  const task = tasks.find((i) => i.id === selectedTodoId);
  const workspace = workspaces.find((w) => w.id === task?.workspaceId);

  return (
    <Sheet
      open={Boolean(task)}
      onOpenChange={() => setSharedState({ selectedTodoId: undefined })}
    >
      <SheetContent className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{task?.name}</SheetTitle>

          <SheetDescription>
            <MarkdownInput
              value={task?.description || ''}
              className="min-h-52"
              onChange={(value) =>
                task && updateTask(task.id, { description: value })
              }
              showToolbar
            />
          </SheetDescription>
        </SheetHeader>
        <table className="mt-4">
          <tbody>
            {workspace?.properties.map((property) => (
              <tr key={property.id} className="mb-2">
                <td className="pr-2 flex items-center">{property.label}</td>
                <td>
                  <div className="flex">
                    <PropertyRenderer
                      property={property}
                      value={task?.properties[property.id]}
                      onChange={(value) =>
                        task && updateProperty(task.id, property.id, value)
                      }
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Button
          variant="outline"
          className="flex gap-2 mt-2 w-full text-red-400 border-red-300 hover:text-white hover:bg-red-400 hover:border-red-400"
          size="sm"
          onClick={() => {
            if (task) {
              setSharedState({ selectedTodoId: undefined });
              deleteTask(task.id);
            }
          }}
        >
          <TrashIcon className="size-4" />
          Delete
        </Button>
      </SheetContent>
    </Sheet>
  );
};

export default SelectedTodoView;
