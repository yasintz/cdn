import fs from 'fs';
import { execSync } from 'child_process';

try {
  fs.rmSync('build', { recursive: true });
} catch (error) {}

try {
  fs.rmSync('dist', { recursive: true });
} catch (error) {}

fs.cpSync('projects', 'dist', { recursive: true });

/**
 * @deprecated
 */
fs.cpSync('projects', 'dist/projects', { recursive: true });

const apps = fs.readdirSync('./src/app');

const templateContent = fs.readFileSync('./src/main.template.tsx', 'utf-8');
apps.forEach((app) => {
  fs.writeFileSync(
    './src/main.tsx',
    templateContent.replace('{app-path}', app)
  );
  execSync(`PROJECT="${app}" pnpm vite build`);

  fs.cpSync(`build/vite`, `dist/${app}`, { recursive: true });
  fs.cpSync(`dist/${app}/index.html`, `dist/${app}.html`);
  fs.rmSync(`dist/${app}/index.html`);
});
