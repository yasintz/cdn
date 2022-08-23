import { useEffect, useMemo, useState } from 'react';
import { TimezoneItemType, UserTimezoneType } from './helpers';
import dayjs from '../utils/dayjs';
import { TimeJsTable } from './table';
import { AddTimezone } from './add-timezone';

const dateToTime = (d: Date) => {
  return d.getHours() * 60 * 60 + d.getMinutes() * 60 + d.getSeconds();
};

type TimeJsProps = {
  timezone: TimezoneItemType[];
  data: UserTimezoneType;
  onUpdate: (data: UserTimezoneType) => void;
};

export const TimeJs = ({ data, timezone, onUpdate }: TimeJsProps) => {
  const [showAddTime, setShowAddTime] = useState(false);
  const [showEditTime, setShowEditTime] = useState(false);
  const [timePercentage, setTimePercentage] = useState(0);

  const timezoneUTC = useMemo(() => {
    if (data.timezoneId && showEditTime) {
      return timezone.filter((t) => t.id === data.timezoneId)[0].timezone;
    }
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }, [data.timezoneId, showEditTime, timezone]);

  const dateByTimePercentage = useMemo(() => {
    const i = dayjs().tz(timezoneUTC).hour(0).minute(0).second(timePercentage);

    return i;
  }, [timePercentage, timezoneUTC]);

  useEffect(() => {
    setTimePercentage(dateToTime(new Date()));
    setInterval(() => {
      if (!showEditTime) {
        setTimePercentage(dateToTime(new Date()));
      }
    }, 1000);
  }, [showEditTime]);

  return (
    <div>
      {showAddTime ? (
        <AddTimezone
          timezones={timezone}
          dateByTimePercentage={dateByTimePercentage}
          onCreate={(title, t) =>
            onUpdate({
              ...data,
              timezoneList: [
                ...data.timezoneList,
                {
                  id: Math.random().toString().slice(2),
                  timezoneId: t.id,
                  title,
                },
              ],
            })
          }
        />
      ) : (
        <button onClick={() => setShowAddTime(true)}>Show Add Timezone</button>
      )}
      <TimeJsTable
        timezone={timezone}
        dateByTimePercentage={dateByTimePercentage}
        timezoneList={data.timezoneList}
      />
    </div>
  );
};
