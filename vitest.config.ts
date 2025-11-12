import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default defineConfig(
  mergeConfig(viteConfig, {
    test: {
      setupFiles: ['./src/test-setup.ts'],
    },
  })
);
