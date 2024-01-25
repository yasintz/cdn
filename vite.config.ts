import fs from 'fs-extra';
import React from 'react';
import ReactDomServer from 'react-dom/server';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import tsconfigPaths from 'vite-tsconfig-paths';

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

async function editMainEntry(selectedApp: string, command: string) {
  const templateContent = fs.readFileSync('./src/main.template.tsx', 'utf-8');

  // const apps = fs.readdirSync('./src/app');
  // const allImports = apps.map((app, index) => {
  //   const componentName = `C${index}`;
  //   const importScript = `const ${componentName} = React.lazy(() => import('src/app/${app}'));`;
  //   return { componentName, importScript };
  // });

  fs.writeFileSync(
    './src/main.tsx',
    templateContent.replace(
      '// {import}',
      `import App from 'src/app/${selectedApp}'`
    )
  );

  fs.writeFileSync(
    './index.html',
    `<!DOCTYPE html>${await getHtml(selectedApp)}`
  );
}

export default defineConfig(async ({ command }) => {
  const selectedApp = process.env.PROJECT;

  await editMainEntry(selectedApp, command);

  return {
    plugins: [react(), visualizer(), tsconfigPaths()],
    base: `/cdn/${command === 'serve' ? `${selectedApp}/` : ''}`,
    server: {
      port: 3007,
    },
    build: {
      outDir: 'build/vite',
    },
  };
});
