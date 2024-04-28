import { useSearchParams } from 'react-router-dom';
import { SearchInput } from '../../components/SearchInput';

type WatchPageProps = {};

export const WatchPage = (props: WatchPageProps) => {
  const [searchParams] = useSearchParams();
  const watchVideoId = searchParams.get('v');

  return (
    <div className="flex flex-col gap-6 pt-4">
      <SearchInput />
      <iframe
        src={`https://www.youtube.com/embed/${watchVideoId}?rel=0`}
        title="YouTube video player"
        frameBorder={0}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-screen w-screen"
      />
    </div>
  );
};
