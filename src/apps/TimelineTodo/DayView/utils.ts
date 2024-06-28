import ms from 'ms';

const ONE_HOUR = ms('1 hour');

export function getHours(startTime: number, endTime: number) {
  const startHour = Math.floor((startTime - 1) / ONE_HOUR);
  const endHour = Math.ceil((endTime + 1) / ONE_HOUR);

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
