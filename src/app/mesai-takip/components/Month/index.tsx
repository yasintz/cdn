import cx from 'classnames';
import styles from './style.module.scss';

type MonthProps = {
  month: string;
  onClick: () => void;
  isActive: boolean;
};

export const Month = ({ month, onClick, isActive }: MonthProps) => {
  return (
    <div
      key={month}
      onClick={onClick}
      className={cx(styles.container, isActive && styles.active)}
    >
      {month}
    </div>
  );
};
