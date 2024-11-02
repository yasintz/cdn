import React, { useEffect } from 'react';
import dayjs from '@/helpers/dayjs';
import { showDiff } from '@/apps/TimelineTodo/Entry/utils';
import {
  getPoint,
  pointToTime,
  roundTimeToNearest,
  timeToPoint,
} from '../utils';
import ms from 'ms';

type EventCreatePointsType = {
  start: number;
  end: number;
  // y1: number;
  // y2: number;
};

export function useEventCreatePreview(
  ref: HTMLDivElement | null,
  day: Date,
  onEventCreate?: (start: Date, end: Date) => void
) {
  const [eventCreatePoints, setEventCreatePoints] =
    React.useState<EventCreatePointsType>();

  const onMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const isOrChildOfDayEvent = Boolean(
      e.target instanceof HTMLDivElement &&
        (e.target.classList.contains('day-event') ||
          e.target.closest('.day-event'))
    );

    if (isOrChildOfDayEvent) return;

    if (!ref) return;

    const point = getPoint(e, ref);
    const time = pointToTime(point, ref);

    const nearestFifteen = roundTimeToNearest(time, ms('15 minutes'));

    setEventCreatePoints({
      start: nearestFifteen,
      end: nearestFifteen,
    });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!eventCreatePoints || !ref) return;
    const point = getPoint(e, ref);
    const time = pointToTime(point, ref);
    const nearestFifteen = roundTimeToNearest(time, ms('15 minutes'));

    setEventCreatePoints({
      start: eventCreatePoints.start,
      end: nearestFifteen,
    });
  };

  const onMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!eventCreatePoints) return;
    if (eventCreatePoints.start === eventCreatePoints.end) return;

    onEventCreate?.(
      dayjs(day).startOf('day').add(eventCreatePoints.start).toDate(),
      dayjs(day).startOf('day').add(eventCreatePoints.end).toDate()
    );

    setEventCreatePoints(undefined);
  };

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEventCreatePoints(undefined);
      }
    };
    window.addEventListener('keydown', listener);

    return () => {
      window.removeEventListener('keydown', listener);
    };
  }, []);

  return {
    eventCreatePoints,
    onMouseDown,
    onMouseMove,
    onMouseUp,
  };
}

type EventCreatePreviewProps = {
  eventCreatePoints: EventCreatePointsType;
  divRef: HTMLDivElement;
};

const EventCreatePreview = ({
  divRef: ref,
  eventCreatePoints,
}: EventCreatePreviewProps) => {
  return (
    <div
      className="absolute left-0 w-full rounded-sm"
      style={{
        top: timeToPoint(eventCreatePoints.start, ref),
        height:
          timeToPoint(eventCreatePoints.end, ref) -
          timeToPoint(eventCreatePoints.start, ref),
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
      }}
    >
      {eventCreatePoints.start !== eventCreatePoints.end && (
        <div className="px-1 py-0.5 text-sm">
          {dayjs.duration(eventCreatePoints.start).format('HH:mm')} -{' '}
          {dayjs.duration(eventCreatePoints.end).format('HH:mm')} - (
          {showDiff(eventCreatePoints.end - eventCreatePoints.start)})
        </div>
      )}
    </div>
  );
};

export default EventCreatePreview;
