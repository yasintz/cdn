import _ from 'lodash';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { SearchInput } from '../../components/SearchInput';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/loading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldX, Info } from 'lucide-react';

function getYoutubeVideosFromSearch(json: any) {
  return json?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents
    ?.map((i: any) => i.videoRenderer)
    .filter((i: any) => i)
    .map((video: any) => ({
      ...video,
      metadata: {
        imgSrc: _.orderBy(
          video?.thumbnail?.thumbnails || [],
          'width',
          'desc'
        )[0]?.url,
        title: video.title?.runs?.[0]?.text,
        time: video.lengthText?.simpleText,
      },
    }));
}

async function youtubeSearch(query: string) {
  const baseUrl = new URL('https://cors-hijacker.vercel.app/api');
  const youtubeUrl = new URL('https://www.youtube.com/results');
  youtubeUrl.searchParams.set('search_query', query);

  baseUrl.searchParams.set('url', youtubeUrl.toString());

  const fetchOptions = {
    headers: {
      'Content-Type': 'text/html',
      Authorization: 'some-token-here',
    },
  };

  const res = await fetch(baseUrl, fetchOptions);
  const htmlText = await res.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, 'text/html');

  let json = {} as any;

  doc.querySelectorAll('script').forEach((sc) => {
    if (sc.innerHTML.includes('var ytInitialData')) {
      const jsonStr = sc.innerHTML
        .replace('var ytInitialData =', '')
        .replace('};', '}');

      json = JSON.parse(jsonStr);
    }
  });

  json.videos = getYoutubeVideosFromSearch(json);
  return json;
}

type SearchPageProps = {};

export const SearchPage = (props: SearchPageProps) => {
  const [limit, setLimit] = useState(3);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search_query');

  const { data, isLoading, error } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: () => youtubeSearch(searchQuery!),
    enabled: Boolean(searchQuery),
  });

  return (
    <div className="py-8">
      <SearchInput />
      <div className="videos max-w-2xl mx-auto mt-8">
        {error && (
          <Alert variant="destructive">
            <ShieldX className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Something went wrong</AlertDescription>
          </Alert>
        )}
        {isLoading && <Loading />}
        {data?.videos?.length === 0 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>No Data</AlertTitle>
            <AlertDescription>Result is empty</AlertDescription>
          </Alert>
        )}
        {data?.videos?.slice(0, limit).map((video: any) => (
          <Link
            to={`/watch?v=${video.videoId}`}
            className="video"
            key={video.videoId}
          >
            <div className="thumbnail">
              <img src={video.metadata.imgSrc} />
              <div className="time">{video.metadata.time}</div>
            </div>
            <div>
              <div className="title">
                {_.truncate(video.metadata.title, { length: 32 })}
              </div>
              <div>{video.publishedTimeText.simpleText}</div>
            </div>
          </Link>
        ))}
        {data?.videos && (
          <Button onClick={() => setLimit((prev) => prev + 3)}>
            Load More
          </Button>
        )}
      </div>
    </div>
  );
};
