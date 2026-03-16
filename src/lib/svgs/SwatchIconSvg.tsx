import React, { forwardRef } from 'react';
import { cn } from '../utils.js';

export const SWATCH_PATH =
  'M10.62 2 L12.42 3.8 L14.22 2 L15.97 3.76 L17.71 2.02 L19.45 3.76 L21.21 2 L22.99 3.78 L24.73 2.04 L26.45 3.76 L28.17 2.04 L29.91 3.78 L28.2 5.49 L29.94 7.24 L28.28 8.9 L30 10.62 L28.2 12.42 L30 14.22 L28.24 15.97 L29.98 17.71 L28.24 19.45 L30 21.21 L28.22 22.99 L29.96 24.73 L28.24 26.45 L29.96 28.17 L28.22 29.91 L28.26 29.95 L26.51 28.2 L24.76 29.94 L23.1 28.28 L21.38 30 L19.58 28.2 L17.78 30 L16.03 28.24 L14.29 29.98 L12.55 28.24 L10.79 30 L9.01 28.22 L7.27 29.96 L5.55 28.24 L3.83 29.96 L2.09 28.22 L2.05 28.26 L3.8 26.51 L2.06 24.76 L3.72 23.1 L2 21.38 L3.8 19.58 L2 17.78 L3.76 16.03 L2.02 14.29 L3.76 12.55 L2 10.79 L3.78 9.01 L2.04 7.27 L3.76 5.55 L2.04 3.83 L3.78 2.09 L3.74 2.05 L5.49 3.8 L7.24 2.06 L8.9 3.72 Z';

export interface SwatchIconSvgProps extends Omit<React.SVGProps<SVGSVGElement>, 'viewBox'> {
  size?: number;
  pathClassName?: string;
}

export const SwatchIconSvg = forwardRef<SVGSVGElement, SwatchIconSvgProps>(
  ({ className, size = 32, fill = 'currentColor', pathClassName, ...props }, ref) => (
    <svg
      ref={ref}
      viewBox="-1 -1 34 34"
      shapeRendering="geometricPrecision"
      className={cn(className)}
      style={{ width: size, height: size }}
      {...props}
    >
      <path d={SWATCH_PATH} fill={fill} className={pathClassName} />
    </svg>
  )
);

SwatchIconSvg.displayName = 'SwatchIconSvg';
