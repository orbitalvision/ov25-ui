import { useEffect,  } from 'react';
import { useOV25UI } from '../contexts/ov25-ui-context.js';
import { IFRAME_HEIGHT_RATIO } from '../utils/configurator-utils.js';

/**
 * Helper function to find an element in Shadow DOM or regular DOM
 */
const findElementByIdInShadowOrRegularDOM = (id: string): HTMLElement | null => {
  // Try regular DOM first
  const element = document.getElementById(id);
  if (element) return element;
  
  // If not found, search in all shadow roots
  const shadowHosts = document.querySelectorAll('div[class^="ov25-configurator-"]');
  for (const host of Array.from(shadowHosts)) {
    if (host.shadowRoot) {
      const elementInShadow = host.shadowRoot.getElementById(id);
      if (elementInShadow) return elementInShadow;
      
      // Also search nested shadow roots if needed
      const nestedHosts = host.shadowRoot.querySelectorAll('div[class^="ov25-configurator-"]');
      for (const nestedHost of Array.from(nestedHosts)) {
        if (nestedHost.shadowRoot) {
          const nestedElement = nestedHost.shadowRoot.getElementById(id);
          if (nestedElement) return nestedElement;
        }
      }
    }
  }
  
  return null;
};

/**
 * Hook to position the iframe and its container at the top of the screen when drawer is open
 */
export const useIframePositioning = () => {
  const {isDrawerOrDialogOpen , isMobile, drawerSize, isProductGalleryStacked } = useOV25UI();


  useEffect(() => {
    if(isDrawerOrDialogOpen){
        const iframe = findElementByIdInShadowOrRegularDOM('ov25-configurator-iframe');
        const container = findElementByIdInShadowOrRegularDOM('ov25-configurator-iframe-container');
        if(!container || !iframe) return;

        const originalIframeHeight = iframe.style.height;
        const originalContainerHeight = container.style.height;

        // Add transition
        iframe.style.transition = 'height 500ms cubic-bezier(0.4, 0, 0.2, 1)';
        container.style.transition = 'height 500ms cubic-bezier(0.4, 0, 0.2, 1)';

        if(drawerSize === 'large'){
            const newHeight = `${window.innerHeight * IFRAME_HEIGHT_RATIO}px`;
            iframe.style.height = newHeight;
            container.style.height = newHeight;
        } else if(drawerSize === 'small'){
            iframe.style.height = '100vw';
            container.style.height = '100vw';
        }

        // Remove transition after animation completes
        setTimeout(() => {
            iframe.style.transition = 'none';
            container.style.transition = 'none';
        }, 500);

        return () => {
            iframe.style.height = originalIframeHeight;
            container.style.height = originalContainerHeight;
        };
    }
  }, [drawerSize, isDrawerOrDialogOpen])


  useEffect(() => {
    // Get the iframe element and container
    const iframe = findElementByIdInShadowOrRegularDOM('ov25-configurator-iframe');
    const container = findElementByIdInShadowOrRegularDOM(isProductGalleryStacked ? 'true-ov25-configurator-iframe-container' : 'ov25-configurator-iframe-container');

    
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
      transform: 'translateX(0) translateY(0)',
      transition: 'none',
    };

    
    const originalIframeStyles = {
      position: iframe.style.position,
      top: iframe.style.top,
      left: iframe.style.left,
      width: iframe.style.width,
      height: iframe.style.height,
      zIndex: iframe.style.zIndex,
      transform: 'translateX(0) translateY(0)',
      transition: 'none',
    };

    const updateIframeWidth = () => {
      if (!isDrawerOrDialogOpen || isMobile) return;
      
      const variantMenuContainer = findElementByIdInShadowOrRegularDOM('ov25-configurator-variant-menu-container');
      const variantMenuWidth = variantMenuContainer?.offsetWidth;
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
      container.style.zIndex = '0';
      container.style.borderRadius = '0';
      container.style.zIndex = '100';
      
      // Only adjust width on desktop
      if (!isMobile) {

        setTimeout(() => {
          updateIframeWidth();  
        }, 100);

        container.style.height = '100%';
        iframe.style.height = '100%';
        window.addEventListener('resize', updateIframeWidth);

        container.style.transform = 'translateX(-100%)';

        iframe.style.transform = 'translateX(-100%)';

        setTimeout(() => {
            iframe.style.transition = 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1)';
            container.style.transition = 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1)';
            container.style.transform = 'translateX(0%)';
            iframe.style.transform = 'translateX(0%)';
        }, 50)

      } else {
        // On mobile, use full width
        container.style.width = '100%';
        container.style.height = '100vw';
        iframe.style.height = '100vw';
        container.style.right = '0';
        iframe.style.width = '100%';


        container.style.transform = 'translateY(-100%)';

        iframe.style.transform = 'translateY(-100%)';

        setTimeout(() => {
            iframe.style.transition = 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1)';
            container.style.transition = 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1)';
            container.style.transform = 'translateY(0%)';
            iframe.style.transform = 'translateY(0%)';
        }, 50)
      }
      
      container.style.overflow = 'hidden';
      
      // Set fixed positioning for iframe
      iframe.style.position = 'fixed';
      iframe.style.top = '0';
      iframe.style.left = '0';
      iframe.style.zIndex = '100';
    }


    
    // Cleanup function to restore original styles
    return () => {
      // Always remove the resize event listener, regardless of drawer state
      window.removeEventListener('resize', updateIframeWidth);
      
      if(isMobile){
        if (isDrawerOrDialogOpen) {
            container.style.transform = 'translateY(-100%)';
            iframe.style.transform = 'translateY(-100%)';
            
            
            setTimeout(() => {
            container.style.position = originalContainerStyles.position;
            container.style.top = originalContainerStyles.top;
            container.style.left = originalContainerStyles.left;
            container.style.right = originalContainerStyles.right;
            container.style.zIndex = originalContainerStyles.zIndex;
            container.style.borderRadius = originalContainerStyles.borderRadius;
            container.style.height = originalContainerStyles.height;
            container.style.width = originalContainerStyles.width;
            container.style.overflow = originalContainerStyles.overflow;
            container.style.transform = originalContainerStyles.transform;
            container.style.transition = originalContainerStyles.transition;
            
            iframe.style.position = originalIframeStyles.position;
            iframe.style.top = originalIframeStyles.top;
            iframe.style.left = originalIframeStyles.left;
            iframe.style.width = originalIframeStyles.width;
            iframe.style.height = originalIframeStyles.height;
            iframe.style.zIndex = originalIframeStyles.zIndex;
            iframe.style.transform = originalIframeStyles.transform;
            iframe.style.transition = originalIframeStyles.transition;
        }, 400)
          }
      } else{
        if (isDrawerOrDialogOpen) {
            container.style.transform = 'translateX(-100%)';
            iframe.style.transform = 'translateX(-100%)';
            
            // Remove immediate z-index reset
            
            setTimeout(() => {
                container.style.position = originalContainerStyles.position;
                container.style.top = originalContainerStyles.top;
                container.style.left = originalContainerStyles.left;
                container.style.right = originalContainerStyles.right;
                container.style.zIndex = originalContainerStyles.zIndex;
                container.style.borderRadius = originalContainerStyles.borderRadius;
                container.style.height = originalContainerStyles.height;
                container.style.width = originalContainerStyles.width;
                container.style.overflow = originalContainerStyles.overflow;
                container.style.transform = originalContainerStyles.transform;
                container.style.transition = originalContainerStyles.transition;
                
                iframe.style.position = originalIframeStyles.position;
                iframe.style.top = originalIframeStyles.top;
                iframe.style.left = originalIframeStyles.left;
                iframe.style.width = originalIframeStyles.width;
                iframe.style.height = originalIframeStyles.height;
                iframe.style.zIndex = originalIframeStyles.zIndex;
                iframe.style.transform = originalIframeStyles.transform;
                iframe.style.transition = originalIframeStyles.transition;
            }, 500)
          }
      }
      
      
    };
  }, [isDrawerOrDialogOpen, isMobile]);
};

export default useIframePositioning;