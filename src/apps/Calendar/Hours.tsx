import React, { useMemo } from 'react';
import NowPresenter from './NowPresenter';

const hours = Array.from({ length: 24 }, (_, i) => i);

const Hours = () => {
  const [ref, setRef] = React.useState<HTMLDivElement | null>(null);
  const divRect = useMemo(() => ref?.getBoundingClientRect(), [ref]);
  const itemSize = (divRect?.height || 0) / 24;

  return (
    <div className="flex flex-col" ref={setRef}>
      <div className="border-r flex-1 flex flex-col w-16 ml-[1px]" />
      {ref &&
        hours.map(
          (hour) =>
            hour > 0 && (
              <div
                key={hour}
                className="flex"
                style={{
                  position: 'absolute',
                  top: `${hour * itemSize}px`,
                  left: 0,
                  right: 0,
                  borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                }}
              >
                <div className="w-16 -translate-y-1/2 bg-white px-2">{hour}</div>
              </div>
            )
        )}
      <NowPresenter itemSize={itemSize} />
    </div>
  );
};

export default Hours;
