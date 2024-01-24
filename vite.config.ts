import React from 'react';
import fs from 'fs';
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
function createEntries(app: string) {
  const templateContent = fs.readFileSync('./src/main.template.tsx', 'utf-8');

  fs.writeFileSync(
    `./src/dist/${app}.tsx`,
    templateContent.replace('{app-path}', app)
  );
  fs.writeFileSync(`./src/dist/${app}.html`, `<!DOCTYPE html> <%- content %>`);
}

export default defineConfig(async ({ command }) => {
  const selectedApp = process.env.PROJECT;
  const apps = await Promise.all(
    fs.readdirSync('./src/app').map(async (app) => {
      const content = await getHtml(app);
      return { app, content };
    })
  );

  apps.forEach((app) => createEntries(app.app));

  return {
    plugins: [
      command === 'serve' &&
        createHtmlPlugin({
          minify: true,
          entry: 'src/main.tsx',
          inject: {
            data: {
              content: await getHtml(selectedApp),
            },
          },
        }),
      command === 'build' &&
        createHtmlPlugin({
          minify: true,
          pages: apps.map(({ app, content }) => ({
            filename: `${app}.html`,
            // template: 'index.html',
            template: `src/dist/${app}.html`,
            entry: `./${app}.tsx`,
            injectOptions: {
              data: {
                content: content,
              },
            },
          })),
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
