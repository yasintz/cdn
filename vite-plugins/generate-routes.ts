import { Plugin } from 'vite';
import path from 'path';
import fs from 'fs';

const initialFolder = 'src/app';

type DefinedRoute = {
  path: string;
};

function createRoutes(folder): DefinedRoute[] {
  const files = fs.readdirSync(folder);

  const filesWithStats = files.map((file) => {
    const filePath = path.join(folder, file);
    const stat = fs.statSync(filePath);

    return {
      file,
      filePath,
      stat,
    };
  });

  const directories = filesWithStats.filter((file) => file.stat.isDirectory());

  const subRoutes = directories.map((dir) => createRoutes(dir.filePath)).flat();

  const routes = [];

  const isPageFileExists = fs.existsSync(path.join(folder, 'page.tsx'));

  if (isPageFileExists) {
    routes.push({
      path: folder.replace(`${initialFolder}/`, ''),
    });
  }

  return [...routes, ...subRoutes];
}

const routes = createRoutes(initialFolder).flat();

function convertPath(route: DefinedRoute) {
  return route.path.split('[').join(':').split(']').join('');
}

function importRoute(route: DefinedRoute) {
  return `import('../app/${route.path}/page').then((res) => ({ Component: res.default }))`;
}

export function generateRoutesPlugin(): Plugin {
  return {
    name: 'vite-plugin-generate-routes',
    enforce: 'pre',
    async transform(code) {
      if (code.includes('$DEFINED_ROUTES')) {
        const lines = code.split('\n');

        return lines
          .map((line) => {
            if (!line.includes('$DEFINED_ROUTES')) {
              return line;
            }

            if (line.includes('declare const')) {
              return line;
            }
            return line.replace(
              '$DEFINED_ROUTES',
              `[
              ${routes
                .map(
                  (r) =>
                    `{ path: '${convertPath(r)}', lazy: () => ${importRoute(
                      r
                    )} }`
                )
                .join(',\n')}
            ]`
            );
          })
          .join('\n');
      }
    },
  };
}
