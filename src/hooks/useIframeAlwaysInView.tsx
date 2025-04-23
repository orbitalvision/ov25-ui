import { useEffect } from 'react';
import { useOV25UI } from '../contexts/ov25-ui-context';

/**
 * Hook to make the iframe stay in view when variants menu is open on mobile
 * Uses the same conditions as MobilePriceOverlay
 */
export const useIframeAlwaysInView = () => {
  const { isMobile, isVariantsOpen, iframeRef } = useOV25UI();

  useEffect(() => {
    // Only apply when on mobile with variants open (same as MobilePriceOverlay)
    if (!isMobile || !isVariantsOpen) return;

    // Get the iframe element using either the ref or direct ID
    const iframe = iframeRef?.current || document.getElementById('ov-25-configurator-iframe');
    const container = document.getElementById('ov-25-configurator-iframe-container');
    
    if (!iframe || !container) return;
    
    // Store original styles to restore later
    const originalIframeStyles = {
      position: iframe.style.position,
      top: iframe.style.top,
      left: iframe.style.left,
      width: iframe.style.width,
      zIndex: iframe.style.zIndex,
      height: iframe.style.height,
    };
    
    const originalContainerStyles = {
      position: container.style.position,
      height: container.style.height,
    };
    
    // Set fixed positioning for iframe
    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.width = '100%';
    iframe.style.zIndex = '2'; // Lower than overlay (9999) to show price overlay above
    iframe.style.height = '80vh'; // Show part of the configurator
    
    // Adjust container to maintain layout
    container.style.position = 'relative';
    container.style.height = '80vh';
    
    // Cleanup function to restore original styles
    return () => {
      iframe.style.position = originalIframeStyles.position;
      iframe.style.top = originalIframeStyles.top;
      iframe.style.left = originalIframeStyles.left;
      iframe.style.width = originalIframeStyles.width;
      iframe.style.zIndex = originalIframeStyles.zIndex;
      iframe.style.height = originalIframeStyles.height;
      
      container.style.position = originalContainerStyles.position;
      container.style.height = originalContainerStyles.height;
    };
  }, [isMobile, isVariantsOpen, iframeRef]);
};

export default useIframeAlwaysInView; 