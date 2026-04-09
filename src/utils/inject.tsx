// inject.ts
import React, { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { OV25UIProvider } from '../contexts/ov25-ui-context.js';
import { ProductGallery, DeferredGalleryContainer } from '../components/product-gallery.js';
import Price from '../components/Price.js';
import Name from '../components/Name.js';
import VariantSelectMenu from '../components/VariantSelectMenu/VariantSelectMenu.js';
import { SwatchesContainer } from '../components/SwatchesContainer.js';
import { SwatchBook } from '../components/VariantSelectMenu/SwatchBook.js';
import { Snap2ConfigureButton, Snap2ConfigureUI } from '../components/Snap2ConfigureButton.js';
import { ConfigureButton } from '../components/ConfigureButton.js';
import { createPortal } from 'react-dom';

// Import styles directly
import '../../globals.css';
import { Toaster } from 'sonner';
import { getSharedStylesheet, createuserCustomCssStylesheet } from './shadow-styles.js';
import { findIframeWithUniqueId } from './configurator-dom-queries.js';

// Import sonner CSS as string
import sonnerCssText from 'sonner/dist/styles.css?inline';
// Create sonner stylesheet
const sonnerStylesheet = new CSSStyleSheet();
sonnerStylesheet.replaceSync(sonnerCssText);

const sharedStylesheet = getSharedStylesheet();

// Apply to main document
(window as any).ov25adoptedStyleSheets = [sharedStylesheet];

// Function to wait for an element to appear in the DOM
function waitForElement(selector: string, timeout = 5000) {
  return new Promise<Element>((resolve, reject) => {
    const immediate = document.querySelector(selector);
    if (immediate) {
      resolve(immediate);
      return;
    }

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

// Helper function to cleanup shadow DOM containers
const cleanupShadowDOMContainers = () => {
  const containersToRemove = [
    'ov25-mobile-drawer-container',
    'ov25-configurator-view-controls-container',
    'ov25-popover-portal-container',
    'ov25-modal-portal-container',
    'ov25-toaster-container',
    'ov25-swatchbook-portal-container',
    'ov25-provider-root'
  ];

  // Also remove any unique provider roots and shadow DOM containers
  const uniqueProviderRoots = document.querySelectorAll('[id^="ov25-provider-root-"]');
  uniqueProviderRoots.forEach(element => {
    element.remove();
  });

  const uniqueShadowContainers = document.querySelectorAll('[id^="ov25-configurator-view-controls-container-"]');
  uniqueShadowContainers.forEach(element => {
    element.remove();
  });

  containersToRemove.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.remove();
    }
  });

  // Clean up any portaled elements that replaced existing elements
  const replacedElements = document.querySelectorAll('[class*="ov25-configurator-"]');
  replacedElements.forEach(element => {
    if (element.shadowRoot) {
      element.shadowRoot.innerHTML = '';
    }
  });
};

// Get configuration_uuid from query parameters
const getConfigurationUuidFromQueryParams = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('configuration_uuid');
};

// Get product_link from query parameters
const getProductLinkFromQueryParams = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('product_link');
};

// Track if we've consumed the query param configuration_uuid (only use on first load)
let hasConsumedQueryConfigUuid = false;

import {
  ConfiguratorDisplayMode,
  CarouselDisplayMode,
} from '../types/config-enums.js';
import {
  type InjectConfiguratorInput,
  type ElementSelector,
  type StringOrFunction,
  normalizeInjectConfig,
} from '../types/inject-config.js';

export type { StringOrFunction, ElementConfig, ElementSelector } from '../types/inject-config.js';
export {
  ConfiguratorDisplayMode,
  CarouselDisplayMode,
  VariantDisplayMode,
  VariantDisplayStyleOverlay,
  CarouselLayout,
  VariantDisplayStyle,
} from '../types/config-enums.js';
export type {
  InjectConfiguratorOptions,
  LegacyInjectConfiguratorOptions,
  InjectConfiguratorInput,
  CarouselConfig,
  ConfiguratorConfig,
  VariantsConfig,
  SelectorsConfig,
  CallbacksConfig,
  BrandingConfig,
  FlagsConfig,
  OnChangePayload,
  OnChangePricePayload,
  OnChangeSkuPayload,
  UnifiedOnChangePayload,
  UnifiedSkuPayload,
  UnifiedSkuPayloadSingle,
  UnifiedSkuPayloadMulti,
  UnifiedPricePayload,
  CommerceLineItemSku,
  CommerceLineItemPrice,
  CommerceLineItemSelection,
  OptionSkuMap,
} from '../types/inject-config.js';

type InjectInternalOptions = {
  skipConfigureButton?: boolean;
  multipleSnap2ReplaceButtons?: Array<{ selector: string; configIndex: number }>;
  switchToSnap2Config?: (index: number) => void;
};

export function injectConfigurator(opts: InjectConfiguratorInput | InjectConfiguratorInput[], _internal?: InjectInternalOptions) {
  const configs = Array.isArray(opts) ? opts : [opts];
  if (configs.length > 1) {
    runMultipleConfiguratorLogic(configs);
    return;
  }
  injectSingleConfigurator(configs[0], _internal);
}

function injectSingleConfigurator(opts: InjectConfiguratorInput, internalOptions?: InjectInternalOptions) {
  const skipConfigureButton = internalOptions?.skipConfigureButton ?? false;
  const n = normalizeInjectConfig(opts);
  const {
    apiKey,
    productLink,
    configurationUuid,
    gallerySelector,
    priceSelector,
    nameSelector,
    variantsSelector,
    swatchesSelector,
    configureButtonSelector,
    carouselDisplayMode,
    carouselDisplayModeMobile,
    carouselMaxImagesDesktop,
    carouselMaxImagesMobile,
    configuratorDisplayMode,
    configuratorDisplayModeMobile,
    configuratorTriggerStyle,
    configuratorTriggerStyleMobile,
    variantDisplayMode,
    variantDisplayModeMobile,
    useSimpleVariantsSelector,
    hideVariantOptions,
    addToBasketFunction,
    buyNowFunction,
    buySwatchesFunction,
    onChangeFunction,
    images,
    logoURL,
    mobileLogoURL,
    cssString,
    deferThreeD,
    showOptional,
    hidePricing,
    hideAr,
    forceMobile,
    autoOpen = false,
    uniqueId,
    bedAllowNoneQueryValue,
    bedFilterSelectionsByCurrentSize,
  } = n;

  const showCarousel = carouselDisplayMode !== CarouselDisplayMode.None;
  const useInlineVariantControls = configuratorDisplayMode === ConfiguratorDisplayMode.Inline
    || (opts as any).useInlineVariantControls === true;
  const useInlineVariantControlsMobile = configuratorDisplayModeMobile === ConfiguratorDisplayMode.Inline;
  const variantDisplayStyle = variantDisplayMode;
  const variantDisplayStyleMobile = variantDisplayModeMobile;

  // Snap2 ignores gallery selector - gallery is always inside the modal
  const resolvedProductLinkForGallery = typeof productLink === 'function' ? productLink() : productLink;
  const effectiveGallerySelector = resolvedProductLinkForGallery?.startsWith('snap2/') ? undefined : gallerySelector;

  // Add generateThumbnail function to window object
  (window as any).ov25GenerateThumbnail = () => {
    return new Promise<string>((resolve, reject) => {
      // Find the iframe element
      const iframe = findIframeWithUniqueId(uniqueId) as HTMLIFrameElement | null;
      if (!iframe || !iframe.contentWindow) {
        reject(new Error('Configurator iframe not found'));
        return;
      }

      // Set up message listener for screenshot response
      const messageHandler = (event: MessageEvent) => {
        if (event.data.type === 'SCREENSHOT_URL') {
          window.removeEventListener('message', messageHandler);
          const { cdnUrl } = JSON.parse(event.data.payload);
          resolve(cdnUrl);
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

  (window as any).ov25ConfigureHandlerRef = { current: null };
  (window as any).ov25OpenConfiguratorRef = { current: null };
  (window as any).ov25CloseConfiguratorRef = { current: null };
  (window as any).ov25OpenSwatchBookRef = { current: null };
  (window as any).ov25CloseSwatchBookRef = { current: null };

  const customCssStylesheet = cssString ? createuserCustomCssStylesheet(cssString) : undefined;
  const existingWindowStylesheets = Array.isArray((window as any).ov25adoptedStyleSheets)
    ? (window as any).ov25adoptedStyleSheets
    : [sharedStylesheet];
  if (customCssStylesheet && !existingWindowStylesheets.includes(customCssStylesheet)) {
    (window as any).ov25adoptedStyleSheets = [...existingWindowStylesheets, customCssStylesheet];
  }

  const getBaseShadowStylesheets = (): CSSStyleSheet[] => {
    const windowStylesheets = Array.isArray((window as any).ov25adoptedStyleSheets)
      ? (window as any).ov25adoptedStyleSheets
      : [sharedStylesheet];

    if (customCssStylesheet && !windowStylesheets.includes(customCssStylesheet)) {
      return [...windowStylesheets, customCssStylesheet];
    }

    return [...windowStylesheets];
  };

  // Resolve string or function
  const resolveStringOrFunction = (value: StringOrFunction): string => {
    return typeof value === 'function' ? value() : value;
  };

  // Get selector string from ElementSelector
  const getSelector = (elementSelector: ElementSelector | undefined): string | undefined => {
    if (!elementSelector) return undefined;
    return typeof elementSelector === 'string' ? elementSelector : ('selector' in elementSelector ? elementSelector.selector : 'id' in elementSelector ? elementSelector.id : undefined);
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
    shadowRoot.adoptedStyleSheets = getBaseShadowStylesheets();
  };

  // Elements like button, input, form don't support attachShadow - wrap in div
  const getOrCreateShadowHost = (target: Element): Element => {
    const SHADOW_HOST_TAGS = new Set(['article', 'aside', 'blockquote', 'body', 'div', 'footer', 'header', 'main', 'nav', 'p', 'section', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
    const tag = target.tagName.toLowerCase();
    if (SHADOW_HOST_TAGS.has(tag) || tag.includes('-')) {
      return target;
    }
    const wrapper = document.createElement('div');
    wrapper.className = target.className;
    target.parentNode?.replaceChild(wrapper, target);
    return wrapper;
  };

  const ensureLoaded = () => {
    // Create mobile drawer Shadow DOM container
    const mobileDrawerContainer = document.createElement('div');
    mobileDrawerContainer.id = 'ov25-mobile-drawer-container';
    mobileDrawerContainer.setAttribute('data-clarity-mask', 'true');
    mobileDrawerContainer.style.position = 'fixed';
    mobileDrawerContainer.style.top = '0';
    mobileDrawerContainer.style.left = '0';
    mobileDrawerContainer.style.width = '100%';
    mobileDrawerContainer.style.height = '100%';
    mobileDrawerContainer.style.pointerEvents = 'none';
    mobileDrawerContainer.style.zIndex = '2147483646'; // max - 1
    document.body.appendChild(mobileDrawerContainer);

    // add an empty <span> inside the mobile drawer container to stop shopify themes with empty div rules from hiding the div
    // even though its got an iframe in its shadow root, the shopify themes still recognise it as empty div and apply a rule like this:
    // div:empty { display: none; }
    const mobileDrawerEmptySpan = document.createElement('span');
    mobileDrawerEmptySpan.style.width = '100%';
    mobileDrawerEmptySpan.style.height = '100%';
    mobileDrawerEmptySpan.style.pointerEvents = 'none';
    mobileDrawerContainer.appendChild(mobileDrawerEmptySpan);

    // Create Shadow DOM root for mobile drawer
    const mobileDrawerShadowRoot = mobileDrawerContainer.attachShadow({ mode: 'open' });
    mobileDrawerShadowRoot.adoptedStyleSheets = getBaseShadowStylesheets();

    const snap2CheckoutSheetContainer = document.createElement('div');
    snap2CheckoutSheetContainer.id = uniqueId
      ? `ov25-snap2-checkout-sheet-container-${uniqueId}`
      : 'ov25-snap2-checkout-sheet-container';
    snap2CheckoutSheetContainer.setAttribute('data-clarity-mask', 'true');
    snap2CheckoutSheetContainer.style.position = 'fixed';
    snap2CheckoutSheetContainer.style.top = '0';
    snap2CheckoutSheetContainer.style.left = '0';
    snap2CheckoutSheetContainer.style.width = '100%';
    snap2CheckoutSheetContainer.style.height = '100%';
    snap2CheckoutSheetContainer.style.pointerEvents = 'none';
    snap2CheckoutSheetContainer.style.zIndex = '2147483647';
    document.body.appendChild(snap2CheckoutSheetContainer);

    const snap2CheckoutSheetEmptySpan = document.createElement('span');
    snap2CheckoutSheetEmptySpan.style.width = '100%';
    snap2CheckoutSheetEmptySpan.style.height = '100%';
    snap2CheckoutSheetEmptySpan.style.pointerEvents = 'none';
    snap2CheckoutSheetContainer.appendChild(snap2CheckoutSheetEmptySpan);

    const snap2CheckoutSheetShadowRoot = snap2CheckoutSheetContainer.attachShadow({ mode: 'open' });
    snap2CheckoutSheetShadowRoot.adoptedStyleSheets = getBaseShadowStylesheets();

    // Create Shadow DOM container used as default dialog portal target (DialogContent portals here when not Snap2/SwatchBook/AR)
    const configuratorViewControlsContainer = document.createElement('div');
    configuratorViewControlsContainer.id = uniqueId ? `ov25-configurator-view-controls-container-${uniqueId}` : 'ov25-configurator-view-controls-container';
    configuratorViewControlsContainer.setAttribute('data-clarity-mask', 'true');
    configuratorViewControlsContainer.style.position = 'absolute';
    configuratorViewControlsContainer.style.top = '0';
    configuratorViewControlsContainer.style.left = '0';
    configuratorViewControlsContainer.style.width = '100%';
    configuratorViewControlsContainer.style.height = '100%';
    configuratorViewControlsContainer.style.pointerEvents = 'none';
    configuratorViewControlsContainer.style.zIndex = '101';
    document.body.appendChild(configuratorViewControlsContainer);

    // add an empty <span> inside the configurator view controls container to stop shopify themes with empty div rules from hiding the div
    // even though its got an iframe in its shadow root, the shopify themes still recognise it as empty div and apply a rule like this:
    // div:empty { display: none; }
    const configuratorViewControlsEmptySpan = document.createElement('span');
    configuratorViewControlsEmptySpan.style.width = '100%';
    configuratorViewControlsEmptySpan.style.height = '100%';
    configuratorViewControlsEmptySpan.style.pointerEvents = 'none';
    configuratorViewControlsContainer.appendChild(configuratorViewControlsEmptySpan);

    // Create Shadow DOM root for configurator view controls
    const configuratorViewControlsShadowRoot = configuratorViewControlsContainer.attachShadow({ mode: 'open' });
    configuratorViewControlsShadowRoot.adoptedStyleSheets = getBaseShadowStylesheets();

    // Create popover portal Shadow DOM container
    const popoverPortalContainer = document.createElement('div');
    popoverPortalContainer.id = 'ov25-popover-portal-container';
    popoverPortalContainer.setAttribute('data-clarity-mask', 'true');
    popoverPortalContainer.style.position = 'fixed';
    popoverPortalContainer.style.top = '0';
    popoverPortalContainer.style.left = '0';
    popoverPortalContainer.style.width = '100%';
    popoverPortalContainer.style.height = '100%';
    popoverPortalContainer.style.pointerEvents = 'none';
    popoverPortalContainer.style.zIndex = '2147483646'; // max -1
    document.body.appendChild(popoverPortalContainer);

    // add an empty <span> inside the popover portal container to stop shopify themes with empty div rules from hiding the div
    // even though its got an iframe in its shadow root, the shopify themes still recognise it as empty div and apply a rule like this:
    // div:empty { display: none; }
    const popoverPortalEmptySpan = document.createElement('span');
    popoverPortalEmptySpan.style.width = '100%';
    popoverPortalEmptySpan.style.height = '100%';
    popoverPortalEmptySpan.style.pointerEvents = 'none';
    popoverPortalContainer.appendChild(popoverPortalEmptySpan);

    // Create Shadow DOM root for popover portal
    const popoverPortalShadowRoot = popoverPortalContainer.attachShadow({ mode: 'open' });
    popoverPortalShadowRoot.adoptedStyleSheets = getBaseShadowStylesheets();

    // Create toaster portal container
    const toasterContainer = document.createElement('div');
    toasterContainer.id = 'ov25-toaster-container';
    toasterContainer.setAttribute('data-clarity-mask', 'true');
    toasterContainer.style.position = 'fixed';
    toasterContainer.style.top = '0';
    toasterContainer.style.left = '0';
    toasterContainer.style.width = '100%';
    toasterContainer.style.height = '100%';
    toasterContainer.style.pointerEvents = 'none';
    toasterContainer.style.zIndex = '2147483647'; // max
    document.body.appendChild(toasterContainer);

    // add an empty <span> inside the toaster portal container to stop shopify themes with empty div rules from hiding the div
    // even though its got an iframe in its shadow root, the shopify themes still recognise it as empty div and apply a rule like this:
    // div:empty { display: none; }
    const toasterPortalEmptySpan = document.createElement('span');
    toasterPortalEmptySpan.style.width = '100%';
    toasterPortalEmptySpan.style.height = '100%';
    toasterPortalEmptySpan.style.pointerEvents = 'none';
    toasterContainer.appendChild(toasterPortalEmptySpan);

    // Create Shadow DOM root for toaster portal
    const toasterPortalShadowRoot = toasterContainer.attachShadow({ mode: 'open' });
    toasterPortalShadowRoot.adoptedStyleSheets = [...getBaseShadowStylesheets(), sonnerStylesheet];

    // Create swatchbook portal Shadow DOM container
    const swatchbookPortalContainer = document.createElement('div');
    swatchbookPortalContainer.id = 'ov25-swatchbook-portal-container';
    swatchbookPortalContainer.setAttribute('data-clarity-mask', 'true');
    swatchbookPortalContainer.style.position = 'fixed';
    swatchbookPortalContainer.style.top = '0';
    swatchbookPortalContainer.style.left = '0';
    swatchbookPortalContainer.style.width = '100%';
    swatchbookPortalContainer.style.height = '100%';
    swatchbookPortalContainer.style.pointerEvents = 'none';
    swatchbookPortalContainer.style.zIndex = '2147483647';
    document.body.appendChild(swatchbookPortalContainer);

    // add an empty <span> inside the swatchbook portal container to stop shopify themes with empty div rules from hiding the div
    // even though its got an iframe in its shadow root, the shopify themes still recognise it as empty div and apply a rule like this:
    // div:empty { display: none; }
    const swatchbookPortalEmptySpan = document.createElement('span');
    swatchbookPortalEmptySpan.style.width = '100%';
    swatchbookPortalEmptySpan.style.height = '100%';
    swatchbookPortalEmptySpan.style.pointerEvents = 'none';
    swatchbookPortalContainer.appendChild(swatchbookPortalEmptySpan);

    // Create Shadow DOM root for swatchbook portal
    const swatchbookPortalShadowRoot = swatchbookPortalContainer.attachShadow({ mode: 'open' });
    swatchbookPortalShadowRoot.adoptedStyleSheets = getBaseShadowStylesheets();

    const isAnyModalMode =
      configuratorDisplayMode === ConfiguratorDisplayMode.Modal ||
      configuratorDisplayModeMobile === ConfiguratorDisplayMode.Modal;

    let modalPortalShadowRoot: ShadowRoot | undefined;
    if (isAnyModalMode) {
      const modalPortalContainer = document.createElement('div');
      modalPortalContainer.id = 'ov25-modal-portal-container';
      modalPortalContainer.setAttribute('data-clarity-mask', 'true');
      modalPortalContainer.style.position = 'fixed';
      modalPortalContainer.style.top = '0';
      modalPortalContainer.style.left = '0';
      modalPortalContainer.style.width = '100%';
      modalPortalContainer.style.height = '100%';
      modalPortalContainer.style.pointerEvents = 'none';
      modalPortalContainer.style.zIndex = '2147483646'; // max - 1
      document.body.appendChild(modalPortalContainer);

      const modalPortalEmptySpan = document.createElement('span');
      modalPortalEmptySpan.style.width = '100%';
      modalPortalEmptySpan.style.height = '100%';
      modalPortalEmptySpan.style.pointerEvents = 'none';
      modalPortalContainer.appendChild(modalPortalEmptySpan);

      modalPortalShadowRoot = modalPortalContainer.attachShadow({ mode: 'open' });
      modalPortalShadowRoot.adoptedStyleSheets = getBaseShadowStylesheets();
    }

    const hasGallerySelector = !!getSelector(effectiveGallerySelector);
    const useDeferredGallery =
    !hasGallerySelector &&
    (deferThreeD || configuratorDisplayMode === ConfiguratorDisplayMode.Modal);

    if (useDeferredGallery) {
      let deferredGalleryEl = document.getElementById('ov25-deferred-gallery-container');
      if (!deferredGalleryEl) {
        deferredGalleryEl = document.createElement('div');
        deferredGalleryEl.id = 'ov25-deferred-gallery-container';
        deferredGalleryEl.setAttribute('data-clarity-mask', 'true');
        document.body.appendChild(deferredGalleryEl);
      }
    }

    // Make sure the portal targets are in the DOM *now*
    const portals: ReactNode[] = [];

    const pushPortal = (selector: string | undefined, el: ReactNode, createShadow: boolean = false) => {
      if (createShadow && selector) {
        const target = document.querySelector(selector);
        if (target) {
          const host = getOrCreateShadowHost(target);
          if (!host.shadowRoot) {
            const shadowRoot = host.attachShadow({ mode: 'open' });
            injectCSSIntoShadowDOM(shadowRoot);
          }
          portals.push(createPortal(el, host.shadowRoot!));
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
          emptyDiv.setAttribute('data-clarity-mask', 'true');
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
          const emptyDiv = document.createElement('div');
          emptyDiv.setAttribute('data-clarity-mask', 'true');
          const stickyGallery =
            useInlineVariantControls && componentName === 'gallery' ? ' ov25-inline-gallery-sticky' : '';
          emptyDiv.className = `${target.className} ov25-configurator-${componentName}${stickyGallery}`.trim();
          if (target.id) emptyDiv.id = target.id;

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

    // Function to check if gallery or its parents have z-index set
    const checkForStackedGallery = (): boolean => {
      const selector = getSelector(effectiveGallerySelector);
      if (!selector) return false;

      const galleryElement = document.querySelector(selector);
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

    const variantsSelectorStr = getSelector(variantsSelector);
    const configureSelector = configureButtonSelector ? getSelector(configureButtonSelector) : undefined;
    const variantsTarget = variantsSelectorStr ? document.querySelector(variantsSelectorStr) : null;
    const configureTarget = configureSelector ? document.querySelector(configureSelector) : null;

    // Process each component
    // Show gallery in page slot when selector is provided (including modal mode — iframe shows on page, then repositions into modal).
    // Non-replace: mount inside a dedicated flex column so iframe + thumbnails stay one layout unit (avoids grid splitting vs siblings).
    if (getSelector(effectiveGallerySelector)) {
      const gallerySel = getSelector(effectiveGallerySelector)!;
      if (shouldReplace(effectiveGallerySelector)) {
        processElement(effectiveGallerySelector, <ProductGallery />, 'gallery');
      } else {
        const target = document.querySelector(gallerySel);
        if (target) {
          const column = document.createElement('div');
          column.className = [
            'ov25-configurator-inject-column',
            useInlineVariantControls ? 'ov25-inline-gallery-sticky' : '',
          ]
            .filter(Boolean)
            .join(' ');
          column.setAttribute('data-clarity-mask', 'true');
          column.style.display = 'flex';
          column.style.flexDirection = 'column';
          column.style.width = '100%';
          target.appendChild(column);
          portals.push(createPortal(<ProductGallery />, column));
        } else {
          console.warn(`[OV25-UI] Element not found for selector "${gallerySel}"`);
        }
      }
    } else if (useDeferredGallery) {
      pushPortal('#ov25-deferred-gallery-container', <DeferredGalleryContainer />, false);
    }

    // Portal for configurator UI (skip when multiple Snap2 - handlers added by runMultipleConfiguratorLogic)
    if (!skipConfigureButton) {
      if (useSimpleVariantsSelector) {
        if (configureTarget && configureButtonSelector) {
          processElement(configureButtonSelector, <VariantSelectMenu />, 'configure-button');
        } else if (variantsTarget) {
          processElement(variantsSelector, <VariantSelectMenu />, 'variants');
        }
      } else {
        if (variantsTarget) {
          processElement(variantsSelector, <VariantSelectMenu />, 'variants');
        } else if (configureTarget && configureButtonSelector) {
          processElement(configureButtonSelector, <Snap2ConfigureButton />, 'configure-button');
        }
      }
    }

    // Multiple Snap2 replace mode: replace target elements with our ConfigureButton
    const { multipleSnap2ReplaceButtons, switchToSnap2Config } = internalOptions ?? {};
    if (multipleSnap2ReplaceButtons?.length && switchToSnap2Config) {
      for (const { selector, configIndex } of multipleSnap2ReplaceButtons) {
        portalReplaceElement(selector, <ConfigureButton onClick={() => switchToSnap2Config(configIndex)} />, 'configure-button', false);
      }
    }

    // Always show price, name, and swatches
    processElement(priceSelector, <Price />, 'price');
    processElement(nameSelector, <Name />, 'name');
    processElement(swatchesSelector, <SwatchesContainer />, 'swatches');

    // Configure button handling when both variants and configure button exist (Snap2 only, not useSimpleVariantsSelector)
    if (configureButtonSelector && variantsTarget && configureTarget && !useSimpleVariantsSelector) {
      if (shouldReplace(configureButtonSelector)) {
        processElement(configureButtonSelector, <Snap2ConfigureButton />, 'configure-button');
      } else {
        const selector = getSelector(configureButtonSelector);
        if (selector) {
          waitForElement(selector, 5000)
            .then(element => {
              const handleClick = () => {
                const handlerRef = (window as any).ov25ConfigureHandlerRef;
                if (handlerRef?.current) {
                  handlerRef.current();
                }
              };
              element.addEventListener('click', handleClick);
            })
            .catch(err => {
              console.warn(`[OV25-UI] Configure button element not found: ${err.message}`);
            });
        }
        portals.push(<Snap2ConfigureUI key="snap2-configure-ui" />);
      }
    }

    if (useSimpleVariantsSelector) {
      const resolvedProductLink = resolveStringOrFunction(productLink);
      if (resolvedProductLink?.startsWith('snap2/')) {
        portals.push(<Snap2ConfigureUI key="snap2-configure-ui" />);
      }
    }

    // Add swatchbook to portals
    portals.push(createPortal(<SwatchBook isMobile={false} />, swatchbookPortalShadowRoot));

    // Special handling for toaster - use body-level container for all modes to ensure visibility in fullscreen
    // Use body-level toaster container at max z-index to ensure it appears above fullscreen iframe
    portals.push(createPortal(<Toaster position="top-center" richColors style={{ zIndex: 2147483647 }} />, toasterPortalShadowRoot));

    // If no portals were created we can bail early
    if (portals.length === 0) {
      return;
    }

    // Create (or reuse) a container for the React root
    // For standard configurators with uniqueId, create separate containers
    const containerId = uniqueId ? `ov25-provider-root-${uniqueId}` : 'ov25-provider-root';
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      container.setAttribute('data-clarity-mask', 'true');
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

    // Use query param configuration_uuid only on first load, not on switches
    let resolvedConfigurationUuid: string | undefined;
    if (!hasConsumedQueryConfigUuid) {
      const queryConfigUuid = getConfigurationUuidFromQueryParams();
      const queryProductLink = getProductLinkFromQueryParams();

      if (queryConfigUuid && (!queryProductLink || queryProductLink === resolvedProductLink)) {
        resolvedConfigurationUuid = queryConfigUuid;
        hasConsumedQueryConfigUuid = true;
      } else if (configurationUuid) {
        resolvedConfigurationUuid = resolveStringOrFunction(configurationUuid);
      }
    } else {
      // Query param already consumed - only use injected configurationUuid
      resolvedConfigurationUuid = configurationUuid ? resolveStringOrFunction(configurationUuid) : undefined;
    }

    (window as any).ov25OpenConfigurator = (optionName?: string) => (window as any).ov25OpenConfiguratorRef?.current?.(optionName);
    (window as any).ov25CloseConfigurator = () => (window as any).ov25CloseConfiguratorRef?.current?.();
    (window as any).ov25OpenSwatchBook = () => (window as any).ov25OpenSwatchBookRef?.current?.();
    (window as any).ov25CloseSwatchBook = () => (window as any).ov25CloseSwatchBookRef?.current?.();

    root.render(
      <OV25UIProvider
        apiKey={resolvedApiKey}
        productLink={resolvedProductLink}
        configurationUuid={resolvedConfigurationUuid || ''}
        buyNowFunction={buyNowFunction}
        buySwatchesFunction={buySwatchesFunction}
        addToBasketFunction={addToBasketFunction}
        onChange={onChangeFunction}
        images={images}
        logoURL={logoURL}
        mobileLogoURL={mobileLogoURL}
        deferThreeD={deferThreeD}
        configuratorGalleryIsDeferred={useDeferredGallery}
        showOptional={showOptional}
        hideAr={hideAr}
        hidePricing={hidePricing}
        forceMobile={forceMobile}
        isProductGalleryStacked={isProductGalleryStacked}
        carouselDisplayMode={carouselDisplayMode}
        carouselDisplayModeMobile={carouselDisplayModeMobile}
        carouselMaxImagesDesktop={carouselMaxImagesDesktop}
        carouselMaxImagesMobile={carouselMaxImagesMobile}
        showCarousel={showCarousel}
        hasConfigureButton={!!configureButtonSelector && !useSimpleVariantsSelector}
        uniqueId={uniqueId}
        useInlineVariantControls={useInlineVariantControls}
        useInlineVariantControlsMobile={useInlineVariantControlsMobile}
        configuratorDisplayMode={configuratorDisplayMode}
        configuratorDisplayModeMobile={configuratorDisplayModeMobile}
        useSimpleVariantsSelector={!!useSimpleVariantsSelector}
        configuratorTriggerStyle={configuratorTriggerStyle}
        configuratorTriggerStyleMobile={configuratorTriggerStyleMobile}
        variantDisplayStyle={variantDisplayStyle}
        variantDisplayStyleMobile={variantDisplayStyleMobile}
        hideVariantOptions={hideVariantOptions}
        shadowDOMs={{
          mobileDrawer: mobileDrawerShadowRoot,
          snap2CheckoutSheet: snap2CheckoutSheetShadowRoot,
          configuratorViewControls: configuratorViewControlsShadowRoot,
          popoverPortal: popoverPortalShadowRoot,
          modalPortal: modalPortalShadowRoot,
          swatchbookPortal: swatchbookPortalShadowRoot
        }}
        cssString={cssString}
        bedAllowNoneQueryValue={bedAllowNoneQueryValue}
        bedFilterSelectionsByCurrentSize={bedFilterSelectionsByCurrentSize}
      >
        {portals}
      </OV25UIProvider>
    );
  };

  // Check if we should auto-open (before ensureLoaded consumes the query param)
  const usesSheetOrDrawer = configuratorDisplayMode !== ConfiguratorDisplayMode.Inline || configuratorDisplayModeMobile !== ConfiguratorDisplayMode.Inline;
  const canAutoOpenFromConfig = autoOpen && usesSheetOrDrawer && (configureButtonSelector || variantsSelector);

  let shouldAutoOpen = false;
  let queryConfigUuid: string | null = null;

  if (canAutoOpenFromConfig) {
    shouldAutoOpen = true;
  } else if (configureButtonSelector && !hasConsumedQueryConfigUuid) {
    queryConfigUuid = getConfigurationUuidFromQueryParams();
    const queryProductLink = getProductLinkFromQueryParams();
    const resolvedProductLinkForAutoOpen = resolveStringOrFunction(productLink);

    if (queryConfigUuid && (!queryProductLink || queryProductLink === resolvedProductLinkForAutoOpen)) {
      shouldAutoOpen = true;
    }
  }

  // Run now if DOM ready, otherwise wait
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureLoaded, { once: true });
  } else {
    ensureLoaded();
  }

  // Auto-open configurator when autoOpen is true (non-inline) or configuration_uuid in query params
  if (shouldAutoOpen && (queryConfigUuid || canAutoOpenFromConfig)) {
    const attemptAutoOpen = (attempts = 0) => {
      const handlerRef = (window as any).ov25ConfigureHandlerRef;
      if (handlerRef?.current) {
        setTimeout(() => {
          handlerRef.current();
        }, 200);
      } else if (attempts < 20) {
        setTimeout(() => attemptAutoOpen(attempts + 1), 100);
      }
    };
    attemptAutoOpen();
  }
}

// Module-level variables for multiple configurators
let currentConfigs: InjectConfiguratorInput[] = [];
let activeConfiguratorIndex: number = 0;
let hasInitializedMultipleConfigurators = false;
const clickHandlers = new Map<string, (event: Event) => void>();
let isReinitializing = false;

function runMultipleConfiguratorLogic(configs: InjectConfiguratorInput[]) {
  if (hasInitializedMultipleConfigurators) {
    console.warn('[OV25-UI] injectConfigurator with multiple configs has already been called. Skipping duplicate initialization.');
    return;
  }
  hasInitializedMultipleConfigurators = true;
  // Detect configurator type based on productLink
  const snap2Configs = configs.filter(config => {
    const productLink = typeof config.productLink === 'function' ? config.productLink() : config.productLink;
    return productLink?.startsWith('snap2/');
  });

  const standardConfigs = configs.filter(config => {
    const productLink = typeof config.productLink === 'function' ? config.productLink() : config.productLink;
    return !productLink?.startsWith('snap2/');
  });

  const getGallerySelector = (c: InjectConfiguratorInput) =>
    ('selectors' in c && c.selectors?.gallery) ?? (c as any).gallerySelector ?? (c as any).galleryId;
  const getConfigureButtonSelector = (c: InjectConfiguratorInput) =>
    ('selectors' in c && c.selectors?.configureButton) ?? (c as any).configureButtonSelector ?? (c as any).configureButtonId;
  const getSelectorFromConfig = (sel: ReturnType<typeof getConfigureButtonSelector>): string | undefined =>
    typeof sel === 'string' ? sel : (sel && ('selector' in sel ? sel.selector : 'id' in sel ? sel.id : undefined));
  const shouldReplaceConfig = (sel: ReturnType<typeof getConfigureButtonSelector>): boolean =>
    sel != null && typeof sel === 'object' && sel.replace === true;
  const getVariantsSelector = (c: InjectConfiguratorInput) =>
    ('selectors' in c && c.selectors?.variants) ?? (c as any).variantsSelector ?? (c as any).variantsId;

  const snap2ConfigsWithoutButton = snap2Configs.filter(config => !getConfigureButtonSelector(config));
  if (snap2ConfigsWithoutButton.length > 0) {
    throw new Error('All Snap2 configs must have a configureButtonSelector defined');
  }

  const standardConfigsWithoutGallery = standardConfigs.filter(config => !getGallerySelector(config));
  if (standardConfigsWithoutGallery.length > 0) {
    throw new Error('All standard configs must have a gallerySelector defined');
  }

  const gallerySelectors = standardConfigs.map(config => {
    const sel = getGallerySelector(config);
    return typeof sel === 'string' ? sel : (sel && ('selector' in sel ? sel.selector : 'id' in sel ? sel.id : undefined));
  }).filter(Boolean);

  const uniqueGalleryIds = new Set(gallerySelectors);
  if (gallerySelectors.length !== uniqueGalleryIds.size) {
    throw new Error(`Can't place multiple configurators in the same place. All gallerySelector values must be unique.`);
  }

  const variantsSelectors = standardConfigs.map(config => {
    const sel = getVariantsSelector(config);
    return typeof sel === 'string' ? sel : (sel && ('selector' in sel ? sel.selector : 'id' in sel ? sel.id : undefined));
  }).filter(Boolean);

  const uniqueVariantsIds = new Set(variantsSelectors);
  if (variantsSelectors.length !== uniqueVariantsIds.size) {
    throw new Error(`Can't place multiple configurator controls in the same place.All variantsSelector values must be unique for standard configurators`);
  }

  // Store configs
  currentConfigs = configs;
  activeConfiguratorIndex = 0;

  // Handle Snap2 configurators (exclusive, lazy initialization)
  if (snap2Configs.length > 0) {
    // Determine which configurator to initialize based on query parameters
    const queryConfigUuid = getConfigurationUuidFromQueryParams();
    const queryProductLink = getProductLinkFromQueryParams();

    // Find the matching configurator if product_link is specified
    let configuratorToInitialize = snap2Configs[0];
    let configuratorIndexToInitialize = 0;

    if (queryProductLink) {
      const matchingIndex = snap2Configs.findIndex(config => {
        const productLink = typeof config.productLink === 'function'
          ? config.productLink()
          : config.productLink;
        return productLink === queryProductLink;
      });

      if (matchingIndex !== -1) {
        configuratorToInitialize = snap2Configs[matchingIndex];
        configuratorIndexToInitialize = matchingIndex;
      }
    }

    const multipleSnap2ReplaceButtons = snap2Configs
      .map((c, i) => {
        const btnSel = getConfigureButtonSelector(c);
        const selector = getSelectorFromConfig(btnSel);
        if (!selector || !shouldReplaceConfig(btnSel)) return null;
        return { selector, configIndex: i };
      })
      .filter((x): x is { selector: string; configIndex: number } => x != null);

    const switchToSnap2Config = (configIndex: number) => {
      if (isReinitializing) return;
      isReinitializing = true;
      try {
        const container = document.getElementById('ov25-provider-root');
        if (container && (container as any)._reactRoot) {
          (container as any)._reactRoot.unmount();
          delete (container as any)._reactRoot;
        }
        cleanupShadowDOMContainers();
        injectSingleConfigurator(snap2Configs[configIndex], {
          skipConfigureButton: true,
          multipleSnap2ReplaceButtons,
          switchToSnap2Config,
        });
        activeConfiguratorIndex = configIndex;
        requestAnimationFrame(() => {
          setTimeout(() => {
            (window as any).ov25ConfigureHandlerRef?.current?.();
            setTimeout(() => { isReinitializing = false; }, 500);
          }, 100);
        });
      } catch (error) {
        console.error('[OV25-UI] Error during reinitialization:', error);
        isReinitializing = false;
      }
    };

    injectSingleConfigurator(configuratorToInitialize, {
      skipConfigureButton: snap2Configs.length > 1,
      multipleSnap2ReplaceButtons: multipleSnap2ReplaceButtons.length > 0 ? multipleSnap2ReplaceButtons : undefined,
      switchToSnap2Config: multipleSnap2ReplaceButtons.length > 0 ? switchToSnap2Config : undefined,
    });
    activeConfiguratorIndex = configuratorIndexToInitialize;

    const initNorm = normalizeInjectConfig(configuratorToInitialize);
    const usesSheetOrDrawer = initNorm.configuratorDisplayMode !== 'inline' || initNorm.configuratorDisplayModeMobile !== 'inline';
    const shouldAutoOpenMulti = queryConfigUuid || (initNorm.autoOpen && usesSheetOrDrawer);

    if (shouldAutoOpenMulti) {
      // Wait for the handler to be set up, then auto-open
      const attemptAutoOpen = (attempts = 0) => {
        const handlerRef = (window as any).ov25ConfigureHandlerRef;
        if (handlerRef?.current) {
          // Handler is ready, open the configurator
          setTimeout(() => {
            handlerRef.current();
          }, 200);
        } else if (attempts < 20) {
          // Handler not ready yet, try again after a short delay
          setTimeout(() => attemptAutoOpen(attempts + 1), 100);
        }
      };
      attemptAutoOpen();
    }

    // Set up click listeners for Snap2 configurators with replace: false (replace: true use our ConfigureButton)
    for (let i = 0; i < snap2Configs.length; i++) {
      const config = snap2Configs[i];
      const btnSel = getConfigureButtonSelector(config);
      if (shouldReplaceConfig(btnSel)) continue;
      const selector = getSelectorFromConfig(btnSel);
      if (!selector) continue;

      waitForElement(selector, 5000)
        .then((element: Element) => {
          const existingHandler = clickHandlers.get(selector);
          if (existingHandler) {
            element.removeEventListener('click', existingHandler);
          }

          const handleClick = async (event: Event) => {
            if (isReinitializing) {
              return;
            }

            isReinitializing = true;

            try {
              // Unmount React root to clean up state (don't call cleanup function to avoid modal flicker)
              const container = document.getElementById('ov25-provider-root');
              if (container && (container as any)._reactRoot) {
                (container as any)._reactRoot.unmount();
                delete (container as any)._reactRoot;
              }

              cleanupShadowDOMContainers();
              injectSingleConfigurator(config, { skipConfigureButton: true });
              activeConfiguratorIndex = i;

              // Open configurator after React renders
              requestAnimationFrame(() => {
                setTimeout(() => {
                  const handlerRef = (window as any).ov25ConfigureHandlerRef;
                  if (handlerRef?.current) {
                    handlerRef.current();
                  }
                  setTimeout(() => {
                    isReinitializing = false;
                  }, 500);
                }, 100);
              });
            } catch (error) {
              console.error('[OV25-UI] Error during reinitialization:', error);
              isReinitializing = false;
            }
          };

          clickHandlers.set(selector, handleClick);
          element.addEventListener('click', handleClick);
        })
        .catch((err: Error) => {
          console.warn(`[OV25-UI] Configure button element not found for selector "${selector}": ${err.message}`);
        });
    }
  }

  // Handle standard configurators (simultaneous display)
  if (standardConfigs.length > 0) {
    // Initialize all standard configurators immediately
    for (let i = 0; i < standardConfigs.length; i++) {
      const config = standardConfigs[i];
      // Add uniqueId to prevent element ID conflicts
      injectSingleConfigurator({ ...config, uniqueId: `config-${i}` });
    }
  }
}
