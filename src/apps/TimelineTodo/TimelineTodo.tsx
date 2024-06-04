import { useParams, useSearchParams } from 'react-router-dom';
import { useStore } from './store';
import ms from 'ms';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import _ from 'lodash';
import { useEffect, useMemo, useRef, useState } from 'react';
import Header from './Header';
import Entry from './Entry';
import './style.scss';
import { getTagSpentTime } from './helpers';

dayjs.extend(duration);

const TimelineTodo = () => {
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const [time, setTime] = useState(Date.now());
  const [showTagInputEntryId, setShowTagInputEntryId] = useState<string>();

  const isPreview = searchParams.get('preview') !== 'false';

  const { sessions, entries, createEntry, allTags } = useStore();

  const session = sessions.find((session) => session.id === sessionId);
  const sessionEntries = useMemo(() => {
    const sessionEntriesRaw = _.orderBy(
      entries.filter((entry) => entry.sessionId === sessionId),
      'time'
    );

    const sessionEntriesData = sessionEntriesRaw.map((entry, index) => {
      const nextItem = sessionEntriesRaw[index + 1];
      const prevItem = sessionEntriesRaw[index - 1];
      const active = time > entry.time && time < nextItem?.time;

      return {
        ...entry,
        diff: nextItem?.time - entry.time,
        next: nextItem,
        prev: prevItem,
        active,
      };
    });

    return sessionEntriesData;
  }, [entries, sessionId, time]);

  const tagsWithSpentTime = useMemo(
    () =>
      allTags.map(({ tag, color }) => ({
        tag,
        color,
        spentTime: dayjs
          .duration(getTagSpentTime(tag, sessionEntries))
          .format('H[h] m[m]'),
      })),
    [allTags, sessionEntries]
  );

  useEffect(() => {
    setTime(dayjs().diff(dayjs().startOf('day')));
    const interval = setInterval(() => {
      setTime(dayjs().diff(dayjs().startOf('day')));
    }, ms('1 minute'));

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div>
      <Header isPreview={isPreview} activeSession={session} />

      <div className="flex gap-2 justify-between">
        <ul
          className="py-4 px-6 overflow-y-auto relative flex-1"
          style={{
            height: 'calc(100vh - 3.6rem)',
          }}
        >
          {sessionEntries.map((entry, index) => (
            <Entry
              key={entry.id}
              entry={entry}
              isLast={index === sessionEntries.length - 1}
              isPreview={isPreview}
              onEntryCreate={() => createEntry(session!.id)}
              tagInputShown={showTagInputEntryId === entry.id}
              showTagInput={() => setShowTagInputEntryId(entry.id)}
              hideTagInput={() => setShowTagInputEntryId(undefined)}
            />
          ))}
        </ul>
        <div className="flex-1 px-4">
          <table className="tags">
            <thead>
              <tr>
                <th>Tag</th>
                <th>Spent Time</th>
              </tr>
            </thead>
            <tbody>
              {tagsWithSpentTime.map(({ tag, spentTime, color }) => (
                <tr key={tag}>
                  <td className="flex gap-2 items-center">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    {tag}
                  </td>
                  <td>{spentTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TimelineTodo;
