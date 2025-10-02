// inject.ts
import React, { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { OV25UIProvider, Swatch, SwatchRulesData } from '../contexts/ov25-ui-context.js';
import { ProductGallery } from '../components/product-gallery.js';
import Price from '../components/Price.js';
import Name from '../components/Name.js';
import VariantSelectMenu from '../components/VariantSelectMenu/VariantSelectMenu.js';
import { SwatchesContainer } from '../components/SwatchesContainer.js';
import { ProductCarousel } from '../components/product-carousel.js';
import ConfiguratorViewControls from '../components/ConfiguratorViewControls.js';
import { SwatchBook } from '../components/VariantSelectMenu/SwatchBook.js';
import { Snap2ConfigureButton } from '../components/Snap2ConfigureButton.js';
import { createPortal } from 'react-dom';

// Import styles directly
import '../styles.css';
import { Toaster } from 'sonner';
// Import CSS as string for adoptedStyleSheets
import cssText from '../styles.css?inline';

// Import sonner CSS as string
import sonnerCssText from 'sonner/dist/styles.css?inline';
// Create sonner stylesheet
const sonnerStylesheet = new CSSStyleSheet();
sonnerStylesheet.replaceSync(sonnerCssText);


// Create shared stylesheet
const sharedStylesheet = new CSSStyleSheet();
sharedStylesheet.replaceSync(cssText);

// Function to create CSS variables stylesheet from CSS string
const createCSSVariablesStylesheet = (cssVariables: string): CSSStyleSheet => {
  const cssVariablesStylesheet = new CSSStyleSheet();
  cssVariablesStylesheet.replaceSync(cssVariables);
  return cssVariablesStylesheet;
};

// Apply to main document
document.adoptedStyleSheets = [sharedStylesheet];

export type StringOrFunction = string | (() => string);

export type ElementConfig = {
  id: string;
  replace?: boolean;
};

export type ElementSelector = string | ElementConfig;

export interface InjectConfiguratorOptions {
  apiKey: StringOrFunction;
  productLink: StringOrFunction;
  configurationUuid: StringOrFunction;
  galleryId?: ElementSelector;
  images?: string[];
  deferThreeD?: boolean;
  showOptional?: boolean;
  priceId?: ElementSelector;
  nameId?: ElementSelector;
  variantsId?: ElementSelector;
  swatchesId?: ElementSelector;
  carouselId?: ElementSelector | true;
  snap2FullscreenButtonId?: ElementSelector;
  addToBasketFunction: () => void;
  buyNowFunction: () => void;
  addSwatchesToCartFunction: (swatches: Swatch[], swatchRulesData: SwatchRulesData) => void;
  logoURL?: string;
  mobileLogoURL?: string;
  cssString?: string;
}

export function injectConfigurator(opts: InjectConfiguratorOptions) {
  const {
    apiKey,
    productLink,
    configurationUuid,
    galleryId,
    priceId,
    nameId,
    variantsId,
    swatchesId,
    carouselId,
    snap2FullscreenButtonId,
    addToBasketFunction,
    buyNowFunction,
    addSwatchesToCartFunction,
    images,
    logoURL,
    mobileLogoURL,
    cssString,
    deferThreeD,
    showOptional,
  } = opts;

  // Add generateThumbnail function to window object
  (window as any).ov25GenerateThumbnail = () => {
    return new Promise<string>((resolve, reject) => {
      // Find the iframe element
      const iframe = document.getElementById('ov25-configurator-iframe') as HTMLIFrameElement;
      if (!iframe || !iframe.contentWindow) {
        reject(new Error('Configurator iframe not found'));
        return;
      }

      // Set up message listener for screenshot response
      const messageHandler = (event: MessageEvent) => {
        if (event.data.type === 'SCREENSHOT_URL') {
          window.removeEventListener('message', messageHandler);
          resolve(JSON.parse(event.data.payload).url);
        } else if (event.data.type === 'ERROR') {
          window.removeEventListener('message', messageHandler);
          reject(new Error(event.data.payload.message || 'Screenshot capture failed'));
        }
      };

      window.addEventListener('message', messageHandler);

      // Send capture screenshot message to iframe
      iframe.contentWindow.postMessage({
        type: 'CAPTURE_SCREENSHOT',
        payload: ''
      }, '*');

      // Set timeout for screenshot capture
      setTimeout(() => {
        window.removeEventListener('message', messageHandler);
        reject(new Error('Screenshot capture timeout'));
      }, 10000);
    });
  };

  // Resolve string or function
  const resolveStringOrFunction = (value: StringOrFunction): string => {
    return typeof value === 'function' ? value() : value;
  };

  // Get configuration_uuid from query parameters with precedence over injected value
  const getConfigurationUuidFromQueryParams = (): string | null => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('configuration_uuid');
  };

  // Get selector string from ElementSelector
  const getSelector = (elementSelector: ElementSelector | undefined): string | undefined => {
    if (!elementSelector) return undefined;
    return typeof elementSelector === 'string' ? elementSelector : 'id' in elementSelector ? elementSelector.id : undefined;
  };

  // Check if replacement is needed
  const shouldReplace = (elementSelector: ElementSelector | undefined): boolean => {
    if (!elementSelector || typeof elementSelector === 'string') return false;
    return elementSelector.replace === true;
  };

  // Check if component should be isolated in Shadow DOM
  // Gallery, price, and name inherit styles from main document
  const shouldCreateShadowDOM = (componentName: string): boolean => {
    return !['gallery', 'price', 'name'].includes(componentName);
  };

  // Function to inject CSS into Shadow DOM using adoptedStyleSheets
  const injectCSSIntoShadowDOM = (shadowRoot: ShadowRoot) => {
    // Apply the shared stylesheet and CSS variables to the Shadow DOM
    const stylesheets = [sharedStylesheet];
    if (cssString) {
      const cssVariablesStylesheet = createCSSVariablesStylesheet(cssString);
      stylesheets.push(cssVariablesStylesheet);
    }
    shadowRoot.adoptedStyleSheets = stylesheets;
  };

  const ensureLoaded = () => {
    // Create mobile drawer Shadow DOM container
    const mobileDrawerContainer = document.createElement('div');
    mobileDrawerContainer.id = 'ov25-mobile-drawer-container';
    mobileDrawerContainer.style.position = 'fixed';
    mobileDrawerContainer.style.top = '0';
    mobileDrawerContainer.style.left = '0';
    mobileDrawerContainer.style.width = '100%';
    mobileDrawerContainer.style.height = '100%';
    mobileDrawerContainer.style.pointerEvents = 'none';
    mobileDrawerContainer.style.zIndex = '99999999999991';
    document.body.appendChild(mobileDrawerContainer);
    
    // Create Shadow DOM root for mobile drawer
    const mobileDrawerShadowRoot = mobileDrawerContainer.attachShadow({ mode: 'open' });
    const mobileDrawerStylesheets = [sharedStylesheet];
    if (cssString) {
      const cssVariablesStylesheet = createCSSVariablesStylesheet(cssString);
      mobileDrawerStylesheets.push(cssVariablesStylesheet);
    }
    mobileDrawerShadowRoot.adoptedStyleSheets = mobileDrawerStylesheets;
    
    // Create configurator view controls Shadow DOM container
    const configuratorViewControlsContainer = document.createElement('div');
    configuratorViewControlsContainer.id = 'ov25-configurator-view-controls-container';
    configuratorViewControlsContainer.style.position = 'absolute';
    configuratorViewControlsContainer.style.top = '0';
    configuratorViewControlsContainer.style.left = '0';
    configuratorViewControlsContainer.style.width = '100%';
    configuratorViewControlsContainer.style.height = '100%';
    configuratorViewControlsContainer.style.pointerEvents = 'none';
    configuratorViewControlsContainer.style.zIndex = '101';
    document.body.appendChild(configuratorViewControlsContainer);
    
    // Create Shadow DOM root for configurator view controls
    const configuratorViewControlsShadowRoot = configuratorViewControlsContainer.attachShadow({ mode: 'open' });
    const configuratorViewControlsStylesheets = [sharedStylesheet];
    if (cssString) {
      const cssVariablesStylesheet = createCSSVariablesStylesheet(cssString);
      configuratorViewControlsStylesheets.push(cssVariablesStylesheet);
    }
    configuratorViewControlsShadowRoot.adoptedStyleSheets = configuratorViewControlsStylesheets;
    
    // Create popover portal Shadow DOM container
    const popoverPortalContainer = document.createElement('div');
    popoverPortalContainer.id = 'ov25-popover-portal-container';
    popoverPortalContainer.style.position = 'fixed';
    popoverPortalContainer.style.top = '0';
    popoverPortalContainer.style.left = '0';
    popoverPortalContainer.style.width = '100%';
    popoverPortalContainer.style.height = '100%';
    popoverPortalContainer.style.pointerEvents = 'none';
    popoverPortalContainer.style.zIndex = '99999999999992';
    document.body.appendChild(popoverPortalContainer);
    
    // Create Shadow DOM root for popover portal
    const popoverPortalShadowRoot = popoverPortalContainer.attachShadow({ mode: 'open' });
    const popoverPortalStylesheets = [sharedStylesheet];
    if (cssString) {
      const cssVariablesStylesheet = createCSSVariablesStylesheet(cssString);
      popoverPortalStylesheets.push(cssVariablesStylesheet);
    }
    popoverPortalShadowRoot.adoptedStyleSheets = popoverPortalStylesheets;

    // Create toaster portal container
    const toasterContainer = document.createElement('div');
    toasterContainer.id = 'ov25-toaster-container';
    toasterContainer.style.position = 'fixed';
    toasterContainer.style.top = '0';
    toasterContainer.style.left = '0';
    toasterContainer.style.width = '100%';
    toasterContainer.style.height = '100%';
    toasterContainer.style.pointerEvents = 'none';
    toasterContainer.style.zIndex = '999999999999999';
    document.body.appendChild(toasterContainer);
    
    // Create Shadow DOM root for toaster portal
    const toasterPortalShadowRoot = toasterContainer.attachShadow({ mode: 'open' });
    const toasterPortalStylesheets = [sharedStylesheet, sonnerStylesheet];
    if (cssString) {
      const cssVariablesStylesheet = createCSSVariablesStylesheet(cssString);
      toasterPortalStylesheets.push(cssVariablesStylesheet);
    }
    toasterPortalShadowRoot.adoptedStyleSheets = toasterPortalStylesheets;
    
    // Create swatchbook portal Shadow DOM container
    const swatchbookPortalContainer = document.createElement('div');
    swatchbookPortalContainer.id = 'ov25-swatchbook-portal-container';
    swatchbookPortalContainer.style.position = 'fixed';
    swatchbookPortalContainer.style.top = '0';
    swatchbookPortalContainer.style.left = '0';
    swatchbookPortalContainer.style.width = '100%';
    swatchbookPortalContainer.style.height = '100%';
    swatchbookPortalContainer.style.pointerEvents = 'none';
    swatchbookPortalContainer.style.zIndex = '99999999999993';
    document.body.appendChild(swatchbookPortalContainer);
    
    // Create Shadow DOM root for swatchbook portal
    const swatchbookPortalShadowRoot = swatchbookPortalContainer.attachShadow({ mode: 'open' });
    const swatchbookPortalStylesheets = [sharedStylesheet];
    if (cssString) {
      const cssVariablesStylesheet = createCSSVariablesStylesheet(cssString);
      swatchbookPortalStylesheets.push(cssVariablesStylesheet);
    }
    swatchbookPortalShadowRoot.adoptedStyleSheets = swatchbookPortalStylesheets;
    
    // Make sure the portal targets are in the DOM *now*
    const portals: ReactNode[] = [];

    const pushPortal = (selector: string | undefined, el: ReactNode, createShadow: boolean = false) => {
      if (createShadow && selector) {
        const target = document.querySelector(selector);
        if (target) {
          // Create Shadow DOM root if it doesn't exist
          if (!target.shadowRoot) {
            const shadowRoot = target.attachShadow({ mode: 'open' });
            // Inject CSS into the new Shadow DOM
            injectCSSIntoShadowDOM(shadowRoot);
          }
          portals.push(createPortal(el, target.shadowRoot!));
        } else {
          console.warn(`[OV25-UI] Element not found for selector "${selector}"`);
        }
      } else if (selector) {
        const target = document.querySelector(selector);
        if (target) {
          portals.push(createPortal(el, target));
        } else {
          console.warn(`[OV25-UI] Element not found for selector "${selector}"`);
        }
      }
    };

    // New function to completely remove target element and portal into its parent
    const portalReplaceElement = (selector: string | undefined, el: ReactNode, componentName: string, createShadow: boolean = false) => {
      if (createShadow && selector) {
        const target = document.querySelector(selector);
        if (target && target.parentNode) {
          // Create an empty div to replace the target
          const emptyDiv = document.createElement('div');
          // Preserve original classes and add our class
          emptyDiv.className = `${target.className} ov25-configurator-${componentName}`.trim();
          
          // Create Shadow DOM root
          if (!emptyDiv.shadowRoot) {
            const shadowRoot = emptyDiv.attachShadow({ mode: 'open' });
            // Inject CSS into the new Shadow DOM
            injectCSSIntoShadowDOM(shadowRoot);
          }
          
          // Replace the target with the empty div
          target.parentNode.replaceChild(emptyDiv, target);
          // Create portal into the Shadow DOM root
          portals.push(createPortal(el, emptyDiv.shadowRoot!));
        } else {
          console.warn(`[OV25-UI] Element or parent not found for selector "${selector}"`);
        }
      } else if (selector) {
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
      }
    };

    // Process each element with appropriate method based on replace flag
    const processElement = (elementSelector: ElementSelector | undefined, component: ReactNode, componentName: string) => {
      const selector = getSelector(elementSelector);
      const useShadowDOM = shouldCreateShadowDOM(componentName);
      
      if (shouldReplace(elementSelector)) {
        portalReplaceElement(selector, component, componentName, useShadowDOM);
      } else {
        pushPortal(selector, component, useShadowDOM);
      }
    };

    const setupCSSVariables = (cssVariables: string) => {
      // Create CSS variables stylesheet and add to document
      const cssVariablesStylesheet = createCSSVariablesStylesheet(cssVariables);
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, cssVariablesStylesheet];
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
    // Only show gallery if snap2FullscreenButtonId is not provided
    if (!snap2FullscreenButtonId) {
      processElement(galleryId, <ProductGallery  />, 'gallery');
    }
    processElement(variantsId, <VariantSelectMenu />, 'variants');
    
    // Always show price, name, and swatches
    processElement(priceId, <Price />, 'price');
    processElement(nameId, <Name />, 'name');
    processElement(swatchesId, <SwatchesContainer />, 'swatches');
    
    // Show snap2 configure button if provided
    if (snap2FullscreenButtonId) {
      processElement(snap2FullscreenButtonId, <Snap2ConfigureButton />, 'snap2-configure-button');
    }
    
    // Add toaster to portals
    portals.push(createPortal(<Toaster position="top-center" richColors style={{ zIndex: 999999999999999 }} />, toasterPortalShadowRoot));
    
    // Add swatchbook to portals
    portals.push(createPortal(<SwatchBook isMobile={false} />, swatchbookPortalShadowRoot));
    
    // Special handling for carousel - only use polling if carouselId is true
    if (carouselId === true) {
      // Start polling for true-carousel element
      waitForElement('#true-carousel', 10000)
        .then(element => {
          const useShadowDOM = shouldCreateShadowDOM('carousel');
          pushPortal('#true-carousel', <ProductCarousel />, useShadowDOM);
        })
        .catch(err => {
          console.warn(`[OV25-UI] ${err.message}`);
        });
    } else if (carouselId) {
      // Process normally if it's a standard ElementSelector
      processElement(carouselId as ElementSelector, <ProductCarousel />, 'carousel');
    }

    // Special handling for configurator view controls - wait for the specific container
    waitForElement('#true-configurator-view-controls-container', 10000)
      .then(element => {
        // Create Shadow DOM on the configurator view controls container
        if (!element.shadowRoot) {
          const shadowRoot = element.attachShadow({ mode: 'open' });
          const configuratorViewControlsStylesheets = [sharedStylesheet];
          if (cssString) {
            const cssVariablesStylesheet = createCSSVariablesStylesheet(cssString);
            configuratorViewControlsStylesheets.push(cssVariablesStylesheet);
          }
          shadowRoot.adoptedStyleSheets = configuratorViewControlsStylesheets;
        }
        // Portal ConfiguratorViewControls into the Shadow DOM
        portals.push(createPortal(<ConfiguratorViewControls />, element.shadowRoot!));
      })
      .catch(err => {
        console.warn(`[OV25-UI] ${err.message}`);
      });

    if (cssString) {
      setupCSSVariables(cssString);
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
    
    // Check query parameters first, then fall back to injected configurationUuid
    const queryConfigUuid = getConfigurationUuidFromQueryParams();
    const resolvedConfigurationUuid = queryConfigUuid || resolveStringOrFunction(configurationUuid);
    
    root.render(
       <OV25UIProvider 
         apiKey={resolvedApiKey} 
         productLink={resolvedProductLink} 
         configurationUuid={resolvedConfigurationUuid}
         buyNowFunction={buyNowFunction}
         addSwatchesToCartFunction={addSwatchesToCartFunction}
         addToBasketFunction={addToBasketFunction} 
         images={images} 
         logoURL={logoURL}
         mobileLogoURL={mobileLogoURL}
         deferThreeD={deferThreeD}
         showOptional={showOptional}
         isProductGalleryStacked={isProductGalleryStacked}
         shadowDOMs={{
           mobileDrawer: mobileDrawerShadowRoot,
           configuratorViewControls: configuratorViewControlsShadowRoot,
           popoverPortal: popoverPortalShadowRoot,
           swatchbookPortal: swatchbookPortalShadowRoot
         }}
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
