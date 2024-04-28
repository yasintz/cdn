import { useMemo, useState } from 'react';
import cx from 'classnames';
import Calendar from 'react-calendar';
import { ItemType } from 'src/app/mesai-takip/useStore';
import { YesNoToggle } from '../YesNoToggle/YesNoToggle';

export function ItemEditCreate({
  item,
  onSave,
  onRemove,
}: {
  item?: ItemType;
  onSave: (item: Omit<ItemType, 'id'>) => void;
  onRemove?: () => void;
}) {
  const [data, setData] = useState({
    ...item,
    date: item?.date || new Date().toISOString(),
  } as ItemType);

  const itemDate = useMemo(() => new Date(data.date), [data.date]);

  const onChange = (key: keyof ItemType) => (params: any) =>
    setData((prev) => ({ ...prev, [key]: params }));

  const onInputChange = (key: keyof ItemType) => (ev: any) =>
    setData((prev) => ({
      ...prev,
      [key]: ev.target.value,
    }));

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: '1rem',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div className="input">
          <span>Saat</span>
          <input
            value={data.hour}
            onChange={onInputChange('hour')}
            placeholder="00"
            type="number"
          />
        </div>
        <div className="input">
          <span>Dakika</span>
          <input
            value={data.minute}
            onChange={onInputChange('minute')}
            placeholder="00"
            type="number"
          />
        </div>
      </div>

      <div>
        <div className="input">
          <span>Not</span>
          <textarea
            value={data.note}
            onChange={onInputChange('note')}
            placeholder="Notunuzu ekleyiniz..."
            rows={3}
          />
        </div>
      </div>

      <Calendar onChange={onChange('date')} value={itemDate} locale="tr-TR" />

      <YesNoToggle
        title="Bugun resmi bir tatil mi?"
        status={Boolean(data.isPublicHoliday)}
        onChange={onChange('isPublicHoliday')}
      />

      <button
        className={cx('button')}
        onClick={() =>
          onSave({
            ...data,
            hour: parseFloat(data.hour?.toString() || '0'),
            minute: parseFloat(data.minute?.toString() || '0'),
            note: data.note || '',
            date: new Date(data.date).toISOString(),
          })
        }
      >
        Kaydet
      </button>
      {onRemove && (
        <button
          className="button danger"
          onClick={() => {
            if (confirm('Silmek istediginize eminmisiniz?')) {
              onRemove();
            }
          }}
        >
          Sil
        </button>
      )}
    </div>
  );
}
