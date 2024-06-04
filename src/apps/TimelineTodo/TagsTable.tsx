import { useMemo } from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { EntryType, useStore } from './store';
import { getTagSpentTime } from './helpers';
import { cn } from '@/lib/utils';
import _ from 'lodash';
dayjs.extend(duration);

type TagsTableProps = {
  sessionEntries: EntryType[];
  className?: string;
};

const TagsTable = ({ sessionEntries, className }: TagsTableProps) => {
  const { allTags } = useStore();

  const tagsWithSpentTime = useMemo(() => {
    const sessionTags = _.flatten(sessionEntries.map((i) => i.tags));
    return allTags
      .filter(({ tag }) => sessionTags.includes(tag))
      .map(({ tag, color }) => ({
        tag,
        color,
        spentTime: dayjs
          .duration(getTagSpentTime(tag, sessionEntries))
          .format('H[h] m[m]'),
      }));
  }, [allTags, sessionEntries]);

  return (
    <div className={cn('flex-1 px-4', className)}>
      <div className="w-full">
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
  );
};

export default TagsTable;
