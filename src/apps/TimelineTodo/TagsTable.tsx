import { useMemo } from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { EntryType, useStore } from './store';
import { getTagSpentTime } from './helpers';
import { cn } from '@/lib/utils';
import _ from 'lodash';
import Tag from './Tag';
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
      .filter((tag) => sessionTags.includes(tag))
      .map((tag) => ({
        tag,
        spentTime: dayjs
          .duration(getTagSpentTime(tag, sessionEntries))
          .format('H[h] m[m]'),
      }));
  }, [allTags, sessionEntries]);

  console.log({ allTags, sessionEntries });

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
            {tagsWithSpentTime.map(({ tag, spentTime }) => (
              <tr key={tag}>
                <td>
                  <div className="flex">
                    <Tag tag={tag} />
                  </div>
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
