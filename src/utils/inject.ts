// inject.ts
import React from 'react';
import { createRoot } from 'react-dom/client';
import { OV25UIProvider } from '../contexts/ov25-ui-context';
import { ProductGallery } from '../components/product-gallery';
import PriceAndName from '../components/PriceAndName';
import VariantSelectMenu from '../components/VariantSelectMenu/VariantSelectMenu';
import { ProductCarousel } from '../components/product-carousel';

export interface InjectConfiguratorOptions {
  apiKey: string;
  productLink: string;
  galleryId?: string;
  priceNameId?: string;
  variantsId?: string;
  carouselId?: string;
}

export function injectConfigurator({
  apiKey,
  productLink,
  galleryId,
  priceNameId,
  variantsId,
  carouselId
}: InjectConfiguratorOptions) {
  // After bundle loads, execute this injection code:
  document.addEventListener('DOMContentLoaded', function() {
    // Create provider container
    const providerContainer = document.createElement('div');
    providerContainer.id = 'ov25-provider-root';
    providerContainer.style.display = 'none';
    document.body.appendChild(providerContainer);
    
    // Initialize provider
    const providerRoot = createRoot(providerContainer);
    providerRoot.render(
      React.createElement(OV25UIProvider, { 
        apiKey,
        productLink,
        children: React.createElement('div')
      })
    );
    
    // Replace elements with components
    function replaceElement(selector: string, Component: React.ComponentType<any>): void {
      const element = document.querySelector(selector);
      if (!element) return;
      
      try {
        const root = createRoot(element as HTMLElement);
        root.render(React.createElement(Component));
      } catch (error) {
        console.error(`Failed to replace element ${selector}:`, error);
      }
    }
    
    // Only replace elements if selectors are provided
    if (galleryId) replaceElement(galleryId, ProductGallery);
    if (priceNameId) replaceElement(priceNameId, PriceAndName);
    if (variantsId) replaceElement(variantsId, VariantSelectMenu);
    if (carouselId) replaceElement(carouselId, ProductCarousel);
  });
}


  