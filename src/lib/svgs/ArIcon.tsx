import React, { forwardRef } from 'react';

interface ArIconProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
}

export const ArIcon = forwardRef<SVGSVGElement, ArIconProps>(({ color = '#100f0d', ...props }, ref) => {
  return (
    <svg
      ref={ref}
      version="1.1"
      width="1889.76"
      height="1889.76"
      viewBox="0 0 1889.76 1889.76"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs />
      <g id="layer-MC0">
        <path
          d="M 0,0 V 248.615 H -57.223 V 0.123 L -232.404,95.191 -259.698,44.896 -28.648,-80.49 198.633,42.189 171.453,92.544 Z"
          style={{ fill: color, fillOpacity: 1, fillRule: 'nonzero', stroke: 'none' }}
          transform="matrix(1.3333333,0,0,-1.3333333,983.03013,1723.6237)"
        />
        <path
          d="m 0,0 -182.503,98.51 -27.18,-50.355 178.059,-96.112 -193.578,-104.488 27.18,-50.356 255.245,137.775 V 175.471 H 0 Z"
          style={{ fill: color, fillOpacity: 1, fillRule: 'nonzero', stroke: 'none' }}
          transform="matrix(1.3333333,0,0,-1.3333333,1687.3272,1302.28)"
        />
        <path
          d="m 0,0 -27.181,50.355 -182.502,-98.509 v 175.47 h -57.223 V -113.181 L -11.661,-250.955 15.52,-200.6 -178.059,-96.112 Z"
          style={{ fill: color, fillOpacity: 1, fillRule: 'nonzero', stroke: 'none' }}
          transform="matrix(1.3333333,0,0,-1.3333333,482.01387,1238.074)"
        />
        <path
          d="M 0,0 -203.85,110.031 -231.03,59.675 -28.611,-49.583 v -133.842 h 57.222 v 133.842 l 198.633,107.217 -27.18,50.355 z"
          style={{ fill: color, fillOpacity: 1, fillRule: 'nonzero', stroke: 'none' }}
          transform="matrix(1.3333333,0,0,-1.3333333,944.88173,901.52707)"
        />
        <path
          d="m 0,0 27.181,-50.355 175.238,94.589 v -248.615 h 57.223 V 44.234 L 431.095,-48.312 458.274,2.044 231.03,124.704 Z"
          style={{ fill: color, fillOpacity: 1, fillRule: 'nonzero', stroke: 'none' }}
          transform="matrix(1.3333333,0,0,-1.3333333,636.84133,225.11107)"
        />
        <path
          d="m 0,0 -27.18,-50.355 193.579,-104.489 -193.578,-104.489 27.18,-50.355 198.021,106.887 v -175.471 h 57.223 v 240.498 z"
          style={{ fill: color, fillOpacity: 1, fillRule: 'nonzero', stroke: 'none' }}
          transform="matrix(1.3333333,0,0,-1.3333333,1423.2972,317.07467)"
        />
        <path
          d="M 0,0 -27.181,50.355 -282.425,-87.419 v -240.498 h 57.222 v 175.471 L -27.18,-259.333 0,-208.978 -193.579,-104.489 Z"
          style={{ fill: color, fillOpacity: 1, fillRule: 'nonzero', stroke: 'none' }}
          transform="matrix(1.3333333,0,0,-1.3333333,502.70667,384.2152)"
        />
      </g>
    </svg>
  );
});

ArIcon.displayName = 'ArIcon';
