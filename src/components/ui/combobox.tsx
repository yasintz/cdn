'use client';

import * as React from 'react';
import { ChevronUp, ChevronDown, CheckIcon, XCircle } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

type PrimitivePropsType = {
  options: Array<{ value: string; label: string }>;
  values: string[];
  onClick: (val: string) => void;
  onClear: () => void;
  placeholder?: string;
  showClearIcon?: boolean;
  open: boolean;
  setOpen: (bool: boolean) => void;
};

function ComboboxPrimitive({
  options,
  placeholder,
  values,
  onClick,
  onClear,
  showClearIcon,
  open,
  setOpen,
}: PrimitivePropsType) {
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span>
            {values
              ? options
                  .filter((option) => values.includes(option.value))
                  .map((option) => option.label)
                  .join(', ')
              : placeholder}
          </span>

          <div className="flex gap-3">
            {showClearIcon && (
              <XCircle
                className="size-4"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
              />
            )}
            {open ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={placeholder} className="h-9" />
          <CommandEmpty>Not Found</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {options.map((framework) => (
                <CommandItem
                  key={framework.value}
                  value={framework.value}
                  onSelect={onClick}
                >
                  {framework.label}

                  <CheckIcon
                    className={cn(
                      'ml-auto h-4 w-4',
                      values.includes(framework.value)
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

type SingleSelectPropsType = {
  options: Array<{ value: string; label: string }>;
  value: string;
  setValue: (value: string) => void;
  placeholder?: string;
  required?: boolean;
};

export const Combobox = ({
  value,
  options,
  setValue,
  placeholder,
  required,
}: SingleSelectPropsType) => {
  const values = React.useMemo(() => [value], [value]);
  const [open, setOpen] = React.useState(false);
  return (
    <ComboboxPrimitive
      open={open}
      values={values}
      onClear={() => setValue('')}
      showClearIcon={Boolean(value && !required)}
      onClick={(newValue) => {
        setValue(!required && value === newValue ? '' : newValue);
        setOpen(false);
      }}
      setOpen={setOpen}
      options={options}
      placeholder={placeholder}
    />
  );
};
