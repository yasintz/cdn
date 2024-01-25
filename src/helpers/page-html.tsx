export type PageHtmlProps = {
  app: string;
};

const Html = (props: PageHtmlProps) => {
  return (
    <html lang="en">
      <head>
        <title>{props.app}</title>
      </head>
      <body>
        <div id="root"></div>
        <script src="./src/main.tsx" type="module" />
      </body>
    </html>
  );
};

export default Html;
