const busStore = require('./bus.json');
const fs = require('fs');
const _ = require('lodash');

function createStopJson() {
  const stops = [];

  Object.entries(busStore).forEach(([route, directions]) => {
    directions.forEach((bus, index) => {
      bus.busStopList.forEach((stop) => {
        const addedBefore = stops.find((item) => item.id === stop.stopId);

        if (!addedBefore) {
          stops.push({
            id: stop.stopId,
            name: stop.stopName,
            lat: stop.lat,
            lng: stop.lng,
          });
        }
      });
    });
  });

  fs.writeFileSync('./stop.json', JSON.stringify(stops));
}

function createPointList() {
  const store = [];
  Object.entries(busStore).forEach(([route, directions]) => {
    directions.forEach((bus, index) => {
      store.push({
        route,
        direction: index,
        pointList: bus.pointList,
      });

      delete bus.pointList;
    });
  });
  fs.writeFileSync('./point-list.json', JSON.stringify(store));
}

function createCleanBus() {
  const store = [];
  Object.entries(busStore).forEach(([route, directions]) => {
    directions.forEach((bus, direction) => {
      store.push({
        route,
        direction: direction,
        stopList: bus.busStopList.map((s) => s.stopId),
      });

      delete bus.pointList;
    });
  });
  fs.writeFileSync('./bus-clean.json', JSON.stringify(store));
}

createCleanBus();
