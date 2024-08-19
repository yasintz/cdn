import React from 'react';
import dayjs from '@/helpers/dayjs';
import { Calendar } from '@/components/ui/calendar';
import ListTimePicker from '@/components/ListTimePicker';

type DateTimePickerProps = {
  value: Date;
  onChange: (value: Date) => void;
};

export const DateTimePicker = ({ value, onChange }: DateTimePickerProps) => {
  const time = dayjs(value).diff(dayjs(value).startOf('day'));

  const onDateChange = (date: Date) => {
    const newDate = dayjs(date).startOf('day').toDate();
    const newTime = dayjs(value).diff(dayjs(value).startOf('day'));

    onChange(dayjs(newDate).add(newTime).toDate());
  };

  const onTimeChange = (newTime: number) => {
    onChange(dayjs(value).startOf('day').add(newTime).toDate());
  };

  return (
    <div className="flex gap-3">
      <Calendar
        mode="single"
        selected={value}
        onSelect={onDateChange as any}
        className="rounded-md border"
      />
      <div className="rounded-md border h-80">
        <ListTimePicker time={time} setTime={onTimeChange} />
      </div>
    </div>
  );
};
