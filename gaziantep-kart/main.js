const { getDistance } = require('geolib');
const _ = require('lodash');
const stops = require('./stop.json');
const buses = require('./bus.json');

function getNearStops(location, threshold) {
  return _.sortBy(
    stops
      .map((stop) => ({
        ...stop,
        distance: getDistance(location, {
          latitude: stop.lat,
          longitude: stop.lng,
        }),
      }))
      .filter((stop) => stop.distance <= threshold),
    'distance'
  );
}

function getBus(nearToMe, nearToTarget) {
  const list = [];

  nearToMe.forEach((stop1) => {
    const busList = buses
      .map((bus) => ({
        ...bus,
        stop1Index: bus.stopList.indexOf(stop1.id),
      }))
      .filter((b) => b.stop1Index > -1);

    nearToTarget.forEach((stop2) => {
      const secondStep = busList
        .map((bus) => ({
          ...bus,
          stop2Index: bus.stopList.indexOf(stop2.id),
        }))
        .filter((bus) => bus.stop2Index > bus.stop1Index);

      list.push(
        ...secondStep.map((bus) => ({
          route: bus.route,
          direction: bus.direction,
          stop1: {
            ...stop1,
            index: bus.stop1Index,
          },
          stop2: {
            ...stop2,
            index: bus.stop2Index,
          },
        }))
      );
    });
  });

  return _.uniqBy(list, (bus) => bus.route + bus.direction);
}

const myLocation = {
  latitude: 37.115485,
  longitude: 37.391399,
};

const disci = {
  latitude: 37.07404526184756,
  longitude: 37.33841048835653,
};

const gaziantepLisesi = {
  latitude: '37.088301',
  longitude: '37.347007',
};

const nearToMe = getNearStops(myLocation, 5000);
const nearToTarget = getNearStops(disci, 200);

// console.log(nearToTarget);

console.log(_.sortBy(getBus(nearToMe, nearToTarget), 'stop1.distance'));
