import { useEffect } from 'react';
import './index.scss';
import { run } from './zinciri-kirma/src/main';

const ZinciriKirma = () => {
  useEffect(() => {
    run();
  });
  return (
    <>
      <span>circleSizeRange</span>
      <input
        id="circleSizeRange"
        type="range"
        min="0"
        max="0.3"
        step="0.000001"
        value="0.0122"
        style={{ width: 1500 }}
      />

      <span>spiralCenterWidthRange</span>
      <input
        id="spiralCenterWidthRange"
        type="range"
        min="0"
        max="0.3"
        step="0.000001"
        value="0.0732"
        style={{ width: 1500 }}
      />

      <span>spiralStartPointRange</span>
      <input
        id="spiralStartPointRange"
        type="range"
        min="0"
        max="1"
        step="0.000001"
        value="0"
        style={{ width: 1500 }}
      />

      <input id="upload" type="file" accept="text/json" size={30} />
      <img id="preview" />
    </>
  );
};

export default ZinciriKirma;
