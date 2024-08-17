import React from 'react';

type VideoProps = {
  videoUrl: string;
  videoRef: React.RefObject<HTMLVideoElement>;
};

const Video = ({ videoRef, videoUrl }: VideoProps) => {
  const onKeyPress: React.KeyboardEventHandler<HTMLVideoElement> =
    React.useCallback(
      (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.key === 'ArrowRight' && videoRef.current) {
          videoRef.current.currentTime -= 50;
        }

        if (e.key === 'ArrowLeft' && videoRef.current) {
          videoRef.current.currentTime += 50;
        }
      },
      [videoRef]
    );

  return (
    <video
      src={videoUrl}
      ref={videoRef}
      onKeyDown={onKeyPress}
      controls
      className="outline-none"
    />
  );
};

export default Video;
