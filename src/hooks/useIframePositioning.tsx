import { useEffect, useRef } from 'react';
import { useOV25UI } from '../contexts/ov25-ui-context.js';
import { IFRAME_HEIGHT_RATIO } from '../utils/configurator-utils.js';
import { MODAL_GALLERY_SLOT_ID } from '../components/ConfiguratorModal.js';
import {
  findElementByIdInShadowOrRegularDOM,
  findIframeWithUniqueId,
} from '../utils/configurator-dom-queries.js';

/** Variant sheet UI (e.g. VariantContentDesktop) uses z-index 2147483644; iframe + deferThreeD poster must stack above it. */
const DESKTOP_SHEET_IFRAME_Z_INDEX = '2147483645';

/**
 * Hook to position the iframe and its container at the top of the screen when drawer is open
 */
export const useIframePositioning = () => {
  const {
    isDrawerOrDialogOpen,
    isMobile,
    drawerSize,
    isProductGalleryStacked,
    isSnap2Mode,
    uniqueId,
    configuratorDisplayMode,
    configuratorDisplayModeMobile,
    useInstantIframeCloseRestore,
    setUseInstantIframeCloseRestore,
    stackedGalleryCloseSyncImmediateRef,
  } = useOV25UI();
  const isModalMode = isMobile ? configuratorDisplayModeMobile === 'modal' : configuratorDisplayMode === 'modal';
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
      pointerEvents: string;
      visibility: string;
      transform: string;
      transition: string;
      opacity: string;
    };
    iframe: {
      position: string;
      top: string;
      left: string;
      width: string;
      height: string;
      zIndex: string;
      pointerEvents: string;
      visibility: string;
      transform: string;
      transition: string;
      opacity: string;
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

    const snap2MobileInline =
      isSnap2Mode && isMobile && !isModalMode && configuratorDisplayModeMobile === 'inline';
    if (snap2MobileInline) {
      return () => {};
    }

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

      if (useInstantIframeCloseRestore) {
        Object.assign(container.style, styles.container);
        Object.assign(iframe.style, styles.iframe);
        Object.assign(parent.style, styles.parent);
        setUseInstantIframeCloseRestore(false);
        stackedGalleryCloseSyncImmediateRef.current = true;
        return;
      }

      if (isModalMode) {
        Object.assign(container.style, styles.container);
        Object.assign(iframe.style, styles.iframe);
        Object.assign(parent.style, styles.parent);
      } else if (isMobile) {
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
            pointerEvents: container.style.pointerEvents,
            visibility: container.style.visibility,
            transform: 'translateX(0) translateY(0)',
            transition: container.style.transition || '',
            opacity: container.style.opacity || '',
          },
          iframe: {
            position: iframe.style.position,
            top: iframe.style.top,
            left: iframe.style.left,
            width: iframe.style.width,
            height: iframe.style.height,
            zIndex: iframe.style.zIndex,
            pointerEvents: iframe.style.pointerEvents,
            visibility: iframe.style.visibility,
            transform: 'translateX(0) translateY(0)',
            transition: iframe.style.transition || '',
            opacity: iframe.style.opacity || '',
          },
          parent: {
            height: parent.style.height,
            width: parent.style.width,
            overflow: parent.style.overflow,
          }
        };
      }

      // Sheet/drawer: lock gallery row size so the slide animation has a stable box. Modal uses a fixed
      // shell over the slot — locking the parent breaks mobile (wrong preload size, overflow fights).
      if (!isModalMode) {
        const containerOriginalHeight = container.offsetHeight;
        const containerOriginalWidth = container.offsetWidth;
        parent.style.height = `${containerOriginalHeight}px`;
        parent.style.width = `${containerOriginalWidth}px`;
        parent.style.overflow = 'hidden';
      }

      // Opening animation code
      if (isModalMode) {
        // Modal: shell + optional bitmap animate in ConfiguratorModal first; then iframe snaps here in one step.
        const frameIdRef = { current: 0 };

        const syncModalIframeToSlot = () => {
          const slot = findElementByIdInShadowOrRegularDOM(MODAL_GALLERY_SLOT_ID);
          if (!slot) return;
          const rect = slot.getBoundingClientRect();
          if (rect.width < 1 || rect.height < 1) return;

          container.style.transition = 'none';
          iframe.style.transition = 'none';

          container.style.position = 'fixed';
          container.style.top = `${rect.top}px`;
          container.style.left = `${rect.left}px`;
          container.style.width = `${rect.width}px`;
          container.style.height = `${rect.height}px`;
          container.style.right = 'auto';
          container.style.zIndex = '2147483647';
          container.style.borderRadius = isMobile
            ? '1.5rem 1.5rem 0 0'
            : isSnap2Mode ? '1.5rem' : '1.5rem 0 0 1.5rem';
          container.style.overflow = 'hidden';
          container.style.pointerEvents = 'auto';
          container.style.visibility = 'visible';
          container.style.opacity = '1';
          container.style.setProperty('transform', 'none', 'important');
          container.style.willChange = 'auto';

          iframe.style.position = 'absolute';
          iframe.style.top = '0';
          iframe.style.left = '0';
          iframe.style.width = '100%';
          iframe.style.height = '100%';
          iframe.style.zIndex = '1';
          iframe.style.pointerEvents = 'auto';
          iframe.style.visibility = 'visible';
          iframe.style.opacity = '1';
          iframe.style.setProperty('transform', 'none', 'important');
          iframe.style.willChange = 'auto';
        };

        const runSync = () => {
          syncModalIframeToSlot();
        };

        frameIdRef.current = requestAnimationFrame(() => {
          frameIdRef.current = requestAnimationFrame(runSync);
        });

        const resizeObserver = new ResizeObserver(runSync);
        const slotEl = findElementByIdInShadowOrRegularDOM(MODAL_GALLERY_SLOT_ID);
        if (slotEl) resizeObserver.observe(slotEl);

        const onVisualViewportChange = () => {
          runSync();
        };
        if (isMobile && window.visualViewport) {
          window.visualViewport.addEventListener('resize', onVisualViewportChange);
          window.visualViewport.addEventListener('scroll', onVisualViewportChange);
        }

        const onWindowResizeModal = () => runSync();
        if (!isSnap2Mode) {
          window.addEventListener('resize', onWindowResizeModal);
        }

        return () => {
          cancelAnimationFrame(frameIdRef.current);
          resizeObserver.disconnect();
          if (!isSnap2Mode) {
            window.removeEventListener('resize', onWindowResizeModal);
          }
          if (isMobile && window.visualViewport) {
            window.visualViewport.removeEventListener('resize', onVisualViewportChange);
            window.visualViewport.removeEventListener('scroll', onVisualViewportChange);
          }
        };
      } else if (isMobile) {
        const updateMobileHeight = () => {
          const viewportHeight = window.visualViewport?.height !== undefined ? window.visualViewport?.height : window.innerHeight;
          const iframeHeight = viewportHeight * IFRAME_HEIGHT_RATIO;
          container.style.height = `${iframeHeight}px`;
          iframe.style.height = `${iframeHeight}px`;
        };

        updateMobileHeight();

        container.style.width = '100%';
        container.style.right = '0';
        iframe.style.width = '100%';

        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.right = '0';
        container.style.zIndex = '0';
        container.style.borderRadius = '0';
        container.style.zIndex = '100';
        container.style.overflow = 'hidden';
        container.style.visibility = 'visible';
        iframe.style.visibility = 'visible';

        iframe.style.position = 'fixed';
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.style.zIndex = '100';

        window.visualViewport?.addEventListener('resize', updateMobileHeight);
        window.visualViewport?.addEventListener('scroll', updateMobileHeight);
        window.addEventListener('resize', updateMobileHeight);

        container.style.transform = 'translateY(-100%)';
        iframe.style.transform = 'translateY(-100%)';

        requestAnimationFrame(() => {
          iframe.style.transition = 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1)';
          container.style.transition = 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1)';
          container.style.transform = 'translateY(0%)';
          iframe.style.transform = 'translateY(0%)';
          updateMobileHeight();
        });

        return () => {
          window.visualViewport?.removeEventListener('resize', updateMobileHeight);
          window.visualViewport?.removeEventListener('scroll', updateMobileHeight);
          window.removeEventListener('resize', updateMobileHeight);
          window.removeEventListener('resize', updateIframeWidth);
        };
      } else {
        // Desktop sheet opening animation
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
        container.style.borderRadius = '0';
        container.style.zIndex = DESKTOP_SHEET_IFRAME_Z_INDEX;
        container.style.overflow = 'hidden';
        container.style.visibility = 'visible';
        iframe.style.visibility = 'visible';

        iframe.style.position = 'fixed';
        iframe.style.top = '0';
        iframe.style.left = '0';
        // Keep iframe below ConfiguratorViewControls (z-[101]) inside the sheet; only the outer
        // container needs DESKTOP_SHEET_IFRAME_Z_INDEX to sit above the variant overlay (2147483644).
        iframe.style.zIndex = '1';

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
    // Intentionally omit useInstantIframeCloseRestore: including it re-ran this effect when the flag
    // flipped false after instant restore, and handleDrawerClose() then applied the legacy slide-out.
  }, [
    isDrawerOrDialogOpen,
    isMobile,
    isSnap2Mode,
    uniqueId,
    isModalMode,
    configuratorDisplayModeMobile,
    setUseInstantIframeCloseRestore,
    stackedGalleryCloseSyncImmediateRef,
  ]);

  // This useEffect handles drawer size changes (mobile drawer is always "large" when open)
  useEffect(() => {
    if (!(isDrawerOrDialogOpen && isMobile)) return;
    if (isModalMode) return;
    if (isSnap2Mode && configuratorDisplayModeMobile === 'inline') return;

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
  }, [drawerSize, isDrawerOrDialogOpen, isModalMode, isSnap2Mode, isMobile, isProductGalleryStacked, uniqueId, configuratorDisplayModeMobile])
};

export default useIframePositioning;