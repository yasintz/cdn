import { useEffect, useMemo, useRef, useState } from 'react';
import cx from 'classnames';
import dark from './img/dark';
import light from './img/light';
import { draw } from './utils';
import './index.scss';

export default function BookCoverGenerator() {
  const [baseFile, setBaseFile] = useState<File>();
  const [bgFile, setBgFile] = useState<File>();
  const [useBaseAsBackground, setUseBaseAsBackground] = useState(true);
  const [useDarkBackground, setUseDarkBackground] = useState(true);
  const [outputImageUrl, setOutputImageUrl] = useState<string>();

  const outputWidth = 560;
  const outputHeight = 300;
  const spacing = 0.05;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { baseFileUrl, bgFileUrl } = useMemo(() => {
    const baseFileUrl = baseFile ? URL.createObjectURL(baseFile) : undefined;
    const bgFileUrl = bgFile ? URL.createObjectURL(bgFile) : undefined;

    const exampleBgUrl = useDarkBackground ? dark : light;

    return {
      baseFileUrl,
      bgFileUrl:
        (useBaseAsBackground ? baseFileUrl : bgFileUrl) || exampleBgUrl,
    };
  }, [baseFile, bgFile, useBaseAsBackground, useDarkBackground]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }
    if (baseFileUrl && bgFileUrl) {
      draw(canvas, baseFileUrl, bgFileUrl, spacing).then(() => {
        const img = canvasRef.current?.toDataURL('image/png');
        if (img) {
          setOutputImageUrl(img);
        }
      });
    }
  });

  const convertToImage = async () => {
    if (outputImageUrl) {
      setOutputImageUrl(undefined);
      return;
    }

    const img = canvasRef.current?.toDataURL('image/png');
    if (img) {
      setOutputImageUrl(img);
    }
  };

  return (
    <div className="container">
      <div className="input">
        <div className="base">
          <input
            type="file"
            onChange={(e) => setBaseFile(e.target.files?.[0])}
          />
          <label>
            <input
              type="checkbox"
              checked={useBaseAsBackground}
              onChange={(e) => setUseBaseAsBackground(e.target.checked)}
            />
            Use Base As Background
          </label>
          <br />
          {baseFileUrl && (
            <div className="image">
              <img src={baseFileUrl} />
            </div>
          )}
        </div>
        <div
          className={cx('background', {
            disabled: useBaseAsBackground,
          })}
        >
          <input type="file" onChange={(e) => setBgFile(e.target.files?.[0])} />
          <button onClick={() => setUseDarkBackground((prev) => !prev)}>
            Use {useDarkBackground ? 'White' : 'Dark'} Background
          </button>
          <br />
          {bgFileUrl && (
            <div className="image">
              <img src={bgFileUrl} />
            </div>
          )}
        </div>
      </div>
      <div className="output">
        <button onClick={convertToImage}>
          {outputImageUrl ? 'Close Image' : 'Convert To Image'}
        </button>
        <img
          src={outputImageUrl}
          width={outputWidth}
          height={outputHeight}
          style={{
            display: outputImageUrl ? 'block' : 'none',
          }}
        />
        <canvas
          width={outputWidth}
          height={outputHeight}
          ref={canvasRef}
          style={{
            display: !outputImageUrl ? 'block' : 'none',
          }}
        />
      </div>
    </div>
  );
}
