import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { EntryType, useStore } from './store';
import { getTagColor, getTagSpentTime, tagsGroup } from './helpers';
import { cn } from '@/lib/utils';
import _ from 'lodash';
import Tag from './Tag';

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

  const tagsWithSpentTime = useMemo(() => {
    const sessionTags = _.flatten(sessionEntries.map((i) => i.tags));
    const tags = allTags
      .filter((tag) => sessionTags.includes(tag))
      .map((tag) => ({
        tag,
        spentTime: getTagSpentTime(tag, sessionEntries),
        groupedTag: Object.entries(tagsGroup).find(([, value]) =>
          value.includes(tag)
        )?.[0],
      }));

    const unTagged = sessionEntries
      .filter((entry) => entry.tags.length === 0)
      .map((entry) => ({
        ...entry,
        tags: ['un-categorized'],
      }));

    unTagged.pop();

    if (unTagged.length > 0) {
      const unCategorized = {
        tag: 'un-categorized',
        groupedTag: undefined,
        spentTime: getTagSpentTime(
          'un-categorized',
          sessionEntries.map(
            (entry) => unTagged.find((e) => e.id === entry.id) || entry
          )
        ),
      };
      tags.push(unCategorized);
    }

    return tags;
  }, [allTags, sessionEntries]);

  const groupedTags = tagsWithSpentTime
    .filter((i) => !i.groupedTag)
    .map(({ tag, spentTime }) => {
      const childs = tagsWithSpentTime.filter((i) => i.groupedTag === tag);
      return {
        childs,
        tag,
        spentTime,
      };
    });

  return (
    <div className={cn('flex-1 px-4', className)}>
      <div className="w-full max-w-96">
        <table className="tags">
          <tr>
            <th>Tag</th>
            <th>Spent Time</th>
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
                      </tr>
                    ))}
                </React.Fragment>
              );
            }
          )}

          <tr>
            <th>Total</th>

            <th>
              {formatDuration(
                groupedTags.reduce((acc, cur) => acc + cur.spentTime, 0)
              )}
            </th>
          </tr>
        </table>
      </div>
    </div>
  );
};

export default TagsTable;
