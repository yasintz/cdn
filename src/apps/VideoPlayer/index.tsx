import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import OldVideoPlayer from './old';
import './style.scss';
import { Button } from '@/components/ui/button';

const VideoPlayer = () => {
  const [searchParams] = useSearchParams();
  const videoId = searchParams.get('video_id');
  const season = searchParams.get('s');
  const episode = searchParams.get('e');
  const [subtitle, setSubtitle] = useState('');
  const parentDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.addEventListener('message', function (event) {
      if (event.origin.includes('streambucket')) {
        setSubtitle(event.data);
      }
    });
  }, []);

  if (!videoId) {
    return <OldVideoPlayer />;
  }

  return (
    <div>
      <div className="w-full relative" ref={parentDivRef}>
        <iframe
          className="w-full h-full min-h-96"
          src={`https://multiembed.mov/directstream.php?video_id=${videoId}${
            season ? `&s=${season}&e=${episode}` : ''
          }`}
        />
        <div
          className="video-player-caption w-full text-center mt-2 absolute bottom-24 z-50 text-white text-3xl"
          dangerouslySetInnerHTML={{ __html: subtitle }}
        />
      </div>
      <Button onClick={() => parentDivRef.current?.requestFullscreen()}>
        Full Screen
      </Button>
    </div>
  );
};

export default VideoPlayer;
