import {
  CONFIGURATOR_IFRAME_BACKGROUND_CSS_VAR,
  CONFIGURATOR_IFRAME_BACKGROUND_FALLBACK,
  CONFIGURATOR_IFRAME_BACKGROUND_PROBE_ID,
} from '../lib/config/iframe-transition-snapshot.js';

/**
 * Resolves configurator iframe-related nodes whether they live in light DOM or shadow roots
 * (variants shell, mobile drawer, modal portal).
 */
export function findElementByIdInShadowOrRegularDOM(id: string): HTMLElement | null {
  const element = document.getElementById(id);
  if (element) {
    return element;
  }

  if (id === 'ov25-configurator-variant-menu-container') {
    const variantsShadowContainer = document.getElementById('ov25-variants-shadow-container');
    if (variantsShadowContainer?.shadowRoot) {
      const elementInShadow = variantsShadowContainer.shadowRoot.getElementById(id);
      if (elementInShadow) {
        return elementInShadow;
      }
    }
  }

  const mobileDrawerContainer = document.getElementById('ov25-mobile-drawer-container');
  if (mobileDrawerContainer?.shadowRoot) {
    const elementInShadow = mobileDrawerContainer.shadowRoot.getElementById(id);
    if (elementInShadow) {
      return elementInShadow;
    }
  }

  const modalPortalContainer = document.getElementById('ov25-modal-portal-container');
  if (modalPortalContainer?.shadowRoot) {
    const elementInShadow = modalPortalContainer.shadowRoot.getElementById(id);
    if (elementInShadow) {
      return elementInShadow;
    }
  }

  const shadowHosts = document.querySelectorAll('div[class^="ov25-configurator-"]');

  for (const host of Array.from(shadowHosts)) {
    if (host.shadowRoot) {
      const elementInShadow = host.shadowRoot.getElementById(id);
      if (elementInShadow) {
        return elementInShadow;
      }

      const nestedHosts = host.shadowRoot.querySelectorAll('div[class^="ov25-configurator-"]');
      for (const nestedHost of Array.from(nestedHosts)) {
        if (nestedHost.shadowRoot) {
          const nestedElement = nestedHost.shadowRoot.getElementById(id);
          if (nestedElement) {
            return nestedElement;
          }
        }
      }
    }
  }

  return null;
}

/**
 * Resolved RGB/RGBA/hex string for canvas `fillStyle`, matching the iframe slot shell (not WebGL alpha).
 */
export function getResolvedConfiguratorIframeBackgroundColor(): string {
  if (typeof document === 'undefined') {
    return CONFIGURATOR_IFRAME_BACKGROUND_FALLBACK;
  }
  const probe = findElementByIdInShadowOrRegularDOM(CONFIGURATOR_IFRAME_BACKGROUND_PROBE_ID);
  if (probe) {
    const { backgroundColor } = getComputedStyle(probe);
    if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent') {
      return backgroundColor;
    }
  }
  const fromVar = getComputedStyle(document.documentElement)
    .getPropertyValue(CONFIGURATOR_IFRAME_BACKGROUND_CSS_VAR)
    .trim();
  if (fromVar) {
    return fromVar;
  }
  return CONFIGURATOR_IFRAME_BACKGROUND_FALLBACK;
}

export function findIframeWithUniqueId(uniqueId?: string): HTMLElement | null {
  const iframeId = uniqueId ? `ov25-configurator-iframe-${uniqueId}` : 'ov25-configurator-iframe';
  const fromDoc = document.getElementById(iframeId);
  if (fromDoc) return fromDoc;

  const mobileDrawerContainer = document.getElementById('ov25-mobile-drawer-container');
  if (mobileDrawerContainer?.shadowRoot) {
    const fromShadow = mobileDrawerContainer.shadowRoot.getElementById(iframeId);
    if (fromShadow) return fromShadow;
  }

  return null;
}

export interface ConfiguratorIframeScreenRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** Screen-space box of the iframe shell immediately before instant close restore (sheet / modal / drawer). */
export function getConfiguratorIframeContainerScreenRect(
  uniqueId: string | undefined,
  isProductGalleryStacked: boolean
): ConfiguratorIframeScreenRect | null {
  const containerId = uniqueId ? `ov25-configurator-iframe-container-${uniqueId}` : 'ov25-configurator-iframe-container';
  const id = isProductGalleryStacked ? 'true-ov25-configurator-iframe-container' : containerId;
  const el = findElementByIdInShadowOrRegularDOM(id);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width < 1 || r.height < 1) return null;
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}
