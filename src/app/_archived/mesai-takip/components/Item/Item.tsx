import React from 'react';
import dayjs from 'dayjs';
import { ItemType, PricesType } from 'src/app/mesai-takip/useStore';
import cx from 'classnames';
import styles from './styles.module.scss';
import { itemPriceCalculator } from 'src/app/mesai-takip/utils/calc';

function getTimeText(item: ItemType) {
  if (item.minute && item.hour) {
    return `${item.hour} saat ${item.minute} dakika`;
  }

  if (item.hour) {
    return `${item.hour} saat`;
  }
  if (item.minute) {
    return `${item.minute} dakika`;
  }
}

export function Item({
  item,
  active,
  onItemClick,
  prices,
}: {
  item: ItemType;
  active?: boolean;
  onItemClick: () => void;
  prices: PricesType;
}) {
  const dateInstance = React.useMemo(() => dayjs(item.date), [item.date]);

  const itemPrice = React.useMemo(
    () => Math.round(itemPriceCalculator(item, prices)),
    [item, prices]
  );
  const day = React.useMemo(
    () => dateInstance.format('DD MMMM, dddd'),
    [dateInstance]
  );

  return (
    <div>
      <div
        className={cx('item-container', styles.container, { active })}
        onClick={onItemClick}
      >
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <div className={styles.title}>{day}</div>
          </div>
          <div className={styles.subtitle}>
            {getTimeText(item)} → {itemPrice} TL
          </div>
          <div
            style={{
              display: 'table',
              tableLayout: 'fixed',
              width: '100%',
            }}
          >
            <div className={cx('text-overflow', styles.note)}>
              {item.note || 'Not eklemediniz...'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
