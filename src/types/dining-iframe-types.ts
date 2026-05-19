/**
 * Dining Configurator — iframe ↔ parent postMessage types.
 *
 * Mirror of OV25/types/dining-iframe-types.ts — kept in sync manually
 * until a shared package is introduced.
 */

// ---------------------------------------------------------------------------
// Schema version
// ---------------------------------------------------------------------------
export const DINING_SCHEMA_VERSION = 1;

// ---------------------------------------------------------------------------
// Message type string union
// ---------------------------------------------------------------------------

export type DiningOutboundMessageType =
  | 'DINING_CATALOG'
  | 'DINING_SCENE_STATE'
  | 'DINING_MENU_UI'
  | 'DINING_ERROR';

export type DiningInboundMessageType =
  | 'DINING_SELECT_TABLE'
  | 'DINING_SET_CHAIR_COUNT'
  | 'DINING_SET_MANUAL_SIDE_COUNTS'
  | 'DINING_TOGGLE_UNIQUE_SIDE'
  | 'DINING_SELECT_ATTACHMENT_POINT'
  | 'DINING_CLEAR_PICKING'
  | 'DINING_SELECT_SEAT_PRODUCT'
  | 'DINING_SELECT_OBJECT'
  | 'DINING_CLOSE_MODULE_MENU';

export type DiningMessageType = DiningOutboundMessageType | DiningInboundMessageType;

export const DINING_MESSAGE_TYPES: Record<DiningMessageType, DiningMessageType> = {
  DINING_CATALOG: 'DINING_CATALOG',
  DINING_SCENE_STATE: 'DINING_SCENE_STATE',
  DINING_MENU_UI: 'DINING_MENU_UI',
  DINING_ERROR: 'DINING_ERROR',
  DINING_SELECT_TABLE: 'DINING_SELECT_TABLE',
  DINING_SET_CHAIR_COUNT: 'DINING_SET_CHAIR_COUNT',
  DINING_SET_MANUAL_SIDE_COUNTS: 'DINING_SET_MANUAL_SIDE_COUNTS',
  DINING_TOGGLE_UNIQUE_SIDE: 'DINING_TOGGLE_UNIQUE_SIDE',
  DINING_SELECT_ATTACHMENT_POINT: 'DINING_SELECT_ATTACHMENT_POINT',
  DINING_CLEAR_PICKING: 'DINING_CLEAR_PICKING',
  DINING_SELECT_SEAT_PRODUCT: 'DINING_SELECT_SEAT_PRODUCT',
  DINING_SELECT_OBJECT: 'DINING_SELECT_OBJECT',
  DINING_CLOSE_MODULE_MENU: 'DINING_CLOSE_MODULE_MENU',
} as const;

// ---------------------------------------------------------------------------
// Compass / UI side types
// ---------------------------------------------------------------------------

export type CompassSide = 'north' | 'south' | 'east' | 'west';
export type DisplaySide = 'front' | 'back' | 'left' | 'right';
export type ChairSpaces = Record<CompassSide, number>;

// ---------------------------------------------------------------------------
// Catalog item
// ---------------------------------------------------------------------------

export interface DiningCatalogItem {
  productId: number;
  configId: number;
  modelId: number;
  name: string;
  description?: string | null;
  imageUrl: string | null;
  imageUrls?: {
    thumbnail?: string;
    small_image?: string;
    image?: string;
    hero?: string;
    original?: string;
  } | null;
  cutoutImage?: string | null;
  heroImage?: string | null;
  rangeId: number;
  type: 'table' | 'chair' | 'bench';
  minChairCount?: number;
  maxChairCount?: number;
  chairSpaces?: ChairSpaces;
  modelBreakpoints?: Array<{
    modelId: number;
    minChairCount: number;
    maxChairCount: number;
  }>;
  size?: number;
  minSize?: number;
  maxSize?: number;
  isHidden?: boolean;
}

// ---------------------------------------------------------------------------
// Outbound payloads (iframe → parent)
// ---------------------------------------------------------------------------

export interface DiningCatalogPayload {
  schemaVersion: number;
  tables: DiningCatalogItem[];
  chairs: DiningCatalogItem[];
  benches: DiningCatalogItem[];
}

export interface SideSeatAssignmentPayload {
  type: 'chair' | 'bench';
  productId: number;
  configId: number;
  modelPath: string;
}

export interface DiningSceneStatePayload {
  schemaVersion: number;
  table: {
    productId: number;
    modelId: number;
    configId: number;
    path: string;
  } | null;
  globalChairCount: number;
  manualChairCounts: Record<string, Partial<Record<CompassSide, number>>>;
  uniqueChairSides: DisplaySide[];
  sideAssignments: Partial<Record<CompassSide, SideSeatAssignmentPayload>>;
  selectedObject: string | null;
  selectedAttachmentPoint: {
    tableId: number;
    side: CompassSide;
    index: number;
  } | null;
  loading: Record<string, boolean>;
}

export interface DiningMenuUIPayload {
  schemaVersion: number;
  openAccordion: string;
  menuTabs: Record<string, 'select' | 'finish'>;
  hideEverything: boolean;
}

export interface DiningErrorPayload {
  schemaVersion: number;
  code?: string;
  message: string;
}

// ---------------------------------------------------------------------------
// Inbound payloads (parent → iframe)
// ---------------------------------------------------------------------------

export interface DiningSelectTablePayload {
  name?: string;
  productId?: number;
  configId?: number;
  modelId?: number;
  modelPath?: string;
}

export interface DiningSetChairCountPayload {
  count: number;
}

export interface DiningSetManualSideCountsPayload {
  tableConfigId: number;
  sides: Partial<Record<CompassSide, number>>;
}

export interface DiningToggleUniqueSidePayload {
  side: DisplaySide;
}

export interface DiningSelectAttachmentPointPayload {
  tableId: number;
  side: CompassSide;
  index: number;
}

export interface DiningSelectSeatProductPayload {
  name?: string;
  type?: 'chair' | 'bench';
  productId?: number;
  configId?: number;
  modelId?: number;
  modelPath?: string;
  side?: CompassSide;
}

export interface DiningSelectObjectPayload {
  path: string;
}
