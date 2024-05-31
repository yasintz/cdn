import { PageHtmlProps } from 'src/helpers/page-html';

const Html = (props: PageHtmlProps) => {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/akyuz-hukuk/law.png" />
        <title>Akyuz Hukuk</title>
      </head>
      <body>
        <div id="root" />
        <script src="./src/main.tsx" type="module" />
      </body>
    </html>
  );
};

export default Html;
