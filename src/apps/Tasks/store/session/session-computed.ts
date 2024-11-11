import { useMemo } from 'react';
import type { SessionType } from './session-slice';
import dayjs from '@/helpers/dayjs';

const theMonthsLong = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const theMonthsShort = theMonthsLong.map((s) => s.substring(0, 3));

function getDateName(name: string) {
  const [month, date] = name.split(' ');

  const dateNumber = parseInt(date, 10);

  if (
    theMonthsLong.concat(theMonthsShort).includes(month) &&
    !Number.isNaN(dateNumber)
  ) {
    const shortIndex = theMonthsShort.indexOf(month);
    const longIndex = theMonthsLong.indexOf(month);
    const monthIndex = shortIndex > -1 ? shortIndex : longIndex;

    const byThisYear = dayjs().set('month', monthIndex).set('date', dateNumber);

    return {
      monthIndex,
      date,
      byThisYear,
    };
  }

  return undefined;
}

export function getSessionComputed(session: SessionType) {
  const { name } = session;
  const dateByName = getDateName(name);

  return {
    fullDateByName: dateByName?.byThisYear,
  };
}

export function useSessionComputed(session: SessionType) {
  return useMemo(() => getSessionComputed(session), [session]);
}
