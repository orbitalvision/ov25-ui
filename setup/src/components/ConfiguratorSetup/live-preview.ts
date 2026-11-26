import type { ReactNode } from 'react';
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
  /**
   * Send the current draft to an already-open preview tab, without opening or focusing a tab. When provided, the
   * full editor updates the open preview by itself shortly after edits instead of offering "Update site preview".
   */
  onAutoUpdate?: (request: ConfiguratorSetupLivePreviewRequest) => void | Promise<void>;
  status?: 'idle' | 'ready' | 'error';
  /** Password screens may open for unlocking; readiness still requires a runtime acknowledgement. */
  availability?: 'checking' | 'supported' | 'unsupported' | 'unverified' | 'requires-unlock';
  /** Recheck availability without opening a storefront tab or saving settings. */
  onRetry?: () => void | Promise<void>;
  disabled?: boolean;
  message?: string;
  label?: string;
  /** Changes whenever the host's store, product or unsaved integration settings change. */
  contextKey?: string;
  /** Optional so plugins without placement validation continue to support draft previews. */
  placementValidation?: ConfiguratorSetupPlacementValidation;
  /** Open the preview tab now, during a click, so a later `onRequest` (after slow work) can fill it without a popup block. */
  onPrepareWindow?: () => void;
  /** Close a tab opened by `onPrepareWindow` that was never used. */
  onDiscardWindow?: () => void;
  /** True while a tab opened during an earlier click is waiting to be filled (an automatic match can fill it). */
  hasPreparedWindow?: () => boolean;
  /** Phone preview, shown as "View on phone" beside the guided Preview site button. */
  mobile?: ConfiguratorSetupMobilePreviewConfig;
}

export interface ConfiguratorSetupMobilePreviewConfig {
  /** Prepare the draft preview and return a link a phone can open. */
  onLink: (request: ConfiguratorSetupLivePreviewRequest) => Promise<string>;
  /** Hosts render the code so this package needs no QR dependency. */
  renderQrCode: (url: string) => ReactNode;
  /** Shown under the code, for example how a password-protected store behaves on a phone. */
  note?: string;
}
