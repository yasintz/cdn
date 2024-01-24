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
