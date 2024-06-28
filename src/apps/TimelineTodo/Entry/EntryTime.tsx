import { EntryType, useStore } from '../store';
import ms from 'ms';
import { useUrlState } from '../useUrlState';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import ListTimePicker from '@/components/ListTimePicker';
import dayjs from '@/helpers/dayjs';

type EntryTimeProps = {
  entry: EntryType;
};

const EntryTime = ({ entry }: EntryTimeProps) => {
  const { batchTimeUpdatingEnabled } = useUrlState();
  const { updateEntryTime } = useStore();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="font-bold text-purple-500 cursor-pointer">
          {dayjs.duration(entry.time).format('HH:mm')}
        </div>
      </PopoverTrigger>
      <PopoverContent className="ml-4 h-64 p-0 w-auto">
        <ListTimePicker
          time={entry.time}
          setTime={(result) => {
            const isBelongsToNextDay = entry.time > ms('24 hours') - 1;
            updateEntryTime(
              entry.id,
              isBelongsToNextDay ? result + ms('24 hours') : result,
              batchTimeUpdatingEnabled
            );
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

export default EntryTime;
