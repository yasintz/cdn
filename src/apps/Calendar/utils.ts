import React from 'react';
import ms from 'ms';
import dayjs from '@/helpers/dayjs';
import { EventType } from './store';

const ONE_DAY = ms('1 day');
export function getEventTimes(start: string, end: string, day: Date) {
  const eventStart = new Date(start);
  const eventEnd = new Date(end);
  return {
    start: dayjs.max(dayjs(day).startOf('day'), dayjs(eventStart))!,
    end: dayjs.min(dayjs(day).endOf('day'), dayjs(eventEnd))!,
  };
}
export function pointToTime(point: number, div: HTMLDivElement) {
  return (point / div.clientHeight) * ms('24 hours');
}

export function timeToPoint(time: number, div: HTMLDivElement) {
  return (time / ms('24 hours')) * div.clientHeight;
}

export function getPoint(e: React.MouseEvent, ref: HTMLDivElement) {
  return e.clientY - ref.getBoundingClientRect().top;
}
export function roundTimeToNearest(time: number, s: number) {
  return Math.round(time / s) * s;
}

export function getEventConfig({
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

  const height = (duration / ONE_DAY) * rect.height - 2;
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
