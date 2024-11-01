import * as React from 'react';
import { CheckIcon, XCircle, ChevronsUpDownIcon } from 'lucide-react';

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

type OptionType = {
  value: string;
  label: string;
};

type PrimitivePropsType = {
  options: Array<OptionType>;
  renderOption?: (option: OptionType) => React.ReactNode;
  values: string[];
  onClick: (val: string) => void;
  onClear: () => void;
  placeholder?: string;
  showClearIcon?: boolean;
  open: boolean;
  setOpen: (bool: boolean) => void;
  className?: string;
  onSearchChange?: (val: string) => void;
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
  className,
  onSearchChange,
  renderOption,
}: PrimitivePropsType) {
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('justify-between outline-none', className)}
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
                className="size-4 opacity-50"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
              />
            )}
            <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder={placeholder}
            className="h-9"
            onValueChange={onSearchChange}
          />
          <CommandEmpty>Not Found</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {options.map((framework) => (
                <CommandItem
                  key={framework.value}
                  value={framework.value}
                  onSelect={onClick}
                >
                  {renderOption ? (
                    renderOption(framework)
                  ) : (
                    <>
                      {framework.label}
                      <CheckIcon
                        className={cn(
                          'ml-auto h-4 w-4',
                          values.includes(framework.value)
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                    </>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

type SingleSelectPropsType = Pick<
  PrimitivePropsType,
  'onSearchChange' | 'options' | 'className' | 'placeholder' | 'renderOption'
> & {
  value: string;
  setValue: (value: string) => void;
  required?: boolean;
};

export const Combobox = ({
  value,
  setValue,
  required,
  ...rest
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
      {...rest}
    />
  );
};
