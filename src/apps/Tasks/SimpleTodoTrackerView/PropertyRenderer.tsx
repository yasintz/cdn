import React from 'react';
import { PropertyConfigType } from '../store';
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
import { Checkbox } from '@/components/ui/checkbox';
import MarkdownInput from '@/components/MarkdownInput';

type PropertyRendererProps = {
  property: PropertyConfigType;
  value: any;
  onChange: (value: any) => void;
};

const PropertyRenderer = ({
  property,
  value,
  onChange,
}: PropertyRendererProps) => {
  if (property.type === 'text') {
    return (
      <Input value={value || ''} onChange={(e) => onChange(e.target.value)} />
    );
  }

  if (property.type === 'number') {
    return (
      <Input
        type="number"
        value={value || ''}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    );
  }

  if (property.type === 'date') {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-[280px] justify-start text-left font-normal',
              !value && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dayjs(value).format('MMMM D, YYYY')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={new Date(value || '')}
            onSelect={(s) => onChange(s?.toISOString())}
            className="rounded-md border"
          />
        </PopoverContent>
      </Popover>
    );
  }

  if (property.type === 'boolean') {
    return (
      <Checkbox
        checked={value}
        onCheckedChange={(checked) => onChange(checked)}
      />
    );
  }

  if (property.type === 'select') {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {property.options.map((option: any) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (property.type === 'rich-text') {
    return (
      <MarkdownInput
        value={value || ''}
        onChange={(value) => onChange(value)}
        showToolbar
      />
    );
  }
};

export default PropertyRenderer;
