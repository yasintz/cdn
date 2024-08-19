import dayjs from 'dayjs';

import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import isBetween from 'dayjs/plugin/isBetween';
import utc from 'dayjs/plugin/utc'
import minMax from 'dayjs/plugin/minMax'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(isBetween);
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(minMax)

export default dayjs;
