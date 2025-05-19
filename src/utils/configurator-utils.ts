import { Selection } from '../contexts/ov25-ui-context.js';

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

/**
 * Animation state options
 */
export type AnimationState = 'unavailable' | 'open' | 'close' | 'loop' | 'stop';

/**
 * Get the iframe element by ID
 */
const getConfiguratorIframe = (): HTMLIFrameElement | null => {
  return document.getElementById('ov25-configurator-iframe') as HTMLIFrameElement;
};

/**
 * Sends a message to the iframe
 */
export const sendMessageToIframe = (
  type: string,
  payload: any
) => {
  const iframe = getConfiguratorIframe();
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
 */
export const selectProduct = (productId: number): void => {
  sendMessageToIframe('SELECT_PRODUCT', productId);
};

/**
 * Handle selecting a configuration option
 * @param optionId - The ID of the option to select
 * @param groupId - The ID of the group the option belongs to
 * @param selectionId - The ID of the specific selection
 */
export const selectOption = (optionId: string, groupId: string, selectionId: string): void => {
  sendMessageToIframe('SELECT_SELECTION', {
    optionId,
    groupId,
    selectionId
  });
};

/**
 * Update the quantity of the product
 * @param quantity - The new quantity value
 */
export const updateQuantity = (quantity: number): void => {
  sendMessageToIframe('UPDATE_QUANTITY', { quantity });
};

/**
 * Add the current configured product to the cart
 */
export const addToCart = (): void => {
  sendMessageToIframe('ADD_TO_CART', {});
};

/**
 * Toggle dimensions visibility in the 3D viewer
 * @param canSeeDimensions - Current dimensions visibility state
 * @param setCanSeeDimensions - State setter function for dimensions visibility
 */
export const toggleDimensions = (
  canSeeDimensions: boolean,
  setCanSeeDimensions: React.Dispatch<React.SetStateAction<boolean>>
): void => {
  sendMessageToIframe('VIEW_DIMENSIONS', { dimensions: !canSeeDimensions });
  setCanSeeDimensions(prev => !prev);
};

/**
 * Toggle animation in the 3D viewer
 */
export const toggleAnimation = (): void => {
  sendMessageToIframe('TOGGLE_ANIMATION', {});
};

/**
 * Enter VR mode
 */
export const toggleVR = (): void => {
  sendMessageToIframe('ENTER_VR', {});
};

/**
 * Enter AR mode
 */
export const toggleAR = (): void => {
  sendMessageToIframe('ENTER_AR', {});
};

/**
 * Toggle fullscreen mode for the iframe's container
 */
export const toggleFullscreen = (): void => {
  const iframe = getConfiguratorIframe();
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
 * Generate the iframe source URL based on productLink and apiKey
 */
export const getIframeSrc = (
  apiKey: string | null,
  productLink: string | null
): string => {
  const baseUrl = 'https://configurator.orbital.vision';
  
  if (!apiKey) {
    apiKey = '15-5f9c5d4197f8b45ee615ac2476e8354a160f384f01c72cd7f2638f41e164c21d';
  }
  
  if (!productLink) {
    productLink = '/range/20';
  }
  
  // Remove leading slash if present
  const cleanedLink = productLink.startsWith('/') ? productLink.substring(1) : productLink;
  
  return `${baseUrl}/${apiKey}/${cleanedLink}`;
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
