import React from 'react';
import Color from 'color';
import dayjs from '@/helpers/dayjs';
import { showDiff } from '../../TimelineTodo/Entry/utils';
import { getEventConfig } from '../utils';
import { EventType } from '../store';
import { cn } from '@/lib/utils';

type NonGroupedEventProps = {
  event: EventType;
  day: Date;
  divRef: HTMLDivElement | null;
  nonGroupEvents: Array<EventType>;
  index: number;
  onClick?: React.MouseEventHandler<HTMLDivElement> | undefined;
};

const NonGroupedEvent = ({
  event,
  day,
  divRef: ref,
  nonGroupEvents,
  index,
  onClick,
}: NonGroupedEventProps) => {
  const { style, timePlacement } = getEventConfig({
    day,
    ref,
    events: nonGroupEvents,
    index,
  });
  const isNextDayDuplicate = !dayjs(event.start).isSame(day, 'day');
  const backgroundColor = Color(event.color).mix(Color('white'), 0.8).hex();

  return (
    <div
      key={event.id}
      className="day-event rounded-sm cursor-pointer flex overflow-hidden select-none"
      style={{
        ...style,
        backgroundColor,
      }}
      onClick={onClick}
    >
      <div
        style={{
          backgroundColor: event.color,
          width: 4,
          height: '100%',
        }}
      />
      <div
        className={cn(
          'flex gap-2 px-2',
          timePlacement === 'bottom' && 'flex-col',
          timePlacement === 'right' && 'items-center'
        )}
      >
        <div className="text-sm">{event.title}</div>
        {!isNextDayDuplicate && !event.isGroup && (
          <div className="text-xs text-gray-600">
            {dayjs(event.start).format('HH:mm')} -{' '}
            {dayjs(event.end).format('HH:mm')} (
            {showDiff(dayjs(event.end).diff(dayjs(event.start)))})
          </div>
        )}
      </div>
    </div>
  );
};

export default NonGroupedEvent;
