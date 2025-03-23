import { Button } from '@/components/ui/button';
import dayjs from '@/helpers/dayjs';
import { cn } from '@/lib/utils';
import { useYoutubeScreenTimeStore } from '@/store/youtube-screen-time.store';
import ms from 'ms';

const Card = ({ title, subTitle }: { title: string; subTitle: string }) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center border border-gray-200 p-2 rounded-md'
      )}
    >
      <span className="text-2xl font-bold">{title}</span>
      <span>{subTitle}</span>
    </div>
  );
};
export default function YoutubeViewer() {
  const { usageByDay, payDay } = useYoutubeScreenTimeStore();
  const dayPrice = 100;
  const average =
    usageByDay.reduce((acc, cur) => acc + cur.usageMs, 0) / usageByDay.length ||
    0;

  const totalHours =
    usageByDay.reduce((acc, cur) => acc + cur.usageMs, 0) / ms('1 hour');

  const exceededDays = usageByDay.filter(
    (item) => item.usageMs > average && !item.paid
  );

  const today = usageByDay[usageByDay.length - 1];

  return (
    <div className="container mx-auto py-4">
      <div className="grid grid-cols-4 gap-4 mb-4">
        <Card
          title={dayjs.duration(average, 'milliseconds').format('m [min]')}
          subTitle="Average"
        />

        <Card
          title={`${Math.ceil(totalHours)} H`}
          subTitle={`Total (${usageByDay.length} days)`}
        />
        <Card
          title={`$${exceededDays.length * dayPrice}`}
          subTitle={`Pay for ${exceededDays.length} days`}
        />

        <Card
          title={`${dayjs
            .duration(today?.usageMs || 0, 'milliseconds')
            .format('m [min]')}`}
          subTitle={`Today`}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-7">
        {exceededDays.toReversed().map((item) => (
          <div
            key={item.time}
            className={cn(
              'flex flex-col items-center border border-gray-200 p-2 rounded-md',
              item.usageMs > average && 'text-red-500'
            )}
          >
            <span className="text-2xl font-bold">
              {dayjs.duration(item.usageMs, 'milliseconds').format('HH:mm')}
            </span>
            <span>{dayjs(item.time).format('DD MMM, ddd')}</span>
            <Button
              className="w-full mt-2"
              variant="secondary"
              size="xs"
              onClick={() => payDay(item.time)}
            >
              Paid
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
