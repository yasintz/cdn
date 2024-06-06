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

export const tagsColor: Record<
  string,
  { backgroundColor: string; color: string }
> = {
  yemek: {
    backgroundColor: '#fecaca',
    color: '#dd2a29',
  },
  sleep: {
    backgroundColor: '#ffef8a',
    color: '#ca8a03',
  },
  ibadet: {
    backgroundColor: '#bfdbfe',
    color: '#2463eb',
  },
};

export const tagsGroup = {
  productivity: ['reading', 'podcast', 'spor'],
  work: ['kajabi', 'chat-app', 'nexizon'],
};

const toRGB = (color: string) => {
  const { style } = new Option();
  style.color = color;
  const rgb = style.color;

  const [r, g, b] = rgb.replace('rgb(', '').replace(')', '').split(',');

  return { r, g, b };
};

export function getTagColor(tag: string) {
  const definedColor = tagsColor[tag];

  if (definedColor) {
    return definedColor;
  }

  const color = stringToColor(tag, 'dark');
  const { r, g, b } = toRGB(color);

  return {
    color,
    backgroundColor: `rgba(${r},${g},${b},0.2)`,
  };
}
