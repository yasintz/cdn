import { useState } from 'react';
import Column from './Column';
import Header from './Header';
import { SimpleTodoType } from '../store';

const boardColumns: SimpleTodoType['status'][] = [
  'backlog',
  'inProgress',
  'done',
];

export default function SimpleTodoTracker() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  return (
    <div>
      <Header selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {boardColumns.map((status) => (
            <Column key={status} status={status} selectedDate={selectedDate} />
          ))}
        </div>
      </div>
    </div>
  );
}
