import type { ConfiguratorSetupPayload } from './initial-config-from-payload';
import type { PreviewLayoutType } from './types';

export interface ConfiguratorSetupLivePreviewRequest {
  payload: ConfiguratorSetupPayload;
  activeLayout: PreviewLayoutType;
}

export type ConfiguratorSetupPlacementKey = 'gallery' | 'variants' | 'price' | 'name' | 'swatches' | 'configureButton' | 'headerSelector' | 'desktopCarouselSelector' | 'mobileCarouselSelector' | 'addToCartFormSelector';
export type ConfiguratorSetupPlacementStatus = 'matched' | 'missing' | 'ambiguous' | 'hidden' | 'unsafe' | 'invalid' | 'unverified' | 'not-required';
export type ConfiguratorSetupPlacementIssue = 'missing-selector' | 'no-match' | 'multiple-matches' | 'not-visible' | 'invalid-selector' | 'outside-product' | 'unknown-product-scope' | 'overlapping-targets' | 'unsafe-target' | 'disabled' | 'not-configured' | 'viewport-inactive' | 'template-mismatch' | 'context-unverified';

export interface ConfiguratorSetupPlacementCheck {
  key: ConfiguratorSetupPlacementKey;
  selector: string;
  status: ConfiguratorSetupPlacementStatus;
  /** 101 means at least 101 matches; storefront reports are bounded. */
  matchCount: number;
  issues: ConfiguratorSetupPlacementIssue[];
}

/** A pre-mount check of one draft on one actual storefront page and viewport. */
export interface ConfiguratorSetupPlacementValidation {
  schemaVersion: 1;
  themeId: string | null;
  template: string | null;
  viewport: { width: number; height: number; mode: 'desktop' | 'mobile' };
  checks: ConfiguratorSetupPlacementCheck[];
  sessionId: string;
  revision: number;
  validationRunId: string;
  checkedAt: number;
  activeLayout: PreviewLayoutType;
  shopDomain: string;
  productId: string;
}

/** Hosts own the storefront session and report readiness only after acknowledgement. */
export interface ConfiguratorSetupLivePreviewConfig {
  onRequest: (request: ConfiguratorSetupLivePreviewRequest) => void | Promise<void>;
  status?: 'idle' | 'ready' | 'error';
  /** Hosts verify availability before allowing a storefront tab to open. */
  availability?: 'checking' | 'supported' | 'unsupported' | 'unverified';
  /** Recheck availability without opening a storefront tab or saving settings. */
  onRetry?: () => void | Promise<void>;
  disabled?: boolean;
  message?: string;
  label?: string;
  /** Changes whenever the host's store, product or unsaved integration settings change. */
  contextKey?: string;
  /** Optional so plugins without placement validation continue to support draft previews. */
  placementValidation?: ConfiguratorSetupPlacementValidation;
}
