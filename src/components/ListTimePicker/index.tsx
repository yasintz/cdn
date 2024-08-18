import dayjs from '@/helpers/dayjs';
import { cn } from '@/lib/utils';
import ms from 'ms';
import { useEffect } from 'react';

const hours = Array.from(Array(24).keys()).map((a, i) => i);
const minutes = Array.from(Array(60).keys()).map((a, i) => i);

const List = ({
  id,
  list,
  active,
  onClick,
}: {
  id: string;
  list: number[];
  active: number;
  onClick: (n: number) => void;
}) => (
  <div className="h-full overflow-y-auto flex flex-col gap-1 text-sm cursor-pointer first:border-r px-2 scrollbar-hidden py-2">
    {list.map((item) => (
      <div
        key={item}
        onClick={() => onClick(item)}
        id={`${id}_${item}`}
        className={cn(
          'border border-transparent px-4 py-1 hover:bg-gray-100 rounded-md',
          active === item && 'border-gray-300'
        )}
      >
        {item.toString().padStart(2, '0')}
      </div>
    ))}
  </div>
);

type ListTimePickerProps = {
  time: number;
  setTime: (time: number) => void;
};

const ListTimePicker = ({ time, setTime }: ListTimePickerProps) => {
  const duration = dayjs.duration(time);
  const hour = parseInt(duration.format('H'), 10);
  const minute = parseInt(duration.format('m'), 10);

  const onTimeSet = (item: number, showMinutes: boolean) => {
    const [h, m] = duration.format('H:m').split(':');
    const result = ms(`${item} ${showMinutes ? 'minutes' : 'hours'}`);

    setTime(ms(!showMinutes ? `${m} minutes` : `${h} hours`) + result);
  };

  useEffect(() => {
    const activeHourElement = document.getElementById(`hours_${hour}`)!;
    const activeMinuteElement = document.getElementById(`minutes_${minute}`)!;

    activeHourElement?.scrollIntoView();
    activeMinuteElement?.scrollIntoView();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-full">
      <List
        id="hours"
        list={hours}
        active={hour}
        onClick={(h) => onTimeSet(h, false)}
      />
      <List
        id="minutes"
        list={minutes}
        active={minute}
        onClick={(m) => onTimeSet(m, true)}
      />
    </div>
  );
};

export default ListTimePicker;
