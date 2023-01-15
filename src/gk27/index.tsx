import React, { useEffect } from 'react';
import { handle } from './utils';

type GaziantepKart27Props = {};

const GaziantepKart27 = (props: GaziantepKart27Props) => {
  useEffect(handle);
  return (
    <>
      <label>
        From:
        <input type="text" placeholder="36.799958, 34.574624" id="from" />
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
        <input type="text" placeholder="36.799958, 34.574624" id="to" />
        <input
          type="number"
          placeholder="threshold"
          id="to-threshold"
          value="1000"
        />
      </label>
      <br />

      <button id="get">Get</button>

      <pre id="result"></pre>
    </>
  );
};

export default GaziantepKart27;
