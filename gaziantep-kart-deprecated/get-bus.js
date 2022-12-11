const axios = require('axios');
const fs = require('fs');
const _ = require('lodash');
const store = require('./bus.json');

const wait = (timeout) => new Promise((res) => setTimeout(res, timeout));

function getStopDetail() {
  return fetch(
    'https://service.kentkart.com/rl1//web/nearest/bus?region=028&lang=tr&authType=4&accuracy=0&lat=37.06377153421882&lng=37.375416799999996&busStopId=10103',
    {
      headers: {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'en-US,en;q=0.9,tr-TR;q=0.8,tr;q=0.7',
        'content-type': 'application/json',
        'sec-ch-ua':
          '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
      },
      referrer: 'https://online.gaziantepkart.com.tr/',
      referrerPolicy: 'no-referrer-when-downgrade',
      body: null,
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
    }
  );
}

function getBusDetail(route) {
  const url0 = `https://service.kentkart.com/rl1//web/pathInfo?region=028&lang=tr&authType=4&direction=0&displayRouteCode=${route}&resultType=111111`;

  const url1 = `https://service.kentkart.com/rl1//web/pathInfo?region=028&lang=tr&authType=4&direction=1&displayRouteCode=${route}&resultType=111111`;

  return Promise.all(
    [url0, url1].map((url) =>
      axios
        .get(url, {
          headers: {
            accept: 'application/json, text/plain, */*',
            'accept-language': 'en-US,en;q=0.9,tr-TR;q=0.8,tr;q=0.7',
            'content-type': 'application/json',
            'sec-ch-ua':
              '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'cross-site',
          },
          referrer: 'https://online.gaziantepkart.com.tr/',
          referrerPolicy: 'no-referrer-when-downgrade',
          body: null,
          method: 'GET',
          mode: 'cors',
          credentials: 'omit',
        })
        .then((res) => _.omit(res.data.pathList[0], ['busList']))
    )
  );
}

async function main() {
  const list = _.difference(busList, Object.keys(store));

  for (let index = 0; index < list.length; index++) {
    const route = list[index];
    try {
      console.log(`${route} start`);
      const result = await getBusDetail(route);
      store[route] = result;
      console.log(`${route} completed`);
      fs.writeFileSync('./bus.json', JSON.stringify(store, null, 2));
      await wait(1000);
    } catch (error) {
      console.log(`${route} failed`, error);
    }
  }
}

setTimeout(main, 100);

const busList = [
  'B01',
  'B02',
  'B03',
  'B04',
  'B05',
  'B06',
  'B07',
  'B08',
  'B10',
  'B11',
  'B12',
  'B14',
  'B18',
  'B28',
  'B29',
  'B30',
  'B31',
  'B33',
  'B35',
  'B39',
  'B40',
  'B41',
  'B43',
  'B44',
  'B45',
  'B46',
  'B49',
  'B50',
  'B53',
  'B56',
  'B57',
  'B58',
  'B59',
  'B60',
  'B601',
  'B61',
  'B611',
  'B62',
  'B63',
  'B64',
  'B65',
  'B66',
  'B67',
  'B69',
  'B74',
  'B75',
  'B76',
  'B77',
  'B78',
  'B79',
  'B80',
  'B84',
  'B86',
  'B87',
  'B88',
  'B89',
  'B90',
  'B91',
  'B92',
  'B93',
  'K09',
  'K13',
  'K15',
  'K16',
  'K17',
  'K19',
  'K20',
  'K21',
  'K22',
  'K24',
  'K26',
  'K27',
  'K32',
  'K34',
  'K36',
  'K47',
  'K48',
  'K52',
  'K55',
  'K68',
  'K70',
  'K71',
  'K72',
  'K73',
  'M01',
  'M02',
  'M03',
  'M04',
  'M05',
  'M06',
  'M07',
  'M08',
  'M09',
  'M10',
  'M11',
  'M12',
  'M13',
  'M14',
  'M15',
  'M16',
  'M17',
  'M18',
  'M19',
  'S01',
  'S02',
  'S03',
  'S04',
  'S05',
  'S06',
  'S07',
  'S08',
  'S09',
  'S10',
  'S11',
  'S12',
  'T1',
  'T2',
  'T3',
  'TA3',
  'TA502',
  'TA503',
  'TA6',
  'B18-1',
  'M12-1',
  'M13-1',
  'M15-1',
  'M17-1',
  'S12-1',
];
