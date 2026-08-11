// Content component for desktop view
import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import { useOV25UI } from "../../contexts/ov25-ui-context.js";
import { requestTransitionSnapshotFromIframe } from "../../utils/request-transition-snapshot-from-iframe.js";
import { getConfiguratorIframeContainerScreenRect } from "../../utils/configurator-dom-queries.js";
import { ProductVariantsWrapper } from './ProductVariantsWrapper.js';
import { Snap2Wrapper } from './Snap2Wrapper.js';
import { WizardVariants } from './WizardVariants.js';
import { VariantsHeader } from './VariantsHeader.js';

const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

type SavedInlineStyleDeclaration = {
  property: string;
  value: string;
  priority: string;
};

type DesktopSheetPageLockSnapshot = {
  bodyDeclarations: SavedInlineStyleDeclaration[];
  htmlDeclarations: SavedInlineStyleDeclaration[];
  scrollX: number;
  scrollY: number;
};

const BODY_PAGE_LOCK_PROPERTIES = new Set([
  'overflow',
  'overflow-x',
  'overflow-y',
  'position',
  'inset',
  'top',
  'right',
  'bottom',
  'left',
  'width',
  'min-width',
  'max-width',
  'box-sizing',
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
]);
const HTML_PAGE_LOCK_PROPERTIES = new Set([
  'overflow',
  'overflow-x',
  'overflow-y',
  'scrollbar-gutter',
]);

let desktopSheetPageLockCount = 0;
let desktopSheetPageLockSnapshot: DesktopSheetPageLockSnapshot | null = null;

function captureInlineStyleDeclarations(
  element: HTMLElement,
  properties: Set<string>,
): SavedInlineStyleDeclaration[] {
  const declarations: SavedInlineStyleDeclaration[] = [];
  for (let index = 0; index < element.style.length; index += 1) {
    const property = element.style.item(index);
    if (!properties.has(property)) continue;
    declarations.push({
      property,
      value: element.style.getPropertyValue(property),
      priority: element.style.getPropertyPriority(property),
    });
  }
  return declarations;
}

function restoreInlineStyleDeclarations(
  element: HTMLElement,
  properties: Set<string>,
  declarations: SavedInlineStyleDeclaration[],
): void {
  for (const property of properties) element.style.removeProperty(property);
  for (const declaration of declarations) {
    element.style.setProperty(
      declaration.property,
      declaration.value,
      declaration.priority,
    );
  }
}

function setPageLockStyle(
  element: HTMLElement,
  property: string,
  value: string,
): void {
  element.style.setProperty(property, value, 'important');
}

function acquireDesktopSheetPageLock(): () => void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return () => {};

  desktopSheetPageLockCount += 1;
  if (desktopSheetPageLockCount === 1) {
    const body = document.body;
    const html = document.documentElement;
    const bodyStyle = window.getComputedStyle(body);
    const bodyRect = body.getBoundingClientRect();
    const zoom = bodyStyle.getPropertyValue('zoom').trim();
    const zoomIsNormal = !zoom || zoom === 'normal' || Math.abs((Number.parseFloat(zoom) || 1) - 1) < 0.001;
    const canFreezeMeasuredBody =
      bodyStyle.display !== 'contents' &&
      bodyStyle.transform === 'none' &&
      zoomIsNormal &&
      bodyRect.width > 0;

    desktopSheetPageLockSnapshot = {
      bodyDeclarations: captureInlineStyleDeclarations(body, BODY_PAGE_LOCK_PROPERTIES),
      htmlDeclarations: captureInlineStyleDeclarations(html, HTML_PAGE_LOCK_PROPERTIES),
      scrollX: window.scrollX,
      scrollY: window.scrollY,
    };

    setPageLockStyle(body, 'overflow-x', 'hidden');
    setPageLockStyle(body, 'overflow-y', 'hidden');
    setPageLockStyle(body, 'position', 'fixed');

    if (canFreezeMeasuredBody) {
      const frozenWidth = `${bodyRect.width}px`;
      setPageLockStyle(body, 'box-sizing', 'border-box');
      setPageLockStyle(body, 'margin-top', '0px');
      setPageLockStyle(body, 'margin-right', '0px');
      setPageLockStyle(body, 'margin-bottom', '0px');
      setPageLockStyle(body, 'margin-left', '0px');
      setPageLockStyle(body, 'top', `${bodyRect.top}px`);
      setPageLockStyle(body, 'right', 'auto');
      setPageLockStyle(body, 'bottom', 'auto');
      setPageLockStyle(body, 'left', `${bodyRect.left}px`);
      setPageLockStyle(body, 'width', frozenWidth);
      setPageLockStyle(body, 'min-width', frozenWidth);
      setPageLockStyle(body, 'max-width', frozenWidth);
      setPageLockStyle(html, 'scrollbar-gutter', 'auto');
    } else {
      setPageLockStyle(body, 'top', `${-window.scrollY}px`);
      setPageLockStyle(body, 'width', '100%');
      if (window.innerWidth > html.clientWidth) {
        setPageLockStyle(html, 'scrollbar-gutter', 'stable');
      }
    }

    setPageLockStyle(html, 'overflow-x', 'hidden');
    setPageLockStyle(html, 'overflow-y', 'hidden');
  }

  let released = false;
  return () => {
    if (released) return;
    released = true;
    desktopSheetPageLockCount = Math.max(0, desktopSheetPageLockCount - 1);
    if (desktopSheetPageLockCount !== 0) return;

    const snapshot = desktopSheetPageLockSnapshot;
    desktopSheetPageLockSnapshot = null;
    if (!snapshot) return;

    restoreInlineStyleDeclarations(
      document.body,
      BODY_PAGE_LOCK_PROPERTIES,
      snapshot.bodyDeclarations,
    );
    restoreInlineStyleDeclarations(
      document.documentElement,
      HTML_PAGE_LOCK_PROPERTIES,
      snapshot.htmlDeclarations,
    );
    window.scrollTo(snapshot.scrollX, snapshot.scrollY);
  };
}

export function VariantContentDesktop() {
    const {
        isVariantsOpen,
        setIsVariantsOpen,
        setIsDrawerOrDialogOpen,
        isDrawerOrDialogOpen,
        isSwatchBookOpen,
        variantDisplayStyleOverlay,
        uniqueId,
        setConfiguratorTransitionProxyBitmap,
        setConfiguratorTransitionProxyMode,
        setUseInstantIframeCloseRestore,
        releaseConfiguratorTransitionProxy,
        setConfiguratorClosingProxyRect,
        isProductGalleryStacked,
        isSnap2Mode,
      } = useOV25UI();
    
    const menuContainerRef = useRef<HTMLDivElement>(null);
    const drawerOrDialogOpenRef = useRef(isDrawerOrDialogOpen);

    useEffect(() => {
      drawerOrDialogOpenRef.current = isDrawerOrDialogOpen;
    }, [isDrawerOrDialogOpen]);

    const shouldLockPage = isVariantsOpen || isDrawerOrDialogOpen;
    useBrowserLayoutEffect(() => {
      if (!shouldLockPage) return;
      return acquireDesktopSheetPageLock();
    }, [shouldLockPage]);
    
    useEffect(() => {
      let cancelled = false;

      if (isVariantsOpen) {
        void (async () => {
          const bitmap = await requestTransitionSnapshotFromIframe(uniqueId);
          if (cancelled) {
            bitmap?.close();
            return;
          }
          if (bitmap) {
            setConfiguratorTransitionProxyMode('opening');
            setConfiguratorTransitionProxyBitmap(bitmap);
          }
          if (!cancelled) {
            drawerOrDialogOpenRef.current = true;
            setIsDrawerOrDialogOpen(true);
          }
        })();
      } else {
        if (drawerOrDialogOpenRef.current) {
          void (async () => {
            const bitmap = await requestTransitionSnapshotFromIframe(uniqueId);
            if (cancelled) {
              bitmap?.close();
              return;
            }
            const rect = bitmap
              ? getConfiguratorIframeContainerScreenRect(uniqueId, isProductGalleryStacked)
              : null;
            setConfiguratorClosingProxyRect(rect);
            if (bitmap) {
              setConfiguratorTransitionProxyMode('closing');
              setConfiguratorTransitionProxyBitmap(bitmap);
            }
            setUseInstantIframeCloseRestore(true);
            drawerOrDialogOpenRef.current = false;
            setIsDrawerOrDialogOpen(false);
          })();
        } else {
          drawerOrDialogOpenRef.current = false;
          setIsDrawerOrDialogOpen(false);
        }
      }

      return () => {
        cancelled = true;
      };
    }, [
      isVariantsOpen,
      uniqueId,
      setIsDrawerOrDialogOpen,
      setConfiguratorTransitionProxyBitmap,
      setConfiguratorTransitionProxyMode,
      setUseInstantIframeCloseRestore,
      setConfiguratorClosingProxyRect,
      isProductGalleryStacked,
    ]);
 
    // Transition state cleanup; the layout effect above owns the shared page lock.
    useEffect(() => {
      return () => {
        drawerOrDialogOpenRef.current = false;
        releaseConfiguratorTransitionProxy();
        setIsDrawerOrDialogOpen(false);
      };
    }, [releaseConfiguratorTransitionProxy, setIsDrawerOrDialogOpen]);

    // Animation effect for the menu container
    useEffect(() => {
      const menuContainer = menuContainerRef.current;
      if (!menuContainer) return;

      if (isDrawerOrDialogOpen) {
        // Initially position off-screen
        menuContainer.style.transform = 'translateX(100%)';
        
        // Add transition and animate in
        setTimeout(() => {
          menuContainer.style.transition = 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1)';
          menuContainer.style.transform = 'translateX(0%)';
        }, 50);
      } else {
        // Animate out
        menuContainer.style.transition = 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1)';
        menuContainer.style.transform = 'translateX(100%)';
        
        // Remove transition after animation completes
        setTimeout(() => {
          menuContainer.style.transition = 'none';
        }, 500);
      }
    }, [isDrawerOrDialogOpen]);

    // Add escape key listener when the menu is open (skip when swatch book is open - it handles its own Escape)
    useEffect(() => {
      const handleEscapeKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && isVariantsOpen && !isSwatchBookOpen) {
          setIsVariantsOpen(false);
        }
      };

      if (isVariantsOpen) {
        window.addEventListener('keydown', handleEscapeKey);
      }

      return () => {
        window.removeEventListener('keydown', handleEscapeKey);
      };
    }, [isVariantsOpen, isSwatchBookOpen, setIsVariantsOpen]);

    // Always render the container for transform effects, but conditionally render the content
    // z-index 2147483644 is max - 3
    const menuContent = (
        <div data-clarity-mask="true" className="ov:fixed ov:inset-0 ov:w-screen ov:pointer-events-none ov:z-2147483644">
            <div className="ov:absolute ov:inset-0 ov:pointer-events-none">
            <div 
              ref={menuContainerRef}
              className="ov:absolute ov:top-0 ov:right-0 ov:h-full ov:w-[384px] ov:pointer-events-auto"
              id='ov25-configurator-variant-menu-container'
              style={{
                transform: 'translateX(100%)'
              }}
            >
                {variantDisplayStyleOverlay === 'wizard' ? (
                  <div className="ov:flex ov:flex-col ov:h-full ov:bg-(--ov25-background-color)">
                    <VariantsHeader />
                    <div className="ov:flex ov:flex-col ov:flex-1 ov:min-h-0 ov:overflow-hidden">
                      <WizardVariants mode="drawer" />
                    </div>
                  </div>
                ) : (
                  isSnap2Mode ? <Snap2Wrapper /> : <ProductVariantsWrapper />
                )}
            </div>
        </div>
      </div>
    );

    // Use createPortal to render this outside the normal DOM hierarchy
    // Variants always use Shadow DOM isolation (hard-coded)
    // Create or find Shadow DOM container
    let shadowContainer = document.getElementById('ov25-variants-shadow-container');
    if (!shadowContainer) {
      shadowContainer = document.createElement('div');
      // add an empty <span> inside the shadow container to stop shopify themes with empty div rules from hiding the div
      // even though its got an iframe in its shadow root, the shopify themes still recognise it as empty div and apply a rule like this:
      // div:empty { display: none; }
      const shadowContainerEmptySpan = document.createElement('span');
      shadowContainerEmptySpan.style.width = '100%';
      shadowContainerEmptySpan.style.height = '100%';
      shadowContainerEmptySpan.style.pointerEvents = 'none';
      shadowContainer.appendChild(shadowContainerEmptySpan);
      shadowContainer.id = 'ov25-variants-shadow-container';
      shadowContainer.style.position = 'fixed';
      shadowContainer.style.inset = '0';
      shadowContainer.style.width = '100vw';
      shadowContainer.style.height = 'auto';
      shadowContainer.style.pointerEvents = 'none';
      shadowContainer.style.zIndex = '2147483644'; // max - 3
      document.body.appendChild(shadowContainer);
      
      // Create Shadow DOM root
      if (!shadowContainer.shadowRoot) {
        const shadowRoot = shadowContainer.attachShadow({ mode: 'open' });
        // Inject CSS into the Shadow DOM using adoptedStyleSheets
        // Use the shared stylesheet from the main document
        shadowRoot.adoptedStyleSheets = (window as any).ov25adoptedStyleSheets;
      }
    }
    
    return createPortal(menuContent, shadowContainer.shadowRoot!);
}
