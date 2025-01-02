import ms from 'ms';
import { DataItemType, GroupedDataType } from './types';
import dayjs from '@/helpers/dayjs';

export function getGroupedData(data: DataItemType[], domainOnly: boolean) {
  const grouped: GroupedDataType = {};

  data.forEach((current) => {
    const { startTime, endTime, url } = current;
    const date = dayjs(startTime).format('YYYY-MM-DD');

    if (!grouped[date]) {
      grouped[date] = [];
    }

    const duration = Math.min(
      endTime.getTime() - startTime.getTime(),
      ms('2.5 minute')
    );

    let urlEntry = grouped[date].find((entry) => {
      if (domainOnly) {
        const currentDomain = new URL(url).hostname;
        const entryDomain = new URL(entry.url).hostname;
        return currentDomain === entryDomain;
      }
      return entry.url === url;
    });

    if (!urlEntry) {
      urlEntry = {
        domain: new URL(url).hostname,
        url,
        instances: [],
        totalDuration: 0,
      };
      grouped[date].push(urlEntry);
    }
    // const latestInstance = urlEntry.instances[urlEntry.instances.length - 1];

    urlEntry.instances.push({
      startTime,
      endTime,
      url,
    });
    urlEntry.totalDuration += duration;
  });

  // Sort URLs by total duration (descending)
  Object.values(grouped).forEach((dayUrls) => {
    dayUrls.sort((a, b) => b.totalDuration - a.totalDuration);
  });
  return grouped;
}
