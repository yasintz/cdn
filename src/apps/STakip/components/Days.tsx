import { cn } from '@/lib/utils';
import dayjs from '@/helpers/dayjs';

export function Days({
  days,
  selectedDate,
  setSelectedDate,
}: {
  days: string[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 mb-4 w-full overflow-x-auto">
      {days.map((day) => (
        <button
          key={day}
          className={cn(
            'border p-2 rounded-md w-20 text-center',
            selectedDate === day && 'bg-blue-500 text-white'
          )}
          onClick={() => setSelectedDate(day)}
        >
          {dayjs(day).format('DD MMM')}
        </button>
      ))}
    </div>
  );
}
