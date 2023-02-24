const path = require('path');
const fs = require('fs');
const execSync = require('child_process').execSync;

const databases = Object.entries(require('./config.json')).map(
  ([name, id]) => ({
    name,
    id,
  })
);

async function main() {
  for (let index = 0; index < databases.length; index++) {
    const { id, name } = databases[index];

    const json = JSON.parse(
      execSync(`curl https://api.npoint.io/${id}`).toString()
    );

    fs.writeFileSync(
      path.join(__dirname, `./backup/${name}.json`),
      JSON.stringify(json)
    );
  }
}

main();
