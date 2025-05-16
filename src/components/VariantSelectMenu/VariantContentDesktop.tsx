// Content component for desktop view
import React, { useEffect } from 'react';

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

    useEffect(() => {})

    return (
        <>
        <div className={`fixed top-0 right-0 h-full  w-[384px] duration-500 transition-all ${isDrawerOrDialogOpen ? 'translate-x-0' : 'translate-x-full'}`} id='ov25-configurator-variant-menu-container'>
            <ProductVariantsWrapper/>
        </div>
        </>
    );
  }

