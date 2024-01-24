import fs from 'fs';

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

// fs.writeFileSync(
//   './src/main.tsx',
//   templateContent.replace('{app-path}', process.env.PROJECT)
// );
