import dayjs from '@/helpers/dayjs';
import { cn } from '@/lib/utils';
import _ from 'lodash';
import { List } from './List';
import { DataItemType } from '../types';

interface UrlItemProps {
  url: string;
  domain: string;
  instances: DataItemType[];
  totalDuration: number;
  domainOnly: boolean;
  className?: string;
}

export const UrlItem = ({
  url,
  domain,
  instances,
  totalDuration,
  domainOnly,
  className,
}: UrlItemProps) => {
  return (
    <div className={cn('border p-4 rounded-lg', className)}>
      <div className="font-medium break-all mb-2">
        {domainOnly ? domain : _.truncate(url, { length: 75 })}
        <span className="ml-2 text-blue-600 font-bold">
          (Total: {dayjs.duration(totalDuration).format('HH:mm')})
        </span>
      </div>
      <List list={instances} />
    </div>
  );
};
