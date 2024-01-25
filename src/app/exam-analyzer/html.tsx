import { PageHtmlProps } from 'src/helpers/page-html';

const Html = (props: PageHtmlProps) => {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/exam-analyzer/manifest.json" />
        <link rel="icon" type="image/png" href="/exam-analyzer/icon.png" />
        <title>Exam Analyzer</title>
      </head>
      <body>
        <div id="root" />
        <script src="./src/main.tsx" type="module" />
      </body>
    </html>
  );
};

export default Html;
