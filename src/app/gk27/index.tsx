import { getNearStops, getBus } from './utils';
import _ from 'lodash';
import { useState } from 'react';
import './index.scss';
import { getCord } from 'src/utils/coordinate';

const GaziantepKart27 = () => {
  const [result, setResult] = useState<ReturnType<typeof getBus>>([]);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [filter, setFilter] = useState<{
    turuncu: boolean;
    sari: boolean;
    mavi: boolean;
    tramway: boolean;
  }>({
    turuncu: true,
    mavi: true,
    sari: true,
    tramway: true,
  });

  const onClick = () => {
    const fromInput = document.getElementById('from') as HTMLInputElement;
    const fromThresholdInput = document.getElementById(
      'from-threshold'
    ) as HTMLInputElement;

    const toInput = document.getElementById('to') as HTMLInputElement;
    const toThresholdInput = document.getElementById(
      'to-threshold'
    ) as HTMLInputElement;

    const fromValue = getCord(fromInput.value);
    const toValue = getCord(toInput.value);

    const from = getNearStops(
      fromValue,
      parseInt(fromThresholdInput.value, 10)
    );
    const to = getNearStops(toValue, parseInt(toThresholdInput.value, 10));

    setResult(_.sortBy(getBus(from, to), 'stop1.distance') as any);
  };
  const filteredResult = result.filter(
    (bus) =>
      (bus.route.startsWith('B') && filter.turuncu) ||
      (bus.route.startsWith('M') && filter.mavi) ||
      (bus.route.startsWith('S') && filter.sari) ||
      (bus.route.startsWith('K') && filter.tramway) ||
      (filter.turuncu && filter.mavi && filter.sari)
  );
  return (
    <>
      <label>
        From:
        <input type="text" placeholder="36.799958, 34.574624" id="from" />
        <input
          type="number"
          placeholder="threshold"
          id="from-threshold"
          defaultValue="1000"
        />
      </label>
      <br />
      <label>
        To:
        <input type="text" placeholder="36.799958, 34.574624" id="to" />
        <input
          type="number"
          placeholder="threshold"
          id="to-threshold"
          defaultValue="1000"
        />
      </label>
      <br />

      <button onClick={onClick}>Get</button>
      <button onClick={() => setSelectedIndexes([])}>Reset Selected</button>
      {Object.keys(filter).map((key) => (
        <label key={key}>
          <input
            type="checkbox"
            checked={filter[key as keyof typeof filter]}
            onChange={(e) =>
              setFilter((prev) => ({ ...prev, [key]: e.target.checked }))
            }
          />
          {key}
        </label>
      ))}
      <br />
      <br />

      <div style={{ display: 'flex' }}>
        <div style={{ flex: 2 }}>
          <table>
            <tr>
              <th>*</th>
              <th>Otobus</th>
              <th className="stop">
                <div>
                  <span>Binis Duragi</span>
                  <span>Durak Numarasi</span>
                </div>
              </th>
              <th className="stop">
                <div>
                  <span>Inis Duragi</span>
                  <span>Durak Numarasi</span>
                </div>
              </th>
              <th>Stop Count</th>
            </tr>
            {filteredResult.map((bus, index) => (
              <tr key={bus.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIndexes.includes(index)}
                    onChange={(e) =>
                      e.target.checked && setSelectedIndexes([index])
                    }
                  />
                </td>
                <td>{bus.route}</td>
                <td className="stop">
                  <div>
                    <span>{bus.stop1.name}</span> <span>{bus.stop1.id}</span>
                  </div>
                </td>
                <td className="stop">
                  <div>
                    <span>{bus.stop2.name}</span> <span>{bus.stop2.id}</span>
                  </div>
                </td>
                <td>{bus.stop2.index - bus.stop1.index}</td>
              </tr>
            ))}
          </table>
        </div>
        {selectedIndexes.length > 0 && (
          <pre style={{ flex: 1, marginLeft: 16 }}>
            {filteredResult
              .filter((res, index) => selectedIndexes.includes(index))
              .map((item) => `\n${JSON.stringify(item, null, 2)}`)
              .join('\n-----------\n')}
          </pre>
        )}
      </div>
    </>
  );
};

export default GaziantepKart27;
