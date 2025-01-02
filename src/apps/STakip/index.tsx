import { Checkbox } from '@/components/ui/checkbox';
import dayjs from '@/helpers/dayjs';
import { googleSheetDB } from '@/utils/googleSheetDb';
import { useEffect, useMemo, useState } from 'react';
import { UrlItem } from './components/UrlItem';
import { ApiResponseType, DataItemType } from './types';
import { getGroupedData } from './getGroupedData';
import { createPreviousAndNextWeekDays } from './createPreviousAndNextWeekDays';
import { Button } from '@/components/ui/button';
import _ from 'lodash';
import { Days } from './components/Days';
import ms from 'ms';

const storage = googleSheetDB('1nGqcgAJ_icHmEBn1ka5XTKLT_7rz7T9oZaB563Cwu-s');

function processData(data: ApiResponseType) {
  const newData: DataItemType[] = [];

  const orderedData = _.orderBy(data.urls, (s) => new Date(s.timestamp));

  orderedData.forEach(({ url, timestamp }, index) => {
    const startTime = new Date(timestamp);
    const next = orderedData[index + 1];

    if (!next) {
      return;
    }
    const endTime = new Date(next.timestamp);

    const diff = endTime.getTime() - startTime.getTime();

    if (diff > ms('3 minutes') || diff < ms('10 seconds')) {
      return;
    }

    newData.push({ startTime, endTime, url });
  });

  return newData;
}

const SumeyyeTakip = () => {
  const [rawData, setRawData] = useState<ApiResponseType>({ urls: [] });
  const data = useMemo(() => processData(rawData), [rawData]);
  // const [data, setData] = useState<DataItemType[]>([]);
  const [domainOnly, setDomainOnly] = useState(true);
  const [showList, setShowList] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    dayjs().format('YYYY-MM-DD')
  );
  const lastOneHourData = useMemo(() => {
    const lastOneHour = dayjs().subtract(1, 'hour');
    const oneHourData = data.filter((url) =>
      dayjs(url.startTime).isAfter(lastOneHour)
    );

    if (!oneHourData) return;

    return getGroupedData(oneHourData, domainOnly)[selectedDate];
  }, [data, domainOnly, selectedDate]);

  const listData = useMemo(() => {
    if (!data) return [];
    return data
      .filter((s) => dayjs(s.startTime).isSame(selectedDate, 'day'))
      .reverse();
  }, [data, selectedDate]);

  const days = useMemo(
    () => createPreviousAndNextWeekDays(selectedDate),
    [selectedDate]
  );
  const groupedData = useMemo(
    () => (data ? getGroupedData(data, domainOnly)! : {}),
    [data, domainOnly]
  );

  useEffect(() => {
    storage.get().then((data) => setRawData(data));
  }, []);

  const urls = groupedData[selectedDate];

  if (showList) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Daily URL Summary</h1>
        <div className="flex items-center gap-2 mb-4 w-full overflow-x-auto">
          <Button size="sm" onClick={() => setShowList(false)}>
            Hide List
          </Button>
        </div>
        <Days
          days={days}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
        <div className="space-y-1">
          {_.orderBy(rawData.urls, (s) => new Date(s.timestamp))
            .filter((s) => dayjs(s.timestamp).isSame(selectedDate, 'day'))
            .reverse()
            .map((url, idx) => (
              <div key={idx} className="text-sm text-gray-600 pl-4">
                {dayjs(url.timestamp).format('HH:mm')}
                <a
                  className="text-blue-600"
                  href={url.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {' '}
                  {_.truncate(url.url, { length: 75 })}
                </a>
              </div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Daily URL Summary</h1>

      <div className="flex gap-4 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Checkbox
            checked={domainOnly}
            onCheckedChange={() => setDomainOnly(!domainOnly)}
          />
          Domain Only
        </div>
        <Button size="sm" onClick={() => setShowList(true)}>
          Show List
        </Button>
      </div>
      <Days
        days={days}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
      <div className="mb-4 border-b pb-4">
        <h2 className="text-xl font-bold mb-2">Last 1 Hour</h2>
        {lastOneHourData ? (
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
        ) : (
          <div className="p-4">No data in last 1 hour</div>
        )}
      </div>
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
