// Content component for desktop view
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { useOV25UI } from "../../contexts/ov25-ui-context.js";
import { ProductVariantsWrapper } from './ProductVariantsWrapper.js';

export function VariantContentDesktop() {
    const {
        isVariantsOpen,
        setIsVariantsOpen,
        setIsDrawerOrDialogOpen,
        isDrawerOrDialogOpen,
      } = useOV25UI();
    
    const menuContainerRef = useRef<HTMLDivElement>(null);
    const originalStyles = useRef<{
      body: {
        overflow: string;
        position: string;
        width: string;
        top: string;
      };
      html: {
        overflow: string;
      };
    } | null>(null);
    
    useEffect(() => {
      if (isVariantsOpen) {
        // Store original styles before modifying
        const bodyStyles = {
          overflow: document.body.style.overflow,
          position: document.body.style.position,
          width: document.body.style.width,
          top: document.body.style.top,
        };
        const htmlStyles = {
          overflow: document.documentElement.style.overflow,
        };
        originalStyles.current = { body: bodyStyles, html: htmlStyles };

        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.top = `-${window.scrollY}px`;
        document.documentElement.style.overflow = 'hidden';
        setIsDrawerOrDialogOpen(true);
      } else {
        const scrollY = document.body.style.top;
        
        // Restore original styles if we have them
        if (originalStyles.current) {
          document.body.style.overflow = originalStyles.current.body.overflow;
          document.body.style.position = originalStyles.current.body.position;
          document.body.style.width = originalStyles.current.body.width;
          document.body.style.top = originalStyles.current.body.top;
          document.documentElement.style.overflow = originalStyles.current.html.overflow;
        } else {
          // Fallback to empty strings
          document.body.style.overflow = '';
          document.body.style.position = '';
          document.body.style.width = '';
          document.body.style.top = '';
          document.documentElement.style.overflow = '';
        }
        
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
        setIsDrawerOrDialogOpen(false);
        originalStyles.current = null;
      }
    }, [isVariantsOpen]);
 
    // Cleanup function to reset body styles when component unmounts
    useEffect(() => {
      return () => {
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
        setIsDrawerOrDialogOpen(false);
      };
    }, [originalStyles]);

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

    // Add escape key listener when the menu is open
    useEffect(() => {
      const handleEscapeKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && isVariantsOpen) {
          setIsVariantsOpen(false);
        }
      };

      if (isVariantsOpen) {
        window.addEventListener('keydown', handleEscapeKey);
      }

      return () => {
        window.removeEventListener('keydown', handleEscapeKey);
      };
    }, [isVariantsOpen, setIsVariantsOpen]);

    // Always render the container for transform effects, but conditionally render the content
    // z-index 2147483644 is max - 3
    const menuContent = (
        <div data-clarity-mask="true" className="ov:inset-0 ov:size-full ov:fixed ov:pointer-events-none ov:z-2147483644">
            <div className="ov:w-full ov:h-full ov:relative ov:pointer-events-none">
            <div 
              ref={menuContainerRef}
              className="ov:absolute ov:top-0 ov:right-0 ov:h-full ov:w-[384px] ov:pointer-events-auto"
              id='ov25-configurator-variant-menu-container'
              style={{
                transform: 'translateX(100%)'
              }}
            >
                <ProductVariantsWrapper/>
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
      shadowContainer.style.top = '0';
      shadowContainer.style.left = '0';
      shadowContainer.style.width = '100%';
      shadowContainer.style.height = '100%';
      shadowContainer.style.pointerEvents = 'none';
      shadowContainer.style.zIndex = '2147483644'; // max - 3
      document.body.appendChild(shadowContainer);
      
      // Create Shadow DOM root
      if (!shadowContainer.shadowRoot) {
        const shadowRoot = shadowContainer.attachShadow({ mode: 'open' });
        // Inject CSS into the Shadow DOM using adoptedStyleSheets
        // Use the shared stylesheet from the main document
        shadowRoot.adoptedStyleSheets = document.adoptedStyleSheets;
      }
    }
    
    return createPortal(menuContent, shadowContainer.shadowRoot!);
}

