import React from 'react';

type ContextType = {
  startHourMs: number;
  endHourMs: number;
};

export const DayViewContext = React.createContext<ContextType>({
  startHourMs: 0,
  endHourMs: 0,
});

export const useDayViewContext = () => React.useContext(DayViewContext);
