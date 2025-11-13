import dayjs from '@/helpers/dayjs';
import { showDiff } from '@/apps/TimelineTodo/Entry/utils';
import { EventCreatePointsType, EventTimesType } from './types';

type EventCreatePreviewProps = {
  eventCreatePoints: EventCreatePointsType;
  eventTimes?: EventTimesType;
};

const EventCreatePreview = ({
  eventCreatePoints,
  eventTimes,
}: EventCreatePreviewProps) => {
  const top = Math.min(eventCreatePoints.y1, eventCreatePoints.y2);
  const height = Math.abs(eventCreatePoints.y2 - eventCreatePoints.y1);
  return (
    <div
      className="absolute left-0 w-full rounded-sm"
      style={{
        top,
        height,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
      }}
    >
      {eventTimes && (
        <div className="px-1 py-0.5 text-sm">
          {dayjs.duration(eventTimes.start).format('HH:mm')} -{' '}
          {dayjs.duration(eventTimes.end).format('HH:mm')} - (
          {showDiff(eventTimes.end - eventTimes.start)})
        </div>
      )}
    </div>
  );
};

export default EventCreatePreview;
