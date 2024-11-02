import Color from 'color';
import dayjs from '@/helpers/dayjs';
import { showDiff } from '../../TimelineTodo/Entry/utils';
import { getEventConfig } from '../utils';
import { EventType } from '../store';

type GroupedEventProps = {
  event: EventType;
  day: Date;
  divRef: HTMLDivElement | null;
  groupEvents: Array<EventType>;
  index: number;
  onClick?: React.MouseEventHandler<HTMLDivElement> | undefined;
};

const GroupedEvent = ({
  event,
  day,
  divRef: ref,
  groupEvents,
  index,
  onClick,
}: GroupedEventProps) => {
  const { style } = getEventConfig({
    day,
    ref,
    events: groupEvents,
    index,
  });
  const backgroundColor = Color(event.color).mix(Color('white'), 0.7).hex();
  return (
    <div
      key={event.id}
      className="day-event border rounded-sm px-2 cursor-pointer"
      style={{
        ...style,
        borderColor: event.color,
      }}
      onClick={onClick}
    >
      <div className="flex">
        <div
          className="text-xs px-1 rounded-sm shadow-sm relative"
          style={{
            backgroundColor,
            transform: 'translateY(-50%)',
            zIndex: 1,
          }}
        >
          {event.title} ({dayjs(event.start).format('HH:mm')} -{' '}
          {dayjs(event.end).format('HH:mm')} -{' '}
          {showDiff(dayjs(event.end).diff(dayjs(event.start)))} )
        </div>
      </div>
    </div>
  );
};

export default GroupedEvent;
