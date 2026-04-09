import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  sendMessageToIframe,
  toggleAR,
  CompatibleModule,
  detectUserAgent,
  orderConfiguratorSelectionsWithNoneFirst,
} from '../utils/configurator-utils.js';
import { selectionVisibleForBedSizeFilter } from '../lib/bed/bed-variant-size-filter.js';
import { SaveSnap2Dialog } from '../components/SaveSnap2Dialog.js';
import {
  CarouselDisplayMode,
  CarouselLayout,
  VariantDisplayStyle,
  VariantDisplayStyleOverlay,
} from '../types/config-enums.js';
import { stringSimilarity } from 'string-similarity-js';
import { launchARWithGLBBlob } from '../utils/launchARWithGLBBlob.js';
import { getProductGalleryImages, resolveImageUrl } from '../lib/utils.js';
import type {
  BedPartSizeFilterFlags,
  OnChangePayload,
  UnifiedPricePayload,
  UnifiedSkuPayload,
} from '../types/inject-config.js';
import { normalizePricePayload, normalizeSkuPayload } from '../commerce/normalize-iframe-commerce.js';
import {
  IFRAME_MSG_TRANSITION_SNAPSHOT,
  IFRAME_MSG_TRANSITION_SNAPSHOT_ERROR,
} from '../lib/config/iframe-transition-snapshot.js';
import { findIframeWithUniqueId, type ConfiguratorIframeScreenRect } from '../utils/configurator-dom-queries.js';

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

function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
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
}

// Define types
export type DrawerSizes = 'closed' | 'small' | 'large';
export type AnimationState = 'unavailable' | 'open' | 'close' | 'loop' | 'stop';
export type TransitionProxyMode = 'opening' | 'closing' | null;

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
  metadata?: { bedSize?: string };
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
    snap2CheckoutSheet?: ShadowRoot;
    configuratorViewControls?: ShadowRoot;
    popoverPortal?: ShadowRoot;
    modalPortal?: ShadowRoot;
    swatchbookPortal?: ShadowRoot;
  };
  cssString?: string;
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
  galleryCarouselFullscreenImage: string | null;
  setGalleryCarouselFullscreenImage: React.Dispatch<React.SetStateAction<string | null>>;
  /** Last frame from the iframe shown in the gallery slot while the iframe moves to sheet/modal. */
  configuratorTransitionProxyBitmap: ImageBitmap | null;
  configuratorTransitionProxyMode: TransitionProxyMode;
  /** Captured sheet/modal iframe bounds; closing proxy is portaled here and slides/fades with the shell. */
  configuratorClosingProxyRect: ConfiguratorIframeScreenRect | null;
  useInstantIframeCloseRestore: boolean;
  setConfiguratorTransitionProxyBitmap: (bitmap: ImageBitmap | null) => void;
  setConfiguratorTransitionProxyMode: (mode: TransitionProxyMode) => void;
  setConfiguratorClosingProxyRect: (rect: ConfiguratorIframeScreenRect | null) => void;
  setUseInstantIframeCloseRestore: React.Dispatch<React.SetStateAction<boolean>>;
  releaseConfiguratorTransitionProxy: () => void;
  /** Stacked gallery: next close sync should skip the legacy 500ms wait (instant iframe restore). Set in useIframePositioning; consumed in ProductGallery. */
  stackedGalleryCloseSyncImmediateRef: React.MutableRefObject<boolean>;
  arPreviewLink: string | null;
  error: Error | null;
  canAnimate: boolean;
  animationState: AnimationState;
  iframeRef: React.RefObject<HTMLIFrameElement>;
  isMobile: boolean;
  hasSwitchedAfterDefer: boolean;
  deferThreeD: boolean;
  /** True when gallery mounts in the hidden preload container (no page slot): modal open should not wait on iframe ImageBitmap. */
  configuratorGalleryIsDeferred: boolean;
  showOptional: boolean;
  hidePricing: boolean;
  hideAr: boolean;
  // Coming from injectConfigurator options
  productLink: string | null;
  apiKey: string;
  configurationUuid: string | null;
  /** OV25 bed iframe: `bedAllowNone` query segment (omit when all parts may use None). */
  bedAllowNoneQueryValue?: string;
  /** Bed iframe: latest size from `CURRENT_BED_SIZE` postMessage (`null` until first message or non-bed). */
  currentBedSize: string | null;
  /** When true for a part, selections in that option hide if `metadata.bedSize` ≠ {@link currentBedSize}. */
  bedFilterSelectionsByCurrentSize: BedPartSizeFilterFlags;
  buyNowFunction: (payload?: OnChangePayload) => void;
  addToBasketFunction: (payload?: OnChangePayload) => void;
  buySwatches: () => void;
  images?: string[];
  logoURL?: string;
  isProductGalleryStacked: boolean;
  carouselLayout: CarouselLayout;
  carouselLayoutMobile: CarouselLayout;
  carouselMaxImagesDesktop?: number;
  carouselMaxImagesMobile?: number;
  showCarousel: boolean;
  mobileLogoURL?: string;
  uniqueId?: string;

  // Computed values
  currentProduct?: Product;
  sizeOption: SizeOption;
  activeOption?: Option;
  availableProductFilters?: ProductFilters;
  optionHasVisibleFilters: (option: { id: string; name: string }) => boolean;
  showFilters?: boolean;
  allOptions: (Option | SizeOption)[];
  allOptionsWithoutModules: (Option | SizeOption)[];
  galleryIndexToUse: number;
  filteredActiveOption?: Option | null;
  searchQueries: { [optionId: string]: string };
  selectedSwatches: Swatch[];
  swatchRulesData: SwatchRulesData;
  isSwatchBookOpen: boolean;
  swatchBookFlash: 'destructive' | 'cta' | null;
  setSwatchBookFlash: React.Dispatch<React.SetStateAction<'destructive' | 'cta' | null>>;
  hasSelectionsWithSwatches: boolean;
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
  /** Latest normalized price payload from CURRENT_PRICE; drives Snap2 checkout sheet line items. */
  commercePriceSnapshot: UnifiedPricePayload | null;
  /** Desktop Snap2 modal: right-rail checkout panel open state (rendered next to variants in Snap2ConfiguratorModal). */
  isSnap2CheckoutSheetOpen: boolean;
  setIsSnap2CheckoutSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
  snap2SaveResponse: { success: boolean; shareUrl?: string; error?: string } | null;
  isModalOpen: boolean;
  controlsHidden: boolean;
  hasConfigureButton: boolean;
  useInlineVariantControls: boolean;
  configuratorDisplayMode: 'inline' | 'sheet' | 'drawer' | 'variants-only-sheet' | 'modal';
  configuratorDisplayModeMobile: 'inline' | 'drawer' | 'modal' | 'variants-only-sheet';
  useSimpleVariantsSelector: boolean;
  /** Drawer trigger: single Configure button or per-option buttons (ProductOptionsGroup). */
  configuratorTriggerStyle: 'single-button' | 'split-buttons';
  variantDisplayStyleMobile: VariantDisplayStyle;
  variantDisplayStyleInline: VariantDisplayStyleOverlay;
  variantDisplayStyleInlineMobile: VariantDisplayStyleOverlay;
  variantDisplayStyleOverlay: VariantDisplayStyleOverlay;
  variantDisplayStyleOverlayMobile: VariantDisplayStyleOverlay;
  shareDialogTrigger: 'none' | 'save-button' | 'modal-close';
  skipNextDrawerCloseRef: React.MutableRefObject<boolean>;
  skipNextShareClickRef: React.MutableRefObject<boolean>;
  expandToOptionIdOnOpen: string | null;
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
  /** Open the variant configurator (closes swatch book, opens variants drawer). Optionally pass an option name (case insensitive) to open on that option. */
  openConfigurator: (optionName?: string) => void;
  /** Open configurator or Snap2 modal based on product type. For useSimpleVariantsSelector single button. */
  openConfiguratorOrSnap2: () => void;
  /** Close the variant configurator drawer. For use by custom buttons. */
  closeConfigurator: () => void;
  /** Open the swatch book. Exposed for custom buttons. */
  openSwatchBook: () => void;
  /** Close the swatch book. Exposed for custom buttons. */
  closeSwatchBook: () => void;
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
  bedAllowNoneQueryValue?: string,
  bedFilterSelectionsByCurrentSize?: BedPartSizeFilterFlags,
  buyNowFunction: (payload?: OnChangePayload) => void,
  addToBasketFunction: (payload?: OnChangePayload) => void,
  buySwatchesFunction: (swatches: Swatch[], swatchRulesData: SwatchRulesData) => void,
  onChange?: (payload: OnChangePayload) => void,
  images?: string[],
  deferThreeD?: boolean,
  showOptional?: boolean,
  hidePricing?: boolean,
  hideAr?: boolean,
  forceMobile?: boolean,
  logoURL?: string,
  isProductGalleryStacked: boolean,
  carouselDisplayMode?: CarouselDisplayMode,
  carouselDisplayModeMobile?: CarouselDisplayMode,
  carouselMaxImagesDesktop?: number,
  carouselMaxImagesMobile?: number,
  /** @deprecated Use carouselDisplayMode */
  carouselLayout?: CarouselDisplayMode,
  showCarousel?: boolean,
  hasConfigureButton: boolean,
  mobileLogoURL?: string,
  uniqueId?: string,
  useInlineVariantControls?: boolean,
  useInlineVariantControlsMobile?: boolean,
  configuratorDisplayMode?: 'inline' | 'sheet' | 'drawer' | 'modal' | 'variants-only-sheet',
  configuratorDisplayModeMobile?: 'inline' | 'drawer' | 'modal' | 'variants-only-sheet',
  useSimpleVariantsSelector?: boolean,
  configuratorTriggerStyle?: 'single-button' | 'split-buttons',
  configuratorTriggerStyleMobile?: 'single-button' | 'split-buttons',
  variantDisplayStyle?: VariantDisplayStyle,
  variantDisplayStyleMobile?: VariantDisplayStyle,
  variantDisplayStyleInline?: VariantDisplayStyleOverlay,
  variantDisplayStyleInlineMobile?: VariantDisplayStyleOverlay,
  variantDisplayStyleOverlay?: VariantDisplayStyleOverlay,
  variantDisplayStyleOverlayMobile?: VariantDisplayStyleOverlay,
  /** Normalized option keys (id or name, lowercase) to hide from variant UI; defaults stay from iframe. */
  hideVariantOptions?: string[],
  shadowDOMs?: {
    mobileDrawer?: ShadowRoot;
    snap2CheckoutSheet?: ShadowRoot;
    configuratorViewControls?: ShadowRoot;
    popoverPortal?: ShadowRoot;
    modalPortal?: ShadowRoot;
    swatchbookPortal?: ShadowRoot;
  },
  cssString?: string,
  configuratorGalleryIsDeferred?: boolean,
}> = ({ 
  children,
  productLink,
  apiKey,
  configurationUuid,
  bedAllowNoneQueryValue,
  bedFilterSelectionsByCurrentSize: bedFilterSelectionsByCurrentSizeProp,
  buyNowFunction,
  addToBasketFunction,
  buySwatchesFunction,
  onChange,
  images,
  deferThreeD = false,
  configuratorGalleryIsDeferred = false,
  showOptional = false,
  hidePricing = false,
  hideAr = false,
  forceMobile = false,
  logoURL,
  isProductGalleryStacked,
  carouselDisplayMode: carouselDisplayModeProp,
  carouselDisplayModeMobile: carouselDisplayModeMobileProp,
  carouselMaxImagesDesktop,
  carouselMaxImagesMobile,
  carouselLayout: carouselLayoutProp,
  showCarousel = true,
  hasConfigureButton,
  mobileLogoURL,
  uniqueId,
  useInlineVariantControls = false,
  useInlineVariantControlsMobile: useInlineVariantControlsMobileProp,
  configuratorDisplayMode = 'sheet',
  configuratorDisplayModeMobile: configuratorDisplayModeMobileProp,
  useSimpleVariantsSelector = true,
  configuratorTriggerStyle = 'single-button',
  configuratorTriggerStyleMobile: configuratorTriggerStyleMobileProp,
  variantDisplayStyle,
  variantDisplayStyleMobile: variantDisplayStyleMobileProp,
  variantDisplayStyleInline: variantDisplayStyleInlineProp,
  variantDisplayStyleInlineMobile: variantDisplayStyleInlineMobileProp,
  variantDisplayStyleOverlay: variantDisplayStyleOverlayProp,
  variantDisplayStyleOverlayMobile: variantDisplayStyleOverlayMobileProp,
  hideVariantOptions = [],
  shadowDOMs,
  cssString,
}) => {
  const carouselLayout = carouselDisplayModeProp ?? carouselLayoutProp ?? CarouselDisplayMode.Stacked;
  const carouselLayoutMobile = carouselDisplayModeMobileProp ?? carouselDisplayModeProp ?? carouselLayoutProp ?? CarouselDisplayMode.Stacked;
  const variantDisplayStyleMobile = variantDisplayStyleMobileProp ?? variantDisplayStyle ?? VariantDisplayStyle.Tree;
  const listLikeStyles: VariantDisplayStyle[] = [VariantDisplayStyle.Wizard, VariantDisplayStyle.List, VariantDisplayStyle.Tabs, VariantDisplayStyle.Accordion, VariantDisplayStyle.Tree];
  const isListLike = variantDisplayStyle != null && listLikeStyles.includes(variantDisplayStyle);
  const isListLikeMobile = variantDisplayStyleMobile != null && listLikeStyles.includes(variantDisplayStyleMobile);
  const variantDisplayStyleInline: VariantDisplayStyleOverlay = isListLike ? (variantDisplayStyle as VariantDisplayStyleOverlay) : (variantDisplayStyleInlineProp ?? VariantDisplayStyleOverlay.Wizard);
  const variantDisplayStyleOverlay: VariantDisplayStyleOverlay = isListLike ? (variantDisplayStyle as VariantDisplayStyleOverlay) : (variantDisplayStyleOverlayProp ?? VariantDisplayStyleOverlay.Tree);
  const variantDisplayStyleInlineMobile: VariantDisplayStyleOverlay = variantDisplayStyleInlineMobileProp ?? (isListLikeMobile ? (variantDisplayStyleMobile as VariantDisplayStyleOverlay) : variantDisplayStyleInline);
  const variantDisplayStyleOverlayMobile: VariantDisplayStyleOverlay = variantDisplayStyleOverlayMobileProp ?? (isListLikeMobile ? (variantDisplayStyleMobile as VariantDisplayStyleOverlay) : variantDisplayStyleOverlay);
  const hideVariantOptionKeys = useMemo(
    () => new Set(hideVariantOptions.filter(Boolean)),
    [hideVariantOptions]
  );
  const isVariantOptionHidden = useCallback(
    (opt: { id: string; name: string }) => {
      if (hideVariantOptionKeys.size === 0) return false;
      const id = String(opt.id).toLowerCase();
      const name = String(opt.name).toLowerCase();
      return hideVariantOptionKeys.has(id) || hideVariantOptionKeys.has(name);
    },
    [hideVariantOptionKeys]
  );

  const bedFilterSelectionsByCurrentSize = useMemo<BedPartSizeFilterFlags>(
    () => ({
      headboard: Boolean(bedFilterSelectionsByCurrentSizeProp?.headboard),
      base: Boolean(bedFilterSelectionsByCurrentSizeProp?.base),
      mattress: Boolean(bedFilterSelectionsByCurrentSizeProp?.mattress),
    }),
    [
      bedFilterSelectionsByCurrentSizeProp?.headboard,
      bedFilterSelectionsByCurrentSizeProp?.base,
      bedFilterSelectionsByCurrentSizeProp?.mattress,
    ],
  );

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
  const [expandToOptionIdOnOpen, setExpandToOptionIdOnOpen] = useState<string | null>(null);
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
  const [currentBedSize, setCurrentBedSize] = useState<string | null>(null);
  const [drawerSize, setDrawerSize] = useState<DrawerSizes>("closed");
  const [isVariantsOpen, setIsVariantsOpen] = useState(false);
  const [isDrawerOrDialogOpen, setIsDrawerOrDialogOpen] = useState(false);
  const [galleryCarouselFullscreenImage, setGalleryCarouselFullscreenImage] = useState<string | null>(null);
  const [configuratorTransitionProxyBitmap, setConfiguratorTransitionProxyBitmapState] = useState<ImageBitmap | null>(null);
  const [configuratorTransitionProxyMode, setConfiguratorTransitionProxyModeState] = useState<TransitionProxyMode>(null);
  const [configuratorClosingProxyRect, setConfiguratorClosingProxyRectState] = useState<ConfiguratorIframeScreenRect | null>(null);
  const [useInstantIframeCloseRestore, setUseInstantIframeCloseRestore] = useState(false);

  const setConfiguratorTransitionProxyMode = useCallback((mode: TransitionProxyMode) => {
    if (mode === 'opening') {
      setConfiguratorClosingProxyRectState(null);
    }
    setConfiguratorTransitionProxyModeState(mode);
  }, []);

  const setConfiguratorClosingProxyRect = useCallback((rect: ConfiguratorIframeScreenRect | null) => {
    setConfiguratorClosingProxyRectState(rect);
  }, []);
  const [arPreviewLink, setArPreviewLink] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [canAnimate, setCanAnimate] = useState<boolean>(false);
  const [animationState, setAnimationState] = useState<AnimationState>('unavailable');
  const iframeRef = useRef<HTMLIFrameElement>(null!);
  const [isMobile, setIsMobile] = useState(forceMobile || window.innerWidth < 768);
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
  const isSelectingProduct = useRef(false);

  const [selectedSwatches, setSelectedSwatches] = useLocalStorage<Swatch[]>('ov25-selected-swatches', []);
  const [isSwatchBookOpen, setIsSwatchBookOpen] = useState<boolean>(false);
  const [swatchBookFlash, setSwatchBookFlash] = useState<'destructive' | 'cta' | null>(null);
  const [swatchRulesData, setSwatchRulesData] = useState<SwatchRulesData>({
    freeSwatchLimit: 0,
    canExeedFreeLimit: false,
    pricePerSwatch: 0,
    minSwatches: 0,
    maxSwatches: 0,
    enabled: false,
  });
  const [commercePriceSnapshot, setCommercePriceSnapshot] = useState<UnifiedPricePayload | null>(null);
  const [isSnap2CheckoutSheetOpen, setIsSnap2CheckoutSheetOpen] = useState(false);
  const [snap2SaveResponse, setSnap2SaveResponse] = useState<{ success: boolean; shareUrl?: string; error?: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [controlsHidden, setControlsHidden] = useState(false);
  const [hasConfigureButtonState, setHasConfigureButton] = useState(hasConfigureButton);
  const [shareDialogTrigger, setShareDialogTrigger] = useState<'none' | 'save-button' | 'modal-close'>('none');
  const skipNextDrawerCloseRef = useRef(false);
  const skipNextShareClickRef = useRef(false);
  const stackedGalleryCloseSyncImmediateRef = useRef(false);
  const [preloading, setPreloading] = useState(window.innerWidth < 768);
  const [iframeResetKey, setIframeResetKey] = useState(0);

  const effectiveConfiguratorDisplayModeMobile = useMemo(
    () =>
      configuratorDisplayModeMobileProp ??
      (configuratorDisplayMode === 'inline'
        ? 'inline'
        : configuratorDisplayMode === 'modal'
          ? 'modal'
          : 'drawer'),
    [configuratorDisplayModeMobileProp, configuratorDisplayMode]
  );

  // Module selection state
  const [compatibleModules, setCompatibleModules] = useState<CompatibleModule[] | null>(null);
  const [isModuleSelectionLoading, setIsModuleSelectionLoading] = useState<boolean>(false);
  const [selectedModuleType, setSelectedModuleType] = useState<'all' | 'middle' | 'corner' | 'end'>('all');
  const [isModulePanelOpen, setIsModulePanelOpen] = useState<boolean>(false);

  // Configure handler ref for external access
  const configureHandlerRef = useRef<(() => void) | null>(null);

  const latestPriceRef = useRef<UnifiedPricePayload | null>(null);
  const latestSkuRef = useRef<UnifiedSkuPayload | null>(null);
  const configuratorStateRef = useRef<ConfiguratorState | undefined>(configuratorState);
  configuratorStateRef.current = configuratorState;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const addToBasketWithPayload = useCallback(() => {
    addToBasketFunction({ skus: latestSkuRef.current ?? null, price: latestPriceRef.current ?? null });
  }, [addToBasketFunction]);

  const buyNowWithPayload = useCallback(() => {
    buyNowFunction({ skus: latestSkuRef.current ?? null, price: latestPriceRef.current ?? null });
  }, [buyNowFunction]);

  const releaseConfiguratorTransitionProxy = useCallback(() => {
    setConfiguratorTransitionProxyBitmapState((prev) => {
      prev?.close();
      return null;
    });
    setConfiguratorTransitionProxyModeState(null);
    setConfiguratorClosingProxyRectState(null);
  }, []);

  const setConfiguratorTransitionProxyBitmap = useCallback((bitmap: ImageBitmap | null) => {
    setConfiguratorTransitionProxyBitmapState((prev) => {
      prev?.close();
      return bitmap;
    });
  }, []);

  // Cleanup function for switching between configurators
  const cleanupConfigurator = useCallback(() => {
    releaseConfiguratorTransitionProxy();
    setUseInstantIframeCloseRestore(false);
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
    setCommercePriceSnapshot(null);
    setIsSnap2CheckoutSheetOpen(false);
    latestPriceRef.current = null;
    latestSkuRef.current = null;
    setCurrentBedSize(null);

    // Reset iframe
    setIframeResetKey(prev => prev + 1);
    
    // Reset other relevant state
    setActiveOptionId(null);
    setSelectedSelections([]);
    setError(null);
    setArPreviewLink(null);
    setPreloading(false);
    setHasSwitchedAfterDefer(false);
    setGalleryCarouselFullscreenImage(null);
  }, [
    releaseConfiguratorTransitionProxy,
    setUseInstantIframeCloseRestore,
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
    setHasSwitchedAfterDefer,
    setGalleryCarouselFullscreenImage,
  ]);

  // When variants open, auto-close bottom modules panel and Snap2 checkout sheet (one surface at a time).
  useEffect(() => {
    if (isVariantsOpen) {
      setIsModulePanelOpen(false);
      setIsSnap2CheckoutSheetOpen(false);
    }
  }, [isVariantsOpen]);

  useEffect(() => {
    if (!isVariantsOpen) setExpandToOptionIdOnOpen(null);
  }, [isVariantsOpen]);

  useEffect(() => {
    if (isSnap2CheckoutSheetOpen) {
      const snap2Mobile = isMobile && productLink?.startsWith('snap2/');
      setIsModulePanelOpen(false);
      if (!snap2Mobile) {
        setIsVariantsOpen(false);
      }
    }
  }, [isSnap2CheckoutSheetOpen, isMobile, productLink]);

  useEffect(() => {
    // auto-close variants and checkout when module panel opens on desktop
    if (isModulePanelOpen && !isMobile) {
      setIsVariantsOpen(false);
      setIsSnap2CheckoutSheetOpen(false);
    }
  }, [isModulePanelOpen, isMobile]);

  useEffect(() => {
    if (isModalOpen) skipNextShareClickRef.current = false;
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) setIsSnap2CheckoutSheetOpen(false);
  }, [isModalOpen]);

  // Effect: Clear pending product ID when current product ID updates
  useEffect(() => {
    if (currentProductId && pendingProductId === currentProductId) {
      setPendingProductId(null);
      isSelectingProduct.current = false;
    }
  }, [currentProductId, pendingProductId]);

  // Effect for detecting mobile devices (skip when forceMobile)
  useEffect(() => {
    if (forceMobile) {
      setIsMobile(true);
      return;
    }
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, [forceMobile]);

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

  const buySwatches = () => {
    buySwatchesFunction(selectedSwatches, swatchRulesData);
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

    const checkBedSizeFilter = (selection: any) =>
      selectionVisibleForBedSizeFilter({
        selection,
        optionDisplayName: option.name,
        currentBedSize,
        flags: bedFilterSelectionsByCurrentSize,
      });

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
          const hasMatchingSelections = group.selections.some(
            (selection) => checkSelectionSearch(selection) && checkBedSizeFilter(selection),
          );
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

                return matchesSearch && matchesFilters && checkBedSizeFilter(selection);
              })
            : group.selections.filter(
                (selection) =>
                  checkSelectionFilters(selection) && checkBedSizeFilter(selection),
              )
          ).filter(selection => selection.isVisible !== false),
      }))
    } as Option;
  }, [
    availableProductFilters,
    searchQueries,
    currentBedSize,
    bedFilterSelectionsByCurrentSize,
  ]);

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

  const sizeOption: SizeOption = useMemo(() => ({
    id: 'size',
    name: 'size',
    groups: [{
      id: 'size-group',
      selections: products?.map(p => ({
        id: p?.id,
        name: p?.name,
        price: p?.price,
        discount: p?.discount,
        thumbnail: (() => {
          const imgs = p?.metadata?.images
          if (!imgs?.length) return undefined
          const last = imgs[imgs.length - 1]
          return resolveImageUrl(last as any, 'carousel') || undefined
        })()
      })) || []
    }]
  }), [products]);

  const allOptions = useMemo(() => {
    const modulesOption = {
      id: 'modules',
      name: 'Modules',
      groups: [{ id: 'modules-group', name: 'Compatible Modules', selections: [] }]
    };
    const snap2Blocked = isSnap2Mode && (!configuratorState?.snap2Objects || configuratorState.snap2Objects.length === 0);
    const sizeEntries = products?.length > 1 && !isSnap2Mode ? [sizeOption] : [];
    const configEntries = snap2Blocked
      ? []
      : (configuratorState?.options || [])
          .filter(option => option.isVisible !== false)
          .map(option => ({
            ...option,
            groups: option.groups
              .filter(group => group.isVisible !== false)
              .map(group => ({
                ...group,
                selections: group.selections.filter(selection => selection.isVisible !== false)
              }))
          }));

    const rawList: (Option | SizeOption)[] = [
      ...(isSnap2Mode && !isVariantOptionHidden(modulesOption) ? [modulesOption] : []),
      ...sizeEntries.filter(opt => !isVariantOptionHidden(opt)),
      ...configEntries.filter(opt => !isVariantOptionHidden(opt)),
    ];
    rawList.forEach((option: Option | SizeOption) => {
      (option as Option).hasNonOption = option.groups.some(group =>
        group.selections.some(selection => selection.name.toLowerCase() === 'none')
      );
    });
    return rawList;
  }, [isSnap2Mode, products, configuratorState, sizeOption, isVariantOptionHidden]);

  const allOptionsWithoutModules = allOptions.filter(option => option.id !== 'modules');

  useEffect(() => {
    if (activeOptionId == null) return;
    if (allOptions.some(o => o.id === activeOptionId)) return;
    const fallback = allOptions.find(o => o.id !== 'modules') ?? allOptions[0];
    setActiveOptionId(fallback ? fallback.id : null);
  }, [activeOptionId, allOptions, setActiveOptionId]);

  const optionHasVisibleFilters = useCallback(
    (option: { id: string; name: string }) => {
      const optionFilters = availableProductFilters?.[option.name];
      if (!optionFilters || Object.keys(optionFilters).length === 0) return false;
      const fullOption = allOptionsWithoutModules?.find((o) => o.id === option.id);
      const groupCount = fullOption?.groups?.length ?? 0;
      return Object.keys(optionFilters).some((key) => {
        if (key === 'Collections') return groupCount > 1 && (optionFilters[key]?.length ?? 0) > 0;
        return (optionFilters[key]?.length ?? 0) > 0;
      });
    },
    [availableProductFilters, allOptionsWithoutModules]
  );

  useEffect(() => {
    if (!configuratorState?.options?.length) return;
    const availableFilters = configuratorState.configuratorSettings?.availableProductFilters || {};
    const allFilterSets: ProductFilters = {};

    configuratorState.options.forEach(option => {
      if (option.name && availableFilters[option.name]) {
        const filterSets: { [key: string]: Set<string> } = {};
        availableFilters[option.name].forEach((filter: string) => {
          filterSets[filter] = new Set<string>();
        });

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

        allFilterSets[option.name] = {};
        Object.keys(filterSets).forEach(key => {
          if (!allFilterSets[option.name]) {
            allFilterSets[option.name] = {};
          }
          allFilterSets[option.name][key] = Array.from(filterSets[key]).map(value => ({ value, checked: false }));
        });
      }
      if (option.groups && option.groups.length > 1) {
        if (!allFilterSets[option.name]) {
          allFilterSets[option.name] = {};
        }
        allFilterSets[option.name]['Collections'] = option.groups.map(group => ({ value: group.name, checked: false }));
      }
    });

    setAvailableProductFilters(prev => {
      const merged: ProductFilters = {};
      Object.keys(allFilterSets).forEach(optionName => {
        merged[optionName] = {};
        Object.keys(allFilterSets[optionName]).forEach(filterKey => {
          const prevOptions = prev?.[optionName]?.[filterKey];
          merged[optionName][filterKey] = allFilterSets[optionName][filterKey].map(
            item => ({
              ...item,
              checked: prevOptions?.find(p => p.value === item.value)?.checked ?? item.checked
            })
          );
        });
      });
      return merged;
    });
    setShowFilters(Object.keys(allFilterSets).length > 0 && Object.keys(allFilterSets).some(key => Object.keys(allFilterSets[key]).some(key2 => Object.keys(allFilterSets[key][key2]).length > 0)));
  }, [configuratorState?.options, configuratorState?.configuratorSettings?.availableProductFilters]);

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
  }, [configuratorState, allOptions]);

  // Check if any selection in the current product has a swatch
  const hasSelectionsWithSwatches = useMemo(() => {
    if (!configuratorState?.options) return false;
    return configuratorState.options.some(option =>
      option.groups.some(group =>
        group.selections.some(selection => selection.swatch !== undefined)
      )
    );
  }, [configuratorState]);

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
    setExpandToOptionIdOnOpen(optionId);
    setActiveOptionId(optionId);
    setIsVariantsOpen(true);
  };

  const toggleHideAll = useCallback(() => {
    const newHiddenState = !controlsHidden;
    setControlsHidden(newHiddenState);
    sendMessageToIframe('TOGGLE_HIDE_ALL', { hideAll: newHiddenState }, uniqueId);
  }, [controlsHidden, setControlsHidden]);

  const handleSelectionSelectRef = useRef<(selection: Selection, optionId?: string) => void>(() => {});
  const handleSelectionSelect = useMemo(
    () => throttle((selection: Selection, optionId?: string) => handleSelectionSelectRef.current(selection, optionId), 500),
    []
  );

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
    if (isMobile) {
      setPreloading(false);
      setExpandToOptionIdOnOpen(null);
      // On mobile/tablet, open variants drawer.
      // Prefer first non-modules option; otherwise fall back to 'modules' so user can pick in the drawer.
      const firstNonModulesOption = allOptions.find(opt => opt.id !== 'modules');
      if (firstNonModulesOption) {
        setActiveOptionId(firstNonModulesOption.id);
      } else {
        setActiveOptionId('modules');
      }
      setIsVariantsOpen(true);
      if (isSnap2Mode && effectiveConfiguratorDisplayModeMobile === 'modal') {
        setIsModalOpen(true);
      }
    } else {
      setIsModalOpen(true);
      setIsModulePanelOpen(true);
      setIsVariantsOpen(true);
    }
  }, [
    allOptions,
    isMobile,
    isSnap2Mode,
    effectiveConfiguratorDisplayModeMobile,
    setPreloading,
    setActiveOptionId,
    setIsVariantsOpen,
    setIsModalOpen,
    setIsModulePanelOpen,
  ]);

  useEffect(() => {
    if (!isVariantsOpen && isSnap2Mode && isMobile && effectiveConfiguratorDisplayModeMobile === 'modal') {
      setIsModalOpen(false);
    }
  }, [
    isVariantsOpen,
    isSnap2Mode,
    isMobile,
    effectiveConfiguratorDisplayModeMobile,
    setIsModalOpen,
  ]);

  /** Open variant configurator: close swatch book, open variants drawer. Optional optionName uses fuzzy match; fallback to first option. */
  const openConfigurator = useCallback((optionName?: string) => {
    setIsSwatchBookOpen(false);
    if (allOptions.length > 0) {
      const name = optionName?.trim();
      let targetId: string | undefined;
      if (name) {
        const withSimilarity = allOptions.map((opt) => ({
          id: opt.id,
          similarity: stringSimilarity(opt.name.toLowerCase(), name.toLowerCase()),
        }));
        const best = withSimilarity.reduce((a, b) => (a.similarity >= b.similarity ? a : b));
        targetId = best.similarity > 0.4 ? best.id : undefined;
      }
      const resolved = targetId ?? allOptions[0].id;
      setExpandToOptionIdOnOpen(name ? resolved : null);
      setActiveOptionId(resolved);
    } else {
      setExpandToOptionIdOnOpen(null);
    }
    setIsVariantsOpen(true);
  }, [allOptions, setIsSwatchBookOpen, setActiveOptionId, setIsVariantsOpen]);

  /** Close variant configurator drawer. Exposed for custom buttons. */
  const closeConfigurator = useCallback(() => {
    setIsSwatchBookOpen(false);
    setIsVariantsOpen(false);
  }, [setIsVariantsOpen]);

  /** Open the swatch book. Exposed for custom buttons. */
  const openSwatchBook = useCallback(() => {
    setIsSwatchBookOpen(true);
  },[setIsSwatchBookOpen])

  /** Close the swatch book. Exposed for custom buttons. */
  const closeSwatchBook = useCallback(() => {
    setIsSwatchBookOpen(false);
  },[setIsSwatchBookOpen])

  const openConfiguratorOrSnap2 = useCallback(() => {
    if (isSnap2Mode) {
      handleConfigureClick();
    } else {
      openConfigurator();
    }
  }, [isSnap2Mode, handleConfigureClick, openConfigurator]);

  configureHandlerRef.current = handleConfigureClick;
  const configureHandlerWindowRef = (window as any).ov25ConfigureHandlerRef;
  if (configureHandlerWindowRef) {
    configureHandlerWindowRef.current = handleConfigureClick;
  }

  const openRef = (window as any).ov25OpenConfiguratorRef;
  const closeRef = (window as any).ov25CloseConfiguratorRef;
  const openSwatchRef = (window as any).ov25OpenSwatchBookRef;
  const closeSwatchRef = (window as any).ov25CloseSwatchBookRef;
  if (openRef) openRef.current = isSnap2Mode ? handleConfigureClick : openConfigurator;
  if (closeRef) closeRef.current = closeConfigurator;
  if (openSwatchRef) openSwatchRef.current = openSwatchBook;
  if (closeSwatchRef) closeSwatchRef.current = closeSwatchBook;

  useEffect(() => () => {
    const r1 = (window as any).ov25OpenConfiguratorRef;
    const r2 = (window as any).ov25CloseConfiguratorRef;
    const r3 = (window as any).ov25OpenSwatchBookRef;
    const r4 = (window as any).ov25CloseSwatchBookRef;
    if (r1) r1.current = null;
    if (r2) r2.current = null;
    if (r3) r3.current = null;
    if (r4) r4.current = null;
  }, []);

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
          const iframe = findIframeWithUniqueId(uniqueId) as HTMLIFrameElement | null;
          if (!iframe || event.source !== iframe.contentWindow) {
            return;
          }
        }

        if (type === IFRAME_MSG_TRANSITION_SNAPSHOT || type === IFRAME_MSG_TRANSITION_SNAPSHOT_ERROR) {
          return;
        }
        
        // AR_GLB_DATA sends raw base64 string, don't parse it
        const data = (type === 'AR_GLB_DATA' || !payload) ? {} : JSON.parse(payload);
        switch (type) {
          case 'ALL_PRODUCTS':
            console.log('[ov25-ui] ALL_PRODUCTS received:', data);
            data?.forEach?.((p: any, i: number) => {
              console.log(`[ov25-ui] Product ${i} (id=${p?.id}) metadata:`, p?.metadata);
            });
            setProducts(data);
            break;
          case 'CURRENT_PRODUCT_ID':
            setCurrentProductId(data);
            break;
          case 'SELECTED_SELECTIONS': {
            const raw = Array.isArray(data)
              ? data.filter(
                  (r: unknown): r is { optionId: string; groupId: string; selectionId: string } =>
                    !!r &&
                    typeof r === 'object' &&
                    typeof (r as { optionId?: unknown }).optionId === 'string' &&
                    typeof (r as { groupId?: unknown }).groupId === 'string' &&
                    typeof (r as { selectionId?: unknown }).selectionId === 'string'
                )
              : [];
            const byOptionId = new Map<
              string,
              { optionId: string; groupId: string; selectionId: string }
            >();
            for (const r of raw) {
              byOptionId.set(r.optionId, {
                optionId: r.optionId,
                groupId: r.groupId,
                selectionId: r.selectionId,
              });
            }
            const fromIframe = Array.from(byOptionId.values());
            setSelectedSelections(fromIframe);
            setConfiguratorState((prev) => {
              if (!prev) return prev;
              return {
                options: prev.options,
                configuratorSettings: prev.configuratorSettings,
                snap2Objects: prev.snap2Objects,
                selectedSelections: fromIframe,
              };
            });
            break;
          }
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
                        selections: orderConfiguratorSelectionsWithNoneFirst(
                          (group.selections || []).map((selection: Selection) => ({
                            ...selection,
                            isVisible: selection.isVisible !== undefined
                              ? selection.isVisible
                              : (existingGroup?.selections.get(selection.id) !== undefined
                                  ? existingGroup.selections.get(selection.id)
                                  : true),
                          })),
                        )
                      };
                    }).filter(group => group.selections.length > 0)
                  };
                })
              };
              return initializedData;
            });
            break;
          case 'CURRENT_PRICE': {
            const pricePayload = normalizePricePayload(data);
            if (!pricePayload) break;
            latestPriceRef.current = pricePayload;
            setCommercePriceSnapshot(pricePayload);
            setPrice(pricePayload.totalPrice);
            setSubtotal(pricePayload.subtotal);
            setFormattedSubtotal(pricePayload.formattedSubtotal);
            setFormattedPrice(pricePayload.formattedPrice);
            setDiscount(pricePayload.discount);
            onChangeRef.current?.({ skus: latestSkuRef.current ?? null, price: pricePayload });
            break;
          }
          case 'CURRENT_SKU': {
            const skuPayload = normalizeSkuPayload(data);
            if (!skuPayload) break;
            latestSkuRef.current = skuPayload;
            setCurrentSku(skuPayload);
            onChangeRef.current?.({ skus: skuPayload, price: latestPriceRef.current ?? null });
            break;
          }
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
          case 'CURRENT_BED_SIZE': {
            const raw = data?.size;
            const next =
              typeof raw === 'string' && raw.trim() !== '' ? raw.trim() : null;
            setCurrentBedSize(next);
            break;
          }
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
              if (isMobile) {
                setExpandToOptionIdOnOpen(null);
                setActiveOptionId('modules');
                if (!hasConfigureButton && !data.isInitialLoad) {
                  setIsVariantsOpen(true);
                }
              } else {
                setIsModulePanelOpen(true);
              }
            } else if (isMobile && configuratorStateRef.current?.snap2Objects?.length) {
              const firstVariant = configuratorStateRef.current.options?.[0];
              if (firstVariant) {
                setActiveOptionId(firstVariant.id);
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

  const hasCutout = !!(currentProduct?.metadata as any)?.cutoutImage
  const cutoutFirst = hasCutout && (isMobile || !deferThreeD)
  const productImages = getProductGalleryImages(currentProduct?.metadata, { cutoutFirst })
  const allImages = [...(images || []), ...productImages]
  
  const [galleryIndex, setGalleryIndex] = useState(0);

  const galleryIndexToUse = deferThreeD && allImages.length > 0 ? 1 : 0;

  const handleSelectionSelectImpl = useCallback((selection: Selection, optionId?: string) => {
    const currentOptionId = optionId || activeOptionId;
    if (currentOptionId === 'size') {
      if (currentProductId !== selection.id) {
        if (isSelectingProduct.current) return;
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
    }
    setSelectedSelections(prev => {
      const newSelections = prev.filter(sel => sel.optionId !== currentOptionId);
      return [...newSelections, { optionId: currentOptionId || '', groupId: selection.groupId, selectionId: selection.id }];
    });
    sendMessageToIframe('SELECT_SELECTION', {
      optionId: currentOptionId,
      groupId: selection.groupId,
      selectionId: selection.id
    }, uniqueId);
    if (!hasSwitchedAfterDefer && galleryIndex === 1 && deferThreeD) {
      setHasSwitchedAfterDefer(true);
      setGalleryIndex(galleryIndexToUse);
    }
  }, [activeOptionId, currentProductId, galleryIndex, galleryIndexToUse, deferThreeD, hasSwitchedAfterDefer, uniqueId]);
  handleSelectionSelectRef.current = handleSelectionSelectImpl;

  // Iframe visibility follows `galleryIndex === galleryIndexToUse` (see IframeContainer). ProductCarousel
  // also jumped to the 3D slot when variants opened, but deferred / no-carousel / hidden preload UIs never
  // mount ProductCarousel, so galleryIndex stayed on a static image index while defer moved 3D to slot 1.
  useEffect(() => {
    if (!isVariantsOpen) return;
    setGalleryIndex(galleryIndexToUse);
  }, [isVariantsOpen, galleryIndexToUse, setGalleryIndex]);

  const contextValue: OV25UIContextType = {
    // Shadow DOM references
    shadowDOMs,
    cssString,
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
    galleryCarouselFullscreenImage,
    setGalleryCarouselFullscreenImage,
    configuratorTransitionProxyBitmap,
    configuratorTransitionProxyMode,
    configuratorClosingProxyRect,
    useInstantIframeCloseRestore,
    setConfiguratorTransitionProxyBitmap,
    setConfiguratorTransitionProxyMode,
    setConfiguratorClosingProxyRect,
    setUseInstantIframeCloseRestore,
    releaseConfiguratorTransitionProxy,
    stackedGalleryCloseSyncImmediateRef,
    arPreviewLink,
    error,
    canAnimate,
    animationState,
    iframeRef,
    isMobile,
    isProductGalleryStacked,
  carouselLayout,
  carouselLayoutMobile,
  carouselMaxImagesDesktop,
  carouselMaxImagesMobile,
  showCarousel,
    hasSwitchedAfterDefer,
    deferThreeD,
    configuratorGalleryIsDeferred,
    showOptional,
    hidePricing,
    hideAr,
    galleryIndexToUse,
    // Coming from injectConfigurator options
    productLink,
    apiKey,
    configurationUuid,
    bedAllowNoneQueryValue,
    currentBedSize,
    bedFilterSelectionsByCurrentSize,
    buyNowFunction: buyNowWithPayload,
    addToBasketFunction: addToBasketWithPayload,
    buySwatches,
    images,
    logoURL,
    mobileLogoURL,
    uniqueId,
    // Computed values
    currentProduct,
    sizeOption,
    activeOption: activeOption,
    availableProductFilters,
    optionHasVisibleFilters,
    showFilters,
    allOptions,
    allOptionsWithoutModules,
    searchQueries,
    selectedSwatches,
    swatchRulesData,
    isSwatchBookOpen,
    swatchBookFlash,
    setSwatchBookFlash,
    hasSelectionsWithSwatches,
    availableCameras,
    availableLights,
    isSnap2Mode,
    commercePriceSnapshot,
    isSnap2CheckoutSheetOpen,
    setIsSnap2CheckoutSheetOpen,
    snap2SaveResponse,
    isModalOpen,
    controlsHidden,
    hasConfigureButton: hasConfigureButtonState,
    useInlineVariantControls: isMobile ? (useInlineVariantControlsMobileProp ?? useInlineVariantControls) : useInlineVariantControls,
    configuratorDisplayMode,
    configuratorDisplayModeMobile: effectiveConfiguratorDisplayModeMobile,
    useSimpleVariantsSelector,
    configuratorTriggerStyle: isMobile ? (configuratorTriggerStyleMobileProp ?? configuratorTriggerStyle) : configuratorTriggerStyle,
    variantDisplayStyleMobile,
    variantDisplayStyleInline,
    variantDisplayStyleInlineMobile,
    variantDisplayStyleOverlay,
    variantDisplayStyleOverlayMobile,
    shareDialogTrigger,
    skipNextDrawerCloseRef,
    skipNextShareClickRef,
    expandToOptionIdOnOpen,
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
    openConfigurator,
    openConfiguratorOrSnap2,
    closeConfigurator,
    openSwatchBook,
    closeSwatchBook,
  };

  return (
    <OV25UIContext.Provider value={contextValue}>
      {children}
      {isSnap2Mode && <SaveSnap2Dialog />}
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