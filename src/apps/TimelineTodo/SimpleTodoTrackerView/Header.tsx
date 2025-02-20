import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import dayjs from '@/helpers/dayjs';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { useMemo } from 'react';
import { SIMPLE_TODO_DATE_FORMAT } from '../store/utils';
import { useSharedStore } from './store';
import { Checkbox } from '@/components/ui/checkbox';
import { useStore } from '../store';
import * as React from 'react';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import _ from 'lodash';

const Header = () => {
  const { selectedDate, showAllTodos, setSharedState } = useSharedStore();
  const {
    simpleTodoList,
    showByTags,
    setShowByTags,
    selectedTags,
    setSelectedTags,
  } = useStore();
  const { formatted, date } = useMemo(() => {
    return {
      formatted: dayjs(selectedDate).format('MMMM D, YYYY'),
      date: new Date(selectedDate),
    };
  }, [selectedDate]);

  const allTags = useMemo(() => {
    return _.uniq(simpleTodoList.map((todo) => todo.tags || []).flat());
  }, [simpleTodoList]);

  if (showByTags) {
    return (
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="show-by-date"
            checked={false}
            onCheckedChange={() => setShowByTags(false)}
          />
          <label
            htmlFor="show-by-date"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Show by date
          </label>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2">
              <Input
                value={`Tags: ${selectedTags.join(', ')}`}
                onChange={() => null}
              />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            {allTags.map((tag) => (
              <DropdownMenuCheckboxItem
                key={tag}
                checked={selectedTags.includes(tag)}
                onCheckedChange={(checked) =>
                  setSelectedTags(
                    checked
                      ? [...selectedTags, tag]
                      : selectedTags.filter((t) => t !== tag)
                  )
                }
              >
                {tag}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 mb-4">
      <Popover>
        <PopoverTrigger asChild disabled={showAllTodos}>
          <Button
            variant="outline"
            className={cn(
              'w-[280px] justify-start text-left font-normal',
              !selectedDate && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? formatted : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(s) =>
              setSharedState({
                selectedDate: dayjs(s).format(SIMPLE_TODO_DATE_FORMAT),
              })
            }
            className="rounded-md border"
          />
        </PopoverContent>
      </Popover>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="show-all-todos"
          checked={showAllTodos}
          onCheckedChange={(checked) =>
            setSharedState({ showAllTodos: !!checked })
          }
        />
        <label
          htmlFor="show-all-todos"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Show All Todos
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="show-by-tags"
          checked={false}
          onCheckedChange={() => setShowByTags(true)}
        />
        <label
          htmlFor="show-by-tags"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Show by tags
        </label>
      </div>
    </div>
  );
};

export default Header;
