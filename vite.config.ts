import React from 'react';
import ReactDomServer from 'react-dom/server';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import tsconfigPaths from 'vite-tsconfig-paths';
import { createHtmlPlugin } from 'vite-plugin-html';

async function getHtml(app: string) {
  let html = '';
  const props = {
    app,
  };
  try {
    const htmlModule = await import(`./src/app/${app}/html.tsx`);
    html = ReactDomServer.renderToString(
      React.createElement(htmlModule.default, props)
    );
  } catch (error) {
    // @ts-ignore
    const htmlModule = await import(`./src/helpers/page-html.tsx`);
    html = ReactDomServer.renderToString(
      React.createElement(htmlModule.default, props)
    );
  }

  return html;
}

export default defineConfig(async () => {
  const selectedApp = process.env.PROJECT;

  return {
    plugins: [
      createHtmlPlugin({
        minify: true,
        entry: 'src/main.tsx',
        inject: {
          data: {
            content: await getHtml(selectedApp),
          },
        },
      }),
      react(),
      visualizer(),
      tsconfigPaths(),
    ],
    base: `/cdn/${selectedApp}/`,
    server: {
      port: 3007,
    },
    build: {
      outDir: 'build/vite',
    },
  };
});
