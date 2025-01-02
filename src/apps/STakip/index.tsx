import { Checkbox } from '@/components/ui/checkbox';
import dayjs from '@/helpers/dayjs';
import { cn } from '@/lib/utils';
import { googleSheetDB } from '@/utils/googleSheetDb';
import ms from 'ms';
import { useEffect, useMemo, useState } from 'react';
import { UrlItem } from './components/UrlItem';

type DataType = {
  urls: Array<{
    url: string;
    timestamp: string;
  }>;
};

type GroupedDataType = {
  [key: string]: Array<{
    url: string;
    domain: string;
    instances: Array<{
      startTime: Date;
      endTime: Date;
      duration: number;
      index: number;
    }>;
    totalDuration: number;
  }>;
};

const storage = googleSheetDB('1nGqcgAJ_icHmEBn1ka5XTKLT_7rz7T9oZaB563Cwu-s');

function getGroupedData(data: DataType['urls'], domainOnly: boolean) {
  const grouped: GroupedDataType = {};

  // Sort urls by timestamp
  const sortedUrls = [...data].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  sortedUrls.forEach((current, index) => {
    const next = sortedUrls[index + 1];
    const date = dayjs(current.timestamp).format('YYYY-MM-DD');

    if (!grouped[date]) {
      grouped[date] = [];
    }

    const startTime = new Date(current.timestamp);
    const endTime = next ? new Date(next.timestamp) : new Date();
    const duration = Math.min(
      endTime.getTime() - startTime.getTime(),
      ms('2.5 minute')
    );

    let urlEntry = grouped[date].find((entry) => {
      if (domainOnly) {
        const currentDomain = new URL(current.url).hostname;
        const entryDomain = new URL(entry.url).hostname;
        return currentDomain === entryDomain;
      }
      return entry.url === current.url;
    });

    if (!urlEntry) {
      urlEntry = {
        domain: new URL(current.url).hostname,
        url: current.url,
        instances: [],
        totalDuration: 0,
      };
      grouped[date].push(urlEntry);
    }
    const latestInstance = urlEntry.instances[urlEntry.instances.length - 1];

    if (latestInstance?.index + 1 === index) {
      latestInstance.duration = dayjs(endTime).diff(
        dayjs(latestInstance.startTime),
        'minutes'
      );
    } else {
      urlEntry.instances.push({
        startTime,
        endTime,
        duration,
        index,
      });
    }
    urlEntry.totalDuration += duration;
  });

  // Sort URLs by total duration (descending)
  Object.values(grouped).forEach((dayUrls) => {
    dayUrls.sort((a, b) => b.totalDuration - a.totalDuration);
  });
  return grouped;
}

function createPreviousAndNextWeekDays(date: string) {
  const startOfWeek = dayjs(date).startOf('week');
  const nextWeek = startOfWeek.add(1, 'week');
  const endOfWeek = startOfWeek.endOf('week');
  const previousWeek = startOfWeek.subtract(1, 'week');
  const isEnd = endOfWeek.format('YYYY-MM-DD') === date;
  const list = [];

  if (!isEnd) {
    for (let i = 0; i < 7; i++) {
      list.push(previousWeek.add(i, 'day').format('YYYY-MM-DD'));
    }
  }

  for (let i = 0; i < 7; i++) {
    list.push(startOfWeek.add(i, 'day').format('YYYY-MM-DD'));
  }

  if (isEnd) {
    for (let i = 0; i < 7; i++) {
      list.push(nextWeek.add(i, 'day').format('YYYY-MM-DD'));
    }
  }

  return list;
}

const SumeyyeTakip = () => {
  const [data, setData] = useState<DataType>();
  const [domainOnly, setDomainOnly] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(
    dayjs().format('YYYY-MM-DD')
  );
  const lastOneHourData = useMemo(() => {
    const lastOneHour = dayjs().subtract(1, 'hour');
    const oneHourData = data?.urls.filter((url) =>
      dayjs(url.timestamp).isAfter(lastOneHour)
    );

    if (!oneHourData) return;

    return getGroupedData(oneHourData, domainOnly)[selectedDate];
  }, [data?.urls, domainOnly, selectedDate]);

  const days = useMemo(
    () => createPreviousAndNextWeekDays(selectedDate),
    [selectedDate]
  );
  const groupedData = useMemo(
    () => (data ? getGroupedData(data.urls, domainOnly)! : {}),
    [data, domainOnly]
  );

  useEffect(() => {
    storage.get().then((data) => setData(data));
  }, []);

  const urls = groupedData[selectedDate];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Daily URL Summary</h1>

      <div className="flex items-center gap-2 mb-4">
        <Checkbox
          checked={domainOnly}
          onCheckedChange={() => setDomainOnly(!domainOnly)}
        />
        Domain Only
      </div>
      <div className="flex items-center gap-2 mb-4 w-full overflow-x-auto">
        {days.map((day) => (
          <button
            key={day}
            className={cn(
              'border p-2 rounded-md w-20 text-center',
              selectedDate === day && 'bg-blue-500 text-white'
            )}
            onClick={() => setSelectedDate(day)}
          >
            {dayjs(day).format('DD MMM')}
          </button>
        ))}
      </div>
      {lastOneHourData && (
        <div className="mb-4 border-b pb-4">
          <h2 className="text-xl font-bold mb-2">Last 1 Hour</h2>
          <div className="flex gap-3">
            {lastOneHourData.map((item, index) => (
              <UrlItem
                key={index}
                url={item.url}
                domain={item.domain}
                instances={item.instances}
                totalDuration={item.totalDuration}
                domainOnly={domainOnly}
                className="flex-1"
              />
            ))}
          </div>
        </div>
      )}
      {urls ? (
        <div>
          <div className="space-y-4">
            {urls?.map((item, index) => (
              <UrlItem
                key={index}
                url={item.url}
                domain={item.domain}
                instances={item.instances}
                totalDuration={item.totalDuration}
                domainOnly={domainOnly}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4">No data for this date</div>
      )}
    </div>
  );
};

export { SumeyyeTakip as Component };
