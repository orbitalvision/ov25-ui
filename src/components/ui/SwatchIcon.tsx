import * as React from 'react';
import { cn } from '../../lib/utils.js';

interface SwatchIconProps {
  className?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: string | number;
  size?: number;
}

export const SwatchIcon = React.memo(({ 
  className, 
  fill = "white", 
  stroke = "black", 
  strokeWidth = "5", 
  size = 40 
}: SwatchIconProps) => {
  return (
    <svg 
      className={cn(className)}
      style={{ width: size, height: size }}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M87.5,25l12.5-12.5L87.5,0l-12.5,12.5L62.5,0l-12.5,12.5L37.5,0l-12.5,12.5L12.5,0,0,12.5l12.5,12.5L0,37.5l12.5,12.5L0,62.5l12.5,12.5L0,87.5l12.5,12.5,12.5-12.5,12.5,12.5,12.5-12.5,12.5,12.5,12.5-12.5,12.5,12.5,12.5-12.5-12.5-12.5,12.5-12.5-12.5-12.5,12.5-12.5-12.5-12.5Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
});

SwatchIcon.displayName = 'SwatchIcon'; 