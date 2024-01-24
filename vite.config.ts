import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [react(), visualizer()],
  base: '/cdn/',
  server: {
    port: 3007,
  },
  build: {
    outDir: 'build/vite',
  },
});
