import dayjs from '@/helpers/dayjs';
import { DataItemType } from '../types';
import ms from 'ms';
import _ from 'lodash';

const formatDuration = (duration: number) => {
  if (duration < ms('1 hour')) {
    return dayjs.duration(duration).format('mm[m] ss[s]');
  }

  return dayjs.duration(duration).format('HH[h] mm[m]');
};

export function List({ list }: { list: DataItemType[] }) {
  return (
    <div className="space-y-1">
      {list.map((instance, idx) => (
        <div key={idx} className="text-sm text-gray-600 pl-4">
          {instance.startTime.toLocaleTimeString()} -{' '}
          {instance.endTime.toLocaleTimeString()} (
          {formatDuration(
            instance.endTime.getTime() - instance.startTime.getTime()
          )}
          )
          {instance.url && (
            <a
              className="text-blue-600"
              href={instance.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {' '}
              {_.truncate(instance.url, { length: 75 })}
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
