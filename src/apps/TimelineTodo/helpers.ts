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

export const tagsColor: Record<string, string> = {
  bad: '#dd2a29',
  sleep: '#ca8a03',
  ibadet: '#2463eb',
  free: '#24b021',
  finance: '#d78b12',
};

export const tagsGroup = {
  productivity: ['reading', 'podcast', 'spor', 'plan', 'english'],
  work: ['kajabi', 'chat-app', 'nexizon'],
  bad: ['youtube'],
};

const toRGB = (color: string) => {
  const { style } = new Option();
  style.color = color;
  const rgb = style.color;

  const [r, g, b] = rgb.replace('rgb(', '').replace(')', '').split(',');

  return { r, g, b };
};

export function hashCode(t: string) {
  var hash = 0,
    i = 0,
    len = t.length;
  while (i < len) {
    hash = ((hash << 5) - hash + t.charCodeAt(i++)) << 0;
  }
  return hash + 2147483647 + 1;
}

export function getTagColor(tag: string) {
  const definedColor = tagsColor[tag];
  const color = definedColor || stringToColor(tag, 'dark');

  const { r, g, b } = toRGB(color);

  return {
    color: `rgba(${r},${g},${b})`,
    backgroundColor: `rgba(${r},${g},${b},0.2)`,
  };
}