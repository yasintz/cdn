import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';

function copyFolderContents(src, dest) {
  if (!fs.existsSync(src)) {
    console.error('Source folder does not exist.');
    return;
  }

  fs.ensureDirSync(dest);

  const contents = fs.readdirSync(src);

  contents.forEach((item) => {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);

    if (fs.statSync(srcPath).isDirectory()) {
      copyFolderContents(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

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

const apps = fs.readdirSync('./src/app').filter((i) => i !== '_archived');

apps.forEach((app) => {
  execSync(`PROJECT="${app}" pnpm vite build`);
  const buildFolder = './build/vite';

  fs.moveSync(
    path.join(buildFolder, 'index.html'),
    path.join(buildFolder, `${app}.html`)
  );

  copyFolderContents(buildFolder, 'dist');
});
