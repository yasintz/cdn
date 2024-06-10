import { useSearchParams } from 'react-router-dom';

export function useUrlState() {
  const [searchParams, setSearchParams] = useSearchParams();

  return {
    tagsShown: searchParams.get('tagsShown') === 'true',
    archivedSessionsShown: searchParams.get('showArchived') === 'true',
    batchTimeUpdatingEnabled: searchParams.get('batchTimeUpdating') === 'true',
    setSearchParams,
  };
}
