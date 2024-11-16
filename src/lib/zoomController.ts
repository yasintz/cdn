type ZoomState = {
  scale: number;
  translateX: number;
  translateY: number;
  lastMouseX: number;
  lastMouseY: number;
  isDragging: boolean;
  transform: string;
  cursor: string;
};

type ZoomOptions = {
  minScale?: number;
  maxScale?: number;
  scaleStep?: number;
  defaultScale?: number;
  onUpdate?: (state: ZoomState) => void;
};

const getTransform = (state: ZoomState): string => {
  return `translate(${state.translateX}px, ${state.translateY}px) scale(${state.scale})`;
};

export function createZoomController(
  element: HTMLElement,
  options: ZoomOptions = {}
) {
  const config = {
    minScale: 0.1,
    maxScale: 5,
    scaleStep: 0.1,
    defaultScale: 1,
    onUpdate: () => {}, // Default to a no-op if not provided
    ...options,
  };

  let state: ZoomState = {
    scale: config.defaultScale,
    translateX: 0,
    translateY: 0,
    lastMouseX: 0,
    lastMouseY: 0,
    isDragging: false,
    transform: '',
    cursor: 'grab',
  };

  const handleUpdate = () => {
    config.onUpdate?.(state);
  };

  const handleWheel = (event: WheelEvent) => {
    event.preventDefault();

    const rect = element.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const delta = -Math.sign(event.deltaY) * config.scaleStep;
    const newScale = Math.min(
      Math.max(state.scale + delta, config.minScale),
      config.maxScale
    );

    if (newScale !== state.scale) {
      const mousePointX = mouseX / state.scale - state.translateX / state.scale;
      const mousePointY = mouseY / state.scale - state.translateY / state.scale;

      state.scale = newScale;
      state.translateX = -(mousePointX * state.scale - mouseX);
      state.translateY = -(mousePointY * state.scale - mouseY);

      state.transform = getTransform(state);
    }
    handleUpdate();
  };

  const handleMouseDown = (event: MouseEvent) => {
    if (event.button === 0) {
      state.isDragging = true;
      state.lastMouseX = event.clientX;
      state.lastMouseY = event.clientY;
      state.cursor = 'grabbing';
    }
    handleUpdate();
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (state.isDragging) {
      const deltaX = event.clientX - state.lastMouseX;
      const deltaY = event.clientY - state.lastMouseY;

      state.translateX += deltaX;
      state.translateY += deltaY;

      state.lastMouseX = event.clientX;
      state.lastMouseY = event.clientY;
      state.transform = getTransform(state);
    }
    handleUpdate();
  };

  const handleMouseUp = () => {
    state.isDragging = false;
    state.cursor = 'grab';
    handleUpdate();
  };

  const reset = () => {
    state = {
      scale: config.defaultScale,
      translateX: 0,
      translateY: 0,
      lastMouseX: 0,
      lastMouseY: 0,
      isDragging: false,
      transform: '',
      cursor: 'grab',
    };
    handleUpdate();
  };

  const init = () => {
    element.addEventListener('wheel', handleWheel, { passive: false });
    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseup', handleMouseUp);
  };

  const destroy = () => {
    element.removeEventListener('wheel', handleWheel);
    element.removeEventListener('mousedown', handleMouseDown);
    element.removeEventListener('mousemove', handleMouseMove);
    element.removeEventListener('mouseup', handleMouseUp);
  };

  return {
    state,
    reset,
    handleMouseDown,
    handleMouseUp,
    handleMouseMove,
    handleWheel,
    init,
    destroy,
  };
}
