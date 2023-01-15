import * as geolib from 'geolib';
import { GeolibInputCoordinates } from 'geolib/es/types';
import _ from 'lodash';
import stops from './stop.json';
import buses from './bus.json';

let started = false;
export function handle() {
  if (started) {
    return;
  }
  started = true;

  function getNearStops(location: GeolibInputCoordinates, threshold: number) {
    return _.sortBy(
      stops
        .map((stop) => ({
          ...stop,
          distance: geolib.getDistance(location, {
            latitude: stop.lat,
            longitude: stop.lng,
          }),
        }))
        .filter((stop) => stop.distance <= threshold),
      'distance'
    );
  }
  function getBus(
    nearToMe: ReturnType<typeof getNearStops>,
    nearToTarget: ReturnType<typeof getNearStops>
  ) {
    const list: any[] = [];

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

  const fromInput = document.getElementById('from') as HTMLInputElement;
  const fromThresholdInput = document.getElementById(
    'from-threshold'
  ) as HTMLInputElement;

  const toInput = document.getElementById('to') as HTMLInputElement;
  const toThresholdInput = document.getElementById(
    'to-threshold'
  ) as HTMLInputElement;

  const result = document.getElementById('result');

  const getCord = (value: string) => {
    const [latitude, longitude] = value
      .split(',')
      .map((i) => i.trim())
      .map((i) => parseFloat(i));

    return { latitude, longitude };
  };

  document.getElementById('get')?.addEventListener('click', () => {
    const fromValue = getCord(fromInput.value);
    const toValue = getCord(toInput.value);

    const from = getNearStops(
      fromValue,
      parseInt(fromThresholdInput.value, 10)
    );
    const to = getNearStops(toValue, parseInt(toThresholdInput.value, 10));

    _.sortBy(getBus(from, to), 'stop1.distance').forEach((item) => {
      if (result) {
        result.innerText += `\n${JSON.stringify(
          item,
          null,
          2
        )}\n\n----------\n`;
      }
    });
  });
}
