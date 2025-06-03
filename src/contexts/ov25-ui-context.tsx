import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { sendMessageToIframe } from '../utils/configurator-utils.js';

// Define types
export type DrawerSizes = 'closed' | 'small' | 'large';
export type AnimationState = 'unavailable' | 'open' | 'close' | 'loop' | 'stop';

export interface Product {
  id: string;
  name: string;
  price: number;
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
}

export interface ConfiguratorState {
  options: Option[];
  selectedSelections: Array<{
    optionId: string;
    groupId: string;
    selectionId: string;
  }>;
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
}

// Context type
interface OV25UIContextType {
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
  formattedPrice: string;
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
  // Coming from injectConfigurator options
  productLink: string | null;
  apiKey: string;
  buyNowFunction: () => void;
  addToBasketFunction: () => void;
  images?: string[];
  logoURL: string;
  isProductGalleryStacked: boolean;
  mobileLogoURL?: string;
  // Computed values
  currentProduct?: Product;
  sizeOption: SizeOption;
  activeOption?: Option;
  allOptions: (Option | SizeOption)[];
  galleryIndexToUse: number;
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
  // Actions
  handleSelectionSelect: (selection: Selection) => void;
  handleOptionClick: (optionId: string) => void;
  handleNextOption: () => void;
  handlePreviousOption: () => void;
  getSelectedValue: (option: Option | SizeOption) => string;
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
  images?: string[],
  deferThreeD?: boolean,
  logoURL: string,
  isProductGalleryStacked: boolean,
  mobileLogoURL?: string
}> = ({ 
  children,
  productLink,
  apiKey,
  buyNowFunction,
  addToBasketFunction,
  images,
  deferThreeD = false,
  logoURL,
  isProductGalleryStacked,
  mobileLogoURL
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
  const [formattedPrice, setFormattedPrice] = useState<string>('£0.00')

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

  const hasDefered = useRef(false);
  const isSelectingProduct = useRef(false);

  // Effect: Initialize selectedSelections from configuratorState
  useEffect(() => {
    if (configuratorState?.selectedSelections) {
      setSelectedSelections(configuratorState.selectedSelections);
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
        thumbnail: p?.metadata?.images?.length > 0 ? p?.metadata?.images[p?.metadata?.images?.length - 1] : null
      })) || []
    }]
  };

  // Active option based on activeOptionId
  const activeOption = configuratorState?.options?.find(opt => opt.id === activeOptionId);

  // Combine size option with configurator options, only including size option if multiple products exist
  const allOptions = [
    ...(products?.length > 1 ? [sizeOption] : []),
    ...(configuratorState?.options || [])
  ];

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
            setFormattedPrice(data.formattedPrice)
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
    // State
    products,
    currentProductId,
    configuratorState,
    selectedSelections,
    activeOptionId,
    quantity,
    price,
    formattedPrice,
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
    galleryIndexToUse,
    // Coming from injectConfigurator options
    productLink,
    apiKey,
    buyNowFunction,
    addToBasketFunction,
    images,
    logoURL,
    mobileLogoURL,
    // Computed values
    currentProduct,
    sizeOption,
    activeOption,
    allOptions,
    
    // Methods
    setProducts,
    setCurrentProductId,
    setConfiguratorState,
    setSelectedSelections,
    setActiveOptionId,
    setQuantity,
    setPrice,
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
    
    // Actions
    handleSelectionSelect,
    handleOptionClick,
    handleNextOption,
    handlePreviousOption,
    getSelectedValue,
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