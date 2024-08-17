import dayjs from '@/helpers/dayjs';
import { cn } from '@/lib/utils';

type HourItemProps = {
  hourMs: number;
  hourSize: number;
  printNext?: boolean;
  hidden?: boolean;
};

const HourItem = ({ hourMs, hourSize, printNext, hidden }: HourItemProps) => {
  return (
    <div
      key={hourMs}
      className="w-full border-b box-border flex relative"
      style={{
        height: hourSize,
      }}
    >
      <div
        className={cn(
          'w-14 h-full -translate-y-4 bg-white text-gray-500 select-none'
        )}
      >
        <span className={cn(hidden && 'opacity-0')}>
          {dayjs.duration(hourMs).format('HH:mm')}
        </span>
      </div>
      {printNext && (
        <div className="absolute bottom-0 w-14 h-full translate-y-3 bg-white flex items-end text-gray-500">
          <span className={cn(hidden && 'opacity-0')}>
            {dayjs.duration(hourMs).add(1, 'hour').format('HH:mm')}
          </span>
        </div>
      )}
    </div>
  );
};

export default HourItem;
