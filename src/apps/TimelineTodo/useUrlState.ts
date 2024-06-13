import { useSearchParams } from 'react-router-dom';

export function useUrlState() {
  const [searchParams, setSearchParams] = useSearchParams();

  return {
    archivedSessionsShown: searchParams.get('showArchived') === 'true',
    batchTimeUpdatingEnabled: searchParams.get('batchTimeUpdating') === 'true',
    sessionSortingEnabled: searchParams.get('sessionSorting') === 'true',
    setSearchParams,
  };
}
