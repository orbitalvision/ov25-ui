import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { sendMessageToIframe } from '../utils/configurator-utils.js';
import type {
  DiningCatalogPayload,
  DiningCatalogItem,
  DiningSceneStatePayload,
  DiningMenuUIPayload,
  DiningErrorPayload,
  DiningSelectTablePayload,
  DiningSetChairCountPayload,
  DiningSetManualSideCountsPayload,
  DiningToggleUniqueSidePayload,
  DiningSelectAttachmentPointPayload,
  DiningSelectSeatProductPayload,
  DiningSelectObjectPayload,
  CompassSide,
  DisplaySide,
  SideSeatAssignmentPayload,
} from '../types/dining-iframe-types.js';
import { DINING_MESSAGE_TYPES } from '../types/dining-iframe-types.js';
import { computeIsMobileViewport } from '../utils/viewport-mobile.js';
import type { ConfiguratorState, Selection } from './ov25-ui-context.js';
import type {
  DiningCallbacksConfig,
  DiningCommercePayload,
  DiningDisplayMode,
  DiningStyleImagesConfig,
} from '../types/dining-inject-config.js';
import type {
  UnifiedPricePayload,
  UnifiedSkuPayload,
} from '../types/inject-config.js';
import { normalizePricePayload, normalizeSkuPayload } from '../commerce/normalize-iframe-commerce.js';
import { applyDisplayCurrencySymbolToPricePayload, DEFAULT_CURRENCY_SYMBOL } from '../lib/config/currency-display.js';

// ---------------------------------------------------------------------------
// Step types
// ---------------------------------------------------------------------------

export type DiningStep = 'style' | 'table' | 'chairs' | 'review';
export type DiningBuilderMode = 'full-range' | 'mix-and-match';

const DINING_SPLIT_STEPS: DiningStep[] = ['table', 'chairs', 'review'];
const DINING_FULL_PAGE_STEPS: DiningStep[] = ['style', 'table', 'chairs', 'review'];

// ---------------------------------------------------------------------------
// Context type
// ---------------------------------------------------------------------------

export interface DiningUIContextType {
  // Shadow DOMs
  shadowDOMs?: {
    sidebar?: ShadowRoot;
    fullPage?: ShadowRoot;
    controls?: ShadowRoot;
  };
  cssString?: string;
  displayMode: DiningDisplayMode;
  logoURL?: string;
  mobileLogoURL?: string;
  styleImages?: DiningStyleImagesConfig;
  hideLogo: boolean;
  hidePricing: boolean;
  disableAddToCart: boolean;
  hideAr: boolean;

  // Catalog (from DINING_CATALOG)
  catalog: DiningCatalogPayload | null;
  tables: DiningCatalogItem[];
  chairs: DiningCatalogItem[];
  benches: DiningCatalogItem[];

  // Scene state (from DINING_SCENE_STATE)
  sceneState: DiningSceneStatePayload | null;
  selectedTableItem: DiningCatalogItem | null;
  globalChairCount: number;
  sideAssignments: Partial<Record<CompassSide, SideSeatAssignmentPayload>>;
  uniqueChairSides: DisplaySide[];
  selectedObject: string | null;
  selectedAttachmentPoint: { tableId: number; side: CompassSide; index: number } | null;
  loading: Record<string, boolean>;
  isAnyLoading: boolean;
  isReady: boolean;

  // Menu UI (from DINING_MENU_UI)
  menuUI: DiningMenuUIPayload | null;

  // Last error (from DINING_ERROR)
  lastError: DiningErrorPayload | null;

  // Commerce snapshots (standard OV25 CURRENT_SKU / CURRENT_PRICE messages)
  commerceSkuSnapshot: UnifiedSkuPayload | null;
  commercePriceSnapshot: UnifiedPricePayload | null;
  diningCommercePayload: DiningCommercePayload;

  // Stepper
  activeStep: DiningStep;
  setActiveStep: (step: DiningStep) => void;
  steps: DiningStep[];
  builderMode: DiningBuilderMode;
  setBuilderMode: (mode: DiningBuilderMode) => void;
  canAdvance: boolean;
  nextStep: () => void;
  prevStep: () => void;

  // Material/fabric (from standard CONFIGURATOR_STATE, piggybacking existing flow)
  configuratorState: ConfiguratorState | undefined;
  setConfiguratorState: React.Dispatch<React.SetStateAction<ConfiguratorState | undefined>>;

  // Actions (send commands to iframe)
  selectTable: (item: DiningCatalogItem) => void;
  setChairCount: (count: number) => void;
  setManualSideCounts: (tableConfigId: number, sides: Partial<Record<CompassSide, number>>) => void;
  toggleUniqueSide: (side: DisplaySide) => void;
  selectAttachmentPoint: (tableId: number, side: CompassSide, index: number) => void;
  clearPicking: () => void;
  selectSeatProduct: (item: DiningCatalogItem, side?: CompassSide) => void;
  selectObject: (path: string) => void;
  closeModuleMenu: () => void;
  viewInRoom: () => void;
  toggleDimensions: () => void;
  enlargeViewer: () => void;
  addToBasket: () => void;

  // Standard configurator selection (for material/fabric)
  handleSelectionSelect: (selection: Selection, optionId?: string) => void;

  // Iframe ref
  iframeRef: React.RefObject<HTMLIFrameElement>;
  isMobile: boolean;
  uniqueId?: string;
}

// ---------------------------------------------------------------------------
// Context + hook
// ---------------------------------------------------------------------------

const DiningUIContext = createContext<DiningUIContextType | undefined>(undefined);

export function useDiningUI(): DiningUIContextType {
  const ctx = useContext(DiningUIContext);
  if (!ctx) throw new Error('useDiningUI must be used within a DiningUIProvider');
  return ctx;
}

// ---------------------------------------------------------------------------
// Provider props
// ---------------------------------------------------------------------------

interface DiningUIProviderProps {
  children: React.ReactNode;
  uniqueId?: string;
  cssString?: string;
  forceMobile?: boolean;
  displayMode?: DiningDisplayMode;
  includeStyleStep?: boolean;
  callbacks?: DiningCallbacksConfig;
  logoURL?: string;
  mobileLogoURL?: string;
  styleImages?: DiningStyleImagesConfig;
  hideLogo?: boolean;
  hidePricing?: boolean;
  disableAddToCart?: boolean;
  hideAr?: boolean;
  currencySymbol?: string;
  shadowDOMs?: {
    sidebar?: ShadowRoot;
    fullPage?: ShadowRoot;
    controls?: ShadowRoot;
  };
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export const DiningUIProvider: React.FC<DiningUIProviderProps> = ({
  children,
  uniqueId,
  cssString,
  forceMobile = false,
  displayMode = 'split',
  includeStyleStep = false,
  callbacks,
  logoURL,
  mobileLogoURL,
  styleImages,
  hideLogo = false,
  hidePricing = false,
  disableAddToCart = false,
  hideAr = false,
  currencySymbol = DEFAULT_CURRENCY_SYMBOL,
  shadowDOMs,
}) => {
  // ---- State ----
  const [catalog, setCatalog] = useState<DiningCatalogPayload | null>(null);
  const [sceneState, setSceneState] = useState<DiningSceneStatePayload | null>(null);
  const [menuUI, setMenuUI] = useState<DiningMenuUIPayload | null>(null);
  const [lastError, setLastError] = useState<DiningErrorPayload | null>(null);
  const [activeStep, setActiveStep] = useState<DiningStep>(includeStyleStep ? 'style' : 'table');
  const [builderMode, setBuilderMode] = useState<DiningBuilderMode>('mix-and-match');
  const [configuratorState, setConfiguratorState] = useState<ConfiguratorState | undefined>(undefined);
  const [commerceSkuSnapshot, setCommerceSkuSnapshot] = useState<UnifiedSkuPayload | null>(null);
  const [commercePriceSnapshot, setCommercePriceSnapshot] = useState<UnifiedPricePayload | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null!);
  const latestSkuRef = useRef<UnifiedSkuPayload | null>(null);
  const latestPriceRef = useRef<UnifiedPricePayload | null>(null);
  const [isMobile, setIsMobile] = useState(
    computeIsMobileViewport({
      width: window.innerWidth,
      height: window.innerHeight,
      forceMobile,
      isSnap2: false,
    })
  );

  // ---- Responsive ----
  useEffect(() => {
    const onResize = () => {
      setIsMobile(
        computeIsMobileViewport({
          width: window.innerWidth,
          height: window.innerHeight,
          forceMobile,
          isSnap2: false,
        })
      );
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [forceMobile]);

  // ---- Derived from catalog ----
  const tables = useMemo(
    () => (catalog?.tables ?? []).filter(t => !t.isHidden),
    [catalog]
  );
  const chairs = useMemo(() => catalog?.chairs ?? [], [catalog]);
  const benches = useMemo(() => catalog?.benches ?? [], [catalog]);

  // ---- Derived from scene state ----
  const selectedTableItem = useMemo(() => {
    if (!sceneState?.table || !catalog) return null;
    return (
      catalog.tables.find(
        t => t.productId === sceneState.table!.productId && t.configId === sceneState.table!.configId
      ) ?? null
    );
  }, [sceneState?.table, catalog]);

  const globalChairCount = sceneState?.globalChairCount ?? 0;
  const sideAssignments = sceneState?.sideAssignments ?? {};
  const uniqueChairSides = sceneState?.uniqueChairSides ?? [];
  const selectedObject = sceneState?.selectedObject ?? null;
  const selectedAttachmentPoint = sceneState?.selectedAttachmentPoint ?? null;
  const loading = sceneState?.loading ?? {};
  const isAnyLoading = useMemo(
    () => Object.values(loading).some(v => v),
    [loading]
  );
  const [hasInitialReadyState, setHasInitialReadyState] = useState(false);
  const hasBootstrapMessages = catalog != null && sceneState != null && configuratorState != null;

  useEffect(() => {
    if (hasBootstrapMessages && !isAnyLoading) {
      setHasInitialReadyState(true);
    }
  }, [hasBootstrapMessages, isAnyLoading]);

  const steps = useMemo<DiningStep[]>(
    () => includeStyleStep ? DINING_FULL_PAGE_STEPS : DINING_SPLIT_STEPS,
    [includeStyleStep]
  );

  useEffect(() => {
    if (!steps.includes(activeStep)) {
      setActiveStep(steps[0]);
    }
  }, [activeStep, steps]);

  const diningCommercePayload = useMemo<DiningCommercePayload>(() => {
    const tableConfigId = sceneState?.table?.configId ?? selectedTableItem?.configId;
    const manualCounts =
      tableConfigId != null
        ? sceneState?.manualChairCounts?.[String(tableConfigId)] ?? {}
        : {};
    const seatsBySide = Object.entries(sideAssignments).flatMap(([side, assignment]) => {
      if (!assignment) return [];
      const item = [...chairs, ...benches].find(candidate =>
        candidate.productId === assignment.productId &&
        candidate.configId === assignment.configId
      );
      const count = assignment.type === 'bench'
        ? 1
        : Math.max(1, Number((manualCounts as Partial<Record<CompassSide, number>>)[side as CompassSide] ?? 1));
      return [{
        productId: assignment.productId,
        configId: assignment.configId,
        name: item?.name ?? assignment.type,
        count,
        side,
      }];
    });

    return {
      table: selectedTableItem
        ? {
            productId: selectedTableItem.productId,
            configId: selectedTableItem.configId,
            name: selectedTableItem.name,
          }
        : null,
      chairs: seatsBySide,
      totalItems: (selectedTableItem ? 1 : 0) + seatsBySide.reduce((sum, item) => sum + item.count, 0),
    };
  }, [benches, chairs, sceneState?.manualChairCounts, sceneState?.table?.configId, selectedTableItem, sideAssignments]);

  // ---- Stepper ----
  const canAdvance = useMemo(() => {
    switch (activeStep) {
      case 'style':
        return true;
      case 'table':
        return selectedTableItem != null;
      case 'chairs':
        return Object.keys(sideAssignments).length > 0;
      case 'review':
        return true;
      default:
        return false;
    }
  }, [activeStep, selectedTableItem, sideAssignments]);

  const nextStep = useCallback(() => {
    const idx = steps.indexOf(activeStep);
    if (idx < steps.length - 1) {
      setActiveStep(steps[idx + 1]);
    }
  }, [activeStep, steps]);

  const prevStep = useCallback(() => {
    const idx = steps.indexOf(activeStep);
    if (idx > 0) {
      setActiveStep(steps[idx - 1]);
    }
  }, [activeStep, steps]);

  // ---- Send helper ----
  const send = useCallback(
    (type: string, payload: any) => {
      const iframe = iframeRef.current;
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage({ type, payload: JSON.stringify(payload) }, '*');
        return;
      }
      sendMessageToIframe(type, payload, uniqueId);
    },
    [uniqueId]
  );

  // ---- Actions (parent → iframe) ----
  const selectTable = useCallback(
    (item: DiningCatalogItem) => {
      const payload: DiningSelectTablePayload = {
        name: item.name,
        productId: item.productId,
        configId: item.configId,
        modelId: item.modelId,
      };
      send(DINING_MESSAGE_TYPES.DINING_SELECT_TABLE, payload);
    },
    [send]
  );

  const setChairCount = useCallback(
    (count: number) => {
      const payload: DiningSetChairCountPayload = { count };
      send(DINING_MESSAGE_TYPES.DINING_SET_CHAIR_COUNT, payload);
    },
    [send]
  );

  const setManualSideCounts = useCallback(
    (tableConfigId: number, sides: Partial<Record<CompassSide, number>>) => {
      const payload: DiningSetManualSideCountsPayload = { tableConfigId, sides };
      send(DINING_MESSAGE_TYPES.DINING_SET_MANUAL_SIDE_COUNTS, payload);
    },
    [send]
  );

  const toggleUniqueSide = useCallback(
    (side: DisplaySide) => {
      const payload: DiningToggleUniqueSidePayload = { side };
      send(DINING_MESSAGE_TYPES.DINING_TOGGLE_UNIQUE_SIDE, payload);
    },
    [send]
  );

  const selectAttachmentPoint = useCallback(
    (tableId: number, side: CompassSide, index: number) => {
      const payload: DiningSelectAttachmentPointPayload = { tableId, side, index };
      send(DINING_MESSAGE_TYPES.DINING_SELECT_ATTACHMENT_POINT, payload);
    },
    [send]
  );

  const clearPicking = useCallback(() => {
    send(DINING_MESSAGE_TYPES.DINING_CLEAR_PICKING, {});
  }, [send]);

  const selectSeatProduct = useCallback(
    (item: DiningCatalogItem, side?: CompassSide) => {
      const payload: DiningSelectSeatProductPayload = {
        name: item.name,
        type: item.type as 'chair' | 'bench',
        productId: item.productId,
        configId: item.configId,
        modelId: item.modelId,
        side,
      };
      send(DINING_MESSAGE_TYPES.DINING_SELECT_SEAT_PRODUCT, payload);
    },
    [send]
  );

  const selectObject = useCallback(
    (path: string) => {
      const payload: DiningSelectObjectPayload = { path };
      send(DINING_MESSAGE_TYPES.DINING_SELECT_OBJECT, payload);
    },
    [send]
  );

  const closeModuleMenu = useCallback(() => {
    send(DINING_MESSAGE_TYPES.DINING_CLOSE_MODULE_MENU, {});
  }, [send]);

  // Standard material/fabric selection (via existing CONFIGURATOR_STATE + SELECT_SELECTION)
  const handleSelectionSelect = useCallback(
    (selection: Selection, optionId?: string) => {
      if (!optionId || !selection.groupId) return;
      send('SELECT_SELECTION', { optionId, groupId: selection.groupId, selectionId: selection.id });
    },
    [send]
  );

  const viewInRoom = useCallback(() => {
    send('ENTER_AR', {});
  }, [send]);

  const toggleDimensions = useCallback(() => {
    send('VIEW_DIMENSIONS', { dimensions: true, styles: cssString });
  }, [cssString, send]);

  const enlargeViewer = useCallback(() => {
    const container = iframeRef.current?.parentElement;
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
      return;
    }
    container.requestFullscreen?.().catch(error => {
      console.error('[DiningUI] Failed to enter fullscreen:', error);
    });
  }, []);

  // ---- Inbound message listener ----
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; payload?: string } | null;
      if (!data || typeof data.type !== 'string') return;

      let payload: any;
      try {
        payload = typeof data.payload === 'string' ? JSON.parse(data.payload) : data.payload;
      } catch {
        return;
      }

      switch (data.type) {
        case DINING_MESSAGE_TYPES.DINING_CATALOG:
          setCatalog(payload as DiningCatalogPayload);
          break;

        case DINING_MESSAGE_TYPES.DINING_SCENE_STATE:
          setSceneState(payload as DiningSceneStatePayload);
          break;

        case DINING_MESSAGE_TYPES.DINING_MENU_UI:
          setMenuUI(payload as DiningMenuUIPayload);
          break;

        case DINING_MESSAGE_TYPES.DINING_ERROR:
          setLastError(payload as DiningErrorPayload);
          console.error('[DiningUI] Error from iframe:', (payload as DiningErrorPayload).message);
          break;

        // Also handle standard CONFIGURATOR_STATE for material/fabric options
        case 'CONFIGURATOR_STATE':
          setConfiguratorState(payload as ConfiguratorState);
          break;

        case 'CURRENT_SKU': {
          const nextSku = normalizeSkuPayload(payload);
          latestSkuRef.current = nextSku;
          setCommerceSkuSnapshot(nextSku);
          break;
        }

        case 'CURRENT_PRICE': {
          const normalized = normalizePricePayload(payload);
          const nextPrice = normalized
            ? applyDisplayCurrencySymbolToPricePayload(normalized, currencySymbol)
            : null;
          latestPriceRef.current = nextPrice;
          setCommercePriceSnapshot(nextPrice);
          break;
        }

        default:
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [currencySymbol]);

  const addToBasket = useCallback(() => {
    if (disableAddToCart) return;
    callbacks?.addToBasket?.({
      ...diningCommercePayload,
      skus: latestSkuRef.current ?? commerceSkuSnapshot,
      price: latestPriceRef.current ?? commercePriceSnapshot,
      dining: diningCommercePayload,
      table: diningCommercePayload.table,
      globalChairCount,
      sideAssignments: Object.fromEntries(
        Object.entries(sideAssignments)
          .filter(([, assignment]) => assignment != null)
          .map(([side, assignment]) => [
            side,
            {
              type: assignment!.type,
              productId: assignment!.productId,
              configId: assignment!.configId,
            },
          ])
      ),
    });
  }, [
    callbacks,
    commercePriceSnapshot,
    commerceSkuSnapshot,
    diningCommercePayload,
    disableAddToCart,
    globalChairCount,
    sideAssignments,
  ]);

  useEffect(() => {
    callbacks?.onChange?.({
      ...diningCommercePayload,
      skus: commerceSkuSnapshot,
      price: commercePriceSnapshot,
      dining: diningCommercePayload,
      table: diningCommercePayload.table,
      globalChairCount,
      sideAssignments: Object.fromEntries(
        Object.entries(sideAssignments)
          .filter(([, assignment]) => assignment != null)
          .map(([side, assignment]) => [
            side,
            {
              type: assignment!.type,
              productId: assignment!.productId,
              configId: assignment!.configId,
            },
          ])
      ),
    });
  }, [
    callbacks,
    commercePriceSnapshot,
    commerceSkuSnapshot,
    diningCommercePayload,
    globalChairCount,
    sideAssignments,
  ]);

  // ---- Context value ----
  const value = useMemo<DiningUIContextType>(
    () => ({
      shadowDOMs,
      cssString,
      displayMode,
      logoURL,
      mobileLogoURL,
      styleImages,
      hideLogo,
      hidePricing,
      disableAddToCart,
      hideAr,
      catalog,
      tables,
      chairs,
      benches,
      sceneState,
      selectedTableItem,
      globalChairCount,
      sideAssignments,
      uniqueChairSides,
      selectedObject,
      selectedAttachmentPoint,
      loading,
      isAnyLoading,
      isReady: hasInitialReadyState,
      menuUI,
      lastError,
      commerceSkuSnapshot,
      commercePriceSnapshot,
      diningCommercePayload,
      activeStep,
      setActiveStep,
      steps,
      builderMode,
      setBuilderMode,
      canAdvance,
      nextStep,
      prevStep,
      configuratorState,
      setConfiguratorState,
      selectTable,
      setChairCount,
      setManualSideCounts,
      toggleUniqueSide,
      selectAttachmentPoint,
      clearPicking,
      selectSeatProduct,
      selectObject,
      closeModuleMenu,
      viewInRoom,
      toggleDimensions,
      enlargeViewer,
      addToBasket,
      handleSelectionSelect,
      iframeRef,
      isMobile,
      uniqueId,
    }),
    [
      shadowDOMs,
      cssString,
      displayMode,
    logoURL,
    mobileLogoURL,
    styleImages,
    hideLogo,
      hidePricing,
      disableAddToCart,
      hideAr,
      catalog,
      tables,
      chairs,
      benches,
      sceneState,
      selectedTableItem,
      globalChairCount,
      sideAssignments,
      uniqueChairSides,
      selectedObject,
      selectedAttachmentPoint,
      loading,
      isAnyLoading,
      hasInitialReadyState,
      menuUI,
      lastError,
      commerceSkuSnapshot,
      commercePriceSnapshot,
      diningCommercePayload,
      activeStep,
      steps,
      builderMode,
      canAdvance,
      nextStep,
      prevStep,
      configuratorState,
      selectTable,
      setChairCount,
      setManualSideCounts,
      toggleUniqueSide,
      selectAttachmentPoint,
      clearPicking,
      selectSeatProduct,
      selectObject,
      closeModuleMenu,
      viewInRoom,
      toggleDimensions,
      enlargeViewer,
      addToBasket,
      handleSelectionSelect,
      isMobile,
      uniqueId,
    ]
  );

  return (
    <DiningUIContext.Provider value={value}>
      {children}
    </DiningUIContext.Provider>
  );
};
