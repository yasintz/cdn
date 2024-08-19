import React, { useEffect, useMemo } from 'react';
import ms from 'ms';
import dayjs from '@/helpers/dayjs';
import { cn } from '@/lib/utils';
import { EventType } from './store';
import _ from 'lodash';
import { toRGB } from '@/helpers/color';
import { showDiff } from '../TimelineTodo/Entry/utils';

const ONE_DAY = ms('1 day');

function getEventTimes(start: string, end: string, day: Date) {
  const eventStart = new Date(start);
  const eventEnd = new Date(end);
  return {
    start: dayjs.max(dayjs(day).startOf('day'), dayjs(eventStart))!,
    end: dayjs.min(dayjs(day).endOf('day'), dayjs(eventEnd))!,
  };
}

function getEventConfig({
  ref,
  day,
  events,
  index,
}: {
  ref: HTMLDivElement | null;
  day: Date;
  events: Array<EventType>;
  index: number;
}): {
  timePlacement: 'right' | 'bottom';
  style: React.CSSProperties;
} {
  if (!ref) {
    return {
      timePlacement: 'right',
      style: {
        display: 'none',
      },
    };
  }

  const event = events[index];

  const rect = ref.getBoundingClientRect();

  const { start, end } = getEventTimes(event.start, event.end, day);

  const eventsInSameTimeFrame = events.filter((ev) => {
    const { start: evStart, end: evEnd } = getEventTimes(ev.start, ev.end, day);

    return (
      (start.isBefore(evEnd) && end.isAfter(evStart)) ||
      (evStart.isBefore(end) && evEnd.isAfter(start))
    );
  });

  const duration = end.toDate().getTime() - start.toDate().getTime();
  const startTime = dayjs(start).diff(dayjs(start).startOf('day'));

  const height = (duration / ONE_DAY) * rect.height;
  const top = (startTime / ONE_DAY) * rect.height;

  const isThereSameTimeFrameEvents = eventsInSameTimeFrame.length > 1;
  const isThisBefore =
    eventsInSameTimeFrame.findIndex((ev) => ev.id === event.id) === 0;
  const width = isThereSameTimeFrameEvents ? 85 : 95;
  const left = !isThereSameTimeFrameEvents || isThisBefore ? 2.5 : 10;

  return {
    timePlacement: height > 50 ? 'bottom' : 'right',
    style: {
      position: 'absolute',
      top,
      left: `${left}%`,
      width: `${width}%`,
      height: Math.max(height, 20),
      ...(event.isGroup && {
        width: '98%',
        left: '1%',
      }),
    },
  };
}

type CalendarDayProps = {
  events: Array<EventType>;
  day: Date;
  onEventClick?: (event: EventType) => void;
  className?: string;
  width: number;
  autoScroll?: boolean;
};

const CalendarDay = ({
  events,
  day,
  className,
  onEventClick,
  width,
  autoScroll,
}: CalendarDayProps) => {
  const [ref, setRef] = React.useState<HTMLDivElement | null>(null);

  const groupEvents = events.filter((ev) => ev.isGroup);
  const nonGroupEvents = useMemo(
    () =>
      _.sortBy(
        events.filter((ev) => !ev.isGroup),
        (s) => new Date(s.start).getTime()
      ),
    [events]
  );

  useEffect(() => {
    if (autoScroll && ref) {
      // ref.parentElement?.scrollTo()
    }
  }, [autoScroll, ref]);

  return (
    <div
      ref={setRef}
      className={cn('relative flex-1', className)}
      style={{ minWidth: width }}
    >
      {groupEvents.map((event, index) => {
        const { style } = getEventConfig({
          day,
          ref,
          events: groupEvents,
          index,
        });
        const backgroundColor = toRGB(event.color, 0.2);
        return (
          <div
            key={event.id}
            className="border rounded-sm px-2 cursor-pointer"
            style={{
              ...style,
              borderColor: event.color,
            }}
            onClick={() => onEventClick?.(event)}
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
      })}
      {nonGroupEvents.map((event, index) => {
        const { style, timePlacement } = getEventConfig({
          day,
          ref,
          events: nonGroupEvents,
          index,
        });
        const isNextDayDuplicate = !dayjs(event.start).isSame(day, 'day');
        const backgroundColor = toRGB(event.color, 0.2);
        return (
          <div
            key={event.id}
            className="rounded-sm cursor-pointer flex overflow-hidden"
            style={{
              ...style,
              backgroundColor,
            }}
            onClick={() => onEventClick?.(event)}
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
      })}
    </div>
  );
};

export default CalendarDay;
