import { defineConfig, PluginOption, ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import fs from 'fs';
import path from 'path';
import vitePluginImportus from 'vite-plugin-importus';

function serveHtml(): PluginOption {
  return {
    apply: 'serve',
    configureServer(server: ViteDevServer) {
      return () => {
        server.middlewares.use(async (req, res, next) => {
          if (req.originalUrl?.endsWith('html')) {
            res.setHeader('Content-Type', 'text/html');
            res.writeHead(200);
            res.write(
              fs.readFileSync(path.join(__dirname, `public/${req.originalUrl}`))
            );
            res.end();
          }

          next();
        });
      };
    },
    name: 'charting-library',
  };
}

export default defineConfig({
  plugins: [
    react(),
    visualizer(),
    vitePluginImportus([
      // {
      //   libraryName: 'lodash',
      //   libraryDirectory: 'es',
      //   camel2DashComponentName: false,
      //   customName: (formatted: string) => `lodash/${formatted}`,
      // },
    ]),
  ],
  base: '/cdn/',
  server: {
    port: 3007,
  },
  build: {
    outDir: 'build/vite',
  },
});
