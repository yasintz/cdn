import { useState } from 'react';
import Column from './Column';
import Header from './Header';
import dayjs from '@/helpers/dayjs';
import { SIMPLE_TODO_DATE_FORMAT } from '../store/utils';

const boardColumns = ['backlog', 'done'];

export default function SimpleTodoTracker() {
  const [selectedDate, setSelectedDate] = useState(() =>
    dayjs().format(SIMPLE_TODO_DATE_FORMAT)
  );

  return (
    <div className="container mx-auto p-4">
      <Header selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {boardColumns.map((status) => (
          <Column
            key={status}
            status={status}
            selectedDate={selectedDate}
            updateSelectedDate={setSelectedDate}
          />
        ))}
      </div>
    </div>
  );
}