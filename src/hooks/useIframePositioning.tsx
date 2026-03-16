import { useEffect, useRef } from 'react';
import { useOV25UI } from '../contexts/ov25-ui-context.js';
import { IFRAME_HEIGHT_RATIO } from '../utils/configurator-utils.js';

/**
 * Helper function to find an element in Shadow DOM or regular DOM
 */
const findElementByIdInShadowOrRegularDOM = (id: string): HTMLElement | null => {
  
  // Try regular DOM first
  const element = document.getElementById(id);
  if (element) {
    return element;
  }
  
  // Special case for variant menu container - look in the variants shadow container
  if (id === 'ov25-configurator-variant-menu-container') {
    const variantsShadowContainer = document.getElementById('ov25-variants-shadow-container');
    if (variantsShadowContainer?.shadowRoot) {
      const elementInShadow = variantsShadowContainer.shadowRoot.getElementById(id);
      if (elementInShadow) {
        return elementInShadow;
      }
    }
  }

  // Snap2 mobile: iframe container lives inside mobile drawer shadow root
  const mobileDrawerContainer = document.getElementById('ov25-mobile-drawer-container');
  if (mobileDrawerContainer?.shadowRoot) {
    const elementInShadow = mobileDrawerContainer.shadowRoot.getElementById(id);
    if (elementInShadow) {
      return elementInShadow;
    }
  }

  // If not found, search in all shadow roots
  const shadowHosts = document.querySelectorAll('div[class^="ov25-configurator-"]');
  
  for (const host of Array.from(shadowHosts)) {
    if (host.shadowRoot) {
      const elementInShadow = host.shadowRoot.getElementById(id);
      if (elementInShadow) {
        return elementInShadow;
      }
      
      // Also search nested shadow roots if needed
      const nestedHosts = host.shadowRoot.querySelectorAll('div[class^="ov25-configurator-"]');
      for (const nestedHost of Array.from(nestedHosts)) {
        if (nestedHost.shadowRoot) {
          const nestedElement = nestedHost.shadowRoot.getElementById(id);
          if (nestedElement) {
            return nestedElement;
          }
        }
      }
    }
  }
  
  return null;
};

/**
 * Helper function to find iframe with unique ID pattern
 */
const findIframeWithUniqueId = (uniqueId?: string): HTMLElement | null => {
  const iframeId = uniqueId ? `ov25-configurator-iframe-${uniqueId}` : 'ov25-configurator-iframe';
  const fromDoc = document.getElementById(iframeId);
  if (fromDoc) return fromDoc;

  const mobileDrawerContainer = document.getElementById('ov25-mobile-drawer-container');
  if (mobileDrawerContainer?.shadowRoot) {
    const fromShadow = mobileDrawerContainer.shadowRoot.getElementById(iframeId);
    if (fromShadow) return fromShadow;
  }

  return null;
};

/**
 * Hook to position the iframe and its container at the top of the screen when drawer is open
 */
export const useIframePositioning = () => {
  const { isDrawerOrDialogOpen, isMobile, drawerSize, isProductGalleryStacked, isSnap2Mode, uniqueId } = useOV25UI();
  const originalStyles = useRef<{
    container: {
      position: string;
      top: string;
      left: string;
      right: string;
      zIndex: string;
      borderRadius: string;
      height: string;
      width: string;
      overflow: string;
      transform: string;
      transition: string;
    };
    iframe: {
      position: string;
      top: string;
      left: string;
      width: string;
      height: string;
      zIndex: string;
      transform: string;
      transition: string;
    };
    parent: {
      height: string;
      width: string;
      overflow: string;
    };
  } | null>(null);

  // This useEffect handles drawer opening and closing - saving and restoring original styles
  useEffect(() => {
    const iframe = findIframeWithUniqueId(uniqueId);
    const containerId = uniqueId ? `ov25-configurator-iframe-container-${uniqueId}` : 'ov25-configurator-iframe-container';
    const container = findElementByIdInShadowOrRegularDOM(isProductGalleryStacked ? 'true-ov25-configurator-iframe-container' : containerId);
    const parent = container?.parentElement;

    if (!iframe || !container || !parent) return;

    const updateIframeWidth = () => {
      if (!isDrawerOrDialogOpen || isMobile) return;
      
      const variantMenuContainer = findElementByIdInShadowOrRegularDOM('ov25-configurator-variant-menu-container');
      
      const variantMenuWidth = variantMenuContainer?.offsetWidth;
      
      if (typeof variantMenuWidth !== 'number') {
        console.error('Variant menu does not exist yet');
      }
      const remainingWidth = window.innerWidth - (variantMenuWidth || 0);
      
      container.style.width = `${remainingWidth}px`;
      iframe.style.width = `${remainingWidth}px`;
    }
    
    // Restores original styles when drawer is closed
    const handleDrawerClose = () => {
      if (!originalStyles.current) return;
      const styles = originalStyles.current;

      if (isMobile) {
        iframe.style.transition = 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1)';
        container.style.transition = 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1)';
        container.style.transform = 'translateY(-100%)';
        iframe.style.transform = 'translateY(-100%)';

        setTimeout(() => {
          Object.assign(container.style, styles.container);
          Object.assign(iframe.style, styles.iframe);
          Object.assign(parent.style, styles.parent);
        }, 400);
      } else {
        iframe.style.transition = 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1)';
        container.style.transition = 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1)';
        container.style.transform = 'translateX(-100%)';
        iframe.style.transform = 'translateX(-100%)';

        setTimeout(() => {
          Object.assign(container.style, styles.container);
          Object.assign(iframe.style, styles.iframe);
          Object.assign(parent.style, styles.parent);
        }, 500);
      }
    };

    if (isDrawerOrDialogOpen) {
      // Save original styles only when drawer first opens
      if (!originalStyles.current) {
        originalStyles.current = {
          container: {
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
          },
          iframe: {
            position: iframe.style.position,
            top: iframe.style.top,
            left: iframe.style.left,
            width: iframe.style.width,
            height: iframe.style.height,
            zIndex: iframe.style.zIndex,
            transform: 'translateX(0) translateY(0)',
            transition: 'none',
          },
          parent: {
            height: parent.style.height,
            width: parent.style.width,
            overflow: parent.style.overflow,
          }
        };
      }

      // Lock parent size to container's original dimensions before any changes
      const containerOriginalHeight = container.offsetHeight;
      const containerOriginalWidth = container.offsetWidth;
      parent.style.height = `${containerOriginalHeight}px`;
      parent.style.width = `${containerOriginalWidth}px`;
      parent.style.overflow = 'hidden';

      // Opening animation code
      if (isMobile) {
        const updateMobileHeight = () => {
          const viewportHeight = window.visualViewport?.height !== undefined ? window.visualViewport?.height : window.innerHeight;
          const iframeHeight = viewportHeight * IFRAME_HEIGHT_RATIO;
          container.style.height = `${iframeHeight}px`;
          iframe.style.height = `${iframeHeight}px`;
        };

        updateMobileHeight(); // Initial height update

        // Full width iframe on mobile
        container.style.width = '100%';
        container.style.right = '0';
        iframe.style.width = '100%';

        // Set fixed positioning for mobile
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.right = '0';
        container.style.zIndex = '0';
        container.style.borderRadius = '0';
        container.style.zIndex = '100';
        container.style.overflow = 'hidden';

        iframe.style.position = 'fixed';
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.style.zIndex = '100';

        // Add viewport event listeners for mobile
        window.visualViewport?.addEventListener('resize', updateMobileHeight);
        window.visualViewport?.addEventListener('scroll', updateMobileHeight);
        window.addEventListener('resize', updateMobileHeight);

        // Start animation (offscreen)
        container.style.transform = 'translateY(-100%)';
        iframe.style.transform = 'translateY(-100%)';

        setTimeout(() => {
          // Start animation after short delay(sliding onscreen)
          iframe.style.transition = 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1)';
          container.style.transition = 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1)';
          container.style.transform = 'translateY(0%)';
          iframe.style.transform = 'translateY(0%)';
          
          // Update height again after animation to ensure correct size
          updateMobileHeight();
        }, 50);

        return () => {
          window.visualViewport?.removeEventListener('resize', updateMobileHeight);
          window.visualViewport?.removeEventListener('scroll', updateMobileHeight);
          window.removeEventListener('resize', updateMobileHeight);
          window.removeEventListener('resize', updateIframeWidth);
        };
      } else {
        // Desktop opening animation code remains the same
        setTimeout(() => {
          updateIframeWidth();
        }, 100);

        container.style.height = '100%';
        iframe.style.height = '100%';
        window.addEventListener('resize', updateIframeWidth);

        // Set fixed positioning for desktop
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.right = '0';
        container.style.zIndex = '0';
        container.style.borderRadius = '0';
        container.style.zIndex = '100';
        container.style.overflow = 'hidden';

        iframe.style.position = 'fixed';
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.style.zIndex = '100';

        container.style.transform = 'translateX(-100%)';
        iframe.style.transform = 'translateX(-100%)';

        setTimeout(() => {
          iframe.style.transition = 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1)';
          container.style.transition = 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1)';
          container.style.transform = 'translateX(0%)';
          iframe.style.transform = 'translateX(0%)';
        }, 50);

        return () => {
          window.removeEventListener('resize', updateIframeWidth);
        };
      }
    } else {
      // Handle closing animation
      handleDrawerClose();
    }

    return () => {
      window.removeEventListener('resize', updateIframeWidth);
    };
  }, [isDrawerOrDialogOpen, isMobile, isSnap2Mode, uniqueId]);

  // This useEffect handles drawer size changes (mobile drawer is always "large" when open)
  useEffect(() => {
    if (!(isDrawerOrDialogOpen && isMobile)) return;
        const iframe = findIframeWithUniqueId(uniqueId);
        const containerId = uniqueId ? `ov25-configurator-iframe-container-${uniqueId}` : 'ov25-configurator-iframe-container';
        const container = findElementByIdInShadowOrRegularDOM(isProductGalleryStacked ? 'true-ov25-configurator-iframe-container' : containerId);
        if(!container || !iframe) return;

        const originalIframeHeight = iframe.style.height;
        const originalContainerHeight = container.style.height;

        iframe.style.transition = 'height 500ms cubic-bezier(0.4, 0, 0.2, 1)';
        container.style.transition = 'height 500ms cubic-bezier(0.4, 0, 0.2, 1)';

        const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
        const newHeight = `${viewportHeight * IFRAME_HEIGHT_RATIO}px`;
        iframe.style.height = newHeight;
        container.style.height = newHeight;

        return () => {
            if (!isDrawerOrDialogOpen) {
                iframe.style.transition = 'none';
                container.style.transition = 'none';
                iframe.style.height = originalIframeHeight;
                container.style.height = originalContainerHeight;
            }
        };
  }, [drawerSize, isDrawerOrDialogOpen, isSnap2Mode, isMobile, isProductGalleryStacked, uniqueId])
};

export default useIframePositioning;