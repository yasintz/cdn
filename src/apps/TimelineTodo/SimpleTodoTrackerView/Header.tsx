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

type HeaderProps = {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
};

const Header = ({ selectedDate, setSelectedDate }: HeaderProps) => {
  const formatted = useMemo(
    () => dayjs(selectedDate).format('MMMM D, YYYY'),
    [selectedDate]
  );
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-[280px] justify-start text-left font-normal mb-4',
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
          selected={new Date(selectedDate)}
          onSelect={(s) => setSelectedDate(dayjs(s).format('YYYY-MM-DD'))}
          className="rounded-md border"
        />
      </PopoverContent>
    </Popover>
  );
};

export default Header;
