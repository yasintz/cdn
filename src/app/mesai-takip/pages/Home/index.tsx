import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from 'src/app/mesai-takip/useStore';
import { Item } from 'src/app/mesai-takip/components/Item/Item';
import { MonthList } from 'src/app/mesai-takip/components/Month/List';
import 'dayjs/locale/tr';
import { routePaths } from 'src/app/mesai-takip/utils/routes';
import { itemPriceCalculator } from 'src/app/mesai-takip/utils/calc';
// import styles from 'src/app/mesai-takip/pages/Home/style.module.scss';

dayjs.locale('tr');

const months = (() => {
  const now = dayjs().startOf('month');

  const range = [-2, -1, 0, 1];

  const monthList = range.map((i) => {
    const date = now.add(i, 'month');
    return {
      id: i,
      name: date.format('MMMM'),
      date,
    };
  });

  return monthList;
})();

export function Home() {
  const navigate = useNavigate();
  const { items, prices } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeMonthId = parseInt(searchParams.get('activeMonthId') || '0');

  const setActiveMonthId = (monthId: number) =>
    setSearchParams((params) => {
      params.set('activeMonthId', monthId.toString());
      return params;
    });

  const activeMonth = useMemo(
    () => months.find((i) => i.id === activeMonthId),
    [activeMonthId]
  );

  const listItems = useMemo(() => {
    const monthStart = activeMonth?.date || dayjs();
    const monthEnd = monthStart.endOf('month');

    const startTime = monthStart.toDate().getTime();
    const endTime = monthEnd.toDate().getTime();
    return items
      .filter((i) => {
        const itemDate = dayjs(i.date).toDate().getTime();

        return itemDate >= startTime && itemDate <= endTime;
      })
      .sort((a, b) => dayjs(b.date).diff(a.date));
  }, [activeMonth?.date, items]);

  const totalMinutes = listItems
    .map((i) => i.hour * 60 + i.minute)
    .reduce((acc, res) => acc + res, 0);

  const totalPrice = Math.round(
    listItems
      .map((i) => itemPriceCalculator(i, prices))
      .reduce((acc, res) => acc + res, 0)
  );

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes - hours * 60;

  return (
    <>
      <MonthList
        months={months}
        onClick={setActiveMonthId}
        activeMonthId={activeMonthId}
      />
      <div className="total-text">
        Toplam {hours} saat {minutes} dakika → {totalPrice} TL
      </div>

      <div className="hide-scrollbar item-list">
        {listItems.map((item) => (
          <Item
            key={item.id}
            item={item}
            onItemClick={() => navigate(routePaths.edit(item.id))}
            prices={prices}
          />
        ))}
      </div>
    </>
  );
}
