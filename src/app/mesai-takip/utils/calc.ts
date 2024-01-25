import { ItemType, PricesType } from 'src/app/mesai-takip/useStore';

export function itemPriceCalculator(item: ItemType, prices: PricesType) {
  const itemHour = item.hour + item.minute / 60;

  if (item.isPublicHoliday) {
    return itemHour * prices.publicHolidays;
  }

  const date = new Date(item.date);
  const isWeekend = [0, 6].includes(date.getDay());

  if (isWeekend) {
    return itemHour * prices.weekends;
  }

  return itemHour * prices.weekdays;
}
