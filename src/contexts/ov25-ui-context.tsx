import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { sendMessageToIframe, toggleAR } from '../utils/configurator-utils.js';
import { stringSimilarity } from 'string-similarity-js';

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
  thumbnail?: string;
  miniThumbnails?: {small: string, medium: string, large: string}
  price: number;
  blurHash: string;
  groupId?: string;
  filter?: {
    [key: string]: string[];
  }
  swatch?: Swatch;
}

export interface Group {
  id: string;
  name: string;
  selections: Selection[];
}

export interface Option {
  id: string;
  name: string;
  groups: Group[];
  hasNonOption?: boolean;
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
}

export interface SizeOption {
  id: 'size';
  name: 'size';
  groups: [{
    id: 'size-group';
    name: 'Size Options';
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
  // Coming from injectConfigurator options
  productLink: string | null;
  apiKey: string;
  buyNowFunction: () => void;
  addToBasketFunction: () => void;
  addSwatchesToCartFunction: () => void;
  images?: string[];
  logoURL?: string;
  isProductGalleryStacked: boolean;
  mobileLogoURL?: string;

  // Computed values
  currentProduct?: Product;
  sizeOption: SizeOption;
  activeOption?: Option;
  availableProductFilters?: ProductFilters;
  showFilters?: boolean;
  allOptions: (Option | SizeOption)[];
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
  // Actions
  handleSelectionSelect: (selection: Selection) => void;
  handleOptionClick: (optionId: string) => void;
  handleNextOption: () => void;
  handlePreviousOption: () => void;
  getSelectedValue: (option: Option | SizeOption) => string;
  toggleAR: () => void;
}

// Create the context
const OV25UIContext = createContext<OV25UIContextType | undefined>(undefined);

// Context provider component
export const OV25UIProvider: React.FC<{ 
  children: React.ReactNode, 
  productLink: string | null, 
  apiKey: string, 
  buyNowFunction: () => void,
  addToBasketFunction: () => void,
  addSwatchesToCartFunction: () => void,
  images?: string[],
  deferThreeD?: boolean,
  showOptional?: boolean,
  logoURL?: string,
  isProductGalleryStacked: boolean,
  mobileLogoURL?: string,
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
  buyNowFunction,
  addToBasketFunction,
  addSwatchesToCartFunction,
  images,
  deferThreeD = false,
  showOptional = false,
  logoURL,
  isProductGalleryStacked,
  mobileLogoURL,
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
  const [isMobile, setIsMobile] = useState(false);
  const [hasSwitchedAfterDefer, setHasSwitchedAfterDefer] = useState(false)
  const [pendingProductId, setPendingProductId] = useState<string | null>(null);
  const [availableProductFilters, setAvailableProductFilters] = useState<ProductFilters>({});
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [searchQueries, setSearchQueries] = useState<{ [optionId: string]: string }>({});
  const [availableCameras, setAvailableCameras] = useState<Array<{
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

  // Effect: Initialize selectedSelections from configuratorState
  useEffect(() => {
    if (configuratorState?.selectedSelections) {
      setSelectedSelections(configuratorState.selectedSelections);
    }
    if (configuratorState?.configuratorSettings?.swatchSettings) {
      setSwatchRulesData(configuratorState.configuratorSettings.swatchSettings);
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

  const selectCamera = (cameraId: string) => {
    sendMessageToIframe('SELECT_CAMERA', cameraId);
  }

  // Computed values
  const currentProduct = products?.find(p => p.id === currentProductId);

  // Create a virtual size option from products
  const sizeOption: SizeOption = {
    id: 'size',
    name: 'size',
    groups: [{
      id: 'size-group',
      name: 'Size Options',
      selections: products?.map(p => ({
        id: p?.id,
        name: p?.name,
        price: p?.price,
        discount: p?.discount,
        thumbnail: p?.metadata?.images?.length > 0 ? p?.metadata?.images[p?.metadata?.images?.length - 1] : null
      })) || []
    }]
  };

  // Active option based on activeOptionId
  const baseActiveOption = configuratorState?.options?.find(opt => opt.id === activeOptionId);
  const activeOption = useMemo(() => {
    if (!baseActiveOption) return undefined;

    const searchFilter = (text: string) => {
      const currentSearchQuery = searchQueries[baseActiveOption.id];
      if (!currentSearchQuery) return true;
      const similarity = stringSimilarity(text.toLowerCase(), currentSearchQuery.toLowerCase());
      const containsQuery = text.toLowerCase().includes(currentSearchQuery.toLowerCase());
      return similarity > 0.4 || containsQuery; // Lower the threshold for better matches
    };

    // Checks a selection against the filters and returns true if it matches any of the filters.
    const checkSelectionFilters = (selection: any) => {
      const optionFilters = availableProductFilters?.[baseActiveOption.name];
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
      const currentSearchQuery = searchQueries[baseActiveOption.id];
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
      ...baseActiveOption,
      groups: baseActiveOption.groups.filter((group) => {
        const currentSearchQuery = searchQueries[baseActiveOption.id];
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
        if (availableProductFilters?.[baseActiveOption.name]?.['Collections']?.some(filter => filter.checked)) {
          return availableProductFilters?.[baseActiveOption.name]['Collections']
            .filter(filter => filter.checked)
            .map(filter => filter.value)
            .includes(group.name);
        }

        return !currentSearchQuery; // Only return true if there's no search query
      }).map(group => ({
        ...group,
        selections: searchQueries[baseActiveOption.id] && !searchFilter(group.name) 
          ? group.selections.filter(selection => {
              const matchesSearch = checkSelectionSearch(selection);
              const matchesFilters = checkSelectionFilters(selection);
              
              return matchesSearch && matchesFilters;
            })
          : group.selections.filter(selection => checkSelectionFilters(selection))
      }))
    };
  }, [baseActiveOption, availableProductFilters, searchQueries]);

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

  // Combine size option with configurator options, only including size option if multiple products exist
  const allOptions = [
    ...(products?.length > 1 ? [sizeOption] : []),
    ...(configuratorState?.options || [])
  ];

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

  const handleSelectionSelect = (selection: Selection) => {
    if (activeOptionId === 'size') {
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
        sendMessageToIframe('SELECT_PRODUCT', selection.id);
      }
      return;
    } else {
      setSelectedSelections(prev => {
        const newSelections = prev.filter(sel => sel.optionId !== activeOptionId);
        return [...newSelections, { 
          optionId: activeOptionId || '', 
          groupId: selection.groupId, 
          selectionId: selection.id 
        }];
      });
      sendMessageToIframe('SELECT_SELECTION', {
        optionId: activeOptionId, 
        groupId: selection.groupId, 
        selectionId: selection.id
      });
    }
    if(!hasSwitchedAfterDefer && galleryIndex === 1 && deferThreeD) {
      setHasSwitchedAfterDefer(true);
      setGalleryIndex(galleryIndexToUse);
    }
  };

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

  // Message handler for iframe communication
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const { type, payload } = event.data;
        
        // Skip if no payload or type
        if (!type) {
          return;
        }
        
        // Handle empty payload as empty object
        const data = payload ? JSON.parse(payload) : {};

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
            setConfiguratorState(data);
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
          setArPreviewLink(data);
          break;
        case 'AVAILABLE_CAMERAS':
          setAvailableCameras(data);
          break;
        case 'CURRENT_QUERY_STRING':
          const currentUrl = new URL(window.location.href);
          currentUrl.search = data;
          window.history.replaceState(window.history.state, '', currentUrl.toString());
          break;
        case 'ERROR':
          setError(new Error(data));
          break;
        }
      } catch (error) {
        console.error('Error handling message:', error, 'Event data:', event.data);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

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
    galleryIndexToUse,
    // Coming from injectConfigurator options
    productLink,
    apiKey,
    buyNowFunction,
    addToBasketFunction,
    addSwatchesToCartFunction,
    images,
    logoURL,
    mobileLogoURL,
    // Computed values
    currentProduct,
    sizeOption,
    activeOption: activeOption,
    availableProductFilters,
    showFilters,
    allOptions,
    searchQueries,
    selectedSwatches,
    swatchRulesData,
    isSwatchBookOpen,
    availableCameras,
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
    // Actions
    handleSelectionSelect,
    handleOptionClick,
    handleNextOption,
    handlePreviousOption,
    getSelectedValue,
    toggleAR,
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