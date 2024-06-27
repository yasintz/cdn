import * as React from 'react';
import { CheckIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import _ from 'lodash';
import { StoreType } from './store';
import { tagsGroup } from './helpers';
import Tag from './Tag';

const allChilds = _.flatten(Object.values(tagsGroup));

const MenuItem = ({
  tag,
  onTagClick,
  entryTags,
}: {
  tag: string;
  onTagClick: (tag: string) => void;
  entryTags: string[];
}) => (
  <DropdownMenuItem
    key={tag}
    onSelect={() => onTagClick(tag)}
    className="flex justify-between"
  >
    <Tag tag={tag} className="mr-4" />
    <CheckIcon
      className={cn(
        'ml-auto h-4 w-4 text-green-700',
        !entryTags.includes(tag) && 'opacity-0'
      )}
    />
  </DropdownMenuItem>
);

const SubMenuOrItem = ({
  tag,
  entryTags,
  onTagClick,
}: {
  tag: string;
  onTagClick: (tag: string) => void;
  entryTags: string[];
}) => {
  const childs: string[] = (tagsGroup as any)[tag];

  if (childs) {
    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <Tag tag={tag} />
        </DropdownMenuSubTrigger>
        <DropdownMenuPortal>
          <DropdownMenuSubContent className="ml-2">
            {childs.map((t: string) => (
              <MenuItem
                key={t}
                tag={t}
                entryTags={entryTags}
                onTagClick={onTagClick}
              />
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuPortal>
      </DropdownMenuSub>
    );
  }
  return <MenuItem tag={tag} entryTags={entryTags} onTagClick={onTagClick} />;
};

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
  const allTagsList = React.useMemo(() => {
    const sortedTagLists = _.uniq(
      [dynamicTag, ...allTags].filter((i) => i).sort()
    );

    return sortedTagLists
      .filter((i) => !allChilds.includes(i))
      .filter((i) => i.toLowerCase().includes(dynamicTag.toLowerCase()));
  }, [allTags, dynamicTag]);

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px] p-0 ml-4 mt-3">
        <Input
          placeholder="Search framework..."
          className="h-9 rounded-none border-0 border-b"
          onChange={(e) => setDynamicTag(e.target.value)}
          value={dynamicTag}
          autoFocus
          ringDisabled
        />

        <div className="flex flex-col max-h-64 overflow-y-scroll">
          {allTagsList.map((tag) => (
            <SubMenuOrItem
              key={tag}
              entryTags={entryTags}
              onTagClick={onTagClick}
              tag={tag}
            />
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
