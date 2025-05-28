// inject.ts
import React, { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { OV25UIProvider } from '../contexts/ov25-ui-context.js';
import { ProductGallery } from '../components/product-gallery.js';
import Price from '../components/Price.js';
import Name from '../components/Name.js';
import VariantSelectMenu from '../components/VariantSelectMenu/VariantSelectMenu.js';
import { ProductCarousel } from '../components/product-carousel.js';
import { createPortal } from 'react-dom';

// Import styles directly
import '../styles.css';

type StringOrFunction = string | (() => string);

type ElementConfig = {
  id: string;
  replace?: boolean;
};

type ElementSelector = string | ElementConfig;

export interface InjectConfiguratorOptions {
  apiKey: StringOrFunction;
  productLink: StringOrFunction;
  galleryId?: ElementSelector;
  images?: string[];
  deferThreeD?: boolean;
  priceId?: ElementSelector;
  nameId?: ElementSelector;
  variantsId?: ElementSelector;
  carouselId?: ElementSelector | true;
  addToBasketFunction: () => void;
  buyNowFunction: () => void;
  logoURL: string;
  cssVariables?: JSON;
}

export function injectConfigurator(opts: InjectConfiguratorOptions) {
  const {
    apiKey,
    productLink,
    galleryId,
    priceId,
    nameId,
    variantsId,
    carouselId,
    addToBasketFunction,
    buyNowFunction,
    images,
    logoURL,
    cssVariables,
    deferThreeD,
  } = opts;



  // Resolve string or function
  const resolveStringOrFunction = (value: StringOrFunction): string => {
    return typeof value === 'function' ? value() : value;
  };

  // Get selector string from ElementSelector
  const getSelector = (elementSelector: ElementSelector | undefined): string | undefined => {
    if (!elementSelector) return undefined;
    return typeof elementSelector === 'string' ? elementSelector : elementSelector.id;
  };

  // Check if replacement is needed
  const shouldReplace = (elementSelector: ElementSelector | undefined): boolean => {
    if (!elementSelector || typeof elementSelector === 'string') return false;
    return elementSelector.replace === true;
  };

  const ensureLoaded = () => {
    // Make sure the portal targets are in the DOM *now*
    const portals: ReactNode[] = [];

    const pushPortal = (selector: string | undefined, el: ReactNode) => {
      if (!selector) return;
      const target = document.querySelector(selector);
      if (target) {
        portals.push(createPortal(el, target));
      } else {
        console.warn(`[OV25-UI] Element not found for selector "${selector}"`);
      }
    };

    // New function to completely remove target element and portal into its parent
    const portalReplaceElement = (selector: string | undefined, el: ReactNode, componentName: string) => {
      if (!selector) return;
      const target = document.querySelector(selector);
      if (target && target.parentNode) {
        // Create an empty div to replace the target
        const emptyDiv = document.createElement('div');
        // Preserve original classes and add our class
        emptyDiv.className = `${target.className} ov25-configurator-${componentName}`.trim();
        // Copy dimensions from original element


        // Replace the target with the empty div
        target.parentNode.replaceChild(emptyDiv, target);
        // Create portal into the empty div
        portals.push(createPortal(el, emptyDiv));
      } else {
        console.warn(`[OV25-UI] Element or parent not found for selector "${selector}"`);
      }
    };

    // Process each element with appropriate method based on replace flag
    const processElement = (elementSelector: ElementSelector | undefined, component: ReactNode, componentName: string) => {
      const selector = getSelector(elementSelector);
      if (shouldReplace(elementSelector)) {
        portalReplaceElement(selector, component, componentName);
      } else {
        pushPortal(selector, component);
      }
    };

    const setupCSSVariables = (cssVariables: JSON) => {
      Object.entries(cssVariables).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
      });
    };

    // Function to wait for an element to appear in the DOM
    function waitForElement(selector: string, timeout = 5000) {
      return new Promise<Element>((resolve, reject) => {
        const interval = 100;
        let elapsed = 0;

        const checkExist = setInterval(() => {
          const element = document.querySelector(selector);
          if (element) {
            clearInterval(checkExist);
            resolve(element);
          } else if (elapsed >= timeout) {
            clearInterval(checkExist);
            reject(new Error(`Element "${selector}" not found within ${timeout}ms`));
          }
          elapsed += interval;
        }, interval);
      });
    };

    // Function to check if gallery or its parents have z-index set
    const checkForStackedGallery = (): boolean => {
      const gallerySelector = getSelector(galleryId);
      if (!gallerySelector) return false;
      
      const galleryElement = document.querySelector(gallerySelector);
      if (!galleryElement) return false;
      
      // Traverse up the DOM tree checking for z-index
      let currentElement: Element | null = galleryElement;
      
      while (currentElement && currentElement !== document.documentElement) {
        const computedStyle = window.getComputedStyle(currentElement);
        const zIndex = computedStyle.zIndex;
        
        // Check if z-index is explicitly set (not 'auto')
        if (zIndex !== 'auto' && zIndex !== '') {
          return true;
        }
        
        currentElement = currentElement.parentElement;
      }
      
      return false;
    };

    const isProductGalleryStacked = checkForStackedGallery();

    // Process each component
    processElement(galleryId, <ProductGallery isStacked={isProductGalleryStacked} />, 'gallery');
    processElement(priceId, <Price />, 'price');
    processElement(nameId, <Name />, 'name');
    processElement(variantsId, <VariantSelectMenu />, 'variants');
    
    // Special handling for carousel - only use polling if carouselId is true
    if (carouselId === true) {
      // Start polling for true-carousel element
      waitForElement('#true-carousel', 10000)
        .then(element => {
          pushPortal('#true-carousel', <ProductCarousel />);
        })
        .catch(err => {
          console.warn(`[OV25-UI] ${err.message}`);
        });
    } else if (carouselId) {
      // Process normally if it's a standard ElementSelector
      processElement(carouselId as ElementSelector, <ProductCarousel />, 'carousel');
    }

    if (cssVariables) {
      setupCSSVariables(cssVariables);
    }

    // If no portals were created we can bail early
    if (portals.length === 0) return;

    // Create (or reuse) a container for the single React root
    let container = document.getElementById('ov25-provider-root');
    if (!container) {
      container = document.createElement('div');
      container.id = 'ov25-provider-root';
      container.style.display = 'contents';  // prov. doesn't render anything anyway
      document.body.appendChild(container);
    }

    // Mount the whole app just once
    const root = (container as any)._reactRoot
      ?? createRoot(container);
    (container as any)._reactRoot = root;     // cache so we don't double-mount

    // Resolve apiKey and productLink when rendering
    const resolvedApiKey = resolveStringOrFunction(apiKey);
    const resolvedProductLink = resolveStringOrFunction(productLink);

    root.render(
      <OV25UIProvider 
        apiKey={resolvedApiKey} 
        productLink={resolvedProductLink} 
        buyNowFunction={buyNowFunction} 
        addToBasketFunction={addToBasketFunction} 
        images={images} 
        logoURL={logoURL ?? 'https://ov25.orbital.vision/_next/image?url=%2Flogo.png&w=128&q=75'}
        deferThreeD={deferThreeD}
      >
        {portals}
      </OV25UIProvider>
    );
  };

  // Run now if DOM ready, otherwise wait
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureLoaded, { once: true });
  } else {
    ensureLoaded();
  }
}
