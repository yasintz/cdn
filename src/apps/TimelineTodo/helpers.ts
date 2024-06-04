import { EntryType } from './store';

export function getTagSpentTime(tag: string, entries: EntryType[]) {
  const tagEntries = entries.filter((entry) => entry.tags.includes(tag));

  let total = 0;

  tagEntries.forEach((entry) => {
    const entryBaseIndex = entries.indexOf(entry);
    const nextEntry = entries[entryBaseIndex + 1];

    if (nextEntry) {
      const diff = nextEntry.time - entry.time;

      total += diff;
    }
  });

  return total;
}

export function stringToColor(
  str: string,
  level: 'dark' | 'light' | 'normal' = 'normal'
) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 0xff;

    if (level === 'dark') {
      value = Math.floor(value / 2);
    }

    if (level === 'light') {
      value = Math.floor((value + 255) / 2);
    }
    color += value.toString(16).padStart(2, '00');
  }

  return color;
}
