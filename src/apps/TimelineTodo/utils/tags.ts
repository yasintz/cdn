import _ from 'lodash';
import { stringToColor, toRGB } from '../helpers';
import { EntryType } from '../store';

export function getTagSpentTime(tag: string, entries: EntryType[]) {
  const tagEntries = entries.filter((entry) => entry.tags.includes(tag));

  let total = 0;

  tagEntries.forEach((entry) => {
    total += entry.duration;
  });

  return total;
}
export const tagsGroup: Record<string, string[]> = {
  productivity: ['reading', 'podcast', 'spor', 'plan', 'english'],
  work: ['kajabi', 'chat-app', 'nexizon', 'c:Kajabi'],
  bad: ['youtube', 'timeline-todo'],
};

export const tagsColor: Record<string, string> = {
  bad: '#dd2a29',
  sleep: '#ca8a03',
  ibadet: '#6C4675',
  free: '#24b021',
  finance: '#d78b12',
  kajabi: '#1276f0',
  'c:Kajabi': '#1276f0',
  spor: '#4876a3',
  'c:Main': '#985df6',
};

export const tagsChildGroupMap: Record<string, string> = Object.entries(
  tagsGroup
).reduce(
  (acc, [key, values]) => ({
    ...acc,
    ...values.reduce((a, value) => ({ ...a, [value]: key }), {}),
  }),
  {}
);

export function getTagColor(tag: string) {
  const definedColor = tagsColor[tag];
  const color = definedColor || stringToColor(tag, 'dark');

  const { r, g, b } = toRGB(color);

  return {
    color: `rgba(${r},${g},${b})`,
    backgroundColor: `rgba(${r},${g},${b},0.2)`,
  };
}

export function getTagsData(sessionEntries: EntryType[], allTags: string[]) {
  const sessionTags = _.flatten(sessionEntries.map((i) => i.tags));
  const tagsWithSpentTimeFn = () => {
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
  };

  const tagsWithSpentTime = tagsWithSpentTimeFn();

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

  return { groupedTags, tagsWithSpentTime };
}
