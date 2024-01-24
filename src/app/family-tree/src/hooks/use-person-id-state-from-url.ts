import { useEffect, useRef, useState } from 'react';

export function usePersonIdStateFromUrl() {
  const [personId, setPersonId] = useState<string>();

  const initializedRef = useRef(false);

  useEffect(() => {
    const url = new URL(window.location.href);

    if (!initializedRef.current) {
      initializedRef.current = true;

      const userFromUrl = url.searchParams.get('user');

      if (userFromUrl) {
        setPersonId(userFromUrl);
      }

      return;
    }

    url.searchParams.delete('user');
    if (personId) {
      url.searchParams.append('user', personId);
    }

    const newUrl = url.toString();
    window.history.pushState({ path: newUrl }, '', newUrl);
  }, [personId]);

  return [personId, setPersonId] as const;
}
