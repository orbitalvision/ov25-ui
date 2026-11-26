'use client';

import { useId, type SVGProps } from 'react';

import { cn } from '../../lib/utils';

export interface SpinnerProps
  extends Omit<SVGProps<SVGSVGElement>, 'children' | 'height' | 'width'> {
  /** Rendered size — a number (px) or any CSS length, such as `2.5rem`. */
  size?: number | string;
  /** Accessible name used when the spinner is not decorative. */
  label?: string;
  /** @deprecated Kept for compatibility with the previous stroked spinner. */
  strokeWidth?: number;
}

const CIRCLE_PATH = [
  'M 24 32',
  'C 34 14 66 14 76 32',
  'C 87 51 74 78 50 78',
  'C 26 78 13 51 24 32',
  'Z',
].join(' ');

const TRIANGLE_PATH = [
  'M 22 25',
  'C 40 25 60 25 78 25',
  'C 68 42 58 60 50 75',
  'C 42 60 32 42 22 25',
  'Z',
].join(' ');

const LOOPED_CIRCLE_PATH = `${CIRCLE_PATH} ${CIRCLE_PATH}`;
const LOOPED_TRIANGLE_PATH = `${TRIANGLE_PATH} ${TRIANGLE_PATH}`;
const DOT_COUNT = 10;
const DOTS = Array.from({ length: DOT_COUNT });
const DOT_RADIUS = 2.6;
const DURATION_SECONDS = 3.6;
const MOTION_KEY_TIMES = '0; 0.28; 0.41; 0.76; 0.89; 1';
const MOTION_KEY_POINTS = [0, 0.16, 0.21, 0.39, 0.44, 0.5];
const MOTION_KEY_SPLINES = Array(5).fill('0.45 0 0.55 1').join('; ');

function getDotKeyPoints(index: number) {
  const offset = index / (DOT_COUNT * 2);
  return MOTION_KEY_POINTS.map((point) => (point + offset).toFixed(4)).join('; ');
}

/**
 * OV25's shared loading mark (a copy of OV25's components/ui/spinner.tsx; keep the two in step). Dots orbit a path that morphs between the OV
 * circle and inverted triangle; reduced-motion users receive a static mark.
 */
export function Spinner({
  'aria-hidden': ariaHidden,
  className,
  label = 'Loading',
  size = 24,
  ...svgProps
}: SpinnerProps) {
  const pathId = `ov-loading-path-${useId().replace(/:/g, '')}`;
  const isDecorative = ariaHidden === true || ariaHidden === 'true';

  return (
    <svg
      {...svgProps}
      aria-hidden={ariaHidden}
      aria-label={isDecorative ? undefined : label}
      className={cn('block shrink-0 overflow-visible', className)}
      height={size}
      role={isDecorative ? undefined : 'img'}
      viewBox="0 0 100 100"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className="motion-reduce:hidden"
        d={LOOPED_CIRCLE_PATH}
        fill="none"
        id={pathId}
      >
        <animate
          attributeName="d"
          calcMode="spline"
          dur={`${DURATION_SECONDS}s`}
          keySplines="0 0 1 1; 0.77 0 0.175 1; 0 0 1 1; 0.77 0 0.175 1; 0 0 1 1"
          keyTimes={MOTION_KEY_TIMES}
          repeatCount="indefinite"
          values={`${LOOPED_CIRCLE_PATH}; ${LOOPED_CIRCLE_PATH}; ${LOOPED_TRIANGLE_PATH}; ${LOOPED_TRIANGLE_PATH}; ${LOOPED_CIRCLE_PATH}; ${LOOPED_CIRCLE_PATH}`}
        />
      </path>

      <g className="motion-reduce:hidden" fill="currentColor">
        {DOTS.map((_, index) => (
          <circle fill="currentColor" key={index} opacity={0.24} r={DOT_RADIUS}>
            <animate
              attributeName="opacity"
              begin={`${-(DOT_COUNT - index - 1) / DOT_COUNT}s`}
              calcMode="spline"
              dur="1s"
              keySplines="0.45 0 0.55 1; 0.45 0 0.55 1"
              keyTimes="0; 0.5; 1"
              repeatCount="indefinite"
              values="0.24; 1; 0.24"
            />
            <animateMotion
              calcMode="spline"
              dur={`${DURATION_SECONDS}s`}
              keyPoints={getDotKeyPoints(index)}
              keySplines={MOTION_KEY_SPLINES}
              keyTimes={MOTION_KEY_TIMES}
              repeatCount="indefinite"
            >
              <mpath href={`#${pathId}`} xlinkHref={`#${pathId}`} />
            </animateMotion>
          </circle>
        ))}
      </g>

      <g className="hidden motion-reduce:block" fill="currentColor">
        <circle cx="24" cy="32" r={DOT_RADIUS} />
        <circle cx="76" cy="32" opacity={0.65} r={DOT_RADIUS} />
        <circle cx="50" cy="78" opacity={0.35} r={DOT_RADIUS} />
      </g>
    </svg>
  );
}

export default Spinner;
