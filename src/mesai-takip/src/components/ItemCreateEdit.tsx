import { useState } from 'react';
import cx from 'classnames';
import Calendar from 'react-calendar';
import { ItemType } from '../useStore';

export function ItemEditCreate({
  item,
  onSave,
}: {
  item?: ItemType;
  onSave: (item: Omit<ItemType, 'id'>) => void;
}) {
  const [data, setData] = useState(() => ({
    date: item?.date ? new Date(item.date) : new Date(),
    hour: item?.hour?.toString() || '',
    minute: item?.minute?.toString() || '',
    note: item?.note || '',
  }));

  const onChange = (key: keyof typeof data) => (params: any) =>
    setData((prev) => ({ ...prev, [key]: params }));

  const onInputChange = (key: keyof typeof data) => (ev: any) =>
    setData((prev) => ({
      ...prev,
      [key]: ev.target.value,
    }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <div className="input">
          <span>Saat</span>
          <input
            value={data.hour}
            onChange={onInputChange('hour')}
            placeholder="00"
          />
        </div>
        <div className="input">
          <span>Dakika</span>
          <input
            value={data.minute}
            onChange={onInputChange('minute')}
            placeholder="00"
          />
        </div>
      </div>

      <div className="input" style={{ margin: '16px 0' }}>
        <span>Not</span>
        <textarea
          value={data.note}
          onChange={onInputChange('note')}
          placeholder="Notunuzu ekleyiniz..."
          rows={3}
        />
      </div>
      <Calendar onChange={onChange('date')} value={data.date} locale="tr-TR" />

      <button
        className={cx('button')}
        style={{ marginTop: 24 }}
        onClick={() =>
          onSave({
            hour: parseFloat(data.hour || '0'),
            minute: parseFloat(data.minute || '0'),
            note: data.note || '',
            date: data.date.toISOString(),
          })
        }
      >
        Kaydet
      </button>
    </div>
  );
}
