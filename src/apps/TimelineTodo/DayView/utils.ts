import ms from 'ms';

const ONE_HOUR = ms('1 hour');
export const hourSize = 75;
export const msSize = hourSize / ms('1 hour');

export function getHours(startTime: number, endTime: number) {
  const startHour = Math.floor((startTime - 1) / ONE_HOUR) - 1;
  const endHour = Math.ceil((endTime + 1) / ONE_HOUR) + 2;

  const hours = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    hours.push({
      hour,
      hourMs: ms(`${hour} hour`),
    });
  }

  return {
    hours,
    startHour,
    endHour,
  };
}

type DayViewItemStyleParams = {
  startTime: number;
  endTime: number;
};

export function getDayViewItemStyle({
  startTime,
  endTime,
}: DayViewItemStyleParams): React.CSSProperties {
  return {
    position: 'absolute',
    top: startTime * msSize,
    left: 54,
    height: (endTime - startTime) * msSize - 2,
    width: 'calc(100% - 54px)',
    zIndex: 1,
  };
}
