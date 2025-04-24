// inject.ts
import React, { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { OV25UIProvider } from '../contexts/ov25-ui-context.js';
import { ProductGallery } from '../components/product-gallery.js';
import PriceAndName from '../components/PriceAndName.js';
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
  priceNameId?: ElementSelector;
  variantsId?: ElementSelector;
  carouselId?: ElementSelector;
}

export function injectConfigurator(opts: InjectConfiguratorOptions) {
  const {
    apiKey,
    productLink,
    galleryId,
    priceNameId,
    variantsId,
    carouselId,
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
        emptyDiv.className = `ov25-configurator-${componentName}`;
        // Copy dimensions from original element
        const computedStyle = window.getComputedStyle(target);
        emptyDiv.style.width = computedStyle.width;
        emptyDiv.style.height = computedStyle.height;
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

    // Process each component
    processElement(galleryId, <ProductGallery />, 'gallery');
    processElement(priceNameId, <PriceAndName />, 'priceName');
    processElement(variantsId, <VariantSelectMenu />, 'variants');
    processElement(carouselId, <ProductCarousel />, 'carousel');

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
      <OV25UIProvider apiKey={resolvedApiKey} productLink={resolvedProductLink}>
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
