import React, { forwardRef } from 'react';

interface DimensionsIconProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
}

export const DimensionsIcon = forwardRef<SVGSVGElement, DimensionsIconProps>(({ color = '#282828', ...props }, ref) => {
  return (
    <svg
      ref={ref}
      version="1.1"
      width="1889.76"
      height="1889.76"
      viewBox="0 0 1889.76 1889.76"
      xmlns="http://www.w3.org/2000/svg"
      style={{ stroke: color, fill: color }}
      {...props}
    >
      <defs />
      <g
        transform="translate(-3819.52)"
      >
        <path
          d="M 0,0 -104.733,104.733 H 673.552 L 568.818,0 609.281,-40.463 783.089,133.345 609.281,307.152 568.818,266.689 673.552,161.956 H -104.733 L 0,266.689 -40.463,307.152 -214.271,133.345 -40.463,-40.463 Z"
          style={{ fill: color, fillOpacity: 1, fillRule: 'nonzero', stroke: 'none' }}
          transform="matrix(1.3333333,0,0,-1.3333333,4380.5304,598.99067)"
        />
        <path
          d="M 76.774,77.037 H 1340.548 V 134.26 H 76.774 Z"
          style={{ fill: color, fillOpacity: 1, fillRule: 'nonzero', stroke: 'none' }}
          transform="matrix(1.3333333,0,0,-1.3333333,3819.52,1889.76)"
        />
        <path
          d="m 1283.326,218.361 h 57.223 v 84.101 h -57.223 z"
          style={{ fill: color, fillOpacity: 1, fillRule: 'nonzero', stroke: 'none' }}
          transform="matrix(1.3333333,0,0,-1.3333333,3819.52,1889.76)"
        />
        <path
          d="m 1283.326,386.563 h 57.223 v 84.101 h -57.223 z"
          style={{ fill: color, fillOpacity: 1, fillRule: 'nonzero', stroke: 'none' }}
          transform="matrix(1.3333333,0,0,-1.3333333,3819.52,1889.76)"
        />
        <path
          d="m 1283.326,554.766 h 57.223 v 84.101 h -57.223 z"
          style={{ fill: color, fillOpacity: 1, fillRule: 'nonzero', stroke: 'none' }}
          transform="matrix(1.3333333,0,0,-1.3333333,3819.52,1889.76)"
        />
        <path
          d="m 1283.326,722.967 h 57.223 v 84.101 h -57.223 z"
          style={{ fill: color, fillOpacity: 1, fillRule: 'nonzero', stroke: 'none' }}
          transform="matrix(1.3333333,0,0,-1.3333333,3819.52,1889.76)"
        />
        <path
          d="m 1283.326,891.169 h 57.223 v 84.101 h -57.223 z"
          style={{ fill: color, fillOpacity: 1, fillRule: 'nonzero', stroke: 'none' }}
          transform="matrix(1.3333333,0,0,-1.3333333,3819.52,1889.76)"
        />
        <path
          d="m 1283.326,1059.371 h 57.223 v 84.101 h -57.223 z"
          style={{ fill: color, fillOpacity: 1, fillRule: 'nonzero', stroke: 'none' }}
          transform="matrix(1.3333333,0,0,-1.3333333,3819.52,1889.76)"
        />
        <path
          d="m 1283.326,1227.573 h 57.223 v 84.101 h -57.223 z"
          style={{ fill: color, fillOpacity: 1, fillRule: 'nonzero', stroke: 'none' }}
          transform="matrix(1.3333333,0,0,-1.3333333,3819.52,1889.76)"
        />
        <path
          d="M 133.997,302.462 H 76.774 v -84.101 h 57.223 z"
          style={{ fill: color, fillOpacity: 1, fillRule: 'nonzero', stroke: 'none' }}
          transform="matrix(1.3333333,0,0,-1.3333333,3819.52,1889.76)"
        />
        <path
          d="M 133.997,470.664 H 76.774 v -84.101 h 57.223 z"
          style={{ fill: color, fillOpacity: 1, fillRule: 'nonzero', stroke: 'none' }}
          transform="matrix(1.3333333,0,0,-1.3333333,3819.52,1889.76)"
        />
        <path
          d="M 133.997,638.866 H 76.774 v -84.101 h 57.223 z"
          style={{ fill: color, fillOpacity: 1, fillRule: 'nonzero', stroke: 'none' }}
          transform="matrix(1.3333333,0,0,-1.3333333,3819.52,1889.76)"
        />
        <path
          d="M 133.997,807.068 H 76.774 v -84.101 h 57.223 z"
          style={{ fill: color, fillOpacity: 1, fillRule: 'nonzero', stroke: 'none' }}
          transform="matrix(1.3333333,0,0,-1.3333333,3819.52,1889.76)"
        />
        <path
          d="M 133.997,975.27 H 76.774 v -84.101 h 57.223 z"
          style={{ fill: color, fillOpacity: 1, fillRule: 'nonzero', stroke: 'none' }}
          transform="matrix(1.3333333,0,0,-1.3333333,3819.52,1889.76)"
        />
        <path
          d="M 133.997,1143.472 H 76.774 v -84.101 h 57.223 z"
          style={{ fill: color, fillOpacity: 1, fillRule: 'nonzero', stroke: 'none' }}
          transform="matrix(1.3333333,0,0,-1.3333333,3819.52,1889.76)"
        />
        <path
          d="M 133.997,1311.674 H 76.774 v -84.101 h 57.223 z"
          style={{ fill: color, fillOpacity: 1, fillRule: 'nonzero', stroke: 'none' }}
          transform="matrix(1.3333333,0,0,-1.3333333,3819.52,1889.76)"
        />
      </g>
    </svg>
  );
});

DimensionsIcon.displayName = 'DimensionsIcon'; 