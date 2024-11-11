import dayjs from '@/helpers/dayjs';
import ms from 'ms';

export function showDiff(diff: number) {
  const duration = dayjs.duration(diff);

  if (diff < ms('1 hour')) {
    return duration.format('m[m]');
  }

  if (duration.minutes() > 0) {
    return duration.format('H[h] m[m]');
  }

  return duration.format('H[h]');
}
