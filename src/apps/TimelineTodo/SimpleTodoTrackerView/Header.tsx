import { Button } from '@/components/ui/button';
import React, { useLayoutEffect } from 'react';

const getDaysInMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  return new Date(year, month + 1, 0).getDate();
};

type HeaderProps = {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
};

const Header = ({ selectedDate, setSelectedDate }: HeaderProps) => {
  const today = new Date();
  const daysInMonth = Array.from({ length: getDaysInMonth(today) });

  useLayoutEffect(() => {
    const selectedDay = document.querySelector('div[data-day-selected="true"]');

    if (selectedDay) {
      selectedDay.scrollIntoView({ behavior: 'instant', block: 'center' });
    }
  }, []);

  return (
    <div className="flex pt-4 pb-2 px-4 mb-2 overflow-x-scroll gap-3">
      {daysInMonth.map((_, i) => {
        const date = new Date(today.getFullYear(), today.getMonth(), i);
        const dateString = date.toISOString().split('T')[0];
        return (
          <div
            key={i}
            className="w-10 h-10 p-0"
            data-day-selected={dateString === selectedDate}
          >
            <Button
              variant={dateString === selectedDate ? 'default' : 'outline'}
              onClick={() => setSelectedDate(dateString)}
            >
              {i}
            </Button>
          </div>
        );
      })}
    </div>
  );
};

export default Header;
