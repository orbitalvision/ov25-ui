import React from 'react';

const DEFAULT_LOGO_URL = 'https://ov25.orbital.vision/OV.png';

export interface OVOrBrandLogoProps {
  imageUrl?: string;
  className?: string;
}

export const OVOrBrandLogo: React.FC<OVOrBrandLogoProps> = ({ imageUrl, className = '' }) => {
  const effectiveUrl = imageUrl ?? DEFAULT_LOGO_URL;
  const isDefault = !imageUrl;

  if (isDefault) {
    return (
      <div
        className={`ov25-variant-header-logo ov25-brand-gradient ${className}`}
        style={{
          width: '8.75rem',
          height: '4rem',
          WebkitMaskImage: `url(${effectiveUrl})`,
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskImage: `url(${effectiveUrl})`,
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
        }}
      />
    );
  }

  return (
    <div className={`ov:flex ov:flex-col ov:items-center ov:justify-center ${className}`}>
      <img className="ov:h-full ov:w-auto ov:object-contain" src={effectiveUrl} alt="" />
    </div>
  );
};
