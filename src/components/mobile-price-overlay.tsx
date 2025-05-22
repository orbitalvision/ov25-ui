import React from 'react';
import { useOV25UI } from '../contexts/ov25-ui-context.js';
import { createPortal } from 'react-dom';

export const MobilePriceOverlay = () => {
  const { price, isMobile, isVariantsOpen, drawerSize, logoURL } = useOV25UI();
  
  // Only show on mobile when variants are open
  if (!isMobile || !isVariantsOpen) {
    return null;
  }

  // Find the target container
  const container = document.getElementById('true-ov25-configurator-iframe-container');
  if (!container) {
    return null;
  }

  // Create portal content
  const overlayContent = (
    <div className={`orbitalvision:absolute orbitalvision:inset-0 orbitalvision:w-full orbitalvision:h-full orbitalvision:flex orbitalvision:text-[var(--ov25-secondary-text-color)] orbitalvision:justify-center orbitalvision:items-start orbitalvision:z-[101] orbitalvision:pointer-events-none orbitalvision:duration-300 orbitalvision:transition-opacity ${drawerSize === 'large' ? 'orbitalvision:opacity-0 ' : 'orbitalvision:opacity-100'}`}>
      <div className="orbitalvision:rounded-[var(--ov25-button-border-radius)] orbitalvision:bg-[var(--ov25-primary-color)] orbitalvision:backdrop-blur-md orbitalvision:px-4 orbitalvision:py-1.5 orbitalvision:mt-4 orbitalvision:flex orbitalvision:items-center orbitalvision:gap-2">
        {logoURL ? (
          <img src={logoURL} alt="Logo" className="orbitalvision:h-6 orbitalvision:w-auto" />
        ) : (
          <p className="orbitalvision:text-sm orbitalvision:font-semibold">£{(price / 100).toFixed(2)}</p>
        )}
      </div>
    </div>
  );

  // Use React Portal to inject the overlay into the iframe container
  return createPortal(overlayContent, container);
}; 