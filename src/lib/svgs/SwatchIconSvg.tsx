import React, { forwardRef } from 'react';
import { cn } from '../utils.js';

const SWATCH_PATH = 'M6 1 L14 0 L28 1 Q 32 5 32 8 L30 16 L32 24 L26 31 L18 30 L10 32 L2 28 L0 18 L1 10 L3 4 Z';

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
