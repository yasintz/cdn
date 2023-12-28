import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BottomSheet } from 'react-spring-bottom-sheet';
import { useStore, ItemType } from './useStore';
import { Item } from './components/Item';
import { ItemEditCreate } from './components/ItemCreateEdit';
import { Month } from './components/Month';
import 'dayjs/locale/tr';

dayjs.locale('tr');

const snapPoints = () => window.innerHeight * 0.88;

const months = [
  'Ocak',
  'Subat',
  'Mart',
  'Nisan',
  'Mayis',
  'Haziran',
  'Temmuz',
  'Agustos',
  'Eylul',
  'Ekim',
  'Kasim',
  'Aralik',
];

function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeMonth, setActiveMonth] = useState(() => new Date().getMonth());
  const { items, addItem, updateItem, removeItem } = useStore();

  const listItems = useMemo(() => {
    const monthStart = dayjs().set('month', activeMonth).startOf('month');
    const monthEnd = monthStart.endOf('month');

    const startTime = monthStart.toDate().getTime();
    const endTime = monthEnd.toDate().getTime();
    return items
      .filter((i) => {
        const itemDate = dayjs(i.date).toDate().getTime();

        return itemDate >= startTime && itemDate <= endTime;
      })
      .sort((a, b) => dayjs(b.date).diff(a.date));
  }, [activeMonth, items]);

  const selectedItemId = searchParams.get('item');
  const selectedItem = items.find((i) => i.id === selectedItemId);

  const saveItem = (item: Omit<ItemType, 'id'>) => {
    if (selectedItemId) {
      updateItem(selectedItemId, item);
      return;
    }
    addItem({
      id: Math.random().toString(36).substring(2, 7),
      ...item,
    });

    setShowCreateModal(false);
    setSearchParams((prev) => ({
      ...prev,
      item: '',
    }));
  };

  return (
    <>
      <div style={{ height: '100%' }}>
        <button
          className="button"
          style={{ width: 'calc(100% - 32px)', margin: 16 }}
          onClick={() => setShowCreateModal(true)}
        >
          Ekle
        </button>

        <div
          style={{
            display: 'flex',
            padding: '4px 16px 12px 16px',
            overflowX: 'scroll',
            width: 'calc(100% - 32px)',
          }}
        >
          {months.map((month, index) => (
            <Month
              key={month}
              month={month}
              onClick={() => setActiveMonth(index)}
              isActive={index === activeMonth}
            />
          ))}
        </div>

        <div
          style={{
            padding: '0 16px',
            overflowY: 'scroll',
            height: '100%',
          }}
        >
          {listItems.map((item) => (
            <Item
              key={item.id}
              item={item}
              active={selectedItemId === item.id}
              onItemClick={() =>
                setSearchParams((prev) => ({ ...prev, item: item.id }))
              }
            />
          ))}
        </div>
      </div>

      <BottomSheet
        open={!!selectedItemId || showCreateModal}
        onDismiss={() => {
          setSearchParams((prev) => ({
            ...prev,
            item: '',
          }));
          setShowCreateModal(false);
        }}
        snapPoints={snapPoints}
      >
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column' }}>
          <ItemEditCreate
            key={selectedItem?.id}
            item={selectedItem}
            onSave={saveItem}
          />
          {selectedItemId && (
            <button
              className="button danger"
              style={{ marginTop: 12 }}
              onClick={() => {
                setSearchParams((prev) => ({
                  ...prev,
                  item: '',
                }));
                setTimeout(() => {
                  removeItem(selectedItemId);
                }, 0);
              }}
            >
              Sil
            </button>
          )}

          <button
            className="button secondary"
            style={{ marginTop: 12 }}
            onClick={() => {
              setSearchParams((prev) => ({
                ...prev,
                item: '',
              }));
              setShowCreateModal(false);
            }}
          >
            Kapat
          </button>
        </div>
      </BottomSheet>
    </>
  );
}

export default App;
