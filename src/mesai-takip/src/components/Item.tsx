import React from 'react';
import dayjs from 'dayjs';
import { ItemType } from '../useStore';
import { dayColors } from '../colors';
import cx from 'classnames';

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
}: {
  item: ItemType;
  active?: boolean;
  onItemClick: () => void;
}) {
  const timeText = getTimeText(item);

  const dateInstance = React.useMemo(() => dayjs(item.date), [item.date]);

  const day = React.useMemo(() => dateInstance.format('DD'), [dateInstance]);

  const date = React.useMemo(() => dateInstance.format('dddd'), [dateInstance]);

  return (
    <div>
      <div className={cx('item-container', { active })} onClick={onItemClick}>
        <div
          className="item-image"
          style={{ backgroundColor: dayColors[date] }}
        >
          {day}
        </div>
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 8,
            }}
          >
            <div style={{ fontWeight: 600, color: '#313c47' }}>{timeText}</div>

            <div
              style={{
                color: '#989898',
                fontSize: 14,
                fontStyle: 'italic',
                fontWeight: 300,
              }}
            >
              {date}
            </div>
          </div>
          <div
            style={{
              display: 'table',
              tableLayout: 'fixed',
              width: '100%',
            }}
          >
            <div
              className="text-overflow"
              style={{
                display: 'table-cell',
                color: item.note ? undefined : 'gray',
                fontWeight: item.note ? undefined : 200,
              }}
            >
              {item.note || 'Not eklemediniz...'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
