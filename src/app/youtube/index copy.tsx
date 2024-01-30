import React from 'react';
import './app.scss';

type YoutubeAppProps = {};

const YoutubeApp = (props: YoutubeAppProps) => {
  React.useEffect(() => {
    const searchParams = new URLSearchParams(document.location.search);
    const iframe = document.querySelector('iframe')!;
    const input = document.querySelector('input')!;
    const watchButton = document.querySelector('button.watch')!;
    const reloadButton = document.querySelector('button.reload')!;

    const videoId = searchParams.get('v');

    if (videoId) {
      iframe.src = `https://www.youtube.com/embed/${videoId}`;
      reloadButton.addEventListener('click', () => {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('v');
        window.location.href = newUrl;
      });

      input.remove();
      watchButton.remove();
    } else {
      reloadButton.remove();
      iframe.remove();
      watchButton.addEventListener('click', () => {
        const videoUrl = new URL(input.value);
        let id = videoUrl.searchParams.get('v')!;
        if (videoUrl.host === 'youtu.be') {
          id = videoUrl.pathname.replace('/', '');
        }
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.append('v', id);
        window.location.href = newUrl;
      });
    }
  }, []);

  return (
    <>
      <iframe
        src="https://www.youtube.com/embed/bs_OXGfw2xo"
        title="YouTube video player"
        frameBorder={0}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
      <input placeholder="https://www.youtube.com/watch?v=bs_OXGfw2xo" />
      <button className="watch">Watch</button>
      <button className="reload">Home</button>
    </>
  );
};

export default YoutubeApp;
