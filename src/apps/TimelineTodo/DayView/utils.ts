import ms from 'ms';
import { useDayViewContext } from './context';

const ONE_HOUR = ms('1 hour');
export const hourSize = 75;
export const msSize = hourSize / ms('1 hour');

export function getHours(startTime: number, endTime: number) {
  const startHour = Math.floor(startTime / ONE_HOUR);
  const endHour = Math.ceil((endTime + 1) / ONE_HOUR) + 1;

  const hours = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    hours.push({
      hour,
      hourMs: ms(`${hour} hour`),
    });
  }

  const totalSize = (endHour - startHour + 1) * hourSize;
  return {
    hours,
    startHourMs: startHour * ONE_HOUR,
    endHourMs: endHour * ONE_HOUR,
    totalSize,
  };
}

type DayViewItemStyleParams = {
  startTime: number;
  endTime: number;
};

export function useDayViewItemStyle({
  startTime,
  endTime,
}: DayViewItemStyleParams): React.CSSProperties {
  const { startHourMs } = useDayViewContext();
  return {
    position: 'absolute',
    top: (startTime - startHourMs) * msSize,
    left: 54,
    height: (endTime - startTime) * msSize - 2,
    width: 'calc(100% - 54px)',
    zIndex: 1,
  };
}
