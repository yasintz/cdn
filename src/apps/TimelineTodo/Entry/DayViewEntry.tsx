import { EntryType, useStore } from '../store';
import dayjs from '@/helpers/dayjs';
import ms from 'ms';
import { cn } from '@/lib/utils';
import { useDayViewItemStyle } from '../DayView/utils';
import { getTagColor } from '../utils/tags';
import { useUrlQ } from '../useUrlState';
import { showDiff } from './utils';

type DayViewEntryProps = {
  entry: EntryType;
};

const DayViewEntry = (props: DayViewEntryProps) => {
  const { getRelations } = useStore();
  const { dayViewSelectedEntryId, setParams } = useUrlQ();

  const relations = getRelations();
  const entry = relations.entries.find((e) => e.id === props.entry.id)!;
  const entryTodos = entry.todos();
  const startTime = entry.time;
  const endTime = entry.time + entry.duration;
  const isSmall = entry.duration < ms('40 minutes');

  const dayViewPositionStyle = useDayViewItemStyle({
    startTime,
    endTime,
  });

  const lastTag = entry.tags[entry.tags.length - 1];
  const isActive = dayViewSelectedEntryId === entry.id;

  const { backgroundColor, color } = getTagColor(lastTag || 'un-categorized');

  return (
    <div
      className={cn(
        'flex border px-4 rounded-md select-none cursor-grab',
        !isSmall && 'flex-col pt-2',
        isSmall && 'items-center gap-4'
      )}
      style={{
        ...dayViewPositionStyle,
        backgroundColor,
        color,
        borderColor: isActive ? '#1276f0' : backgroundColor,
      }}
      onClick={() => setParams({ dayViewSelectedEntryId: entry.id })}
    >
      <div className="text-sm font-medium">
        {entryTodos.map((i) => i.text).join(' ~ ')}
      </div>
      <div className="text-xs">
        {dayjs.duration(startTime).format('HH:mm')}
        {' - '}
        {dayjs.duration(endTime).format('HH:mm')} ({showDiff(entry.duration)})
      </div>
    </div>
  );
};

export default DayViewEntry;
