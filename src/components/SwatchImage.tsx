import React from 'react';
import { SWATCH_PATH } from '../lib/svgs/SwatchIconSvg.js';
import { cn } from '../lib/utils.js';

export interface SwatchImageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
}

export const SwatchImage: React.FC<SwatchImageProps> = ({
  src,
  alt,
  className,
  imgClassName,
  ...props
}) => {
  const clipId = React.useId().replace(/:/g, '');
  return (
    <div className={cn('ov:relative ov:block ov:overflow-hidden', className)} {...props}>
      <svg
        viewBox="-1 -1 34 34"
        className="ov:block ov:w-full ov:h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <clipPath id={clipId}>
            <path d={SWATCH_PATH} />
          </clipPath>
        </defs>
        <image
          href={src}
          x="-1"
          y="-1"
          width="36"
          height="36"
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${clipId})`}
          className={imgClassName}
        />
      </svg>
    </div>
  );
};
