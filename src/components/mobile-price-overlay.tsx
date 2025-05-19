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
  const container = document.getElementById('ov25-configurator-iframe-container');
  if (!container) {
    return null;
  }

  // Create portal content
  const overlayContent = (
    <div className={`absolute inset-0 w-full h-full flex text-[var(--ov25-secondary-text-color)] justify-center items-start z-[9999] pointer-events-none duration-300 transition-opacity ${drawerSize === 'large' ? 'opacity-0 ' : 'opacity-100'}`}>
      <div className="rounded-[var(--ov25-button-border-radius)] bg-[var(--ov25-primary-color)] backdrop-blur-md px-4 py-1.5 mt-4 flex items-center gap-2">
        {logoURL ? (
          <img src={logoURL} alt="Logo" className="h-6 w-auto" />
        ) : (
          <p className="text-sm font-semibold">£{(price / 100).toFixed(2)}</p>
        )}
      </div>
    </div>
  );

  // Use React Portal to inject the overlay into the iframe container
  return createPortal(overlayContent, container);
}; 