import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(async ({ command, mode }) => {
  return {
    plugins: [
      react(),
      tsconfigPaths(),
      mode === 'analyze' && visualizer({ open: true }),
    ],
    base: `/mustafa-akyuz/`,
    server: {
      port: 3007,
    },
  };
});
