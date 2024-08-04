import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import LocalVideoPlayer from './local';
import { FullscreenIcon } from 'lucide-react';
import './style.scss';

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
    return <LocalVideoPlayer />;
  }

  return (
    <div className="new-video-player w-full relative h-full" ref={parentDivRef}>
      <iframe
        className="w-full h-full"
        src={`https://multiembed.mov/directstream.php?video_id=${videoId}${
          season ? `&s=${season}&e=${episode}` : ''
        }`}
      />
      <pre
        className="video-player-caption"
        dangerouslySetInnerHTML={{ __html: subtitle }}
      />
      <div className="text-white absolute bottom-2 right-2 bg-black p-1 opacity-0 hover:opacity-100">
        <FullscreenIcon
          onClick={() => document.documentElement.requestFullscreen()}
        />
      </div>
    </div>
  );
};

export default VideoPlayer;
