import { useState } from 'react';
import Column from './Column';
import Header from './Header';
import { SimpleTodoType } from '../store';
import dayjs from '@/helpers/dayjs';

const boardColumns: SimpleTodoType['status'][] = ['backlog', 'done'];

export default function SimpleTodoTracker() {
  const [selectedDate, setSelectedDate] = useState(() =>
    dayjs().format('YYYY-MM-DD')
  );

  return (
    <div className="container mx-auto p-4">
      <Header selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {boardColumns.map((status) => (
          <Column key={status} status={status} selectedDate={selectedDate} />
        ))}
      </div>
    </div>
  );
}
