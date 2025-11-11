import dayjs from '@/helpers/dayjs';
import axios from 'axios';
import * as icsToJson from 'ical2json';
import { useEffect } from 'react';
import { EntryType, SessionType, useStore } from '../store';
import _ from 'lodash';

const allCalendarsJson: Array<{ name: string; url: string }> = JSON.parse(
  import.meta.env.VITE_EXTERNAL_CALENDARS || '[]'
);

export async function getAllCalendars() {
  const promises = allCalendarsJson.map(async (c) => ({
    ...c,
    ...getIcallJson((await axios.get(c.url)).data, c.name),
  }));

  const responses = await Promise.all(promises);

  return responses;
}

export type ExternalCalendarType = Awaited<
  ReturnType<typeof getAllCalendars>
>[number];

export function useExternalCalendars() {
  useEffect(() => {
    getAllCalendars().then((res) => {
      const { sessions, entries } = useStore.getState();
      const newEntries = createEntriesForExternalCalendars(
        sessions,
        entries,
        res
      );

      useStore.setState((state) => ({
        ...state,
        entries: newEntries,
      }));
    });
  }, []);
}

function getIcallJson(content: string, calenderId: string) {
  const convertedData = icsToJson.convert(content).VCALENDAR[0];

  if (typeof convertedData === 'string') {
    return {
      data: [],
      timezone: '',
    };
  }

  const timezone = 'Etc/GMT';

  const data = (convertedData.VEVENT as any[])
    .map((item) => {
      const itemEntries = Object.entries(item);
      const start = itemEntries.find(([key]) => key.startsWith('DTSTART')) as [
        string,
        string
      ];
      const end = itemEntries.find(([key]) => key.startsWith('DTEND')) as [
        string,
        string
      ];
      const exDate = itemEntries.find(([key]) => key.startsWith('EXDATE'));
      return {
        id: item.UID,
        title: item.SUMMARY,
        calenderId,
        startAt: convertItemToDate(...start, timezone),
        endAt: convertItemToDate(...end, timezone),
        item,
        deleted: Boolean(exDate),
      };
    })
    .filter((i) => !i.deleted);

  return { data, timezone };
}

export function convertItemToDate(
  key: string,
  dateString: string,
  defaultTimezone: string
) {
  key = key.replace(';VALUE=DATE', '');

  const timezone = getTimezoneFromKey(key) || defaultTimezone;
  
  // If dateString ends with 'Z', it's UTC time
  // Parse as UTC, then treat it as local time in target timezone and convert back to UTC
  if (dateString.endsWith('Z')) {
    const date = formatIcalDateString(dateString);
    // The second parameter 'true' means keepLocalTime - treats UTC time as local time in target timezone
    return dayjs.utc(date).tz(timezone, true).toDate();
  }
  
  const date = formatIcalDateString(dateString);

  try {
    return dayjs.tz(date, timezone).toDate();
  } catch (error) {
    console.log({ date, timezone, key, dateString, defaultTimezone });
    return new Date();
  }
}

export function getTimezoneFromKey(key: string) {
  key = key.replace(';VALUE=DATE', '');

  if (key.includes('=')) {
    return key.split('=')[1];
  }
}

export function formatIcalDateString(dateString: string) {
  const year = Number(dateString.slice(0, 4));
  const month = Number(dateString.slice(4, 6));
  const day = Number(dateString.slice(6, 8));

  if (dateString.includes('T')) {
    const hour = Number(dateString.slice(9, 11));
    const minute = Number(dateString.slice(11, 13));
    const second = Number(dateString.slice(13, 15));
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  }
  return `${year}-${month}-${day} 0:0:0`;
}

function createEntriesForExternalCalendars(
  sessions: SessionType[],
  entries: EntryType[],
  externalCalendars: ExternalCalendarType[]
) {
  const newEntries: EntryType[] = [];

  externalCalendars.forEach((calendar) => {
    calendar.data.forEach((event) => {
      const eventSession = sessions
        .filter((i) => i.date)
        .find((session) =>
          dayjs(event.startAt).isBetween(
            session.date,
            dayjs(session.date).add(1, 'day')
          )
        );

      if (!eventSession) {
        return;
      }

      const eventId = createHash(event.id);

      newEntries.push({
        id: eventId,
        time: dayjs(event.startAt).diff(dayjs(event.startAt).startOf('day')),
        duration: event.endAt.getTime() - event.startAt.getTime(),
        sessionId: eventSession.id,
        tags: [`c:${event.calenderId}`],
        title: event.title,
        externalCalendarEventId: eventId,
      });
    });
  });
  return _.uniqBy(
    [...entries.filter((i) => !i.externalCalendarEventId), ...newEntries],
    'id'
  );
}

function createHash(input: string, length = 16) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0; // Convert to 32-bit integer
  }

  // Convert hash to a hexadecimal string
  let hexHash = Math.abs(hash).toString(16);

  // Ensure the hash is at least the desired length by padding if necessary
  while (hexHash.length < length) {
    hexHash += hexHash;
  }

  return hexHash.slice(0, length);
}
