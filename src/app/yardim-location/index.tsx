import React, { useEffect, useState } from 'react';
import * as geolib from 'geolib';
import { CoordinateType, getCord } from '../utils/coordinate';
import _ from 'lodash';

type HelpType = {
  index: number;
  coordinate: CoordinateType;
  distanceToOthers: Array<{
    index: number;
    distance: number;
  }>;
};

type InputPropsType = {
  help: HelpType;
  children: React.ReactNode;
  onChange?: (help: HelpType) => void;
  disabled?: boolean;
};
const Input = ({ help, children, onChange, disabled }: InputPropsType) => {
  const onCordChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const value = e.target.value;
    const isCord = value.includes(',');

    if (isCord) {
      const { latitude, longitude } = getCord(value);
      onChange?.({ ...help, coordinate: { latitude, longitude } });
    } else {
      onChange?.({
        ...help,
        coordinate: {
          ...help.coordinate,
          latitude: parseFloat(e.target.value),
        },
      });
    }
  };

  const onIndexChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    onChange?.({ ...help, index: parseInt(e.target.value, 10) });
  };

  const onLongitudeChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    onChange?.({
      ...help,
      coordinate: { ...help.coordinate, longitude: parseFloat(e.target.value) },
    });
  };
  return (
    <div>
      <input
        placeholder="index"
        value={help.index}
        onChange={onIndexChange}
        disabled={disabled}
      />
      <input
        placeholder="cord"
        value={help.coordinate.latitude}
        onChange={onCordChange}
        disabled={disabled}
      />
      <input
        value={help.coordinate.longitude}
        onChange={onLongitudeChange}
        disabled={disabled}
      />
      <input
        value={`${help.coordinate.latitude}, ${help.coordinate.longitude}`}
        disabled={disabled}
      />
      {children}
    </div>
  );
};

// @ts-ignore
const emptyHelp = {
  index: '',
  coordinate: {
    latitude: '',
    longitude: '',
  },
} as HelpType;

const YardimLocation = () => {
  const [helps, setHelps] = useState<HelpType[]>([]);
  const [newHelp, setNewHelp] = useState<HelpType>(emptyHelp);
  const [viewIndex, setViewIndex] = useState<number>();
  const [groups, setGroups] = useState<number[][]>([]);
  const viewHelp = helps.find((i) => i.index === viewIndex);

  useEffect(() => {
    const cache = JSON.parse(localStorage.getItem('helps') || '[]');

    setHelps(cache);
  }, []);

  const onAdd = () => {
    if (newHelp) {
      const newHelps = _.sortBy([...helps, newHelp], 'index');
      setHelps(newHelps);
      setNewHelp(emptyHelp);

      localStorage.setItem('helps', JSON.stringify(newHelps));
    }
  };

  const onRemove = (help: HelpType) => {
    const newHelps = helps.filter((i) => i !== help);
    setHelps(newHelps);
    localStorage.setItem('helps', JSON.stringify(newHelps));
  };

  const onRefresh = () => {
    const handled: number[] = [];
    const newGroups: number[][] = [];
    for (let index = 0; index < helps.length; index++) {
      const help = helps[index];
      if (handled.includes(help.index)) {
        continue;
      }

      const nearIndex = help.distanceToOthers
        .filter((i) => i.distance < 1500)
        .map((i) => i.index)
        .filter((i) => !handled.includes(i));

      handled.push(...nearIndex, help.index);
      newGroups.push([help.index, ...nearIndex]);
    }
    setGroups(newGroups);
    console.log(newGroups);

    return;

    const newHelps = helps.map((help) => {
      const distanceToOthers = helps
        .filter((i) => i !== help)
        .map((oh) => ({
          index: oh.index,
          distance: geolib.getDistance(help.coordinate, oh.coordinate),
        }));

      return {
        ...help,
        distanceToOthers: _.sortBy(distanceToOthers, 'distance'),
      };
    });

    setHelps(newHelps);
    localStorage.setItem('helps', JSON.stringify(newHelps));
  };

  return (
    <div style={{ display: 'flex' }}>
      <pre>
        Title,latitude,longitude,Address{'\n'}
        {helps
          .map(
            (help) =>
              `${help.index},${help.coordinate.latitude},${help.coordinate.longitude},"[${help.coordinate.latitude},${help.coordinate.longitude}]"`
          )
          .join('\n')}
      </pre>
      <div>
        <button onClick={onRefresh}>Refresh</button>
        {helps.map((help) => (
          <Input key={help.index} help={help} disabled>
            <button onClick={() => onRemove(help)}>x</button>
            <button onClick={() => setViewIndex(help.index)}>{'>'}</button>
          </Input>
        ))}
        <Input onChange={(help) => setNewHelp(help)} help={newHelp}>
          <button onClick={onAdd}>Add</button>
        </Input>

        {getUrl(helps).map((u) => (
          <div>
            <a href={u.url} target="_blank">
              {u.routes.map((r) => r.index).join(', ')}
            </a>
          </div>
        ))}

        <div>
          {groups.map((group, index) => (
            <div key={index.toString()}>
              <div>{group.join(', ')}</div>

              <a
                href={getUrl(
                  group.map((g) => helps.find((a) => a.index === g) as HelpType)
                ).toString()}
                target="_blank"
              >
                Direction
              </a>
              <hr />
            </div>
          ))}
        </div>
      </div>
      {viewHelp && (
        <div>
          <pre>{JSON.stringify(viewHelp, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default YardimLocation;

// https://www.google.com/maps/dir/37.1145837,37.3738729/37.02075279483696,+37.35581390331587/37.01119243692623,+37.36654273830534/@37.0631114,37.2869411,12z

const getUrl = (_helps: HelpType[]) => {
  if (_helps.length === 0) {
    return [];
  }
  const initialCord = getCord('37.076498222032924,37.32748232296175');
  const helps = Array.from(_helps);
  const routes = [_helps[0]];

  console.log(routes);
  let lastCord: HelpType | undefined = routes[0];

  while (lastCord) {
    const near = _.sortBy(
      helps.map((i) => ({
        ...i,
        // @ts-ignore
        distance: geolib.getDistance(lastCord.coordinate, i.coordinate),
      })),
      'distance'
    )[0];

    const index = helps.findIndex((i) => i.index === near.index);
    if (index != -1) {
      helps.splice(index, 1);

      routes.push(near);
      lastCord = near;
    } else {
      lastCord = undefined;
    }
  }

  return _.chunk(routes, 7).map((route) => ({
    routes: route,
    url: `https://www.google.com/maps/dir/${route
      .map((i) => i.coordinate)
      .reverse()
      .concat([initialCord])
      .reverse()
      .map((h) => `${h.latitude},${h.longitude}`)
      .join('/')}`,
  }));

  //   for (let index = 0; index < helps.length; index++) {
  //     const element = helps[index];
  //   }

  // const a =   [initialCord,...helps.map()]
  //   return `https://www.google.com/maps/dir/${routes
  //     .splice(10, 20)
  //     .map((h) => `${h.latitude},${h.longitude}`)
  //     .join('/')}`;

  //   return `https://www.google.com/maps/dir/37.076498222032924,37.32748232296175/${helps
  //     .map((h) => `${h.coordinate.latitude},${h.coordinate.longitude}`)
  //     .join('/')}`;
};
