import React from 'react';
import {
  Tooltip as TooltipMain,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

type TooltipProps = {
  tooltip: React.ReactNode;
  children: React.ReactNode;
};

const Tooltip = ({ children, tooltip }: TooltipProps) => {
  return (
    <TooltipProvider>
      <TooltipMain delayDuration={0}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent className='mb-1'>{tooltip}</TooltipContent>
      </TooltipMain>
    </TooltipProvider>
  );
};

export default Tooltip;
