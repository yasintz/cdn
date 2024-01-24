import { PageHtmlProps } from 'src/helpers/page-html';

const Html = (props: PageHtmlProps) => {
  return (
    <html lang="en">
      <head>
        <script src="https://d3js.org/d3.v4.min.js"></script>
        <title>Family Tree</title>
      </head>
      <body>
        <div id="root"></div>
      </body>
    </html>
  );
};

export default Html;
