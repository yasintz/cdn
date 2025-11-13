import React, { useEffect, useMemo } from 'react';
import dayjs from '@/helpers/dayjs';
import {
  getPoint,
  pointToTime,
  roundTimeToNearest,
  timeToPoint,
} from '../utils';
import ms from 'ms';
import { EventCreatePointsType, EventTimesType } from './types';

function getNearestFifteenPoint(e: React.MouseEvent, ref: HTMLDivElement) {
  const point = getPoint(e, ref);
  const time = pointToTime(point, ref);
  const nearestFifteen = roundTimeToNearest(time, ms('15 minutes'));
  return timeToPoint(nearestFifteen, ref);
}

export function useEventCreatePreview(
  ref: HTMLDivElement | null,
  day: Date,
  onEventCreate?: (start: Date, end: Date) => void
) {
  const [eventCreatePoints, setEventCreatePoints] =
    React.useState<EventCreatePointsType>();

  const eventTimes = useMemo<EventTimesType | undefined>(() => {
    if (
      !eventCreatePoints ||
      !ref ||
      eventCreatePoints.y1 === eventCreatePoints.y2
    ) {
      return;
    }

    const startPoint = Math.min(eventCreatePoints.y1, eventCreatePoints.y2);
    const endPoint = Math.max(eventCreatePoints.y1, eventCreatePoints.y2);

    const start = pointToTime(startPoint, ref);
    const end = pointToTime(endPoint, ref);
    return { start, end };
  }, [eventCreatePoints, ref]);

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

    const point = getNearestFifteenPoint(e, ref);

    setEventCreatePoints({
      y1: point,
      y2: point,
    });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!eventCreatePoints || !ref) return;
    const point = getNearestFifteenPoint(e, ref);

    setEventCreatePoints({
      y1: eventCreatePoints.y1,
      y2: point,
    });
  };

  const onMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!eventTimes) return;

    onEventCreate?.(
      dayjs(day).startOf('day').add(eventTimes.start).toDate(),
      dayjs(day).startOf('day').add(eventTimes.end).toDate()
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
    eventTimes,
    onMouseDown,
    onMouseMove,
    onMouseUp,
  };
}
