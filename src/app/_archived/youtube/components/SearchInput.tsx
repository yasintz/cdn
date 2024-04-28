import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { useNavigate, useSearchParams } from 'react-router-dom';

function getIdFromYoutubeUrl(u: string) {
  const url = new URL(u);

  if (url.hostname.includes('youtube')) {
    return url.searchParams.get('v');
  }
}
function getIdFromGoogleUrl(u: string) {
  const url = new URL(u);
  const urlParam = url.searchParams.get('url');

  return urlParam && getIdFromYoutubeUrl(urlParam);
}
function getIdFromYoutubeShortUrl(u: string) {
  const url = new URL(u);

  if (url.hostname === 'youtu.be') {
    return url.pathname.substring(1);
  }
}

export const SearchInput = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search_query');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const onSubmit = () => {
    const inputValue = inputRef.current?.value;

    if (inputValue?.startsWith('http')) {
      const videoIdFromUrl =
        getIdFromYoutubeUrl(inputValue) ||
        getIdFromGoogleUrl(inputValue) ||
        getIdFromYoutubeShortUrl(inputValue);

      if (videoIdFromUrl) {
        navigate(`/watch?v=${videoIdFromUrl}`);
        return;
      }
    }

    navigate(`/results?search_query=${inputRef.current?.value}`);
  };

  return (
    <div className="flex w-full max-w-2xl items-center space-x-2 mx-auto">
      <Input
        placeholder=""
        defaultValue={searchQuery || ''}
        ref={inputRef}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onSubmit();
          }
        }}
      />
      <Button onClick={onSubmit} variant="outline">
        Search
      </Button>
    </div>
  );
};
