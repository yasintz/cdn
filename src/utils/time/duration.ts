import dayjs from '@/helpers/dayjs';

const key = '*HH';

export function formatDuration(duration: number, formatText: string) {
  const dur = dayjs.duration(duration);

  if (formatText.includes(key)) {
    const [before, after] = formatText.split(key);

    return `${dur.format(before)}${dur.asHours()}${dur.format(after)}`;
  }

  return dur.format(formatText);
}
