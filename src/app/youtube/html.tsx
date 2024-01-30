import { PageHtmlProps } from 'src/helpers/page-html';

const Html = (props: PageHtmlProps) => {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/youtube/manifest.json" />
        <link rel="icon" type="image/png" href="/youtube/icon.png" />
        <title>Youtube</title>
      </head>
      <body>
        <div id="root" />
        <div id="modal-root"></div>
        <script src="./src/main.tsx" type="module" />
      </body>
    </html>
  );
};

export default Html;
