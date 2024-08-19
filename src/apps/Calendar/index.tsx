import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import dayjs from '@/helpers/dayjs';
import { EventType, useStore } from './store';
import CalendarDay from './Day';
import Form from './Form';
import { useUrlQ } from './useUrlQ';
import Hours from './Hours';
import { cn } from '@/lib/utils';

const CreateModal = () => {
  const { createEvent } = useStore();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button>Create</button>
      </DialogTrigger>

      <DialogContent className="max-w-5xl">
        <Form onSubmit={createEvent} />
      </DialogContent>
    </Dialog>
  );
};

const UpdateModal = ({
  onClose,
  event,
  open,
}: {
  open: boolean;
  onClose: () => void;
  event: EventType;
}) => {
  const { updateEvent, deleteEvent } = useStore();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl">
        <Form
          key={event.id}
          defaultValues={event}
          onSubmit={(values) => updateEvent(event.id, values)}
          onDelete={() => deleteEvent(event.id)}
        />
      </DialogContent>
    </Dialog>
  );
};

const CalendarPage = () => {
  const today = new Date();
  const [viewDays, setViewDays] = React.useState(4);
  const { events } = useStore();
  const { selectedEventId, updateModalClosed, setParams } = useUrlQ();
  const activeEvent = events.find((event) => event.id === selectedEventId);
  const [daysRef, setDaysRef] = React.useState<HTMLDivElement | null>(null);
  const [frameWidth, setFrameWidth] = React.useState(0);
  const colWidth = frameWidth / viewDays;
  const frameMaxWidth = daysRef ? frameWidth : undefined;

  const onEventClick = (event: EventType) =>
    setParams({ selectedEventId: event.id, updateModalClosed: false });

  const days = Array.from({ length: 14 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - 3 + i);

    return date;
  });

  useEffect(() => {
    // @ts-expect-error defined
    window.syncscroll?.reset();
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between px-4">
        <CreateModal />
        <select
          value={viewDays.toString()}
          onChange={(e) => setViewDays(Number(e.target.value))}
        >
          <option value="7">Week</option>
          <option value="1">Day</option>
          <option value="4">4 Days</option>
        </select>
      </div>
      <div
        className="syncscroll flex justify-between border-b overflow-x-scroll h-10 scrollbar-hidden ml-auto"
        style={{ maxWidth: frameMaxWidth }}
        scrollsync-name="scrollSyncPane"
      >
        {days.map((day) => (
          <div
            className={cn(
              'flex flex-1 justify-center',
              dayjs(today).isSame(day, 'day') && 'text-red-500'
            )}
            key={day.toISOString()}
            style={{ minWidth: colWidth }}
          >
            {day.toDateString()}
          </div>
        ))}
      </div>
      <div className="flex flex-col flex-auto min-h-0">
        <div className="flex flex-col items-stretch min-h-0 flex-auto">
          <div className="flex-initial min-h-0 overflow-x-hidden overflow-y-auto">
            <div
              className="flex justify-between flex-1 relative"
              style={{
                minHeight: 1000,
              }}
            >
              <Hours />
              <div
                className="syncscroll flex flex-1 overflow-x-scroll"
                style={{ maxWidth: frameMaxWidth }}
                scrollsync-name="scrollSyncPane"
                ref={(r) => {
                  setFrameWidth(r?.clientWidth as number);
                  setDaysRef(r);
                }}
              >
                {daysRef &&
                  days.map((day) => (
                    <CalendarDay
                      autoScroll={dayjs(today).isSame(day, 'day')}
                      className="border-r"
                      width={colWidth}
                      key={day.toISOString()}
                      day={day}
                      onEventClick={onEventClick}
                      events={events.filter(
                        (event) =>
                          dayjs(event.start).isSame(day, 'day') ||
                          dayjs(event.end).isSame(day, 'day')
                      )}
                    />
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {activeEvent && (
        <UpdateModal
          open={!updateModalClosed}
          onClose={() => setParams({ updateModalClosed: true })}
          event={activeEvent}
        />
      )}
    </div>
  );
};

export { CalendarPage as Component };
