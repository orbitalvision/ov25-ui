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
    <div className={`ov:absolute ov:inset-0 ov:w-full ov:h-full ov:flex ov:text-[var(--ov25-secondary-text-color)] ov:justify-center ov:items-start ov:z-[101] ov:pointer-events-none ov:duration-300 ov:transition-opacity ${drawerSize === 'large' ? 'ov:opacity-0 ' : 'ov:opacity-100'}`}>
      <div className="ov:rounded-[var(--ov25-button-border-radius)] ov:bg-[var(--ov25-primary-color)] ov:backdrop-blur-md ov:px-4 ov:py-1.5 ov:mt-4 ov:flex ov:items-center ov:gap-2">
        {logoURL ? (
          <img src={logoURL} alt="Logo" className="ov:h-6 ov:w-auto" />
        ) : (
          <p className="ov:text-sm ov:font-semibold">£{(price / 100).toFixed(2)}</p>
        )}
      </div>
    </div>
  );

  // Use React Portal to inject the overlay into the iframe container
  return createPortal(overlayContent, container);
}; 