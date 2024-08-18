import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import dayjs from '@/helpers/dayjs';
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import ListTimePicker from '@/components/ListTimePicker';

const CreateModal = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button>Create</button>
      </DialogTrigger>

      <DialogContent className="max-w-full md:max-w-[470px]">
        <DialogHeader>
          <DialogTitle>Create / Update</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Title
            </Label>
            <Input
              //   value={value.name}
              //   onChange={(e) => onChange({ ...value, name: e.target.value })}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="flex justify-between">
          <Calendar
            mode="single"
            // selected={date}
            // onSelect={(d) => onChange({ ...value, date: d?.getTime() })}
            className="rounded-md border"
          />
          <div className="rounded-md border h-80">
            <ListTimePicker time={0} setTime={() => 0} />
          </div>
        </div>

        <DialogFooter>
          <Button>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const CalendarPage = () => {
  const [viewStart, setViewStart] = React.useState(new Date());
  const [viewDays, setViewDays] = React.useState(7);

  const days = Array.from({ length: viewDays }, (_, i) => {
    const date = new Date(viewStart);
    date.setDate(date.getDate() + i);

    return date;
  });

  return (
    <div className="flex flex-col flex-1">
      <div className="flex justify-between px-4">
        <button
          onClick={() =>
            setViewStart(dayjs(viewStart).subtract(viewDays, 'day').toDate())
          }
        >
          Prev
        </button>
        <CreateModal />
        <button
          onClick={() =>
            setViewStart(dayjs(viewStart).add(viewDays, 'day').toDate())
          }
        >
          Next
        </button>
      </div>
      <div className="flex justify-between flex-1">
        {days.map((day) => (
          <div
            className="px-4 flex-1 bg-red-100 border-r"
            key={day.toISOString()}
          >
            {day.toDateString()}
          </div>
        ))}
      </div>
    </div>
  );
};

export { CalendarPage as Component };
