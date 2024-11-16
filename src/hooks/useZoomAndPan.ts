import { createZoomController } from '@/lib/zoomController';
import { useEffect, useRef, useState } from 'react';

type UseZoomAndPanReturn = {
  ref: React.RefObject<HTMLDivElement | null>;
  transform: string;
  cursor: string;
};

export function useZoomAndPan(
  initialZoom = 1,
  zoomSpeed = 10
): UseZoomAndPanReturn {
  const [value, setValue] = useState({ transform: '', cursor: 'grab' });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = createZoomController(ref.current!, {
      maxScale: 10,
      scaleStep: 0.05,
      onUpdate: () => {
        setValue({
          ...controller.state,
        });
      },
    });

    controller.init();

    return () => {
      controller.destroy();
    };
  }, [initialZoom, zoomSpeed]);

  return { ref, ...value };
}
