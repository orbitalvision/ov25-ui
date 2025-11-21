import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { sendMessageToIframe, toggleAR, CompatibleModule, detectUserAgent } from '../utils/configurator-utils.js';
import { stringSimilarity } from 'string-similarity-js';
import { launchARWithGLBBlob } from '../utils/launchARWithGLBBlob.js';

function throttle<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let isThrottled = false;

  return (...args: Parameters<T>) => {
    if (!isThrottled) {
      fn(...args);
      isThrottled = true;
      setTimeout(() => {
        isThrottled = false;
      }, delay);
    }
  };
}

// Define types
export type DrawerSizes = 'closed' | 'small' | 'large';
export type AnimationState = 'unavailable' | 'open' | 'close' | 'loop' | 'stop';

export interface ProductFilters {
  [optionName: string]: {
    [filterKey: string]: Array<{
      value: string;
      checked: boolean;
    }>;
  };
}

export interface Product {
  id: string;
  name: string;
  price: number;
  discount: number;
  lowestPrice: number;
  metadata: any;
}

export interface Selection {
  id: string;
  name: string;
  sku?: string;
  thumbnail?: string;
  miniThumbnails?: {small: string, medium: string, large: string}
  price: number;
  blurHash: string;
  groupId?: string;
  filter?: {
    [key: string]: string[];
  }
  swatch?: Swatch;
  isVisible?: boolean;
}

export interface Group {
  id: string;
  name: string;
  selections: Selection[];
  isVisible?: boolean;
}

export interface Option {
  id: string;
  name: string;
  groups: Group[];
  hasNonOption?: boolean;
  isVisible?: boolean;
}

export interface ConfiguratorState {
  options: Option[];
  selectedSelections: Array<{
    optionId: string;
    groupId: string;
    selectionId: string;
  }>;
  configuratorSettings: {
    swatchSettings: SwatchRulesData;
    availableProductFilters: {
      [key: string]: string[];
    };
  };
  snap2Objects: any[];
}

export interface SizeOption {
  id: 'size';
  name: 'size';
  groups: [{
    id: 'size-group';
    selections: Array<{
      id: string;
      name: string;
      price: number;
      thumbnail?: string;
    }>;
  }];
  hasNonOption?: boolean;
}

export interface Discount {
  percentage: number;
  amount: number;
  formattedAmount: string;
}

export interface Swatch {
  name: string;
  option: string;
  manufacturerId: string;
  description: string;
  sku: string;
  thumbnail: {
    blurHash: string;
    thumbnail: string;
    miniThumbnails: {
      large: string;
      medium: string;
      small: string;
    }
  };
}

export type SwatchRulesData = {
  freeSwatchLimit: number; 
  canExeedFreeLimit: boolean;
  pricePerSwatch: number; 
  minSwatches: number;
  maxSwatches: number;
  enabled: boolean; 
}

// Context type
interface OV25UIContextType {
  // Shadow DOM references
  shadowDOMs?: {
    mobileDrawer?: ShadowRoot;
    configuratorViewControls?: ShadowRoot;
    popoverPortal?: ShadowRoot;
    swatchbookPortal?: ShadowRoot;
  };
  // State
  products: Product[];
  currentProductId?: string;
  configuratorState?: ConfiguratorState;
  selectedSelections: Array<{
    optionId: string;
    groupId?: string;
    selectionId: string;
  }>;
  activeOptionId: string | null;
  quantity: number;
  price: number;
  subtotal: number;
  formattedPrice: string;
  formattedSubtotal: string;
  discount: Discount;
  galleryIndex: number;
  currentSku: any;
  range: any;
  drawerSize: DrawerSizes;
  isVariantsOpen: boolean;
  isDrawerOrDialogOpen: boolean;
  arPreviewLink: string | null;
  error: Error | null;
  canAnimate: boolean;
  animationState: AnimationState;
  iframeRef: React.RefObject<HTMLIFrameElement>;
  isMobile: boolean;
  hasSwitchedAfterDefer: boolean;
  deferThreeD: boolean;
  showOptional: boolean;
  hidePricing: boolean;
  hideAr: boolean;
  // Coming from injectConfigurator options
  productLink: string | null;
  apiKey: string;
  configurationUuid: string | null;
  buyNowFunction: () => void;
  addToBasketFunction: () => void;
  addSwatchesToCart: () => void;
  images?: string[];
  logoURL?: string;
  isProductGalleryStacked: boolean;
  mobileLogoURL?: string;
  uniqueId?: string;

  // Computed values
  currentProduct?: Product;
  sizeOption: SizeOption;
  activeOption?: Option;
  availableProductFilters?: ProductFilters;
  showFilters?: boolean;
  allOptions: (Option | SizeOption)[];
  allOptionsWithoutModules: (Option | SizeOption)[];
  galleryIndexToUse: number;
  filteredActiveOption?: Option | null;
  searchQueries: { [optionId: string]: string };
  selectedSwatches: Swatch[];
  swatchRulesData: SwatchRulesData;
  isSwatchBookOpen: boolean;
  availableCameras: Array<{
    id: string;
    displayName: string;
  }>;
  availableLights: Array<{
    id: string;
    displayName: string;
  }>;
  // Snap2 state
  isSnap2Mode: boolean;
  snap2SaveResponse: { success: boolean; shareUrl?: string; error?: string } | null;
  isModalOpen: boolean;
  controlsHidden: boolean;
  hasConfigureButton: boolean;
  useInlineVariantControls: boolean;
  shareDialogTrigger: 'none' | 'save-button' | 'modal-close';
  skipNextDrawerCloseRef: React.MutableRefObject<boolean>;
  preloading: boolean;
  setPreloading: (preloading: boolean) => void;
  resetIframe: () => void;
  iframeResetKey: number;
  configureHandlerRef: React.MutableRefObject<(() => void) | null>;
  // Module selection state
  compatibleModules: CompatibleModule[] | null;
  isModuleSelectionLoading: boolean;
  selectedModuleType: 'all' | 'middle' | 'corner' | 'end';
  isModulePanelOpen: boolean;
  // Methods
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setCurrentProductId: React.Dispatch<React.SetStateAction<string | undefined>>;
  setConfiguratorState: React.Dispatch<React.SetStateAction<ConfiguratorState | undefined>>;
  setSelectedSelections: React.Dispatch<React.SetStateAction<Array<{
    optionId: string;
    groupId?: string;
    selectionId: string;
  }>>>;
  setActiveOptionId: React.Dispatch<React.SetStateAction<string | null>>;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
  setPrice: React.Dispatch<React.SetStateAction<number>>;
  setSubtotal: React.Dispatch<React.SetStateAction<number>>;
  setDiscount: React.Dispatch<React.SetStateAction<Discount>>;
  setGalleryIndex: React.Dispatch<React.SetStateAction<number>>;
  setCurrentSku: React.Dispatch<React.SetStateAction<any>>;
  setRange: React.Dispatch<React.SetStateAction<any>>;
  setDrawerSize: React.Dispatch<React.SetStateAction<DrawerSizes>>;
  setIsVariantsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsDrawerOrDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setArPreviewLink: React.Dispatch<React.SetStateAction<string | null>>;
  setError: React.Dispatch<React.SetStateAction<Error | null>>;
  setCanAnimate: React.Dispatch<React.SetStateAction<boolean>>;
  setAnimationState: React.Dispatch<React.SetStateAction<AnimationState>>;
  setHasSwitchedAfterDefer: React.Dispatch<React.SetStateAction<boolean>>;
  setAvailableProductFilters: React.Dispatch<React.SetStateAction<ProductFilters>>;
  setSearchQuery: (optionId: string, query: string) => void;
  setSelectedSwatches: React.Dispatch<React.SetStateAction<Swatch[]>>;
  setSwatchRulesData: React.Dispatch<React.SetStateAction<SwatchRulesData>>;
  toggleSwatch: (swatch: Swatch) => void;
  isSwatchSelected: (swatch: Swatch) => boolean;
  setIsSwatchBookOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setAvailableCameras: React.Dispatch<React.SetStateAction<Array<{
    id: string;
    displayName: string;
  }>>>;
  selectCamera: (cameraId: string) => void;
  setAvailableLights: React.Dispatch<React.SetStateAction<Array<{
    id: string;
    displayName: string;
  }>>>;
  selectLightGroup: (subGroupId: string) => void;
  setSnap2SaveResponse: React.Dispatch<React.SetStateAction<{ success: boolean; shareUrl?: string; error?: string } | null>>;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setControlsHidden: React.Dispatch<React.SetStateAction<boolean>>;
  setHasConfigureButton: React.Dispatch<React.SetStateAction<boolean>>;
  setShareDialogTrigger: React.Dispatch<React.SetStateAction<'none' | 'save-button' | 'modal-close'>>;
  toggleHideAll: () => void;
  // Module selection methods
  setCompatibleModules: React.Dispatch<React.SetStateAction<CompatibleModule[] | null>>;
  setIsModuleSelectionLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedModuleType: React.Dispatch<React.SetStateAction<'all' | 'middle' | 'corner' | 'end'>>;
  setIsModulePanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  // Actions
  handleSelectionSelect: (selection: Selection, optionId?: string) => void;
  handleOptionClick: (optionId: string) => void;
  handleNextOption: () => void;
  handlePreviousOption: () => void;
  getSelectedValue: (option: Option | SizeOption) => string;
  toggleAR: () => void;
  cleanupConfigurator: () => void;
  applySearchAndFilters: (option: Option | SizeOption, optionId: string) => Option | SizeOption;
}

// Create the context
const OV25UIContext = createContext<OV25UIContextType | undefined>(undefined);

// Create a function to create unique contexts for multiple configurators
export const createUniqueContext = (uniqueId: string) => {
  return createContext<OV25UIContextType | undefined>(undefined);
};

// Context provider component
export const OV25UIProvider: React.FC<{ 
  children: React.ReactNode, 
  productLink: string | null, 
  apiKey: string, 
  configurationUuid: string,
  buyNowFunction: () => void,
  addToBasketFunction: () => void,
  addSwatchesToCartFunction: (swatches: Swatch[], swatchRulesData: SwatchRulesData) => void,
  images?: string[],
  deferThreeD?: boolean,
  showOptional?: boolean,
  hidePricing?: boolean,
  hideAr?: boolean,
  logoURL?: string,
  isProductGalleryStacked: boolean,
  hasConfigureButton: boolean,
  mobileLogoURL?: string,
  uniqueId?: string,
  useInlineVariantControls?: boolean,
  shadowDOMs?: {
    mobileDrawer?: ShadowRoot;
    configuratorViewControls?: ShadowRoot;
    popoverPortal?: ShadowRoot;
    swatchbookPortal?: ShadowRoot;
  }
}> = ({ 
  children,
  productLink,
  apiKey,
  configurationUuid,
  buyNowFunction,
  addToBasketFunction,
  addSwatchesToCartFunction,
  images,
  deferThreeD = false,
  showOptional = false,
  hidePricing = false,
  hideAr = false,
  logoURL,
  isProductGalleryStacked,
  hasConfigureButton,
  mobileLogoURL,
  uniqueId,
  useInlineVariantControls = false,
  shadowDOMs
}) => {
  // State definitions
  const [products, setProducts] = useState<Product[]>([]);
  const [currentProductId, setCurrentProductId] = useState<string>();
  const [configuratorState, setConfiguratorState] = useState<ConfiguratorState>();
  const [selectedSelections, setSelectedSelections] = useState<Array<{
    optionId: string;
    groupId?: string;
    selectionId: string;
  }>>([]);
  const [activeOptionId, setActiveOptionId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState<Discount>({
    percentage: 0,
    amount: 0,
    formattedAmount: '£0.00'
  });
  const [formattedPrice, setFormattedPrice] = useState<string>('£0.00')
  const [formattedSubtotal, setFormattedSubtotal] = useState<string>('£0.00')
  const [currentSku, setCurrentSku] = useState<any>(null);
  const [range, setRange] = useState<any>(null);
  const [drawerSize, setDrawerSize] = useState<DrawerSizes>("closed");
  const [isVariantsOpen, setIsVariantsOpen] = useState(false);
  const [isDrawerOrDialogOpen, setIsDrawerOrDialogOpen] = useState(false);
  const [arPreviewLink, setArPreviewLink] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [canAnimate, setCanAnimate] = useState<boolean>(false);
  const [animationState, setAnimationState] = useState<AnimationState>('unavailable');
  const iframeRef = useRef<HTMLIFrameElement>(null!);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [hasSwitchedAfterDefer, setHasSwitchedAfterDefer] = useState(false)
  const [pendingProductId, setPendingProductId] = useState<string | null>(null);
  const [availableProductFilters, setAvailableProductFilters] = useState<ProductFilters>({});
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [searchQueries, setSearchQueries] = useState<{ [optionId: string]: string }>({});
  const [availableCameras, setAvailableCameras] = useState<Array<{
    id: string;
    displayName: string;
  }>>([]);
  const [availableLights, setAvailableLights] = useState<Array<{
    id: string;
    displayName: string;
  }>>([]);
  const hasDefered = useRef(false);
  const isSelectingProduct = useRef(false);
  const hasComputedFilters = useRef(false);

  const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [storedValue, setStoredValue] = useState<T>(() => {
      try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error);
        return initialValue;
      }
    });

    const setValue = useCallback((value: T | ((val: T) => T)) => {
      setStoredValue(prevValue => {
        try {
          const valueToStore = value instanceof Function ? value(prevValue) : value;
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          return valueToStore;
        } catch (error) {
          console.error(`Error setting localStorage key "${key}":`, error);
          return prevValue;
        }
      });
    }, [key]);

    return [storedValue, setValue];
  };

  const [selectedSwatches, setSelectedSwatches] = useLocalStorage<Swatch[]>('ov25-selected-swatches', []);
  const [isSwatchBookOpen, setIsSwatchBookOpen] = useState<boolean>(false);
  const [swatchRulesData, setSwatchRulesData] = useState<SwatchRulesData>({
    freeSwatchLimit: 0,
    canExeedFreeLimit: false,
    pricePerSwatch: 0,
    minSwatches: 0,
    maxSwatches: 0,
    enabled: false,
  });
  const [snap2SaveResponse, setSnap2SaveResponse] = useState<{ success: boolean; shareUrl?: string; error?: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [controlsHidden, setControlsHidden] = useState(false);
  const [hasConfigureButtonState, setHasConfigureButton] = useState(hasConfigureButton);
  const [shareDialogTrigger, setShareDialogTrigger] = useState<'none' | 'save-button' | 'modal-close'>('none');
  const skipNextDrawerCloseRef = useRef(false);
  const [preloading, setPreloading] = useState(window.innerWidth < 768);
  const [iframeResetKey, setIframeResetKey] = useState(0);
  
  // Module selection state
  const [compatibleModules, setCompatibleModules] = useState<CompatibleModule[] | null>(null);
  const [isModuleSelectionLoading, setIsModuleSelectionLoading] = useState<boolean>(false);
  const [selectedModuleType, setSelectedModuleType] = useState<'all' | 'middle' | 'corner' | 'end'>('all');
  const [isModulePanelOpen, setIsModulePanelOpen] = useState<boolean>(false);

  // Configure handler ref for external access
  const configureHandlerRef = useRef<(() => void) | null>(null);

  // Cleanup function for switching between configurators
  const cleanupConfigurator = useCallback(() => {
    // Close any open modal/drawer
    setIsModalOpen(false);
    setIsVariantsOpen(false);
    
    // Reset snap2-specific state
    setConfiguratorState(undefined);
    setCompatibleModules(null);
    setSnap2SaveResponse(null);
    setShareDialogTrigger('none');
    setControlsHidden(false);
    setIsModulePanelOpen(false);
    setIsModuleSelectionLoading(false);
    
    // Reset iframe
    setIframeResetKey(prev => prev + 1);
    
    // Reset other relevant state
    setActiveOptionId(null);
    setSelectedSelections([]);
    setError(null);
    setArPreviewLink(null);
    setPreloading(false);
    setHasSwitchedAfterDefer(false);
  }, [
    setIsModalOpen,
    setIsVariantsOpen,
    setConfiguratorState,
    setCompatibleModules,
    setSnap2SaveResponse,
    setShareDialogTrigger,
    setControlsHidden,
    setIsModulePanelOpen,
    setIsModuleSelectionLoading,
    setIframeResetKey,
    setActiveOptionId,
    setSelectedSelections,
    setError,
    setArPreviewLink,
    setPreloading,
    setHasSwitchedAfterDefer
  ]);

  // When variants open, auto-close bottom modules panel
  useEffect(() => {
    if (isVariantsOpen) {
      setIsModulePanelOpen(false);
    }
  }, [isVariantsOpen]);

  useEffect(() => {
    // auto-close variants when module panel opens on desktop
    if (isModulePanelOpen && !isMobile) {
      setIsVariantsOpen(false);
    }
  }, [isModulePanelOpen, isMobile]);

  // Effect: Initialize selectedSelections from configuratorState
  useEffect(() => {
    if (configuratorState?.selectedSelections) {
      setSelectedSelections(configuratorState.selectedSelections);
    }
    if (configuratorState?.configuratorSettings?.swatchSettings) {
      setSwatchRulesData(configuratorState.configuratorSettings.swatchSettings);
    }
    if (configuratorState?.snap2Objects && configuratorState.snap2Objects.length > 0) {
      const firstNonModulesOption = allOptions.find(opt => opt.id !== 'modules');
      if (firstNonModulesOption) {
        setActiveOptionId(firstNonModulesOption.id);
      }
    }
  }, [configuratorState]);

  // Effect: Clear pending product ID when current product ID updates
  useEffect(() => {
    if (currentProductId && pendingProductId === currentProductId) {
      setPendingProductId(null);
      isSelectingProduct.current = false;
    }
  }, [currentProductId, pendingProductId]);

  // Effect for detecting mobile devices
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check initially
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const setSearchQuery = useCallback((optionId: string, query: string) => {
    setSearchQueries(prev => ({
      ...prev,
      [optionId]: query
    }));
  }, []);

  const toggleSwatch = useCallback((swatch: Swatch) => {
    setSelectedSwatches(prev => {
      const index = prev.findIndex(s => s.manufacturerId === swatch.manufacturerId && s.name === swatch.name && s.option === swatch.option);
      if (index === -1) {
        return [...prev, swatch];
      }
      return prev.filter(s => s.manufacturerId !== swatch.manufacturerId || s.name !== swatch.name || s.option !== swatch.option);
    });
  }, []);

  const isSwatchSelected = useCallback((swatch: Swatch) => {
    return selectedSwatches.some(s => s.manufacturerId === swatch.manufacturerId && s.name === swatch.name && s.option === swatch.option);
  }, [selectedSwatches]);

  const addSwatchesToCart = () => {
    addSwatchesToCartFunction(selectedSwatches, swatchRulesData);
    setSelectedSwatches([]);
  };

  const selectCamera = (cameraId: string) => {
    sendMessageToIframe('SELECT_CAMERA', cameraId, uniqueId);
  }

  const selectLightGroup = (subGroupId: string) => {
    sendMessageToIframe('SELECT_LIGHT', subGroupId, uniqueId);
  }

  const handleToggleAR = () => {
    toggleAR(uniqueId);
  }

  // Computed values
  const currentProduct = products?.find(p => p.id === currentProductId);
  
  // Check if we're in snap2 mode based on productLink
  const isSnap2Mode = useMemo(() => {
    return productLink?.startsWith('snap2/') || false;
  }, [productLink]);

  // Create a virtual size option from products
  const sizeOption: SizeOption = {
    id: 'size',
    name: 'size',
    groups: [{
      id: 'size-group',
      selections: products?.map(p => ({
        id: p?.id,
        name: p?.name,
        price: p?.price,
        discount: p?.discount,
        thumbnail: p?.metadata?.images?.length > 0 ? p?.metadata?.images[p?.metadata?.images?.length - 1] : null
      })) || []
    }]
  };

  // Helper function to apply search and filter logic to any option
  const applySearchAndFilters = useCallback((option: Option | SizeOption, optionId: string) => {
    if (!option) return option;

    // For size options, just return as-is since they don't have complex filtering
    if (option.id === 'size' || optionId === 'size') {
      return option;
    }

    const searchFilter = (text: string) => {
      const currentSearchQuery = searchQueries[optionId];
      if (!currentSearchQuery) return true;
      const similarity = stringSimilarity(text.toLowerCase(), currentSearchQuery.toLowerCase());
      const containsQuery = text.toLowerCase().includes(currentSearchQuery.toLowerCase());
      return similarity > 0.4 || containsQuery; // Lower the threshold for better matches
    };

    // Checks a selection against the filters and returns true if it matches any of the filters.
    const checkSelectionFilters = (selection: any) => {
      const optionFilters = availableProductFilters?.[option.name];
      if (!optionFilters) return true;
      
      let hasAnyCheckedFilters = false;
      let matchesAnyCheckedFilter = false;

      for (const filterName in optionFilters) {
        if (filterName === 'Collections') {
          continue;
        }
        const filterValues = optionFilters[filterName];
        const checkedFilterValues = filterValues
          .filter(filterValue => filterValue.checked)
          .map(filterValue => filterValue.value);
        if (checkedFilterValues.length > 0) {
          hasAnyCheckedFilters = true;
          const selectionFilterValues = selection.filter?.[filterName];
          
          if (selectionFilterValues?.some((value: string) => checkedFilterValues.includes(value))) {
            matchesAnyCheckedFilter = true;
            break;
          }
        }
      }

      return !hasAnyCheckedFilters || matchesAnyCheckedFilter;
    };

    // Checks a selection against the search query and returns true if it matches the search query.
    const checkSelectionSearch = (selection: any) => {
      const currentSearchQuery = searchQueries[optionId];
      if (!currentSearchQuery) return true;
      
      // Check selection name
      if (searchFilter(selection.name)) {
        return true;
      }
      
      // Check all filter values
      for (const filterName in selection.filter) {
        const filterValues = selection.filter[filterName];
        if (filterValues?.some((value: string) => {
          const matches = searchFilter(value);
          return matches;
        })) {
          return true;
        }
      }
      return false;
    };

    return {
      ...option,
      groups: (option.groups as Group[])
        .filter((group) => group.isVisible !== false)
        .filter((group) => {
        const currentSearchQuery = searchQueries[optionId];
        // First check if group name matches search
        if (currentSearchQuery && searchFilter(group.name)) {
          return true;
        }

        // If group name doesn't match, check if any selections in this group match
        if (currentSearchQuery) {
          const hasMatchingSelections = group.selections.some(selection => checkSelectionSearch(selection));
          if (hasMatchingSelections) {
            return true;
          }
        }

        // If no search query, check category filters
        if (availableProductFilters?.[option.name]?.['Collections']?.some(filter => filter.checked)) {
          return availableProductFilters?.[option.name]['Collections']
            .filter(filter => filter.checked)
            .map(filter => filter.value)
            .includes(group.name);
        }

        return !currentSearchQuery; // Only return true if there's no search query
      }).map(group => ({
        ...group,
          selections: (searchQueries[optionId] && !searchFilter(group.name) 
          ? group.selections.filter(selection => {
              const matchesSearch = checkSelectionSearch(selection);
              const matchesFilters = checkSelectionFilters(selection);
              
              return matchesSearch && matchesFilters;
            })
          : group.selections.filter(selection => checkSelectionFilters(selection))
          ).filter(selection => selection.isVisible !== false)
      }))
    } as Option;
  }, [availableProductFilters, searchQueries]);

  // Active option based on activeOptionId
  const baseActiveOption = configuratorState?.options?.find(opt => opt.id === activeOptionId);
  const activeOption = useMemo(() => {
    if (!baseActiveOption) return undefined;
    // Only apply search and filters for regular options, not size options
    if (activeOptionId === 'size') {
      return baseActiveOption;
    }
    return applySearchAndFilters(baseActiveOption, activeOptionId || '') as Option;
  }, [baseActiveOption, activeOptionId, applySearchAndFilters]);

  // Compute filters once when we have the necessary data
  if (!hasComputedFilters.current && configuratorState && configuratorState.options && configuratorState.options.length > 0) {
    const availableFilters = configuratorState.configuratorSettings?.availableProductFilters || {};
    const allFilterSets: ProductFilters = {};

    // Process each option, adding filters for each selection and group.
    configuratorState.options.forEach(option => {
      if (option.name && availableFilters[option.name]) {
        // Initialize filter sets for this option
        const filterSets: { [key: string]: Set<string> } = {};
        availableFilters[option.name].forEach((filter: string) => {
          filterSets[filter] = new Set<string>();
        });

        // Loop through all filters for this option, adding filter values to the set
        option.groups.forEach(group => {
          group.selections.forEach(selection => {
            Object.keys(selection.filter || {}).forEach((key: string) => {
              const filterValues = selection.filter?.[key as keyof typeof selection.filter] as string[] | undefined;
              if (Array.isArray(filterValues) && filterSets[key]) {
                filterValues.forEach(filterValue => filterSets[key].add(filterValue));
              }
            });
          });
        });

        // Convert sets to arrays for this option
        allFilterSets[option.name] = {};
        Object.keys(filterSets).forEach(key => {
          if (!allFilterSets[option.name]) {
            allFilterSets[option.name] = {};
          }
          allFilterSets[option.name][key] = Array.from(filterSets[key]).map(value => ({ 
            value, 
            checked: false 
          }));
        });
      }
      // Add groups as the first filter for this option. If the only group is 'Default Groups' its not really a group so we should not show the filter.
      if (option.groups && option.groups.length > 0 && (option.groups.length > 1 || option.groups[0].name !== 'Default Group')) {
        if (!allFilterSets[option.name]) {
          allFilterSets[option.name] = {};
        }
        allFilterSets[option.name]['Collections'] = option.groups.map(group => ({
          value: group.name,
          checked: false
        }));
      }
    });
    setAvailableProductFilters(allFilterSets);
    setShowFilters(Object.keys(allFilterSets).length > 0 && Object.keys(allFilterSets).some(key => Object.keys(allFilterSets[key]).some(key2 => Object.keys(allFilterSets[key][key2]).length > 0)));
    hasComputedFilters.current = true;
  }

  // Combine size option with configurator options, only including size option if multiple products exist and not in snap2 mode
  const allOptions = [
    // Add modules option first in snap2 mode
    ...(isSnap2Mode ? [{
      id: 'modules',
      name: 'Modules',
      groups: [{
        id: 'modules-group',
        name: 'Compatible Modules',
        selections: []
      }]
    }] : []),
    // Only show other options if we have snap2Objects or we're not in snap2 mode
    ...(isSnap2Mode && (!configuratorState?.snap2Objects || configuratorState.snap2Objects.length === 0) ? [] : [
      ...(products?.length > 1 && !isSnap2Mode ? [sizeOption] : []),
      ...(configuratorState?.options || [])
        .filter(option => option.isVisible !== false)
        .map(option => ({
          ...option,
          groups: option.groups
            .filter(group => group.isVisible !== false)
            .map(group => ({
              ...group,
              selections: group.selections.filter(selection => selection.isVisible !== false)
            }))
        }))
    ])
  ];

  const allOptionsWithoutModules = allOptions.filter(option => option.id !== 'modules');

  allOptions.forEach(option => {
    option.hasNonOption = option.groups.some(group => {
      return group.selections.some(selection => {
        return selection.name.toLowerCase() === 'none';
      });
    });
  });

  // Helper function to get the selected value for an option
  const getSelectedValue = (option: Option | SizeOption) => {
    if (option.id === 'size') {
      return currentProduct?.name || '';
    }

    const selectedSelection = selectedSelections.find(
      sel => sel.optionId === option.id
    );
    if (!selectedSelection) return '';

    const group = option.groups.find(g => g.id === selectedSelection.groupId);
    const selection = group?.selections.find(s => s.id === selectedSelection.selectionId);
    return selection?.name || '';
  };

  // Action handlers
  const handleOptionClick = (optionId: string) => {
    setActiveOptionId(optionId);
    setIsVariantsOpen(true);
  };

  const toggleHideAll = useCallback(() => {
    const newHiddenState = !controlsHidden;
    setControlsHidden(newHiddenState);
    sendMessageToIframe('TOGGLE_HIDE_ALL', { hideAll: newHiddenState }, uniqueId);
  }, [controlsHidden, setControlsHidden]);

  /**
   * Handles variant selection with optional optionId parameter.
   * @param selection - The selected variant
   * @param optionId - Optional option ID to use instead of activeOptionId (useful for inline variant controls)
   */
  const handleSelectionSelect = throttle((selection: Selection, optionId?: string) => {
    // Use provided optionId if available, otherwise fall back to activeOptionId
    const currentOptionId = optionId || activeOptionId;
    if (currentOptionId === 'size') {
      if (currentProductId !== selection.id) {
        // Block if already selecting a product
        if (isSelectingProduct.current) {
          return;
        }
        
        isSelectingProduct.current = true;
        setPendingProductId(selection.id);
        setSelectedSelections(prev => {
          const newSelections = prev.filter(sel => sel.optionId !== 'size');
          return [...newSelections, { optionId: 'size', selectionId: selection.id }];
        });
        sendMessageToIframe('SELECT_PRODUCT', selection.id, uniqueId);
        setCurrentProductId(selection.id);
      }
      return;
    } else {
      setSelectedSelections(prev => {
        const newSelections = prev.filter(sel => sel.optionId !== currentOptionId);
        return [...newSelections, { 
          optionId: currentOptionId || '', 
          groupId: selection.groupId, 
          selectionId: selection.id 
        }];
      });
      sendMessageToIframe('SELECT_SELECTION', {
        optionId: currentOptionId, 
        groupId: selection.groupId, 
        selectionId: selection.id
      }, uniqueId);
    }
    if(!hasSwitchedAfterDefer && galleryIndex === 1 && deferThreeD) {
      setHasSwitchedAfterDefer(true);
      setGalleryIndex(galleryIndexToUse);
    }
  }, 500)

  // Navigation functions
  const handleNextOption = () => {
    const findIndex = allOptions.findIndex(opt => opt.id === activeOptionId);
    const newIndex = (findIndex + 1) % allOptions?.length;
    setActiveOptionId(allOptions[newIndex].id);
  };

  const handlePreviousOption = () => {
    const currentIndex = allOptions.findIndex(opt => opt.id === activeOptionId);
    const newIndex = (currentIndex - 1 + allOptions?.length) % allOptions?.length;
    setActiveOptionId(allOptions[newIndex].id);
  };

  // Configure button handler for Snap2 mode
  const handleConfigureClick = useCallback(() => {
    if (window.innerWidth < 1024) {
      setPreloading(false);
      // On mobile/tablet, open variants drawer.
      // Prefer first non-modules option; otherwise fall back to 'modules' so user can pick in the drawer.
      const firstNonModulesOption = allOptions.find(opt => opt.id !== 'modules');
      if (firstNonModulesOption) {
        setActiveOptionId(firstNonModulesOption.id);
      } else {
        setActiveOptionId('modules');
      }
      setIsVariantsOpen(true);
    } else {
      setIsModalOpen(true);
      setIsModulePanelOpen(true);
    }
  }, [allOptions, setPreloading, setActiveOptionId, setIsVariantsOpen, setIsModalOpen, compatibleModules, setIsModulePanelOpen]);

  // Expose configure handler ref
  useEffect(() => {
    configureHandlerRef.current = handleConfigureClick;
    // Also sync to window object for external access
    if ((window as any).ov25ConfigureHandlerRef) {
      (window as any).ov25ConfigureHandlerRef.current = handleConfigureClick;
    }
  }, [handleConfigureClick]);

  // Expose cleanup function via window object
  useEffect(() => {
    (window as any).ov25CleanupConfigurator = cleanupConfigurator;
  }, [cleanupConfigurator]);

  // Handler for AR GLB data
  const handleARGLBData = useCallback(async (base64Data: string) => {
    try {
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { type: 'model/gltf-binary' });
      await launchARWithGLBBlob(blob, undefined, 'ar-model-viewer-overlay');
    } catch (error) {
      console.error('Error handling AR GLB data:', error);
    }
  }, []);

  // Message handler for iframe communication
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const { type, payload } = event.data;
        
        // Skip if no payload or type
        if (!type) {
          return;
        }
        
        // For standard configurators with uniqueId, filter messages by iframe source
        if (uniqueId) {
          const iframeId = `ov25-configurator-iframe-${uniqueId}`;
          const iframe = document.getElementById(iframeId) as HTMLIFrameElement;
          if (!iframe || event.source !== iframe.contentWindow) {
            return;
          }
        }
        
        // AR_GLB_DATA sends raw base64 string, don't parse it
        const data = (type === 'AR_GLB_DATA' || !payload) ? {} : JSON.parse(payload);
        switch (type) {
          case 'ALL_PRODUCTS':
            setProducts(data);
            break;
          case 'CURRENT_PRODUCT_ID':
            setCurrentProductId(data);
            break;
          case 'ANIMATION_STATE':
            setCanAnimate(data !== 'unavailable');
            setAnimationState(data);
            break;
          case 'CONFIGURATOR_STATE':
            if (isSnap2Mode) {
              setIsModuleSelectionLoading(false);
            }
            // Preserve existing visibility state when CONFIGURATOR_STATE is received
            setConfiguratorState(prev => {
              // Create a map of existing visibility states for quick lookup
              const existingVisibility = new Map<string, { option?: boolean; groups: Map<string, { group?: boolean; selections: Map<string, boolean> }> }>();
              
              if (prev) {
                prev.options.forEach(option => {
                  const groupMap = new Map<string, { group?: boolean; selections: Map<string, boolean> }>();
                  option.groups.forEach(group => {
                    const selectionMap = new Map<string, boolean>();
                    group.selections.forEach(selection => {
                      if (selection.isVisible !== undefined) {
                        selectionMap.set(selection.id, selection.isVisible);
                      }
                    });
                    groupMap.set(group.id, {
                      group: group.isVisible,
                      selections: selectionMap
                    });
                  });
                  existingVisibility.set(option.id, {
                    option: option.isVisible,
                    groups: groupMap
                  });
                });
              }
              
              // Merge incoming data with existing visibility state
              const initializedData = {
                ...data,
                options: (data.options || []).map((option: Option) => {
                  const existing = existingVisibility.get(option.id);
                  return {
                    ...option,
                    isVisible: option.isVisible !== undefined 
                      ? option.isVisible 
                      : (existing?.option !== undefined ? existing.option : true),
                    groups: (option.groups || []).map((group: Group) => {
                      const existingGroup = existing?.groups.get(group.id);
                      return {
                        ...group,
                        isVisible: group.isVisible !== undefined
                          ? group.isVisible
                          : (existingGroup?.group !== undefined ? existingGroup.group : true),
                        selections: (group.selections || []).map((selection: Selection) => ({
                          ...selection,
                          isVisible: selection.isVisible !== undefined
                            ? selection.isVisible
                            : (existingGroup?.selections.get(selection.id) !== undefined 
                                ? existingGroup.selections.get(selection.id) 
                                : true)
                        }))
                      };
                    }).filter(group => group.selections.length > 0)
                  };
                })
              };
              return initializedData;
            });
            break;
          case 'CURRENT_PRICE':
            setPrice(data.totalPrice);
            setSubtotal(data.subtotal)
            setFormattedSubtotal(data.formattedSubtotal)
            setFormattedPrice(data.formattedPrice)
            setDiscount(data.discount)
            break;
          case 'CURRENT_SKU':
            setCurrentSku(data);
            break;
          case 'RANGE':
            setRange(data);
            break;
          case 'AR_PREVIEW_LINK':
            const userAgent = detectUserAgent();
            if (userAgent !== 'windows' && userAgent !== 'mac') {
              window.location.href = data;
            } else {
              setArPreviewLink(data);
            }
            break;
          case 'AVAILABLE_CAMERAS':
            setAvailableCameras(data);
            break;
          case 'AVAILABLE_LIGHTS':
            setAvailableLights(data);
            break;
          case 'AR_GLB_DATA':
            handleARGLBData(payload);
            break;
          case 'CURRENT_QUERY_STRING':
            const currentUrl = new URL(window.location.href);
            currentUrl.search = data;
            window.history.replaceState(window.history.state, '', currentUrl.toString());
            break;
          case 'ERROR':
            setError(new Error(data));
            break;
          case 'SNAP2_SAVE_RESPONSE':
            if (data.success) {
              const currentUrl = window.location.origin + window.location.pathname;
              const urlParams = new URLSearchParams();
              urlParams.set('configuration_uuid', data.uuid);
              urlParams.set('product_link', productLink || '');
              const shareableUrl = `${currentUrl}?${urlParams.toString()}`;
              setSnap2SaveResponse({ success: true, shareUrl: shareableUrl });
            } else {
              setSnap2SaveResponse({ success: false, error: data.error || 'Failed to save configuration' });
            }
            break;
          case 'COMPATIBLE_MODULES':
            setCompatibleModules(data.modules || []);
            if (data.modules.length > 0) {
              setIsModuleSelectionLoading(false);
              if (window.innerWidth < 1024) {
                // Mobile/tablet behavior - open drawer
                setActiveOptionId('modules');
                if (!hasConfigureButton && !data.isInitialLoad) {
                  setIsVariantsOpen(true);
                }
              } else {
                // Desktop behavior - open module panel
                setIsModulePanelOpen(true);
              }
            }
            break;
          case 'SELECT_MODULE_RECEIVED':
            // Loading state is now managed by InitialiseMenu component (when configuratorState.snap2Objects.length > 0). this is too early to set it to false, since 3D scene is not yet loaded.
            break;
          case 'SHOW_OPTION':
          case 'HIDE_OPTION':
            setConfiguratorState(prev => {
              if (!prev) return prev;
              const isVisible = type === 'SHOW_OPTION';
              const optionExists = prev.options.some(opt => opt.id === data.optionId);
              if (!optionExists) {
                console.warn(`Visibility message received for unknown option ID: ${data.optionId}`);
                return prev;
              }
              return {
                ...prev,
                options: prev.options.map(option => 
                  option.id === data.optionId 
                    ? { ...option, isVisible }
                    : option
                )
              };
            });
            break;
          case 'SHOW_GROUP':
          case 'HIDE_GROUP':
            setConfiguratorState(prev => {
              if (!prev) return prev;
              const isVisible = type === 'SHOW_GROUP';
              const option = prev.options.find(opt => opt.id === data.optionId);
              if (!option) {
                console.warn(`Visibility message received for unknown option ID: ${data.optionId}`);
                return prev;
              }
              const groupExists = option.groups.some(grp => grp.id === data.groupId);
              if (!groupExists) {
                console.warn(`Visibility message received for unknown group ID: ${data.groupId} in option: ${data.optionId}`);
                return prev;
              }
              return {
                ...prev,
                options: prev.options.map(option => 
                  option.id === data.optionId
                    ? {
                        ...option,
                        groups: option.groups.map(group =>
                          group.id === data.groupId
                            ? { ...group, isVisible }
                            : group
                        )
                      }
                    : option
                )
              };
            });
            break;
          case 'SHOW_SELECTION':
          case 'HIDE_SELECTION':
            setConfiguratorState(prev => {
              if (!prev) return prev;
              const isVisible = type === 'SHOW_SELECTION';
              const option = prev.options.find(opt => opt.id === data.optionId);
              if (!option) {
                console.warn(`Visibility message received for unknown option ID: ${data.optionId}`);
                return prev;
              }
              const group = option.groups.find(grp => grp.id === data.groupId);
              if (!group) {
                console.warn(`Visibility message received for unknown group ID: ${data.groupId} in option: ${data.optionId}`);
                return prev;
              }
              const selectionExists = group.selections.some(sel => sel.id === data.selectionId);
              if (!selectionExists) {
                console.warn(`Visibility message received for unknown selection ID: ${data.selectionId} in group: ${data.groupId}, option: ${data.optionId}`);
                return prev;
              }
              return {
                ...prev,
                options: prev.options.map(option => 
                  option.id === data.optionId
                    ? {
                        ...option,
                        groups: option.groups.map(group =>
                          group.id === data.groupId
                            ? {
                                ...group,
                                selections: group.selections.map(selection =>
                                  selection.id === data.selectionId
                                    ? { ...selection, isVisible }
                                    : selection
                                )
                              }
                            : group
                        )
                      }
                    : option
                )
              };
            });
            break;
        }
      } catch (error) {
        console.error('Error handling message:', error, 'Event data:', event.data);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleARGLBData]);

  const productImages = currentProduct?.metadata?.images?.slice(0, -1) || [];

  const allImages = [...(images || []), ...productImages]
  
  const [galleryIndex, setGalleryIndex] = useState(0);

  const [galleryIndexToUse, setGalleryIndexToUse] = useState(galleryIndex);
  useEffect(() => {
      if(deferThreeD && allImages.length > 0 && !hasDefered.current) {
        setGalleryIndexToUse(1);
        hasDefered.current = true;
      }
    }, [allImages]);



  const contextValue: OV25UIContextType = {
    // Shadow DOM references
    shadowDOMs,
    // State
    products,
    currentProductId,
    configuratorState,
    selectedSelections,
    activeOptionId,
    quantity,
    price,
    subtotal,
    formattedPrice,
    discount,
    formattedSubtotal,
    galleryIndex,
    currentSku,
    range,
    drawerSize,
    isVariantsOpen,
    isDrawerOrDialogOpen,
    arPreviewLink,
    error,
    canAnimate,
    animationState,
    iframeRef,
    isMobile,
    isProductGalleryStacked,
    hasSwitchedAfterDefer,
    deferThreeD,
    showOptional,
    hidePricing,
    hideAr,
    galleryIndexToUse,
    // Coming from injectConfigurator options
    productLink,
    apiKey,
    configurationUuid,
    buyNowFunction,
    addToBasketFunction,
    addSwatchesToCart,
    images,
    logoURL,
    mobileLogoURL,
    uniqueId,
    // Computed values
    currentProduct,
    sizeOption,
    activeOption: activeOption,
    availableProductFilters,
    showFilters,
    allOptions,
    allOptionsWithoutModules,
    searchQueries,
    selectedSwatches,
    swatchRulesData,
    isSwatchBookOpen,
    availableCameras,
    availableLights,
    isSnap2Mode,
    snap2SaveResponse,
    isModalOpen,
    controlsHidden,
    hasConfigureButton: hasConfigureButtonState,
    useInlineVariantControls,
    shareDialogTrigger,
    skipNextDrawerCloseRef,
    preloading,
    setPreloading,
    resetIframe: () => setIframeResetKey(prev => prev + 1),
    iframeResetKey,
    configureHandlerRef,
    // Module selection state
    compatibleModules,
    isModuleSelectionLoading,
    selectedModuleType,
    isModulePanelOpen,
    // Methods
    setProducts,
    setCurrentProductId,
    setConfiguratorState,
    setSelectedSelections,
    setActiveOptionId,
    setQuantity,
    setPrice,
    setSubtotal,
    setDiscount,
    setGalleryIndex,
    setCurrentSku,
    setRange,
    setDrawerSize,
    setIsVariantsOpen,
    setIsDrawerOrDialogOpen,
    setArPreviewLink,
    setError,
    setCanAnimate,
    setAnimationState,
    setHasSwitchedAfterDefer,
    setAvailableProductFilters,
    setSearchQuery,
    setSelectedSwatches,
    toggleSwatch,
    isSwatchSelected,
    setSwatchRulesData,
    setIsSwatchBookOpen,
    setAvailableCameras,
    selectCamera,
    setAvailableLights,
    selectLightGroup,
    setSnap2SaveResponse,
    setIsModalOpen,
    setControlsHidden,
    setHasConfigureButton,
    setShareDialogTrigger,
    toggleHideAll,
    // Module selection methods
    setCompatibleModules,
    setIsModuleSelectionLoading,
    setSelectedModuleType,
    setIsModulePanelOpen,
    // Actions
    handleSelectionSelect,
    handleOptionClick,
    handleNextOption,
    handlePreviousOption,
    getSelectedValue,
    toggleAR: handleToggleAR,
    cleanupConfigurator,
    applySearchAndFilters,
  };

  return (
    <OV25UIContext.Provider value={contextValue}>
      {children}
    </OV25UIContext.Provider>
  );
};

// Custom hook to use the context
export const useOV25UI = () => {
  const context = useContext(OV25UIContext);
  if (context === undefined) {
    throw new Error('useOV25UI must be used within an OV25UIProvider');
  }
  return context;
}; 