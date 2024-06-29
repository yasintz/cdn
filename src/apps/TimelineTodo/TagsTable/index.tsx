import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { EntryType, useStore } from '../store';
import { getTagColor, getTagsData } from '../helpers';
import { cn } from '@/lib/utils';
import _ from 'lodash';
import Tag from '../Tag';
import ms from 'ms';

dayjs.extend(duration);

function formatDuration(duration: number) {
  const dur = dayjs.duration(duration);
  return `${dur.days() * 24 + dur.hours()}h ${dur.minutes()}m`;
}

type TagsTableProps = {
  sessionEntries: EntryType[];
  className?: string;
};

const TagsTable = ({ sessionEntries, className }: TagsTableProps) => {
  const [expandedTags, setExpandedTags] = useState<string[]>([]);
  const { allTags } = useStore();

  const { groupedTags } = useMemo(
    () => getTagsData(sessionEntries, allTags),
    [allTags, sessionEntries]
  );

  const entryDurationTotal = sessionEntries.reduce(
    (acc, cur) => acc + cur.duration,
    0
  );

  const lastEntry = sessionEntries[sessionEntries.length - 1];
  const totalSpentTime =
    lastEntry.time + lastEntry.duration - sessionEntries[0].time;

  const totalDiff = totalSpentTime - entryDurationTotal;

  return (
    <div className={cn('flex-1 px-4', className)}>
      <div className="w-full">
        <table className="tags">
          <tbody>
            <tr>
              <th>Tag</th>
              <th>Spent Time</th>
              <th>24h/%</th>
              <th>Total/%</th>
            </tr>
            {_.orderBy(groupedTags, 'spentTime', 'desc').map(
              ({ tag, childs, spentTime }) => {
                return (
                  <React.Fragment key={tag}>
                    <tr>
                      <td>
                        <div
                          className="flex gap-2 cursor-pointer"
                          onClick={() =>
                            setExpandedTags((prev) =>
                              prev.includes(tag)
                                ? prev.filter((t) => t !== tag)
                                : [...prev, tag]
                            )
                          }
                        >
                          <Tag tag={tag} />{' '}
                          {!expandedTags.includes(tag) && childs.length > 0 && (
                            <span className="text-xs">{childs.length}</span>
                          )}
                        </div>
                      </td>
                      <td>{formatDuration(spentTime)}</td>
                      <td>{((100 * spentTime) / ms('24 h')).toFixed(1)}%</td>
                      <td>
                        {((100 * spentTime) / totalSpentTime).toFixed(1)}%
                      </td>
                    </tr>

                    {expandedTags.includes(tag) &&
                      childs.map((child) => (
                        <tr
                          key={child.tag}
                          style={{
                            backgroundColor: getTagColor(tag).backgroundColor,
                          }}
                        >
                          <td>
                            <div className="flex ml-4">
                              <Tag tag={child.tag} />
                            </div>
                          </td>
                          <td>{formatDuration(child.spentTime)}</td>
                          <td>
                            {((100 * child.spentTime) / ms('24 h')).toFixed(1)}%
                          </td>
                          <td>
                            {((100 * child.spentTime) / totalSpentTime).toFixed(
                              1
                            )}
                            %
                          </td>
                        </tr>
                      ))}
                  </React.Fragment>
                );
              }
            )}
            {totalDiff > 0 && (
              <tr>
                <td>
                  <div className="flex gap-2 cursor-pointer">
                    <Tag tag={'empty slots'} />
                  </div>
                </td>
                <td>{formatDuration(totalDiff)}</td>
                <td>{((100 * totalDiff) / ms('24 h')).toFixed(1)}%</td>
                <td>{((100 * totalDiff) / totalSpentTime).toFixed(1)}%</td>
              </tr>
            )}

            <tr>
              <th>Total</th>

              <th>{formatDuration(totalSpentTime)}</th>

              <th></th>
              <th></th>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TagsTable;
