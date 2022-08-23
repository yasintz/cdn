import { useMemo } from 'react';
import { TimezoneItemType, UserTimezoneType } from './helpers';
import dayjs from '../utils/dayjs';

type TimeJsTableProps = {
  timezoneList: UserTimezoneType['timezoneList'];
  timezone: TimezoneItemType[];
  dateByTimePercentage: dayjs.Dayjs;
};

export const TimeJsTable = ({
  timezoneList: timezoneListProp,
  timezone,
  dateByTimePercentage,
}: TimeJsTableProps) => {
  const timezoneList = useMemo(
    () =>
      timezoneListProp.map(({ id, title, timezoneId }) => {
        const timezoneItem = timezone.filter((t) => t.id === timezoneId)[0];
        const offsetStr = timezoneItem.offset.toString();

        const date = dateByTimePercentage.tz(timezoneItem.timezone);

        return {
          id,
          date,
          formattedTime: date.format('hh:mm A'),
          formattedDate: date.format('MM/DD/YYYY'),
          title,
          offset: offsetStr[0] === '-' ? offsetStr : `+${offsetStr}`,
        };
      }),
    [dateByTimePercentage, timezone, timezoneListProp]
  );

  return (
    <table>
      <tbody>
        {timezoneList.map((time) => (
          <tr key={time.id}>
            <td>{time.title}</td>
            <td className="time">{time.formattedTime}</td>
            <td className="date">{time.formattedDate}</td>
            <td className="action">
              <button>x</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
