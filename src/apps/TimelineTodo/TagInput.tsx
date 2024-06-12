'use client';

import * as React from 'react';
import { CheckIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
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
import _ from 'lodash';
import { StoreType } from './store';

type TagInputPropsType = {
  allTags: StoreType['allTags'];
  entryTags: string[];
  onTagClick: (tag: string) => void;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function TagInput({
  onTagClick,
  allTags,
  entryTags,
  children,
  open,
  onOpenChange,
}: TagInputPropsType) {
  const [dynamicTag, setDynamicTag] = React.useState('');
  const allTagsList = React.useMemo(
    () => _.uniq([dynamicTag, ...allTags].filter((i) => i).sort()),
    [allTags, dynamicTag]
  );

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput
            placeholder="Search framework..."
            className="h-9"
            onValueChange={setDynamicTag}
            autoFocus
          />
          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {allTagsList.map((tag) => (
                <CommandItem
                  key={tag}
                  value={tag}
                  onSelect={() => {
                    onTagClick(tag);
                  }}
                >
                  {tag}
                  <CheckIcon
                    className={cn(
                      'ml-auto h-4 w-4',
                      !entryTags.includes(tag) && 'opacity-0'
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
