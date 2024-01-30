import _ from 'lodash';
import React, { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SearchInput } from '../../components/SearchInput';

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
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search_query');
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: () => youtubeSearch(searchQuery!),
    enabled: Boolean(searchQuery),
  });

  return (
    <div>
      <SearchInput />
      <div className="videos">
        {data?.videos?.slice(0, 3).map((video: any) => (
          <div
            key={video.videoId}
            className="video"
            onClick={() => navigate(`/watch?v=${video.videoId}`)}
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
          </div>
        ))}
      </div>
    </div>
  );
};
