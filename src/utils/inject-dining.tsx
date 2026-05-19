/**
 * injectDiningConfigurator — entry point for merchants to embed a dining
 * set builder on their product pages.
 *
 * Follows the same shadow-root / portal-replace pattern as
 * injectConfigurator in inject.tsx, but with a dining-specific
 * context and component tree.
 */

import React, { type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';
import { getSharedStylesheet, createuserCustomCssStylesheet } from './shadow-styles.js';
import { DiningUIProvider } from '../contexts/dining-ui-context.js';
import { DiningProductGallery } from '../components/dining/DiningProductGallery.js';
import { DiningSidebar } from '../components/dining/DiningSidebar.js';
import { DiningFullPageShell } from '../components/dining/DiningFullPageShell.js';
import type { DiningDisplayMode, InjectDiningConfiguratorOptions } from '../types/dining-inject-config.js';
import type { ElementSelector, StringOrFunction } from '../types/inject-config.js';
import { DINING_IFRAME_SHOW_ATTACHMENT_POINTS_QUERY_KEY } from './configurator-utils.js';
import { getConfiguratorBaseUrl } from './configurator-origin.js';
import { computeIsMobileViewport } from './viewport-mobile.js';

// ---------------------------------------------------------------------------
// Helpers (mirrored from inject.tsx)
// ---------------------------------------------------------------------------

const DINING_FULL_PAGE_BACKGROUND = '#ffffff';
const DINING_FULL_PAGE_SECONDARY_BACKGROUND = '#f8f8fb';
const DINING_FULL_PAGE_FONT_FAMILY = '"IBM Plex Sans", sans-serif';

let diningFullPageDefaultsStylesheet: CSSStyleSheet | null = null;

const getDiningFullPageDefaultsStylesheet = (): CSSStyleSheet => {
  if (!diningFullPageDefaultsStylesheet) {
    diningFullPageDefaultsStylesheet = new CSSStyleSheet();
    diningFullPageDefaultsStylesheet.replaceSync(`
      :host(.ov25-dining-full-page-host) {
        --ov25-background-color: ${DINING_FULL_PAGE_BACKGROUND};
        --ov25-secondary-background-color: ${DINING_FULL_PAGE_SECONDARY_BACKGROUND};
        --ov25-configurator-iframe-background-color: var(--ov25-background-color);
        --ov25-360-font-family: ${DINING_FULL_PAGE_FONT_FAMILY};
        --ov25-font-family: var(--ov25-360-font-family);

        background: var(--ov25-secondary-background-color);
        color: var(--ov25-text-color, #111111);
        font-family: var(--ov25-font-family);
      }
    `);
  }

  return diningFullPageDefaultsStylesheet;
};

const resolveStringOrFunction = (value: StringOrFunction): string =>
  typeof value === 'function' ? value() : value;

const getSelector = (elementSelector: ElementSelector | undefined): string | undefined => {
  if (!elementSelector) return undefined;
  return typeof elementSelector === 'string'
    ? elementSelector
    : 'selector' in elementSelector
      ? elementSelector.selector
      : 'id' in elementSelector
        ? (elementSelector as any).id
        : undefined;
};

const shouldReplace = (elementSelector: ElementSelector | undefined): boolean => {
  if (!elementSelector || typeof elementSelector === 'string') return false;
  return (elementSelector as any).replace === true;
};

const DEFAULT_DINING_GALLERY_MIN_HEIGHT = '400px';

const getDiningGalleryMinHeight = (target: Element): string => {
  if (!(target instanceof HTMLElement)) return DEFAULT_DINING_GALLERY_MIN_HEIGHT;

  const minHeight = window.getComputedStyle(target).minHeight;
  return minHeight && minHeight !== '0px' && minHeight !== 'auto'
    ? minHeight
    : DEFAULT_DINING_GALLERY_MIN_HEIGHT;
};

const applyDiningGalleryStyles = (element: HTMLElement, target: Element): void => {
  element.style.cssText = [
    'position:relative',
    'display:flex',
    'flex-direction:column',
    'width:100%',
    'height:100%',
    `min-height:${getDiningGalleryMinHeight(target)}`,
  ].join(';') + ';';
};

const applyDiningFullPageRootStyles = (element: HTMLElement, fixedViewport = true): void => {
  const viewportHeight = 'min(100svh, 100dvh)';
  element.style.cssText = [
    `position:${fixedViewport ? 'fixed' : 'relative'}`,
    fixedViewport ? 'inset:0' : '',
    `width:${fixedViewport ? '100vw' : '100%'}`,
    `height:${viewportHeight}`,
    `max-height:${viewportHeight}`,
    fixedViewport ? 'z-index:2147483644' : '',
    'display:block',
    'overflow:hidden',
    'background:var(--ov25-secondary-background-color, #f8f8fb)',
    'color:var(--ov25-text-color, #111111)',
    'font-family:var(--ov25-font-family, "IBM Plex Sans", sans-serif)',
  ].filter(Boolean).join(';') + ';';
};

const resolveResponsiveDiningDisplayMode = (
  displayMode: InjectDiningConfiguratorOptions['displayMode'],
  forceMobile: boolean,
): DiningDisplayMode => {
  const isMobile = computeIsMobileViewport({
    width: window.innerWidth,
    height: window.innerHeight,
    forceMobile,
    isSnap2: false,
  });
  if (!displayMode) return 'split';
  return isMobile
    ? displayMode.mobile ?? displayMode.desktop
    : displayMode.desktop;
};

// ---------------------------------------------------------------------------
// Iframe URL builder
// ---------------------------------------------------------------------------

export function getDiningIframeSrc(
  apiKey: string,
  diningConfiguratorId: string,
  hexBgColor?: string | null,
  showAttachmentPoints?: boolean | null,
): string {
  const baseUrl = getConfiguratorBaseUrl();
  const path = `dining-configurator/${diningConfiguratorId}`;

  const params = new URLSearchParams();

  // Inherit parent query params (missing keys only)
  new URLSearchParams(window.location.search).forEach((v, k) => {
    if (!params.has(k)) params.set(k, v);
  });

  if (hexBgColor) {
    const hexValue = hexBgColor.startsWith('#') ? hexBgColor.substring(1) : hexBgColor;
    params.set('hexBgColor', hexValue);
  }

  if (showAttachmentPoints === false) {
    params.set(DINING_IFRAME_SHOW_ATTACHMENT_POINTS_QUERY_KEY, 'false');
  }

  const qs = params.toString();
  return `${baseUrl}/${apiKey}/${path}${qs ? `?${qs}` : ''}`;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function injectDiningConfigurator(opts: InjectDiningConfiguratorOptions): void {
  const {
    apiKey: apiKeyInput,
    diningConfiguratorId: diningIdInput,
    selectors,
    callbacks,
    branding,
    flags,
    displayOptions,
    displayMode,
    uniqueId,
  } = opts;

  const cssString = branding?.cssString;
  const forceMobile = flags?.forceMobile ?? false;
  const resolvedDisplayMode = resolveResponsiveDiningDisplayMode(displayMode, forceMobile);

  // ---- Stylesheet setup ----
  const customCssStylesheet = cssString ? createuserCustomCssStylesheet(cssString) : undefined;
  const existingWindowStylesheets = Array.isArray((window as any).ov25adoptedStyleSheets)
    ? (window as any).ov25adoptedStyleSheets
    : [getSharedStylesheet()];
  if (customCssStylesheet && !existingWindowStylesheets.includes(customCssStylesheet)) {
    (window as any).ov25adoptedStyleSheets = [...existingWindowStylesheets, customCssStylesheet];
  }

  const getBaseShadowStylesheets = (): CSSStyleSheet[] => {
    const windowStylesheets = Array.isArray((window as any).ov25adoptedStyleSheets)
      ? (window as any).ov25adoptedStyleSheets
      : [getSharedStylesheet()];
    if (customCssStylesheet && !windowStylesheets.includes(customCssStylesheet)) {
      return [...windowStylesheets, customCssStylesheet];
    }
    return [...windowStylesheets];
  };

  const injectCSSIntoShadowDOM = (shadowRoot: ShadowRoot, includeDiningFullPageDefaults = false) => {
    const baseStylesheets = getBaseShadowStylesheets();
    shadowRoot.adoptedStyleSheets = includeDiningFullPageDefaults
      ? [baseStylesheets[0], getDiningFullPageDefaultsStylesheet(), ...baseStylesheets.slice(1)]
      : baseStylesheets;
  };

  // ---- Resolve values ----
  const resolvedApiKey = resolveStringOrFunction(apiKeyInput);
  const resolvedDiningId = resolveStringOrFunction(diningIdInput);
  const iframeSrc = getDiningIframeSrc(
    resolvedApiKey,
    resolvedDiningId,
    undefined,
    resolvedDisplayMode === 'full-page' ? false : displayOptions?.showAttachmentPoints,
  );

  // ---- Build portals ----
  const portals: ReactNode[] = [];
  let fullPageShadowRoot: ShadowRoot | undefined;

  if (resolvedDisplayMode === 'full-page') {
    const rootSel = getSelector(selectors?.root);
    let host: HTMLElement | null = null;

    if (rootSel) {
      const target = document.querySelector(rootSel);
      if (!target) {
        console.warn(`[OV25-UI Dining] Root element not found: "${rootSel}"`);
      } else if (shouldReplace(selectors?.root)) {
        host = document.createElement('div');
        host.className = `${target.className} ov25-dining-full-page-host`.trim();
        host.setAttribute('data-clarity-mask', 'true');
        applyDiningFullPageRootStyles(host, false);
        target.parentNode?.replaceChild(host, target);
      } else {
        host = document.createElement('div');
        host.className = 'ov25-dining-full-page-host';
        host.setAttribute('data-clarity-mask', 'true');
        applyDiningFullPageRootStyles(host, false);
        target.appendChild(host);
      }
    }

    if (!host) {
      const id = uniqueId ? `ov25-dining-full-page-root-${uniqueId}` : 'ov25-dining-full-page-root';
      host = document.getElementById(id) as HTMLElement | null;
      if (!host) {
        host = document.createElement('div');
        host.id = id;
        host.className = 'ov25-dining-full-page-host';
        host.setAttribute('data-clarity-mask', 'true');
        document.body.appendChild(host);
      }
      applyDiningFullPageRootStyles(host);
    }

    fullPageShadowRoot = host.shadowRoot ?? host.attachShadow({ mode: 'open' });
    injectCSSIntoShadowDOM(fullPageShadowRoot, true);
    portals.push(createPortal(<DiningFullPageShell />, fullPageShadowRoot));
  }

  // Gallery (iframe container — no shadow DOM, inherits page styles)
  const gallerySel = resolvedDisplayMode === 'split' ? getSelector(selectors?.gallery) : undefined;
  if (gallerySel) {
    const target = document.querySelector(gallerySel);
    if (target) {
      if (shouldReplace(selectors?.gallery)) {
        const div = document.createElement('div');
        div.className = `${target.className} ov25-dining-gallery`.trim();
        div.setAttribute('data-clarity-mask', 'true');
        applyDiningGalleryStyles(div, target);
        target.parentNode?.replaceChild(div, target);
        portals.push(createPortal(<DiningProductGallery />, div));
      } else {
        const column = document.createElement('div');
        column.className = 'ov25-dining-gallery';
        column.setAttribute('data-clarity-mask', 'true');
        applyDiningGalleryStyles(column, target);
        target.appendChild(column);
        portals.push(createPortal(<DiningProductGallery />, column));
      }
    } else {
      console.warn(`[OV25-UI Dining] Gallery element not found: "${gallerySel}"`);
    }
  }

  // Sidebar (shadow DOM isolated)
  const sidebarSel = resolvedDisplayMode === 'split' ? getSelector(selectors?.sidebar) : undefined;
  let sidebarShadowRoot: ShadowRoot | undefined;
  if (sidebarSel) {
    const target = document.querySelector(sidebarSel);
    if (target) {
      const host = document.createElement('div');
      host.className = `${target.className} ov25-dining-sidebar-host`.trim();
      host.setAttribute('data-clarity-mask', 'true');
      host.style.cssText = 'width:100%;height:100%;';

      if (shouldReplace(selectors?.sidebar)) {
        target.parentNode?.replaceChild(host, target);
      } else {
        target.appendChild(host);
      }

      sidebarShadowRoot = host.attachShadow({ mode: 'open' });
      injectCSSIntoShadowDOM(sidebarShadowRoot);
      portals.push(createPortal(<DiningSidebar />, sidebarShadowRoot));
    } else {
      console.warn(`[OV25-UI Dining] Sidebar element not found: "${sidebarSel}"`);
    }
  }

  // If no portals, bail
  if (portals.length === 0) {
    console.warn('[OV25-UI Dining] No portals created — check your selectors.');
    return;
  }

  // ---- React root ----
  const containerId = uniqueId
    ? `ov25-dining-provider-root-${uniqueId}`
    : 'ov25-dining-provider-root';
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.setAttribute('data-clarity-mask', 'true');
    container.style.display = 'contents';
    document.body.appendChild(container);
  }

  const root = (container as any)._reactRoot ?? createRoot(container);
  (container as any)._reactRoot = root;

  root.render(
    <DiningUIProvider
      uniqueId={uniqueId}
      cssString={cssString}
      forceMobile={forceMobile}
      displayMode={resolvedDisplayMode}
      includeStyleStep={resolvedDisplayMode === 'full-page'}
      callbacks={callbacks}
      logoURL={branding?.logoURL}
      mobileLogoURL={branding?.mobileLogoURL}
      styleImages={branding?.styleImages}
      hideLogo={branding?.hideLogo}
      hidePricing={flags?.hidePricing}
      disableAddToCart={flags?.disableAddToCart}
      hideAr={flags?.hideAr}
      currencySymbol={flags?.currencySymbol}
      shadowDOMs={{
        sidebar: sidebarShadowRoot,
        fullPage: fullPageShadowRoot,
      }}
    >
      {portals}
      {/* Set iframe src after mount */}
      <DiningIframeSrcSetter src={iframeSrc} uniqueId={uniqueId} />
    </DiningUIProvider>
  );
}

/**
 * Tiny component that sets the iframe src after mount (the iframe ref
 * is only available inside the DiningUIProvider context).
 */
import { useDiningUI } from '../contexts/dining-ui-context.js';

const DiningIframeSrcSetter: React.FC<{ src: string; uniqueId?: string }> = ({ src, uniqueId }) => {
  const { iframeRef } = useDiningUI();

  React.useEffect(() => {
    if (iframeRef.current && !iframeRef.current.src) {
      iframeRef.current.src = src;
    }
  }, [src, iframeRef]);

  return null;
};
