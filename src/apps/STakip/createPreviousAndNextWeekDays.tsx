import dayjs from "@/helpers/dayjs";

export function createPreviousAndNextWeekDays(date: string) {
  const startOfWeek = dayjs(date).startOf('week');
  const nextWeek = startOfWeek.add(1, 'week');
  const endOfWeek = startOfWeek.endOf('week');
  const previousWeek = startOfWeek.subtract(1, 'week');
  const isEnd = endOfWeek.format('YYYY-MM-DD') === date;
  const list = [];

  if (!isEnd) {
    for (let i = 0; i < 7; i++) {
      list.push(previousWeek.add(i, 'day').format('YYYY-MM-DD'));
    }
  }

  for (let i = 0; i < 7; i++) {
    list.push(startOfWeek.add(i, 'day').format('YYYY-MM-DD'));
  }

  if (isEnd) {
    for (let i = 0; i < 7; i++) {
      list.push(nextWeek.add(i, 'day').format('YYYY-MM-DD'));
    }
  }

  return list;
}
