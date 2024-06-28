import ms from 'ms';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import ListTimePicker from '@/components/ListTimePicker';
import dayjs from '@/helpers/dayjs';

type EntryTimeProps = {
  // entry: EntryType;
  time: number;
  onChange: (time: number) => void;
  editable?: boolean;
};

const EntryTime = ({ time, onChange, editable }: EntryTimeProps) => {
  const component = (
    <div className="font-bold text-purple-500 cursor-pointer">
      {dayjs.duration(time).format('HH:mm')}
    </div>
  );

  if (!editable) {
    return component;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>{component}</PopoverTrigger>
      <PopoverContent className="ml-4 h-64 p-0 w-auto">
        <ListTimePicker
          time={time}
          setTime={(result) => {
            const isBelongsToNextDay = time > ms('24 hours') - 1;
            onChange(isBelongsToNextDay ? result + ms('24 hours') : result);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

export default EntryTime;
