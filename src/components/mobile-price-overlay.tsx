import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useOV25UI } from '../contexts/ov25-ui-context';
import { createPortal } from 'react-dom';

export const MobilePriceOverlay = () => {
  const { price, isMobile, isVariantsOpen } = useOV25UI();
  
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
    <div className="absolute inset-0 w-full h-full flex justify-center items-start z-[9999] pointer-events-none">
      <div className="rounded-full relative bg-white border-[#E5E5E5] shadow-sm px-4 pr-3.5 py-0 flex items-center mt-4 gap-2 pointer-events-auto">
        <p className="text-sm text-[#282828]">£{(price / 100).toFixed(2)}</p>
        <div className="w-[1px] -mt-4 h-12 bg-[#E5E5E5]"></div>
        <ShoppingCart className="w-4 h-4 text-[#282828]" />
      </div>
    </div>
  );

  // Use React Portal to inject the overlay into the iframe container
  return createPortal(overlayContent, container);
}; 