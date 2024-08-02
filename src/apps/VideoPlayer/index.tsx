import React, { useEffect, useMemo, useRef, useState } from 'react';
import srtParser2 from 'srt-parser-2';
import './style.scss';

const parser = new srtParser2();

const VideoPlayer = () => {
  const [videoFile, setVideoFile] = useState<File>();
  const [srt, setSrt] = useState<string>();
  const [activeSubtitle, setActiveSubtitle] = useState<string>();
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoUrl = useMemo(() => {
    if (!videoFile) {
      return undefined;
    }

    const objectUrl = URL.createObjectURL(videoFile);

    return objectUrl;
  }, [videoFile]);

  const subtitle = useMemo(() => {
    if (!srt) {
      return [];
    }

    const srtArray = parser.fromSrt(srt);

    return srtArray;
  }, [srt]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!videoRef.current || !subtitle.length) {
        return;
      }

      const currentSeconds = videoRef?.current?.currentTime;

      const currentSubtitle = subtitle.find(
        (s) =>
          s.startSeconds <= currentSeconds && s.endSeconds >= currentSeconds
      );

      setActiveSubtitle(currentSubtitle?.text);
    }, 250);

    return () => {
      clearInterval(interval);
    };
  }, [subtitle]);

  if (!videoFile) {
    return (
      <div>
        <label>
          Subtitle:{' '}
          <input
            type="file"
            onChange={(e) => {
              const reader = new FileReader();

              reader.addEventListener('load', (e) => {
                setSrt(e.target?.result as string);
              });

              reader.readAsText(e.target.files?.[0] as any);
            }}
          />
        </label>

        <label>
          Video:{' '}
          <input
            type="file"
            onChange={(e) => {
              setVideoFile(e.target.files?.[0]);
            }}
          />
        </label>
      </div>
    );
  }

  return (
    <div>
      <div className="video-player">
        <video src={videoUrl} ref={videoRef} controls />
        {srt && <pre className="video-player-caption">{activeSubtitle}</pre>}
      </div>
      <button
        onClick={() => videoRef.current?.parentElement?.requestFullscreen()}
      >
        Full Screen
      </button>
    </div>
  );
};

export default VideoPlayer;
