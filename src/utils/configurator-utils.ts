import { Selection } from '../contexts/ov25-ui-context.js';
import { BED_IFRAME_ALLOW_NONE_QUERY_KEY } from '../lib/config/bed-embed-query.js';
import { findIframeWithUniqueId } from './configurator-dom-queries.js';

/**
 * Configuration option type
 */
export type ConfigOption = {
  id: string;
  name: string;
  // Additional properties of a config option
};

/**
 * Selection data structure
 */
export type SelectionItem = {
  optionId: string;
  groupId?: string;
  selectionId: string;
};

export type ConfiguratorSelectionBedMetadata = {
  bedSize?: string;
};

/** Reads `metadata.bedSize` from API/configurator selections (e.g. bed catalogue lines). */
export function selectionBedSizeFromMetadata(
  selection: { metadata?: ConfiguratorSelectionBedMetadata | null } | null | undefined,
): string | undefined {
  const v = selection?.metadata?.bedSize?.trim();
  return v || undefined;
}

function orderWithNoneLabelFirst<T>(
  items: readonly T[],
  getLabel: (item: T) => string | undefined | null,
): T[] {
  if (items.length <= 1) return [...items];
  const none: T[] = [];
  const rest: T[] = [];
  for (const item of items) {
    const label = getLabel(item);
    const isNone = typeof label === 'string' && label.trim().toLowerCase() === 'none';
    (isNone ? none : rest).push(item);
  }
  return [...none, ...rest];
}

/** Label used only to detect "None" rows (name or bed line metadata). */
function selectionNoneSortLabel(
  s: { name?: string | null; metadata?: ConfiguratorSelectionBedMetadata | null },
): string {
  const n = s.name?.trim().toLowerCase();
  if (n === 'none') return 'none';
  const bed = selectionBedSizeFromMetadata(s);
  if (bed?.trim().toLowerCase() === 'none') return 'none';
  return s.name ?? '';
}

/**
 * Per-group selection order from the iframe: "None" (any case, trimmed) first; stable order otherwise.
 */
export function orderConfiguratorSelectionsWithNoneFirst<
  T extends { name: string; metadata?: ConfiguratorSelectionBedMetadata | null },
>(items: readonly T[]): T[] {
  return orderWithNoneLabelFirst(items, (s) => selectionNoneSortLabel(s));
}

/**
 * Animation state options
 */
export type AnimationState = 'unavailable' | 'open' | 'close' | 'loop' | 'stop';

/**
 * Module selection types for Snap2
 */
export type CompatibleModule = {
  productId: number;
  position: string;
  product: {
    id: number;
    name: string;
    imageUrl: string;
    hasImage: boolean;
  };
  model: {
    modelPath: string;
    modelId: number;
  };
  dimensions: {
    x: number;
    y: number;
    z: number;
  }
};

export type SelectModuleReceivedMessage = {
  success: boolean;
  modelPath: string;
  modelId: number;
};

/**
 * Get the iframe element by ID
 */
const getConfiguratorIframe = (uniqueId?: string): HTMLIFrameElement | null =>
  findIframeWithUniqueId(uniqueId) as HTMLIFrameElement | null;

/**
 * Sends a message to the iframe
 */
export const sendMessageToIframe = (
  type: string,
  payload: any,
  uniqueId?: string
) => {
  const iframe = getConfiguratorIframe(uniqueId);
  if (iframe?.contentWindow) {
    iframe.contentWindow.postMessage({
      type,
      payload: JSON.stringify(payload)
    }, '*');
  }
};

/**
 * Handle selecting a product
 * @param productId - The ID of the product to select
 * @param uniqueId - Optional unique ID for multiple configurators
 */
export const selectProduct = (productId: number, uniqueId?: string): void => {
  sendMessageToIframe('SELECT_PRODUCT', productId, uniqueId);
};

/**
 * Handle selecting a configuration option
 * @param optionId - The ID of the option to select
 * @param groupId - The ID of the group the option belongs to
 * @param selectionId - The ID of the specific selection
 */
export const selectOption = (optionId: string, groupId: string, selectionId: string, uniqueId?: string): void => {
  sendMessageToIframe('SELECT_SELECTION', {
    optionId,
    groupId,
    selectionId
  }, uniqueId);
};

/**
 * Update the quantity of the product
 * @param quantity - The new quantity value
 */
export const updateQuantity = (quantity: number, uniqueId?: string): void => {
  sendMessageToIframe('UPDATE_QUANTITY', { quantity }, uniqueId);
};

/**
 * Add the current configured product to the cart
 */
export const addToCart = (uniqueId?: string): void => {
  sendMessageToIframe('ADD_TO_CART', {}, uniqueId);
};

/**
 * Toggle dimensions visibility in the 3D viewer
 * @param canSeeDimensions - Current dimensions visibility state
 * @param setCanSeeDimensions - State setter function for dimensions visibility
 */
export const toggleDimensions = (
  canSeeDimensions: boolean,
  setCanSeeDimensions: React.Dispatch<React.SetStateAction<boolean>>,
  uniqueId?: string,
  cssString?: string
): void => {
  sendMessageToIframe('VIEW_DIMENSIONS', { dimensions: !canSeeDimensions, styles: cssString }, uniqueId);
  setCanSeeDimensions(prev => !prev);
};

/**
 * Toggle mini dimensions in the 3D viewer
 */
export const toggleMiniDimensions = (
  canSeeMiniDimensions: boolean,
  setCanSeeMiniDimensions: React.Dispatch<React.SetStateAction<boolean>>,
  uniqueId?: string,
  cssString?: string
): void => {
  sendMessageToIframe('VIEW_MINI_DIMENSIONS', { miniDimensions: !canSeeMiniDimensions, styles: cssString }, uniqueId);
  setCanSeeMiniDimensions(prev => !prev);
};

/**
 * Request iframe to save snap2 configuration and return URL info
 */
export const requestSnap2Save = (uniqueId?: string): void => {
  sendMessageToIframe('REQUEST_SNAP2_SAVE', {}, uniqueId);
};

/**
 * Send SELECT_MODULE message to iframe
 */
export const selectModule = (modelPath: string, modelId: number, uniqueId?: string): void => {
  sendMessageToIframe('SELECT_MODULE', {
    modelPath,
    modelId
  }, uniqueId);
};

/**
 * This will deselect the model and attachment point
 */
export const closeModuleSelectMenu = (uniqueId?: string): void => {
  sendMessageToIframe('CLOSE_MODULE_SELECT_MENU', {}, uniqueId);
};

/**
 * Toggle animation in the 3D viewer
 */
export const toggleAnimation = (uniqueId?: string): void => {
  sendMessageToIframe('TOGGLE_ANIMATION', {}, uniqueId);
};

/**
 * Enter VR mode
 */
export const toggleVR = (uniqueId?: string): void => {
  sendMessageToIframe('ENTER_VR', {}, uniqueId);
};

/**
 * Enter AR mode
 */
export const toggleAR = (uniqueId?: string): void => {
  sendMessageToIframe('ENTER_AR', {}, uniqueId);
};

/**
 * Toggle fullscreen mode for the iframe's container
 */
export const toggleFullscreen = (uniqueId?: string): void => {
  const iframe = getConfiguratorIframe(uniqueId);
  const container = iframe?.parentElement;
  if (container) {
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }
};

/**
 * Get the animation button text based on the current state
 * @param canAnimate - Whether animation is available
 * @param animationState - Current animation state
 * @returns The appropriate button text
 */
export const getAnimationButtonText = (
  canAnimate: boolean,
  animationState: AnimationState
): string => {
  if (!canAnimate) return '';
  if (animationState === 'open' || animationState === 'loop') return 'Close';
  return 'Open';
};

/**
 * Generate the iframe source URL based on productLink and apiKey.
 * Merges query strings: params on `productLink`, then parent page (missing keys only), then uuid / hex / bedAllowNone.
 */
export const getIframeSrc = (
  apiKey: string | null,
  productLink: string | null,
  configurationUuid?: string | null,
  hexBgColor?: string | null,
  bedAllowNone?: string | null,
): string => {
  const useLocal =
    import.meta.env.USE_LOCAL_DEV === 'true' || import.meta.env.USE_LOCAL_DEV === '1';
  const baseUrl = useLocal
    ? 'http://configurator.localhost:3000'
    : 'https://configurator.orbital.vision';

  if (!apiKey) {
    apiKey = '';
  }

  if (!productLink) {
    productLink = '';
  }

  const cleanedLink = productLink.startsWith('/') ? productLink.substring(1) : productLink;

  const qIdx = cleanedLink.indexOf('?');
  const pathPart = qIdx >= 0 ? cleanedLink.slice(0, qIdx) : cleanedLink;
  const merged = new URLSearchParams(qIdx >= 0 ? cleanedLink.slice(qIdx + 1) : '');

  const parentQueryParams = window.location.search;
  new URLSearchParams(parentQueryParams).forEach((v, k) => {
    if (!merged.has(k)) {
      merged.set(k, v);
    }
  });

  if (configurationUuid) {
    merged.set('configuration_uuid', configurationUuid);
  }

  if (hexBgColor) {
    const hexValue = hexBgColor.startsWith('#') ? hexBgColor.substring(1) : hexBgColor;
    merged.set('hexBgColor', hexValue);
  }

  if (bedAllowNone != null && bedAllowNone !== '') {
    merged.set(BED_IFRAME_ALLOW_NONE_QUERY_KEY, bedAllowNone);
  }

  const queryString = merged.toString();
  const linkWithParams = queryString ? `${pathPart}?${queryString}` : pathPart;

  return `${baseUrl}/${apiKey}/${linkWithParams}`;
};

/**
 * Create a handler for selection of a variant
 * @param activeOptionId - The currently active option ID
 * @param currentProductId - The currently selected product ID
 * @param setSelectedSelections - State setter for selected selections
 * @returns A selection handler function
 */
export const createSelectionHandler = (
  activeOptionId: string | null,
  currentProductId: number | undefined,
  setSelectedSelections: React.Dispatch<React.SetStateAction<SelectionItem[]>>
): (selection: Selection) => void => {
  return (selection: Selection) => {
    if (activeOptionId === 'size') {
      if ((currentProductId as any) !== selection.id) {
        setSelectedSelections(prev => {
          const newSelections = prev.filter(sel => sel.optionId !== 'size');
          return [...newSelections, { optionId: 'size', selectionId: selection.id }];
        });
        selectProduct(selection.id as any);
      }
      return;
    } else if (selection.groupId && activeOptionId !== null) {
      setSelectedSelections(prev => {
        const newSelections = prev.filter(sel => sel.optionId !== activeOptionId);
        return [...newSelections, { 
          optionId: activeOptionId, 
          groupId: selection.groupId, 
          selectionId: selection.id 
        }];
      });
      selectOption(activeOptionId, selection.groupId, selection.id);
    }
  };
};

/**
 * Navigation handlers interface
 */
export interface OptionNavigationHandlers {
  handleNextOption: () => void;
  handlePreviousOption: () => void;
}

/**
 * Create option navigation handlers
 * @param allOptions - Array of available configuration options
 * @param activeOptionId - Currently active option ID
 * @param setActiveOptionId - State setter for the active option ID
 * @returns Object with next and previous option handler functions
 */
export const createOptionNavigationHandlers = (
  allOptions: ConfigOption[],
  activeOptionId: string | null,
  setActiveOptionId: React.Dispatch<React.SetStateAction<string | null>>
): OptionNavigationHandlers => {
  const handleNextOption = (): void => {
    const currentIndex = allOptions.findIndex(opt => opt.id === activeOptionId);
    const newIndex = (currentIndex + 1) % allOptions.length;
    setActiveOptionId(allOptions[newIndex].id);
  };

  const handlePreviousOption = (): void => {
    const currentIndex = allOptions.findIndex(opt => opt.id === activeOptionId);
    const newIndex = (currentIndex - 1 + allOptions.length) % allOptions.length;
    setActiveOptionId(allOptions[newIndex].id);
  };

  return { handleNextOption, handlePreviousOption };
};

export const IFRAME_HEIGHT_RATIO = 0.42 // 1/3 of viewport height for iframe, leaving 2/3 for drawer
export const DRAWER_HEIGHT_RATIO = 1 - IFRAME_HEIGHT_RATIO; // ~0.66, complementary to iframe ratio

/**
 * User agent types
 */
export type USER_AGENT = 'ios' | 'android' | 'windows' | 'mac' | 'unknown';

/**
 * Detect the user's device/platform
 * @returns The detected user agent type
 */
export const detectUserAgent = (): USER_AGENT => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  const isMobile = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  if (isMobile) {
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      return 'ios';
    }
    return 'android';
  }
  
  if (/Win/i.test(userAgent)) {
    return 'windows';
  }
  
  if (/Mac/i.test(userAgent)) {
    return 'mac';
  }
  
  return 'unknown';
};
