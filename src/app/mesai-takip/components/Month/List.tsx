import styles from './style.module.scss';

import { Month } from '.';

export type MonthType = {
  id: number;
  name: string;
};

type MonthListProps = {
  months: Array<MonthType>;
  onClick: (monthId: number) => void;
  activeMonthId: number;
};

export const MonthList = ({
  months,
  activeMonthId,
  onClick,
}: MonthListProps) => {
  return (
    <div className={styles.listContainer}>
      {months.map((month) => (
        <Month
          key={month.id}
          month={month.name}
          onClick={() => onClick(month.id)}
          isActive={month.id === activeMonthId}
        />
      ))}
    </div>
  );
};
