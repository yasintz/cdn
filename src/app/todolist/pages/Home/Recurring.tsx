'use client';

import * as React from 'react';
import { ChevronDown, Check } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const frameworks = [
  {
    value: 'never',
    label: 'Never',
  },
  {
    value: 'daily',
    label: 'Every Day',
  },
  {
    value: '2days',
    label: 'Every 2 Days',
  },
  {
    value: '3days',
    label: 'Every 3 Days',
  },
  {
    value: 'weekly',
    label: 'Every Week',
  },
  {
    value: 'monthly',
    label: 'Every Month',
  },
];

type PropsType = {
  onRecurringChange: (value: string) => void;
};

export function ComboboxDemo({ onRecurringChange }: PropsType) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState('never');

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between border-transparent"
        >
          {value
            ? frameworks.find((framework) => framework.value === value)?.label
            : 'Select framework...'}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandGroup>
            <CommandList>
              {frameworks.map((framework) => (
                <CommandItem
                  key={framework.value}
                  value={framework.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue);
                    onRecurringChange(currentValue);
                    setOpen(false);
                  }}
                >
                  {framework.label}
                  <Check
                    className={cn(
                      'ml-auto h-4 w-4',
                      value === framework.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
