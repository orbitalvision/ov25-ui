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
      viewBox="0 0 473.52 473.52"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M414.33,118.38l59.19-59.19L414.33,0l-59.19,59.19L295.95,0l-59.19,59.19L177.57,0l-59.19,59.19L59.19,0,0,59.19l59.19,59.19L0,177.57l59.19,59.19L0,295.95l59.19,59.19L0,414.33l59.19,59.19,59.19-59.19,59.19,59.19,59.19-59.19,59.19,59.19,59.19-59.19,59.19,59.19,59.19-59.19-59.19-59.19,59.19-59.19-59.19-59.19,59.19-59.19-59.19-59.19Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
});

SwatchIcon.displayName = 'SwatchIcon'; 