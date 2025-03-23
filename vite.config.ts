import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';
import { visualizer } from 'rollup-plugin-visualizer';
import { typeToSchemaPlugin } from './vite-plugins/json-schema-generator';
import { generateRoutesPlugin } from './vite-plugins/generate-routes';

const isAnalyze = process.argv.includes('--analyze');

export default defineConfig({
  plugins: [
    typeToSchemaPlugin(),
    generateRoutesPlugin(),
    react(),
    tsconfigPaths(),
    isAnalyze && {
      name: 'rename-index-files',
      apply: 'build',
      generateBundle(options, bundle) {
        Object.keys(bundle).forEach((fileName) => {
          const file = bundle[fileName];

          if (file.type === 'chunk') {
            // const allowedKeys = ['facadeModuleId', 'fileName', 'type'];
            // console.log(
            //   fileName,
            //   Object.keys(file).reduce((acc, key) => {
            //     if (!allowedKeys.includes(key)) {
            //       acc[key] = '<REMOVED>';
            //     }
            //     return acc;
            //   }, file)
            // );
          }
          const shouldRename =
            file &&
            file.type === 'chunk' &&
            (file.facadeModuleId?.endsWith('/index.tsx') ||
              file.facadeModuleId?.endsWith('/index.ts') ||
              file.facadeModuleId?.endsWith('/router.tsx'));

          if (file && file.type === 'chunk' && shouldRename) {
            const dirName = path.basename(path.dirname(file.facadeModuleId));
            const filePart = file.facadeModuleId.split('/').pop().split('.')[0];
            const newFileName = `assets/${dirName}-${filePart}.js`;
            bundle[newFileName] = { ...file, fileName: newFileName };
            delete bundle[fileName];
          }
        });
      },
    },
    isAnalyze &&
      visualizer({
        open: false,
        template: 'sunburst',
      }),
  ],
  base: `/cdn/`,
  server: {
    port: 3008,
  },
});
