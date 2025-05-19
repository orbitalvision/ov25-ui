// Content component for desktop view
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

import { useOV25UI } from "../../contexts/ov25-ui-context.js";
import { ProductVariantsWrapper } from './ProductVaraintsWrapper.js';

export function VariantContentDesktop() {
    const {
        isVariantsOpen,
        setIsDrawerOrDialogOpen,
        isDrawerOrDialogOpen,
      } = useOV25UI();
    
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

    // Only create the content element if needed
    if (!isVariantsOpen) {
      return null;
    }

    const menuContent = (
      <div className={`orbitalvision:fixed orbitalvision:top-0 orbitalvision:right-0 orbitalvision:h-full orbitalvision:w-[384px] orbitalvision:z-[11] orbitalvision:duration-500 orbitalvision:transition-all ${isDrawerOrDialogOpen ? 'orbitalvision:translate-x-0' : 'orbitalvision:translate-x-full'}`} id='ov25-configurator-variant-menu-container'>
        <ProductVariantsWrapper/>
      </div>
    );

    // Use createPortal to render this outside the normal DOM hierarchy
    return createPortal(menuContent, document.body);
}

