import React from 'react';
import { SimpleTodoType } from '../store/simple-todo-slice';

type EstimateProps = {
  todo: SimpleTodoType;
  deleteEstimate: () => void;
};

const Estimate = ({ todo, deleteEstimate }: EstimateProps) => {
  const estimateLongPressTimeout = React.useRef<NodeJS.Timeout | undefined>(
    undefined
  );

  const estimate = todo.text.split('Estimate:')[1].trim();
  return (
    <div
      className="flex items-center gap-2 mb-2"
      onMouseDown={() => {
        estimateLongPressTimeout.current = setTimeout(() => {
          deleteEstimate();
        }, 1000);
      }}
      onMouseUp={() => clearTimeout(estimateLongPressTimeout.current)}
      onMouseMove={() => clearTimeout(estimateLongPressTimeout.current)}
    >
      <div className="flex-1 h-[1px] bg-gray-300" />
      <div className="text-sm text-gray-400">{estimate}</div>
      <div className="flex-1 h-[1px] bg-gray-300" />
    </div>
  );
};

export default Estimate;
