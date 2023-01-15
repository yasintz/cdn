import * as geolib from 'geolib';
import { GeolibInputCoordinates } from 'geolib/es/types';
import _ from 'lodash';
import stops from './stop.json';
import buses from './bus.json';

export function getNearStops(
  location: GeolibInputCoordinates,
  threshold: number
) {
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

export function getBus(
  nearToMe: ReturnType<typeof getNearStops>,
  nearToTarget: ReturnType<typeof getNearStops>
) {
  const list: Array<{
    id: string;
    route: string;
    direction: number;
    stop1: ReturnType<typeof getNearStops>[number] & { index: number };
    stop2: ReturnType<typeof getNearStops>[number] & { index: number };
  }> = [];

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
          id: `${bus.route}${bus.direction}`,
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

  return _.uniqBy(list, (bus) => bus.id);
}

export const getCord = (value: string) => {
  const [latitude, longitude] = value
    .split(',')
    .map((i) => i.trim())
    .map((i) => parseFloat(i));

  return { latitude, longitude };
};
