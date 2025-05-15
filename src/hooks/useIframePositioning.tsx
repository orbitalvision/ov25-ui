import { useEffect } from 'react';
import { useOV25UI } from '../contexts/ov25-ui-context.js';

/**
 * Hook to position the iframe and its container at the top of the screen when drawer is open
 */
export const useIframePositioning = () => {
  const { isDrawerOrDialogOpen, isMobile } = useOV25UI();

  useEffect(() => {
    // Get the iframe element and container
    const iframe = document.getElementById('ov25-configurator-iframe');
    const container = document.getElementById('ov25-configurator-iframe-container');
    
    if (!iframe || !container) return;
    
    // Store original styles to restore later
    const originalContainerStyles = {
      position: container.style.position,
      top: container.style.top,
      left: container.style.left,
      right: container.style.right,
      zIndex: container.style.zIndex,
      borderRadius: container.style.borderRadius,
      height: container.style.height,
      width: container.style.width,
      overflow: container.style.overflow,
    };
    
    const originalIframeStyles = {
      position: iframe.style.position,
      top: iframe.style.top,
      left: iframe.style.left,
      width: iframe.style.width,
      height: iframe.style.height,
      zIndex: iframe.style.zIndex,
    };

    const updateIframeWidth = () => {
      if (!isDrawerOrDialogOpen || isMobile) return;
      
      const variantMenuWidth = document.getElementById('ov25-configurator-variant-menu-container')?.offsetWidth;
      if(typeof variantMenuWidth !== 'number') {
        console.error('Variant menu does not exist yet');
      }
      const remainingWidth = window.innerWidth - (variantMenuWidth || 0);
      container.style.width = `${remainingWidth}px`;
      iframe.style.width = `${remainingWidth}px`;
    }
    
    if (isDrawerOrDialogOpen) {
      // Set fixed positioning for container
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.right = '0';
      container.style.zIndex = '10';
      container.style.borderRadius = '0';
      
      // Only adjust width on desktop
      if (!isMobile) {
        setTimeout(() => {
          // on first render, wait until the variant menu exists
          updateIframeWidth();
        }, 100);
        container.style.height = '100%';
        iframe.style.height = '100%';
        window.addEventListener('resize', updateIframeWidth);
      } else {
        // On mobile, use full width
        container.style.width = '100%';
        container.style.height = '100vw';
        iframe.style.height = '100vw';
        container.style.right = '0';
        iframe.style.width = '100%';
      }
      
      container.style.overflow = 'hidden';
      
      // Set fixed positioning for iframe
      iframe.style.position = 'fixed';
      iframe.style.top = '0';
      iframe.style.left = '0';
      iframe.style.zIndex = '10';
    }
    
    // Cleanup function to restore original styles
    return () => {
      // Always remove the resize event listener, regardless of drawer state
      window.removeEventListener('resize', updateIframeWidth);
      
      if (isDrawerOrDialogOpen) {
        container.style.position = originalContainerStyles.position;
        container.style.top = originalContainerStyles.top;
        container.style.left = originalContainerStyles.left;
        container.style.right = originalContainerStyles.right;
        container.style.zIndex = originalContainerStyles.zIndex;
        container.style.borderRadius = originalContainerStyles.borderRadius;
        container.style.height = originalContainerStyles.height;
        container.style.width = originalContainerStyles.width;
        container.style.overflow = originalContainerStyles.overflow;
        
        iframe.style.position = originalIframeStyles.position;
        iframe.style.top = originalIframeStyles.top;
        iframe.style.left = originalIframeStyles.left;
        iframe.style.width = originalIframeStyles.width;
        iframe.style.height = originalIframeStyles.height;
        iframe.style.zIndex = originalIframeStyles.zIndex;
      }
    };
  }, [isDrawerOrDialogOpen, isMobile]);
};

export default useIframePositioning;