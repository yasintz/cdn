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
import MarkdownInput from '@/components/MarkdownInput';
import SelectProject from '@/apps/TimeTracker/SelectProject';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import dayjs from '@/helpers/dayjs';
import { Calendar } from '@/components/ui/calendar';
import { SIMPLE_TODO_DATE_FORMAT } from '../store/utils';
import { useStore as useTimeTrackerStore } from '@/apps/TimeTracker/store';
import { Combobox } from '@/components/ui/combobox';

const SelectedTodoView = () => {
  const { selectedTodoId, setSharedState } = useSharedStore();
  const { simpleTodoList, updateTask } = useStore();
  const todo = simpleTodoList.find((i) => i.id === selectedTodoId);
  const { tasks, projects } = useTimeTrackerStore();

  const properties = [
    {
      id: 'project',
      label: 'Project',
      component: (
        <SelectProject
          className="flex-1"
          projectId={todo?.projectId}
          onChange={(projectId) => todo && updateTask(todo.id, { projectId })}
        />
      ),
    },
    {
      id: 'date',
      label: 'Date',
      component: (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-[280px] justify-start text-left font-normal',
                !todo?.date && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dayjs(todo?.date).format('MMMM D, YYYY')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={new Date(todo?.date || '')}
              onSelect={(s) =>
                todo &&
                updateTask(todo.id, {
                  date: dayjs(s).format(SIMPLE_TODO_DATE_FORMAT),
                })
              }
              className="rounded-md border"
            />
          </PopoverContent>
        </Popover>
      ),
    },
    {
      id: 'reference',
      label: 'Reference',
      component: (
        <Input
          value={todo?.reference || ''}
          onChange={(e) =>
            todo && updateTask(todo.id, { reference: e.target.value })
          }
        />
      ),
    },
    {
      id: 'timeTracker',
      label: 'Time Tracker',
      component: (
        <Combobox
          className="w-full"
          options={tasks.map((task) => ({
            label: `${projects.find((p) => p.id === task.projectId)?.name}: ${
              task.title
            }`,
            value: task.id,
          }))}
          value={todo?.timeTrackerId || ''}
          setValue={(value) =>
            todo && updateTask(todo.id, { timeTrackerId: value })
          }
        />
      ),
    },
  ];

  return (
    <Sheet
      open={Boolean(todo)}
      onOpenChange={() => setSharedState({ selectedTodoId: undefined })}
    >
      <SheetContent className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="pr-3">
            <Input
              value={todo?.text || ''}
              className="border-none"
              onChange={(e) =>
                todo && updateTask(todo.id, { text: e.target.value })
              }
            />
          </SheetTitle>
          <SheetDescription>
            <table>
              <tbody>
                {properties.map((property) => (
                  <tr key={property.id} className="mb-2">
                    <td className="pr-2 flex items-center">{property.label}</td>
                    <td>{property.component}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <MarkdownInput
              onChange={(value) => todo && updateTask(todo.id, { note: value })}
              value={todo?.note || ''}
              className="mt-2 border rounded text-sm h-52"
              showToolbar
            />
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export default SelectedTodoView;
