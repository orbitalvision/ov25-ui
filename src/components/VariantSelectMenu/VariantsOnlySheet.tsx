import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useOV25UI } from '../../contexts/ov25-ui-context.js';
import { ProductVariantsWrapper } from './ProductVariantsWrapper.js';
import { WizardVariants } from './WizardVariants.js';
import { VariantsHeader } from './VariantsHeader.js';
import { MobileCheckoutButton } from './MobileCheckoutButton.js';

/**
 * Standalone sheet for variants-only-sheet mode. Animates in from the right, full height.
 * Does NOT set isDrawerOrDialogOpen, so useIframePositioning is never triggered.
 */
export function VariantsOnlySheet() {
  const {
    isVariantsOpen,
    setIsVariantsOpen,
    isModalOpen,
    isMobile,
    isSwatchBookOpen,
    variantDisplayStyleOverlay,
    variantDisplayStyleOverlayMobile,
  } = useOV25UI();

  const menuContainerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [closingComplete, setClosingComplete] = useState(true);
  const prevOpenRef = useRef(isVariantsOpen);
  const effectiveOverlayStyle = isMobile ? variantDisplayStyleOverlayMobile : variantDisplayStyleOverlay;
  const originalStyles = useRef<{ body: { overflow: string; position: string; width: string; top: string }; html: { overflow: string } } | null>(null);
  const justClosed = prevOpenRef.current && !isVariantsOpen;
  prevOpenRef.current = isVariantsOpen;
  if (justClosed) setClosingComplete(false);
  const shouldRender = isVariantsOpen || !closingComplete;

  const handleClose = () => {
    if (isModalOpen) return;
    setIsVariantsOpen(false);
  };

  useEffect(() => {
    if (isVariantsOpen) {
      originalStyles.current = {
        body: {
          overflow: document.body.style.overflow,
          position: document.body.style.position,
          width: document.body.style.width,
          top: document.body.style.top,
        },
        html: { overflow: document.documentElement.style.overflow },
      };
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${window.scrollY}px`;
      document.documentElement.style.overflow = 'hidden';
    } else {
      const scrollY = document.body.style.top;
      if (originalStyles.current) {
        document.body.style.overflow = originalStyles.current.body.overflow;
        document.body.style.position = originalStyles.current.body.position;
        document.body.style.width = originalStyles.current.body.width;
        document.body.style.top = originalStyles.current.body.top;
        document.documentElement.style.overflow = originalStyles.current.html.overflow;
      } else {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        document.documentElement.style.overflow = '';
      }
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
      originalStyles.current = null;
    }
  }, [isVariantsOpen]);

  useEffect(() => {
    return () => {
      if (originalStyles.current) {
        document.body.style.overflow = originalStyles.current.body.overflow;
        document.body.style.position = originalStyles.current.body.position;
        document.body.style.width = originalStyles.current.body.width;
        document.body.style.top = originalStyles.current.body.top;
        document.documentElement.style.overflow = originalStyles.current.html.overflow;
      }
    };
  }, []);

  useEffect(() => {
    if (isVariantsOpen) setClosingComplete(true);
  }, [isVariantsOpen]);

  useEffect(() => {
    const el = menuContainerRef.current;
    const backdrop = backdropRef.current;
    if (!el) return;
    if (isVariantsOpen) {
      el.style.transform = 'translateX(100%)';
      if (backdrop) backdrop.style.opacity = '0';
      setTimeout(() => {
        el.style.transition = 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1)';
        el.style.transform = 'translateX(0)';
        if (backdrop) {
          backdrop.style.transition = 'opacity 500ms cubic-bezier(0.4, 0, 0.2, 1)';
          backdrop.style.opacity = '1';
        }
      }, 50);
    } else if (shouldRender) {
      el.style.transition = 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1)';
      el.style.transform = 'translateX(100%)';
      if (backdrop) {
        backdrop.style.transition = 'opacity 500ms cubic-bezier(0.4, 0, 0.2, 1)';
        backdrop.style.opacity = '0';
      }
      const t = setTimeout(() => {
        setClosingComplete(true);
        el.style.transition = 'none';
      }, 500);
      return () => clearTimeout(t);
    }
  }, [isVariantsOpen, shouldRender]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVariantsOpen && !isSwatchBookOpen) setIsVariantsOpen(false);
    };
    if (isVariantsOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isVariantsOpen, isSwatchBookOpen, setIsVariantsOpen]);

  if (!shouldRender) return null;

  const menuContent = (
    <div data-clarity-mask="true" className="ov:fixed ov:inset-0 ov:z-[2147483644]">
      <div
        ref={backdropRef}
        role="button"
        tabIndex={0}
        onClick={handleClose}
        onKeyDown={(e) => e.key === 'Enter' && handleClose()}
        className="ov:absolute ov:inset-0 ov:bg-black/50 ov:transition-opacity ov:cursor-pointer ov:pointer-events-auto"
        style={{ opacity: 0 }}
        aria-label="Close"
      />
      <div className="ov:absolute ov:inset-0 ov:pointer-events-none">
        <div
          ref={menuContainerRef}
          className={`ov:absolute ov:top-0 ov:right-0 ov:h-full ov:pointer-events-auto ov:bg-[var(--ov25-background-color)] ov:shadow-lg ${isMobile ? 'ov:w-[85vw]' : 'ov:w-[384px]'}`}
          style={{ transform: 'translateX(100%)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="ov:relative ov:h-full ov:flex ov:flex-col">
            <button
              onClick={handleClose}
              className="ov:absolute ov:top-3 ov:right-3 ov:z-10 ov:p-1.5 ov:rounded-full ov:hover:bg-neutral-100 ov:cursor-pointer ov:flex ov:items-center ov:justify-center"
              aria-label="Close"
            >
              <X size={24} className="ov:text-[var(--ov25-secondary-text-color)]" strokeWidth={2} />
            </button>
            {effectiveOverlayStyle === 'wizard' ? (
              <>
                <VariantsHeader />
                <div className="ov:flex ov:flex-col ov:flex-1 ov:min-h-0 ov:overflow-hidden">
                  <WizardVariants mode="drawer" />
                </div>
              </>
            ) : (
              <>
                <div className="ov:shrink-0 ov:min-h-12" />
                <div className="ov:flex-1 ov:min-h-0 ov:overflow-auto">
                  <ProductVariantsWrapper embeddedInVariantsOnlySheet />
                </div>
                <div className="ov:flex-shrink-0">
                  <MobileCheckoutButton />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  let shadowContainer = document.getElementById('ov25-variants-only-sheet-container');
  if (!shadowContainer) {
    shadowContainer = document.createElement('div');
    shadowContainer.id = 'ov25-variants-only-sheet-container';
    const span = document.createElement('span');
    span.style.cssText = 'width:100%;height:100%;pointer-events:none';
    shadowContainer.appendChild(span);
    shadowContainer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483644';
    document.body.appendChild(shadowContainer);
    if (!shadowContainer.shadowRoot) {
      shadowContainer.attachShadow({ mode: 'open' });
      shadowContainer.shadowRoot!.adoptedStyleSheets = (window as any).ov25adoptedStyleSheets;
    }
  }

  return createPortal(menuContent, shadowContainer!.shadowRoot!);
}
