import { useEffect, useState } from 'react';
import ms from 'ms';

type Params =
  | {
      interval: number | string;
    }
  | number;
export default function useNow(params?: Params) {
  const interval =
    typeof params === 'number' ? params : params?.interval ?? 1000;

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const intervalMs = typeof interval === 'string' ? ms(interval) : interval;
    const intervalInstance = setInterval(() => setNow(Date.now()), intervalMs);

    return () => clearInterval(intervalInstance);
  }, [interval]);

  return now;
}
