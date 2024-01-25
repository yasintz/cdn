import { PageHtmlProps } from 'src/helpers/page-html';

const Html = (props: PageHtmlProps) => {
  return (
    <html lang="en">
      <head>
        <script src="https://d3js.org/d3.v4.min.js"></script>
        <link rel="manifest" href="/family-tree/manifest.json" />
        <link rel="icon" type="image/png" href="/family-tree/icon.png" />
        <title>Family Tree</title>
      </head>
      <body>
        <div id="root" />
        <script src="./src/main.tsx" type="module" />
      </body>
    </html>
  );
};

export default Html;
