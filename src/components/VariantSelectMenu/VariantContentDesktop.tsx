// Content component for desktop view
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import { useOV25UI } from "../../contexts/ov25-ui-context.js";
import { ProductVariantsWrapper } from './ProductVaraintsWrapper.js';

export function VariantContentDesktop() {
    const {
        isVariantsOpen,
        setIsVariantsOpen,
        setIsDrawerOrDialogOpen,
        isDrawerOrDialogOpen,
      } = useOV25UI();
    
    const menuContainerRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
      // Update body styles when drawer is opened/closed
      if (isVariantsOpen) {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.top = `-${window.scrollY}px`;
        setIsDrawerOrDialogOpen(true);
      } else {
        const scrollY = document.body.style.top;
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
        setIsDrawerOrDialogOpen(false);
      }
    }, [isVariantsOpen]);
 
    // Cleanup function to reset body styles when component unmounts
    useEffect(() => {
      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        setIsDrawerOrDialogOpen(false);
      };
    }, []);

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
    const menuContent = (
        <div className="ov:inset-0 ov:size-full ov:fixed ov:pointer-events-none ov:z-[100] ">
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
    return createPortal(menuContent, document.body);
}

