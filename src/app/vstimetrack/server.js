import axios from 'axios';
import _ from 'lodash';
import path from 'path';
import fs from 'fs';

const throttleJsonPath =
  '/Users/yasin/Documents/side-projects/cdn/src/app/vstimetrack/throttle.json';

const throttleJson = JSON.parse(fs.readFileSync(throttleJsonPath, 'utf-8'));

const parentFolders = _.orderBy(
  [
    {
      name: 'side-projects',
      path: '/Users/yasin/Documents/side-projects',
    },
    {
      name: 'side-projects/cdn',
      path: '/Users/yasin/Documents/side-projects/cdn/src/app',
    },
    {
      name: 'works',
      path: '/Users/yasin/Documents/works',
    },
  ],
  (s) => -s.path.length
);

const apiUrl = `https://google-sheet-database.vercel.app/api/v2/jdb/19Q7TuqVy08vpu2phdPXPyGN0J1L4iwHOK9_jkxzPHwQ/135325869/functions/array/push?path=logs`;

let editingFile = process.argv[2].trim();
let parent;

const activeParentFolder = parentFolders.find((parent) =>
  editingFile.includes(parent.path)
);

if (activeParentFolder) {
  parent = editingFile.replace(`${activeParentFolder.path}/`, '').split('/')[0];
}

const filePath = parent
  ? path.join(activeParentFolder.name, parent)
  : editingFile;

const lastCalledAt = throttleJson[filePath];

const THIRTY_SECONDS = 1000 * 30;

if (!lastCalledAt || Date.now() - lastCalledAt > THIRTY_SECONDS) {
  console.log('Tracked!');
  axios.put(apiUrl, {
    time: new Date().toISOString(),
    path: filePath,
  });
  throttleJson[filePath] = Date.now();

  fs.writeFileSync(throttleJsonPath, JSON.stringify(throttleJson));
} else {
  console.log('Untracked!');
}
