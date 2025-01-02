import dayjs from '@/helpers/dayjs';
import { cn } from '@/lib/utils';
import _ from 'lodash';

interface Instance {
  startTime: Date;
  endTime: Date;
  duration: number;
  index: number;
}

interface UrlItemProps {
  url: string;
  domain: string;
  instances: Instance[];
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
      <div className="space-y-1">
        {instances.map((instance, idx) => (
          <div key={idx} className="text-sm text-gray-600 pl-4">
            {instance.startTime.toLocaleTimeString()} -{' '}
            {instance.endTime.toLocaleTimeString()} (
            {dayjs.duration(instance.duration).format('HH:mm')})
          </div>
        ))}
      </div>
    </div>
  );
}; 