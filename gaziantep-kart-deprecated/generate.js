const handlebars = require('handlebars');
const fs = require('fs');
const buses = require('./bus.json');
const stops = require('./stop.json');

const content = fs.readFileSync('./main.html', 'utf-8');

const template = handlebars.compile(content);

fs.writeFileSync(
  './index.html',
  template({
    encodedJson: encodeURIComponent(JSON.stringify({ buses, stops })),
  })
);
