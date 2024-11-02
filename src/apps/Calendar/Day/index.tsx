import React, { useLayoutEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { EventType } from '../store';
import _ from 'lodash';
import EventCreatePreview, {
  useEventCreatePreview,
} from './EventCreatePreview';
import GroupedEvent from './GroupedEvent';
import NonGroupedEvent from './NonGroupedEvent';

type CalendarDayProps = {
  events: Array<EventType>;
  day: Date;
  onEventClick?: (event: EventType) => void;
  className?: string;
  width: number;
  autoScroll?: boolean;
  onEventCreate?: (start: Date, end: Date) => void;
};

const CalendarDay = ({
  events,
  day,
  className,
  onEventClick,
  width,
  autoScroll,
  onEventCreate,
}: CalendarDayProps) => {
  const [ref, setRef] = React.useState<HTMLDivElement | null>(null);

  const { eventCreatePoints, onMouseDown, onMouseMove, onMouseUp } =
    useEventCreatePreview(ref, day, onEventCreate);

  const groupEvents = events.filter((ev) => ev.isGroup);
  const nonGroupEvents = useMemo(
    () =>
      _.sortBy(
        events.filter((ev) => !ev.isGroup),
        (s) => new Date(s.start).getTime()
      ),
    [events]
  );

  const handleEventClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    event: EventType
  ) => {
    e.stopPropagation();
    onEventClick?.(event);
  };

  useLayoutEffect(() => {
    if (autoScroll && ref) {
      ref.parentElement?.scrollTo({
        left: ref.offsetLeft - ref.clientWidth * 1.5,
      });
    }
  }, [autoScroll, ref]);

  return (
    <div
      ref={setRef}
      className={cn('relative flex-1', className)}
      style={{ minWidth: width }}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
    >
      {eventCreatePoints && ref && (
        <EventCreatePreview
          eventCreatePoints={eventCreatePoints}
          divRef={ref}
        />
      )}
      {groupEvents.map((event, index) => (
        <GroupedEvent
          key={event.id}
          event={event}
          day={day}
          divRef={ref}
          groupEvents={groupEvents}
          index={index}
          onClick={(e) => handleEventClick(e, event)}
        />
      ))}
      {nonGroupEvents.map((event, index) => (
        <NonGroupedEvent
          key={event.id}
          event={event}
          day={day}
          divRef={ref}
          nonGroupEvents={nonGroupEvents}
          index={index}
          onClick={(e) => handleEventClick(e, event)}
        />
      ))}
    </div>
  );
};

export default CalendarDay;
