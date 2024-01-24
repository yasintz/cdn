import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import tsconfigPaths from 'vite-tsconfig-paths';
import { createHtmlPlugin } from 'vite-plugin-html';

export default defineConfig(async () => {
  return {
    plugins: [
      createHtmlPlugin({
        minify: true,
        entry: 'src/main.tsx',
      }),
      react(),
      visualizer(),
      tsconfigPaths(),
    ],
    base: `/cdn/${process.env.PROJECT}/`,
    server: {
      port: 3007,
    },
    build: {
      outDir: 'build/vite',
    },
  };
});
