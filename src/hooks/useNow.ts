import { useEffect, useState } from 'react';

export default function useNow(interval: number = 1000) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const intervalInstance = setInterval(() => setNow(Date.now()), interval);

    return () => clearInterval(intervalInstance);
  }, [interval]);

  return now;
}
