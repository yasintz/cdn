import { getNearStops, getBus } from './utils';
import _ from 'lodash';
import { useState } from 'react';
import './index.scss';
import { getCord } from '../utils/coordinate';

const GaziantepKart27 = () => {
  const [result, setResult] = useState<ReturnType<typeof getBus>>([]);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);

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

    setResult(_.sortBy(getBus(from, to), 'stop1.distance'));
  };
  return (
    <>
      <label>
        From:
        <input
          type="text"
          placeholder="36.799958, 34.574624"
          id="from"
          value="37.114822254971344, 37.390943663683984"
        />
        <input
          type="number"
          placeholder="threshold"
          id="from-threshold"
          value="1000"
        />
      </label>
      <br />
      <label>
        To:
        <input
          type="text"
          placeholder="36.799958, 34.574624"
          id="to"
          value="37.095476401939095, 37.39011530655496"
        />
        <input
          type="number"
          placeholder="threshold"
          id="to-threshold"
          value="1000"
        />
      </label>
      <br />

      <button onClick={onClick}>Get</button>
      <button onClick={() => setSelectedIndexes([])}>Reset Selected</button>
      <br />
      <br />

      <div style={{ display: 'flex' }}>
        <div style={{ flex: 2 }}>
          <table>
            <tr>
              <th>*</th>
              <th>Bus</th>
              <th>First Stop</th>
              <th>Last Stop</th>
              <th>Stop Count</th>
            </tr>
            {result.map((bus, index) => (
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
                <td>{bus.stop1.name}</td>
                <td>{bus.stop2.name}</td>
                <td>{bus.stop2.index - bus.stop1.index}</td>
              </tr>
            ))}
          </table>
        </div>
        <pre style={{ flex: 1, marginLeft: 16 }}>
          {result
            .filter((res, index) => selectedIndexes.includes(index))
            .map((item) => `\n${JSON.stringify(item, null, 2)}`)
            .join('\n-----------\n')}
        </pre>
      </div>
    </>
  );
};

export default GaziantepKart27;
