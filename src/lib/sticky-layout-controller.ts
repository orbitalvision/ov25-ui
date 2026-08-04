/**
 * Measurement and compatibility engine for normal-product `inline-sticky` layouts.
 * It detects client headers, calculates viewport geometry, diagnoses/repairs sticky-blocking
 * ancestors, and publishes owned CSS variables plus a fallback snapshot as the page changes.
 * It does not render UI or relocate the gallery host; `useStickyHostRelocation` consumes its
 * fallback decision. Destroying the controller removes observers and restores owned mutations.
 */
export const STICKY_LAYOUT_CSS_PROPERTIES = {
  headerOffset: '--ov25-sticky-header-offset',
  sizingHeaderOffset: '--ov25-sticky-sizing-header-offset',
  resolvedTopGap: '--ov25-sticky-resolved-top-gap',
  resolvedBottomGap: '--ov25-sticky-resolved-bottom-gap',
  top: '--ov25-sticky-top',
  availableHeight: '--ov25-sticky-available-height',
  optionHeaderHeight: '--ov25-sticky-option-header-height',
  galleryBottom: '--ov25-sticky-gallery-bottom',
  viewportWidth: '--ov25-sticky-viewport-width',
} as const;

export const DEFAULT_STICKY_GAP = 16;

type StickyLayoutCssProperty =
  (typeof STICKY_LAYOUT_CSS_PROPERTIES)[keyof typeof STICKY_LAYOUT_CSS_PROPERTIES];

type StickyLayoutOwnedCssVariables = Record<StickyLayoutCssProperty, string>;

// Omit the dynamic runtime ones
export type StickyLayoutCssVariables = Omit<
  StickyLayoutOwnedCssVariables,
  | (typeof STICKY_LAYOUT_CSS_PROPERTIES)['galleryBottom']
  | (typeof STICKY_LAYOUT_CSS_PROPERTIES)['sizingHeaderOffset']
  | (typeof STICKY_LAYOUT_CSS_PROPERTIES)['viewportWidth']
>;

export type StickyHeaderStatus = 'resolved' | 'not-found';
export type StickyHeaderSource = 'override' | 'auto' | 'auto-fallback';

export const STICKY_HEADER_STRONG_CANDIDATE_SELECTORS = [
  '.shopify-section-group-header-group',
  '[data-ov25-header]',
  '[id^="shopify-section-"][id$="__header"]',
  '#header-group',
  '#header-component',
  '#HeaderWrapper',
  '#SiteHeader',
  '#site-header',
  '[data-header-wrapper]',
  '[data-section-type="header"]',
  '#shopify-section-header',
  'header.site-header',
  'header.theme__header',
  '#header',
  'sticky-header',
] as const;

export const STICKY_HEADER_SEMANTIC_FALLBACK_SELECTORS = [
  'header[role="banner"]',
  'body > header',
] as const;

export interface StickyHeaderDetectionOptions {
  viewportWidth?: number;
  viewportHeight?: number;
  scrollY?: number;
  readStyle?: StickyStyleReader;
}

export interface StickyHeaderResolution {
  status: StickyHeaderStatus;
  source: StickyHeaderSource;
  selector?: string;
  elements: Element[];
  error?: unknown;
  overrideSelector?: string;
  overrideError?: unknown;
}

export type StickyStyleReader = (element: Element) => CSSStyleDeclaration | null;

function normalizePixelValue(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value * 100) / 100);
}

function toPixels(value: number): string {
  return `${normalizePixelValue(value)}px`;
}

function toViewportPixels(value: number): string {
  const finiteValue = Number.isFinite(value) ? value : 0;
  return `${Math.round(finiteValue * 100) / 100}px`;
}

export function createStickyLayoutCssVariables(
  headerOffset: number,
  optionHeaderHeight: number,
  topGap = DEFAULT_STICKY_GAP,
  bottomGap = DEFAULT_STICKY_GAP,
): StickyLayoutCssVariables {
  return {
    [STICKY_LAYOUT_CSS_PROPERTIES.headerOffset]: toPixels(headerOffset),
    [STICKY_LAYOUT_CSS_PROPERTIES.resolvedTopGap]: toPixels(topGap),
    [STICKY_LAYOUT_CSS_PROPERTIES.resolvedBottomGap]: toPixels(bottomGap),
    [STICKY_LAYOUT_CSS_PROPERTIES.top]:
      'calc(var(--ov25-sticky-header-offset, 0px) + var(--ov25-sticky-resolved-top-gap, 16px))',
    [STICKY_LAYOUT_CSS_PROPERTIES.availableHeight]:
      'calc(100dvh - var(--ov25-sticky-sizing-header-offset, var(--ov25-sticky-header-offset, 0px)) - var(--ov25-sticky-resolved-top-gap, 16px) - var(--ov25-sticky-resolved-bottom-gap, 16px))',
    [STICKY_LAYOUT_CSS_PROPERTIES.optionHeaderHeight]: toPixels(optionHeaderHeight),
  };
}

export function resolveStickyHeaderElements(
  root: ParentNode,
  selector: string | undefined,
  detectionOptions: StickyHeaderDetectionOptions = {},
): StickyHeaderResolution {
  const normalizedSelector = selector?.trim();
  if (!normalizedSelector) {
    return detectStickyHeaderElements(root, detectionOptions);
  }

  try {
    const elements = Array.from(root.querySelectorAll(normalizedSelector));
    return {
      status: elements.length > 0 ? 'resolved' : 'not-found',
      source: 'override',
      selector: normalizedSelector,
      elements,
    };
  } catch (error) {
    const fallback = detectStickyHeaderElements(root, detectionOptions);
    return {
      ...fallback,
      source: 'auto-fallback',
      overrideSelector: normalizedSelector,
      overrideError: error,
    };
  }
}

function defaultStyleReader(element: Element): CSSStyleDeclaration | null {
  return element.ownerDocument.defaultView?.getComputedStyle(element) ?? null;
}

function documentForRoot(root: ParentNode): Document | null {
  if ((root as Node).nodeType === 9) return root as Document;
  return (root as Element | DocumentFragment).ownerDocument ?? null;
}

function elementOrShadowHostParent(element: Element): Element | null {
  if (element.parentElement) return element.parentElement;
  const root = element.getRootNode();
  return 'host' in root && root.host instanceof Element ? root.host : null;
}

/** Injector-created wrappers must carry this marker before sticky repairs may mutate them. */
export const OV25_INJECTOR_OWNED_ATTRIBUTE = 'data-ov25-injector-owned';

function hasOv25RuntimeSubtreeMarker(element: Element): boolean {
  const id = element.id.toLowerCase();
  if (id.startsWith('ov25') || id.startsWith('ov-25')) return true;
  if (Array.from(element.classList).some((name) => name.toLowerCase().startsWith('ov25-'))) {
    return true;
  }
  return element
    .getAttributeNames()
    .some((name) => name.startsWith('data-ov25') && name !== 'data-ov25-header');
}

/** True only when this element itself carries the explicit injector ownership marker. */
export function isOv25OwnedElement(element: Element): boolean {
  return element.hasAttribute(OV25_INJECTOR_OWNED_ATTRIBUTE);
}

function isInsideOv25Subtree(element: Element): boolean {
  let current: Element | null = element;
  while (current) {
    if (hasOv25RuntimeSubtreeMarker(current)) return true;
    current = elementOrShadowHostParent(current);
  }
  return false;
}

function isInsideExcludedHeaderRegion(element: Element): boolean {
  return Boolean(
    element.closest(
      'main, [role="main"], footer, dialog, [role="dialog"], [aria-modal="true"], [data-drawer], [data-modal]',
    ),
  );
}

function hasHiddenState(element: Element): boolean {
  return Boolean(element.closest('[hidden], [inert], [aria-hidden="true"]'));
}

// Elements with styles such as display: none should not be considered as a header candidate.
function hasNonRenderedStyle(
  element: Element,
  readStyle: StickyStyleReader,
): boolean {
  let current: Element | null = element;
  while (current) {
    const style = readStyle(current);
    if (
      style?.display === 'none' ||
      style?.visibility === 'hidden' ||
      style?.visibility === 'collapse' ||
      Number.parseFloat(style?.opacity ?? '') <= 0.01 ||
      style?.getPropertyValue('content-visibility') === 'hidden'
    ) {
      return true;
    }
    current = elementOrShadowHostParent(current);
  }
  return false;
}

function isRenderedHeaderCandidate(
  element: Element,
  viewportWidth: number,
  viewportHeight: number,
  readStyle: StickyStyleReader,
): boolean {
  if (!element.isConnected || isInsideOv25Subtree(element)) return false;
  if (isInsideExcludedHeaderRegion(element) || hasHiddenState(element)) return false;

  const rect = element.getBoundingClientRect();
  if (!isVisibleHeaderRect(element, rect, viewportHeight, readStyle)) return false;
  if (!Number.isFinite(rect.left) || !Number.isFinite(rect.right)) return false;
  if (rect.right <= 0 || rect.left >= viewportWidth) return false;
  const topRegionBottom = Math.min(320, Math.max(160, viewportHeight * 0.35));
  if (rect.top >= topRegionBottom) return false;
  const minimumWidth = Math.min(320, viewportWidth * 0.5);
  if (rect.width < minimumWidth) return false;
  const maximumHeight = Math.min(420, viewportHeight * 0.6);
  if (rect.height > maximumHeight) return false;
  return true;
}

function isPlausibleSemanticHeader(
  element: Element,
  scrollY: number,
  readStyle: StickyStyleReader,
): boolean {
  const style = readStyle(element);
  if (style?.position === 'fixed' || style?.position === 'sticky') return true;
  const rect = element.getBoundingClientRect();
  const documentTop = rect.top + scrollY;
  return documentTop <= Math.max(200, rect.height * 2);
}

function queryCandidateElements(root: ParentNode, selectors: readonly string[]): Element[] {
  return Array.from(root.querySelectorAll(selectors.join(',')));
}

/**
 * Audited Shopify/theme header detection. Strong selectors cover Dawn, Horizon, and current client
 * themes; semantic fallbacks require fixed/sticky positioning or an origin near document top.
 */
export function detectStickyHeaderElements(
  root: ParentNode,
  options: StickyHeaderDetectionOptions = {},
): StickyHeaderResolution {
  const documentObject = documentForRoot(root);
  const windowObject = documentObject?.defaultView;
  const viewportWidth = normalizePixelValue(
    options.viewportWidth ?? windowObject?.visualViewport?.width ?? windowObject?.innerWidth ?? 0,
  );
  const viewportHeight = normalizePixelValue(
    options.viewportHeight ?? windowObject?.visualViewport?.height ?? windowObject?.innerHeight ?? 0,
  );
  const scrollY = normalizePixelValue(
    options.scrollY ?? windowObject?.scrollY ?? documentObject?.documentElement.scrollTop ?? 0,
  );
  const readStyle = options.readStyle ?? defaultStyleReader;
  if (viewportWidth === 0 || viewportHeight === 0) {
    return { status: 'not-found', source: 'auto', elements: [] };
  }

  const strong = queryCandidateElements(root, STICKY_HEADER_STRONG_CANDIDATE_SELECTORS);
  const semantic = queryCandidateElements(root, STICKY_HEADER_SEMANTIC_FALLBACK_SELECTORS).filter(
    (element) => isPlausibleSemanticHeader(element, scrollY, readStyle),
  );
  const elements = [...new Set([...strong, ...semantic])].filter((element) =>
    isRenderedHeaderCandidate(element, viewportWidth, viewportHeight, readStyle),
  );

  return {
    status: elements.length > 0 ? 'resolved' : 'not-found',
    source: 'auto',
    elements,
  };
}

// Measures the part of the header that is visible on the screen.
function isVisibleHeaderRect(
  element: Element,
  rect: DOMRect,
  viewportHeight: number,
  readStyle: StickyStyleReader,
): boolean {
  if (hasHiddenState(element)) return false;
  if (!Number.isFinite(rect.width) || !Number.isFinite(rect.height)) return false;
  if (rect.width <= 0 || rect.height <= 0) return false;
  if (!Number.isFinite(rect.top) || !Number.isFinite(rect.bottom)) return false;
  if (rect.bottom <= 0 || rect.top >= viewportHeight) return false;

  return !hasNonRenderedStyle(element, readStyle);
}

/** Largest visible matched header bottom, clamped to the current viewport. */
export function getLargestVisibleHeaderBottom(
  elements: Iterable<Element>,
  viewportHeight: number,
  readStyle: StickyStyleReader = defaultStyleReader,
): number {
  const maxViewportHeight = normalizePixelValue(viewportHeight);
  if (maxViewportHeight === 0) return 0;

  let largestBottom = 0;
  for (const element of elements) {
    const rect = element.getBoundingClientRect();
    if (!isVisibleHeaderRect(element, rect, maxViewportHeight, readStyle)) continue;
    largestBottom = Math.max(largestBottom, Math.min(rect.bottom, maxViewportHeight));
  }
  return normalizePixelValue(largestBottom);
}

/** Safe composition used when callers only need the current offset. */
export function measureStickyHeaderOffset(
  root: ParentNode,
  selector: string | undefined,
  viewportHeight: number,
  readStyle: StickyStyleReader = defaultStyleReader,
  viewportWidth?: number,
): number {
  const resolution = resolveStickyHeaderElements(root, selector, {
    viewportHeight,
    viewportWidth,
    readStyle,
  });
  return getLargestVisibleHeaderBottom(resolution.elements, viewportHeight, readStyle);
}

function measureElementHeight(
  element: HTMLElement | null,
  readStyle: StickyStyleReader,
): number {
  if (!element?.isConnected || element.hasAttribute('hidden')) return 0;
  if (hasHiddenState(element) || hasNonRenderedStyle(element, readStyle)) {
    return 0;
  }
  return normalizePixelValue(element.getBoundingClientRect().height);
}

export type StickyBlockingReason =
  | 'vertical-scroll-container'
  | 'vertical-overflow-clipping'
  | 'constrained-height'
  | 'contain-layout'
  | 'contain-paint'
  | 'transform-containing-block'
  | 'flex-grid-stretch'
  | 'insufficient-sticky-travel';

export interface StickyBlockingAncestor {
  element: HTMLElement;
  reasons: StickyBlockingReason[];
  ownedByOv25: boolean;
  repairable: boolean;
}

export interface StickyAncestorInspection {
  host: HTMLElement;
  ancestors: HTMLElement[];
  blockers: StickyBlockingAncestor[];
  ownedBlockers: StickyBlockingAncestor[];
  externalBlockers: StickyBlockingAncestor[];
  requiresBodyFallback: boolean;
}

function cssProperty(style: CSSStyleDeclaration, property: string): string {
  return style.getPropertyValue(property).trim();
}

/** Resolves the vertical overflow value that determines the nearest sticky scroll/clipping box. */
function effectiveOverflowY(style: CSSStyleDeclaration): string {
  return (style.overflowY || style.overflow || 'visible').trim().toLowerCase();
}

function effectiveOverflowX(style: CSSStyleDeclaration): string {
  return (style.overflowX || style.overflow || 'visible').trim().toLowerCase();
}

/** Detects explicit max-height or clipped overflowing content that can shorten sticky travel. */
function isConstrainedHeight(
  element: HTMLElement,
  style: CSSStyleDeclaration,
  ignoreOverflowConstraint = false,
): boolean {
  const maxHeight = (style.maxHeight || cssProperty(style, 'max-height')).trim().toLowerCase();
  if (maxHeight !== '' && maxHeight !== 'none' && maxHeight !== 'max-content') return true;
  if (ignoreOverflowConstraint) return false;
  return (
    element.clientHeight > 0 &&
    element.scrollHeight > element.clientHeight + 1 &&
    effectiveOverflowY(style) !== 'visible'
  );
}

/** Expands CSS containment shorthands into the layout/paint blocker reasons relevant to sticky. */
function containReasons(style: CSSStyleDeclaration): StickyBlockingReason[] {
  const contain = (style.contain || cssProperty(style, 'contain')).trim().toLowerCase();
  if (contain === '' || contain === 'none' || contain === 'normal') return [];
  const tokens = new Set(contain.split(/\s+/));
  const impliesLayout = tokens.has('layout') || tokens.has('content') || tokens.has('strict');
  const impliesPaint = tokens.has('paint') || tokens.has('content') || tokens.has('strict');
  return [
    ...(impliesLayout ? (['contain-layout'] as const) : []),
    ...(impliesPaint ? (['contain-paint'] as const) : []),
  ];
}

/** Detects properties that establish a containing block and can change sticky/fallback geometry. */
function createsTransformContainingBlock(style: CSSStyleDeclaration): boolean {
  const transform = (style.transform || cssProperty(style, 'transform')).trim().toLowerCase();
  const perspective = cssProperty(style, 'perspective').toLowerCase();
  const filter = cssProperty(style, 'filter').toLowerCase();
  const willChange = (style.willChange || cssProperty(style, 'will-change')).toLowerCase();
  return (
    (transform !== '' && transform !== 'none') ||
    (perspective !== '' && perspective !== 'none') ||
    (filter !== '' && filter !== 'none') ||
    willChange.split(',').some((value) =>
      ['transform', 'perspective', 'filter'].includes(value.trim()),
    )
  );
}

/** Detects cross-axis flex/grid stretching, which can leave a sticky item no room to travel. */
function isFlexGridStretch(element: HTMLElement, readStyle: StickyStyleReader): boolean {
  const parent = element.parentElement;
  if (!parent) return false;
  const parentStyle = readStyle(parent);
  const elementStyle = readStyle(element);
  if (!parentStyle || !elementStyle) return false;
  const display = parentStyle.display.toLowerCase();
  if (!['flex', 'inline-flex', 'grid', 'inline-grid'].includes(display)) return false;
  const alignSelf = elementStyle.alignSelf.toLowerCase();
  if (alignSelf === 'stretch') return true;
  if (alignSelf !== '' && alignSelf !== 'auto' && alignSelf !== 'normal') return false;
  const alignItems = parentStyle.alignItems.toLowerCase();
  return alignItems === '' || alignItems === 'normal' || alignItems === 'stretch';
}

/** The actual page scroller and HTML root are expected and must not be classified as blockers. */
function isStickyBlockerExemptDocumentRoot(element: HTMLElement): boolean {
  const documentObject = element.ownerDocument;
  return (
    element === documentObject.documentElement ||
    element === documentObject.scrollingElement
  );
}

/** BODY overflow is viewport overflow while both overflow axes on HTML remain visible. */
function isBodyOverflowPropagatedToViewport(
  element: HTMLElement,
  readStyle: StickyStyleReader,
): boolean {
  const documentObject = element.ownerDocument;
  if (element !== documentObject.body) return false;
  const rootStyle = readStyle(documentObject.documentElement);
  return (
    rootStyle !== null &&
    effectiveOverflowX(rootStyle) === 'visible' &&
    effectiveOverflowY(rootStyle) === 'visible'
  );
}

/** Body/HTML are never valid product-scoped boundaries, even when body is not the page scroller. */
function isDocumentFallbackBoundary(element: HTMLElement): boolean {
  const documentObject = element.ownerDocument;
  return (
    element === documentObject.body ||
    element === documentObject.documentElement ||
    element === documentObject.scrollingElement
  );
}

/** Maps one ancestor's overflow, sizing, containment, transform, and layout styles to blocker reasons. */
export function classifyStickyAncestor(
  element: HTMLElement,
  readStyle: StickyStyleReader = defaultStyleReader,
): StickyBlockingAncestor | null {
  if (isStickyBlockerExemptDocumentRoot(element)) return null;
  const style = readStyle(element);
  if (!style) return null;
  const reasons: StickyBlockingReason[] = [];
  const overflowY = effectiveOverflowY(style);
  const bodyOverflowIsPropagated = isBodyOverflowPropagatedToViewport(element, readStyle);
  if (!bodyOverflowIsPropagated) {
    if (['auto', 'scroll', 'overlay'].includes(overflowY)) {
      reasons.push('vertical-scroll-container');
    } else if (overflowY === 'hidden' || overflowY === 'clip') {
      reasons.push('vertical-overflow-clipping');
    }
  }
  if (isConstrainedHeight(element, style, bodyOverflowIsPropagated)) {
    reasons.push('constrained-height');
  }
  reasons.push(...containReasons(style));
  if (createsTransformContainingBlock(style)) reasons.push('transform-containing-block');
  if (isFlexGridStretch(element, readStyle)) reasons.push('flex-grid-stretch');
  if (reasons.length === 0) return null;

  const ownedByOv25 = isOv25OwnedElement(element);
  return {
    element,
    reasons: [...new Set(reasons)],
    ownedByOv25,
    repairable: ownedByOv25,
  };
}

function htmlAncestorChain(element: HTMLElement): HTMLElement[] {
  const ancestors: HTMLElement[] = [];
  let current = element.parentElement;
  while (current) {
    ancestors.push(current);
    current = current.parentElement;
  }
  return ancestors;
}

/** Read-only classification of all ancestors that can constrain native sticky positioning. */
export function inspectStickyAncestors(
  host: HTMLElement,
  readStyle: StickyStyleReader = defaultStyleReader,
): StickyAncestorInspection {
  const ancestors = htmlAncestorChain(host);
  const blockers: StickyBlockingAncestor[] = [];

  const hostClassification = classifyStickyAncestor(host, readStyle);
  if (hostClassification?.reasons.includes('flex-grid-stretch')) {
    blockers.push({
      ...hostClassification,
      reasons: ['flex-grid-stretch'],
    });
  }

  for (const ancestor of ancestors) {
    const blocker = classifyStickyAncestor(ancestor, readStyle);
    if (!blocker) continue;

    // Stretch constrains the sticky item itself, not every ancestor stretched by its parent.
    const reasons = blocker.reasons.filter((reason) => reason !== 'flex-grid-stretch');
    if (reasons.length > 0) blockers.push({ ...blocker, reasons });
  }

  const ownedBlockers = blockers.filter((blocker) => blocker.ownedByOv25);
  const externalBlockers = blockers.filter((blocker) => !blocker.ownedByOv25);
  return {
    host,
    ancestors,
    blockers,
    ownedBlockers,
    externalBlockers,
    requiresBodyFallback: externalBlockers.length > 0,
  };
}

interface InlineStyleValue {
  property: string;
  value: string;
  priority: string;
}

interface StickyGalleryColumnStretchRepair {
  element: HTMLElement;
  container: HTMLElement;
  matchesAppliedStyle(): boolean;
  restore(): boolean;
}

interface StickyGalleryBlockerState {
  element: HTMLElement;
  reasons: readonly StickyBlockingReason[];
  ownedByOv25: boolean;
}

interface StickyGalleryColumnStretchFailure {
  element: HTMLElement;
  signature: string;
  blockers: readonly StickyGalleryBlockerState[];
}

export interface StickyOwnedWrapperRepair {
  element: HTMLElement;
  properties: readonly string[];
  reasons: readonly StickyBlockingReason[];
  suspend(): void;
  reconcile(blocker: StickyBlockingAncestor): void;
  matchesAppliedStyle(): boolean;
  restore(): void;
}

function repairPropertiesForReasons(reasons: readonly StickyBlockingReason[]): string[] {
  const properties = new Set<string>();
  if (
    reasons.includes('vertical-scroll-container') ||
    reasons.includes('vertical-overflow-clipping')
  ) {
    properties.add('overflow');
    properties.add('overflow-x');
    properties.add('overflow-y');
  }
  if (reasons.includes('constrained-height')) {
    properties.add('height');
    properties.add('max-height');
  }
  if (reasons.includes('contain-layout') || reasons.includes('contain-paint')) {
    properties.add('contain');
  }
  if (reasons.includes('transform-containing-block')) {
    properties.add('transform');
    properties.add('perspective');
    properties.add('filter');
    properties.add('will-change');
  }
  if (reasons.includes('flex-grid-stretch')) properties.add('align-self');
  return [...properties];
}

function repairedPropertyValue(property: string): string {
  if (property.startsWith('overflow')) return 'visible';
  if (property === 'height') return 'auto';
  if (property === 'max-height') return 'none';
  if (property === 'contain') return 'none';
  if (property === 'align-self') return 'flex-start';
  if (property === 'will-change') return 'auto';
  return 'none';
}

function readInlineStyle(element: HTMLElement, property: string): InlineStyleValue {
  return {
    property,
    value: element.style.getPropertyValue(property),
    priority: element.style.getPropertyPriority(property),
  };
}

function restoreInlineStyle(element: HTMLElement, entry: InlineStyleValue): void {
  if (entry.value) {
    element.style.setProperty(entry.property, entry.value, entry.priority);
  } else {
    element.style.removeProperty(entry.property);
  }
}

function isGalleryColumnStretchEligible(
  element: HTMLElement,
  readStyle: StickyStyleReader,
): boolean {
  const container = element.parentElement;
  if (!container) return false;
  const containerStyle = readStyle(container);
  if (!containerStyle) return false;
  const writingMode = (
    containerStyle.writingMode || cssProperty(containerStyle, 'writing-mode')
  ).toLowerCase();
  if (writingMode && writingMode !== 'horizontal-tb') return false;

  const display = (
    containerStyle.display || cssProperty(containerStyle, 'display')
  ).toLowerCase();
  if (display === 'grid' || display === 'inline-grid') return true;
  if (display !== 'flex' && display !== 'inline-flex') return false;

  const flexDirection = (
    containerStyle.flexDirection || cssProperty(containerStyle, 'flex-direction') || 'row'
  ).toLowerCase();
  return flexDirection === 'row' || flexDirection === 'row-reverse';
}

function applyGalleryColumnStretchRepair(
  element: HTMLElement,
  readStyle: StickyStyleReader,
): StickyGalleryColumnStretchRepair | null {
  if (!isGalleryColumnStretchEligible(element, readStyle)) return null;
  const container = element.parentElement;
  if (!container) return null;

  const previous = readInlineStyle(element, 'align-self');
  let restored = false;
  element.style.setProperty('align-self', 'stretch', 'important');
  const appliedStyle = readStyle(element);
  const computedAlignSelf = (
    appliedStyle?.alignSelf || (appliedStyle ? cssProperty(appliedStyle, 'align-self') : '')
  ).toLowerCase();
  if (computedAlignSelf !== 'stretch') {
    restoreInlineStyle(element, previous);
    return null;
  }

  const repair: StickyGalleryColumnStretchRepair = {
    element,
    container,
    matchesAppliedStyle() {
      return (
        !restored &&
        element.style.getPropertyValue('align-self') === 'stretch' &&
        element.style.getPropertyPriority('align-self') === 'important'
      );
    },
    restore() {
      if (restored) return false;
      const stillOwned = repair.matchesAppliedStyle();
      restored = true;
      if (stillOwned) restoreInlineStyle(element, previous);
      return stillOwned;
    },
  };
  return repair;
}

// creates a serialized fingerprint of the layout when an attempted gallery-column repair fails.
function galleryColumnStretchFailureSignature(
  host: HTMLElement,
  boundary: HTMLElement,
  stickyTop: number,
  options: StickyTravelMeasurementOptions,
  readStyle: StickyStyleReader,
): string {
  const hostRect = host.getBoundingClientRect();
  const boundaryRect = boundary.getBoundingClientRect();
  const scrollY = normalizePixelValue(options.scrollY ?? 0);
  const container = boundary.parentElement;
  const containerRect = container?.getBoundingClientRect() ?? null;
  const boundaryStyle = readStyle(boundary);
  const containerStyle = container ? readStyle(container) : null;
  return JSON.stringify([
    normalizePixelValue(hostRect.height),
    normalizePixelValue(hostRect.width),
    normalizePixelValue(boundaryRect.height),
    normalizePixelValue(boundaryRect.width),
    normalizePixelValue(boundaryRect.top + scrollY),
    normalizePixelValue(boundaryRect.bottom + scrollY),
    normalizePixelValue(containerRect?.height ?? 0),
    normalizePixelValue(containerRect?.width ?? 0),
    normalizePixelValue((containerRect?.top ?? 0) + scrollY),
    normalizePixelValue((containerRect?.bottom ?? 0) + scrollY),
    normalizePixelValue(options.naturalDocumentTop ?? hostRect.top + scrollY),
    normalizePixelValue(stickyTop),
    boundary.style.getPropertyValue('align-self'),
    boundary.style.getPropertyPriority('align-self'),
    boundaryStyle?.alignSelf ?? '',
    boundaryStyle?.height ?? '',
    boundaryStyle?.minHeight ?? '',
    boundaryStyle?.maxHeight ?? '',
    boundaryStyle?.boxSizing ?? '',
    containerStyle?.display ?? '',
    containerStyle?.alignItems ?? '',
    containerStyle?.alignContent ?? '',
    containerStyle?.flexDirection ?? '',
    containerStyle?.flexWrap ?? '',
    containerStyle?.gridTemplateColumns ?? '',
    containerStyle?.gridTemplateRows ?? '',
    containerStyle?.height ?? '',
    containerStyle?.minHeight ?? '',
    containerStyle?.maxHeight ?? '',
    containerStyle?.writingMode ?? '',
  ]);
}

function captureGalleryBlockerState(
  blockers: Iterable<StickyBlockingAncestor>,
  galleryBlockerElements: ReadonlySet<HTMLElement>,
): StickyGalleryBlockerState[] {
  return [...blockers]
    .filter((blocker) => galleryBlockerElements.has(blocker.element))
    .map((blocker) => ({
      element: blocker.element,
      reasons: [...blocker.reasons].sort(),
      ownedByOv25: blocker.ownedByOv25,
    }));
}

function sameGalleryBlockerState(
  left: readonly StickyGalleryBlockerState[],
  right: readonly StickyGalleryBlockerState[],
): boolean {
  if (left.length !== right.length) return false;
  return left.every((leftBlocker) => {
    const rightBlocker = right.find(
      (candidate) => candidate.element === leftBlocker.element,
    );
    return (
      rightBlocker !== undefined &&
      rightBlocker.ownedByOv25 === leftBlocker.ownedByOv25 &&
      leftBlocker.reasons.length === rightBlocker.reasons.length &&
      leftBlocker.reasons.every(
        (reason, index) => reason === rightBlocker.reasons[index],
      )
    );
  });
}

function hasAppliedRepairValue(element: HTMLElement, property: string): boolean {
  return (
    element.style.getPropertyValue(property) === repairedPropertyValue(property) &&
    element.style.getPropertyPriority(property) === 'important'
  );
}

/** Applies reversible inline fixes only when the classified wrapper is OV25-owned. */
export function repairOv25OwnedStickyBlocker(
  blocker: StickyBlockingAncestor,
): StickyOwnedWrapperRepair | null {
  if (!blocker.ownedByOv25 || !isOv25OwnedElement(blocker.element)) return null;
  const element = blocker.element;
  const previous = new Map<string, InlineStyleValue>();
  let properties = new Set<string>();
  let reasons: StickyBlockingReason[] = [];
  let applied = false;
  let restored = false;
  const repair: StickyOwnedWrapperRepair = {
    element,
    get properties() {
      return [...properties];
    },
    get reasons() {
      return [...reasons];
    },
    suspend() {
      if (restored || !applied) return;
      for (const property of properties) {
        const entry = previous.get(property);
        if (entry) restoreInlineStyle(element, entry);
      }
      applied = false;
    },
    reconcile(nextBlocker) {
      if (
        restored ||
        nextBlocker.element !== element ||
        !nextBlocker.ownedByOv25 ||
        !isOv25OwnedElement(element)
      ) {
        return;
      }

      const nextProperties = new Set(repairPropertiesForReasons(nextBlocker.reasons));
      reasons = [...new Set(nextBlocker.reasons)];
      for (const property of nextProperties) {
        if (!previous.has(property)) previous.set(property, readInlineStyle(element, property));
      }
      for (const property of properties) {
        if (nextProperties.has(property)) continue;
        const entry = previous.get(property);
        if (entry) restoreInlineStyle(element, entry);
      }

      properties = nextProperties;
      for (const property of properties) {
        if (!hasAppliedRepairValue(element, property)) {
          element.style.setProperty(property, repairedPropertyValue(property), 'important');
        }
      }
      applied = true;
    },
    matchesAppliedStyle() {
      return applied && [...properties].every((property) => hasAppliedRepairValue(element, property));
    },
    restore() {
      if (restored) return;
      restored = true;
      for (const entry of previous.values()) restoreInlineStyle(element, entry);
      properties.clear();
      reasons = [];
      previous.clear();
      applied = false;
    },
  };
  repair.reconcile(blocker);
  return repair;
}

/** Lowest useful common product boundary; body/document roots are intentionally rejected. */
export function findCommonStickyBoundary(
  hosts: Array<HTMLElement | null | undefined>,
): HTMLElement | null {
  const connectedHosts = uniqueElements(hosts).filter((host) => host.isConnected);
  if (connectedHosts.length === 0) return null;

  const firstChain = htmlAncestorChain(connectedHosts[0]);
  let boundary: HTMLElement | null =
    firstChain.find((candidate) =>
      connectedHosts.every((host) => candidate === host || candidate.contains(host)),
    ) ?? null;

  while (boundary && isOv25OwnedElement(boundary)) {
    boundary = boundary.parentElement;
  }

  if (!boundary || isDocumentFallbackBoundary(boundary)) {
    return null;
  }
  return boundary;
}

export interface StickyTravelMetrics {
  requiredTravel: number;
  availableTravel: number;
  insufficient: boolean;
}

interface StickyTravelMeasurementOptions {
  naturalDocumentTop?: number;
  scrollY?: number;
}

/** Measures whether a containing boundary lets the host reach its requested viewport top. */
export function measureStickyTravel(
  host: HTMLElement,
  boundary: HTMLElement,
  stickyTop: number,
  options: StickyTravelMeasurementOptions = {},
): StickyTravelMetrics {
  const hostRect = host.getBoundingClientRect();
  const boundaryRect = boundary.getBoundingClientRect();
  const naturalHostTop = options.naturalDocumentTop ?? hostRect.top;
  const boundaryBottom =
    boundaryRect.bottom +
    (options.naturalDocumentTop === undefined
      ? 0
      : normalizePixelValue(options.scrollY ?? 0));
  const requiredTravel = normalizePixelValue(Math.max(0, naturalHostTop - stickyTop));
  const availableTravel = normalizePixelValue(
    Math.max(0, boundaryBottom - naturalHostTop - hostRect.height),
  );

  return {
    requiredTravel,
    availableTravel,
    insufficient:
      hostRect.height > 0 &&
      boundaryRect.height > 0 &&
      requiredTravel > availableTravel + 1,
  };
}

function isBroadPageBoundary(element: HTMLElement): boolean {
  return element.matches('main, footer, [role="main"], [role="contentinfo"]');
}

/** Widens a short LCA only within the current product subtree. */
export function findSufficientStickyBoundary(
  initialBoundary: HTMLElement | null,
  galleryHost: HTMLElement,
  stickyTop: number,
  measurementOptions: StickyTravelMeasurementOptions = {},
): HTMLElement | null {
  let boundary = initialBoundary;
  while (boundary && !isDocumentFallbackBoundary(boundary) && !isBroadPageBoundary(boundary)) {
    if (!measureStickyTravel(
      galleryHost,
      boundary,
      stickyTop,
      measurementOptions,
    ).insufficient) {
      return boundary;
    }
    boundary = boundary.parentElement;
  }
  return null;
}

export interface StickyRectSnapshot {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
}

export interface StickyBodyFallbackGeometry {
  mode: 'flow' | 'fixed' | 'absolute-end';
  placeholder: StickyRectSnapshot;
  stickyTop: number;
  fixedLeft: number;
  fixedWidth: number;
  fixedHeight: number;
  boundary: HTMLElement | null;
  boundaryBottom: number | null;
  boundaryEndTop: number | null;
  documentEndTop: number | null;
}

function finiteNumber(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

function rectSnapshot(rect: DOMRect): StickyRectSnapshot {
  return {
    top: finiteNumber(rect.top),
    right: finiteNumber(rect.right),
    bottom: finiteNumber(rect.bottom),
    left: finiteNumber(rect.left),
    width: normalizePixelValue(rect.width),
    height: normalizePixelValue(rect.height),
  };
}

/** Geometry plan for later same-host body relocation; this function never mutates the DOM. */
export function calculateStickyBodyFallbackGeometry(options: {
  placeholder: Pick<HTMLElement, 'getBoundingClientRect'>;
  stickyTop: number;
  boundary?: HTMLElement | null;
  scrollY?: number;
}): StickyBodyFallbackGeometry {
  const placeholder = rectSnapshot(options.placeholder.getBoundingClientRect());
  const stickyTop = normalizePixelValue(options.stickyTop);
  const boundary = options.boundary ?? null;
  const boundaryBottom = boundary
    ? finiteNumber(boundary.getBoundingClientRect().bottom)
    : null;
  const boundaryEndTop = boundaryBottom === null ? null : boundaryBottom - placeholder.height;
  const documentEndTop =
    boundaryEndTop === null ? null : finiteNumber(options.scrollY ?? 0) + boundaryEndTop;
  const mode =
    placeholder.top > stickyTop
      ? 'flow'
      : boundaryEndTop !== null && boundaryEndTop <= stickyTop
        ? 'absolute-end'
        : 'fixed';

  return {
    mode,
    placeholder,
    stickyTop,
    fixedLeft: placeholder.left,
    fixedWidth: placeholder.width,
    fixedHeight: placeholder.height,
    boundary,
    boundaryBottom,
    boundaryEndTop,
    documentEndTop,
  };
}

export type StickyLayoutDiagnosticCode =
  | 'header-selector-invalid'
  | 'header-target-not-found'
  | 'header-auto-detection-empty'
  | 'sticky-boundary-insufficient-travel'
  | 'sticky-boundary-parent-fallback'
  | 'sticky-boundary-missing'
  | 'sticky-blocking-ancestor';

export interface StickyLayoutDiagnostic {
  code: StickyLayoutDiagnosticCode;
  message: string;
  selector?: string;
  element?: HTMLElement;
  reasons?: StickyBlockingReason[];
  ownedByOv25?: boolean;
  requiresBodyFallback?: boolean;
}

export interface StickyLayoutSnapshot {
  headerOffset: number;
  topGap: number;
  bottomGap: number;
  optionHeaderHeight: number;
  headerElements: readonly Element[];
  headerStatus: StickyHeaderStatus;
  headerSource: StickyHeaderSource;
  ancestorBlockers: readonly StickyBlockingAncestor[];
  requiresBodyFallback: boolean;
  fallbackBoundary: HTMLElement | null;
}

export interface StickyLayoutControllerElements {
  galleryHost?: HTMLElement | null;
  variantsHost?: HTMLElement | null;
  optionHeader?: HTMLElement | null;
}

export interface StickyLayoutControllerOptions extends StickyLayoutControllerElements {
  document: Document;
  window?: Window;
  root?: ParentNode;
  headerSelector?: string;
  topGapOverride?: number;
  bottomGapOverride?: number;
  /** Defaults to true; only wrappers positively identified as OV25-owned can be repaired. */
  repairOwnedWrappers?: boolean;
  onChange?: (snapshot: StickyLayoutSnapshot) => void;
  onDiagnostic?: (diagnostic: StickyLayoutDiagnostic) => void;
}

export interface StickyLayoutController {
  start(): void;
  scheduleMeasure(options?: { afterCurrentFrame?: boolean }): void;
  setElements(elements: StickyLayoutControllerElements): void;
  getSnapshot(): StickyLayoutSnapshot;
  destroy(): void;
}

interface StickyGalleryFlowAnchor {
  parent: HTMLElement;
  offsetTop: number;
}

interface StickyGalleryFlowOriginRecord {
  anchor: StickyGalleryFlowAnchor | null;
  listeners: Set<() => void>;
  owners: Set<object>;
  cleanupGeneration: number;
}

const stickyGalleryFlowOrigins = new WeakMap<HTMLElement, StickyGalleryFlowOriginRecord>();

// The anchor lets OV25 calculate where the gallery would naturally be in the document even after body-level fallback moves it elsewhere.
function getStickyGalleryFlowOriginRecord(host: HTMLElement): StickyGalleryFlowOriginRecord {
  const existing = stickyGalleryFlowOrigins.get(host);
  if (existing) return existing;
  const record: StickyGalleryFlowOriginRecord = {
    anchor: null,
    listeners: new Set(),
    owners: new Set(),
    cleanupGeneration: 0,
  };
  stickyGalleryFlowOrigins.set(host, record);
  return record;
}

function notifyStickyGalleryFlowOrigin(host: HTMLElement): void {
  for (const listener of stickyGalleryFlowOrigins.get(host)?.listeners ?? []) listener();
}

function deleteStickyGalleryFlowOriginRecord(
  host: HTMLElement,
  record: StickyGalleryFlowOriginRecord,
): void {
  if (stickyGalleryFlowOrigins.get(host) === record) {
    stickyGalleryFlowOrigins.delete(host);
  }
}

function bindStickyGalleryFlowOrigin(
  host: HTMLElement | null,
  parent: HTMLElement | null,
  owner: object,
): StickyGalleryFlowAnchor | null {
  if (!host || !parent) return null;
  const record = getStickyGalleryFlowOriginRecord(host);
  record.owners.add(owner);
  record.cleanupGeneration += 1;
  if (record.anchor?.parent === parent) return record.anchor;

  const hostTop = host.getBoundingClientRect().top;
  const parentTop = parent.getBoundingClientRect().top;
  const offsetTop = hostTop - parentTop;
  if (!Number.isFinite(offsetTop)) return null;

  const anchor = { parent, offsetTop };
  record.anchor = anchor;
  notifyStickyGalleryFlowOrigin(host);
  return anchor;
}

function releaseStickyGalleryFlowOrigin(
  host: HTMLElement | null,
  owner: object,
  preserveForSynchronousRecreation: boolean,
): void {
  if (!host) return;
  const record = stickyGalleryFlowOrigins.get(host);
  if (!record) return;
  if (!record.owners.delete(owner) || record.owners.size > 0) return;

  const releasedAnchor = record.anchor;
  if (!releasedAnchor) {
    if (record.listeners.size === 0) deleteStickyGalleryFlowOriginRecord(host, record);
    return;
  }

  const cleanupGeneration = ++record.cleanupGeneration;
  const clearReleasedAnchor = () => {
    if (
      stickyGalleryFlowOrigins.get(host) !== record ||
      record.cleanupGeneration !== cleanupGeneration ||
      record.owners.size > 0 ||
      record.anchor !== releasedAnchor
    ) {
      return;
    }
    record.anchor = null;
    for (const listener of record.listeners) listener();
    if (!record.anchor && record.owners.size === 0 && record.listeners.size === 0) {
      deleteStickyGalleryFlowOriginRecord(host, record);
    }
  };
  if (preserveForSynchronousRecreation) Promise.resolve().then(clearReleasedAnchor);
  else clearReleasedAnchor();
}

function isStickyBodyLayer(element: HTMLElement | null): boolean {
  return element?.hasAttribute('data-ov25-sticky-body-layer') ?? false;
}

// Returns the gallery's original flow parent while it is in the OV25 body fallback;
// otherwise returns its current parent.
function retainedStickyGalleryParent(host: HTMLElement | null): HTMLElement | null {
  if (!host) return null;
  const currentParent = host.parentElement;
  const retainedParent = stickyGalleryFlowOrigins.get(host)?.anchor?.parent ?? null;
  if (
    retainedParent &&
    (currentParent === retainedParent || isStickyBodyLayer(currentParent))
  ) {
    return retainedParent;
  }
  return currentParent;
}

// Reconstructs the gallery's natural document-space top from its original parent
// and captured offset, independently of body-level relocation.
function naturalDocumentTopFromAnchor(
  anchor: StickyGalleryFlowAnchor | null,
  windowObject: Window,
): number | null {
  if (!anchor?.parent.isConnected) return null;
  const parentTop = anchor.parent.getBoundingClientRect().top;
  const scrollY = Number.isFinite(windowObject.scrollY) ? windowObject.scrollY : 0;
  const naturalDocumentTop = parentTop + scrollY + anchor.offsetTop;
  return Number.isFinite(naturalDocumentTop) ? naturalDocumentTop : null;
}

export function getStickyHostNaturalDocumentTop(
  host: HTMLElement,
  windowObject: Window | null = host.ownerDocument.defaultView,
): number | null {
  if (!windowObject) return null;
  return naturalDocumentTopFromAnchor(
    stickyGalleryFlowOrigins.get(host)?.anchor ?? null,
    windowObject,
  );
}

// watch sticky host so we know when it moves
export function observeStickyHostNaturalDocumentTop(
  host: HTMLElement,
  listener: () => void,
): () => void {
  const record = getStickyGalleryFlowOriginRecord(host);
  record.listeners.add(listener);
  return () => {
    record.listeners.delete(listener);
    if (!record.anchor && record.owners.size === 0 && record.listeners.size === 0) {
      deleteStickyGalleryFlowOriginRecord(host, record);
    }
  };
}

function applyCssVariables(host: HTMLElement, variables: StickyLayoutOwnedCssVariables): void {
  for (const [property, value] of Object.entries(variables)) {
    if (host.style.getPropertyValue(property) !== value) {
      host.style.setProperty(property, value);
    }
  }
}

function removeCssVariables(host: HTMLElement | null): void {
  if (!host) return;
  for (const property of Object.values(STICKY_LAYOUT_CSS_PROPERTIES)) {
    host.style.removeProperty(property);
  }
}

type StickyHostCssSnapshot = Map<string, { value: string; priority: string }>;

function captureHostCssVariables(host: HTMLElement): StickyHostCssSnapshot {
  return new Map(
    Object.values(STICKY_LAYOUT_CSS_PROPERTIES).map((property) => [
      property,
      {
        value: host.style.getPropertyValue(property),
        priority: host.style.getPropertyPriority(property),
      },
    ]),
  );
}

function restoreHostCssVariables(
  host: HTMLElement,
  snapshot: StickyHostCssSnapshot,
): void {
  removeCssVariables(host);
  for (const [property, previous] of snapshot) {
    if (previous.value) {
      host.style.setProperty(property, previous.value, previous.priority);
    }
  }
}

function uniqueElements<T extends Element>(elements: Array<T | null | undefined>): T[] {
  return [...new Set(elements.filter((element): element is T => Boolean(element)))];
}

function isUsefulStickyBoundary(
  element: HTMLElement | null,
  documentObject: Document,
): element is HTMLElement {
  return Boolean(
    element?.isConnected &&
      element !== documentObject.body &&
      element !== documentObject.documentElement,
  );
}

function sameElements(a: readonly Element[], b: readonly Element[]): boolean {
  return a.length === b.length && a.every((element, index) => element === b[index]);
}

function sameSnapshot(a: StickyLayoutSnapshot, b: StickyLayoutSnapshot): boolean {
  return (
    a.headerOffset === b.headerOffset &&
    a.topGap === b.topGap &&
    a.bottomGap === b.bottomGap &&
    a.optionHeaderHeight === b.optionHeaderHeight &&
    a.headerStatus === b.headerStatus &&
    a.headerSource === b.headerSource &&
    a.requiresBodyFallback === b.requiresBodyFallback &&
    a.fallbackBoundary === b.fallbackBoundary &&
    sameElements(a.headerElements, b.headerElements) &&
    sameBlockers(a.ancestorBlockers, b.ancestorBlockers)
  );
}

function sameBlockers(
  a: readonly StickyBlockingAncestor[],
  b: readonly StickyBlockingAncestor[],
): boolean {
  return (
    a.length === b.length &&
    a.every(
      (blocker, index) =>
        blocker.element === b[index].element &&
        blocker.ownedByOv25 === b[index].ownedByOv25 &&
        blocker.repairable === b[index].repairable &&
        blocker.reasons.length === b[index].reasons.length &&
        blocker.reasons.every((reason, reasonIndex) => reason === b[index].reasons[reasonIndex]),
    )
  );
}

function cloneSnapshot(snapshot: StickyLayoutSnapshot): StickyLayoutSnapshot {
  return {
    ...snapshot,
    headerElements: [...snapshot.headerElements],
    ancestorBlockers: snapshot.ancestorBlockers.map((blocker) => ({
      ...blocker,
      reasons: [...blocker.reasons],
    })),
  };
}

function viewportHeightForWindow(windowObject: Window): number {
  const visualViewportHeight = windowObject.visualViewport?.height;
  if (visualViewportHeight && Number.isFinite(visualViewportHeight)) {
    return normalizePixelValue(visualViewportHeight);
  }
  return normalizePixelValue(windowObject.innerHeight);
}

function viewportWidthForWindow(windowObject: Window): number {
  const visualViewportWidth = windowObject.visualViewport?.width;
  if (visualViewportWidth && Number.isFinite(visualViewportWidth)) {
    return normalizePixelValue(visualViewportWidth);
  }
  return normalizePixelValue(windowObject.innerWidth);
}

export interface StickyLayoutGaps {
  top: number;
  bottom: number;
}

function cssLengthToPixels(
  value: string,
  element: HTMLElement,
  windowObject: Window,
): number | null {
  const trimmed = value.trim().toLowerCase();
  const number = Number.parseFloat(trimmed);
  if (!Number.isFinite(number) || number < 0) return null;
  if (trimmed.endsWith('px') || /^\d+(?:\.\d+)?$/.test(trimmed)) return number;
  if (trimmed.endsWith('rem')) {
    const rootSize = Number.parseFloat(
      windowObject.getComputedStyle(element.ownerDocument.documentElement).fontSize,
    );
    return number * (Number.isFinite(rootSize) ? rootSize : 16);
  }
  if (trimmed.endsWith('em')) {
    const fontSize = Number.parseFloat(windowObject.getComputedStyle(element).fontSize);
    return number * (Number.isFinite(fontSize) ? fontSize : 16);
  }
  return null;
}

function readResolvedGap(
  element: HTMLElement | null | undefined,
  property: '--ov25-sticky-top-gap' | '--ov25-sticky-bottom-gap',
  windowObject: Window,
): number | null {
  if (!element) return null;
  const value = windowObject.getComputedStyle(element).getPropertyValue(property);
  const pixels = cssLengthToPixels(value, element, windowObject);
  return pixels === null ? null : normalizePixelValue(pixels);
}

function resolveGapFromHosts(
  outerHost: HTMLElement | null,
  innerHosts: Array<HTMLElement | null | undefined>,
  property: '--ov25-sticky-top-gap' | '--ov25-sticky-bottom-gap',
  windowObject: Window,
): number {
  const outerValue = readResolvedGap(outerHost, property, windowObject);
  if (outerValue !== null) return outerValue;

  const innerValues = uniqueElements(innerHosts)
    .map((element) => readResolvedGap(element, property, windowObject))
    .filter((value): value is number => value !== null);
  return (
    innerValues.find((value) => value !== DEFAULT_STICKY_GAP) ??
    innerValues[0] ??
    DEFAULT_STICKY_GAP
  );
}

/** One gap source for outer relocation and both gallery/variants shadow-host metrics. */
export function resolveStickyLayoutGaps(
  galleryHost: HTMLElement | null,
  variantsHost: HTMLElement | null,
  windowObject: Window,
): StickyLayoutGaps {
  const innerGalleryHost = galleryHost?.querySelector<HTMLElement>(
    '#ov-25-configurator-gallery-container',
  );
  return {
    top: resolveGapFromHosts(
      galleryHost,
      [innerGalleryHost, variantsHost],
      '--ov25-sticky-top-gap',
      windowObject,
    ),
    bottom: resolveGapFromHosts(
      galleryHost,
      [innerGalleryHost, variantsHost],
      '--ov25-sticky-bottom-gap',
      windowObject,
    ),
  };
}

function resolutionDiagnostic(resolution: StickyHeaderResolution): StickyLayoutDiagnostic | null {
  if (resolution.overrideError) {
    return {
      code: 'header-selector-invalid',
      message: `Sticky header selector is invalid; using automatic header detection: "${resolution.overrideSelector}".`,
      selector: resolution.overrideSelector,
    };
  }
  if (resolution.status === 'resolved') return null;
  if (resolution.source !== 'override') {
    return {
      code: 'header-auto-detection-empty',
      message: 'No visible storefront header was auto-detected; using a zero header offset.',
    };
  }
  return {
    code: 'header-target-not-found',
    message: `Sticky header override matched no elements; waiting for a dynamic match: "${resolution.selector}".`,
    selector: resolution.selector,
  };
}

/**
 * Creates the measurement lifecycle for one inline-sticky gallery/variants pair. `start()`
 * observes layout changes, publishes sticky geometry and CSS variables, and applies reversible
 * repairs to eligible OV25-owned ancestors. The snapshot reports when body-level relocation is
 * required; `destroy()` disconnects observers and restores every controller-owned mutation.
 */
export function createStickyLayoutController(
  options: StickyLayoutControllerOptions,
): StickyLayoutController {
  const documentObject = options.document;
  const windowObject = options.window ?? documentObject.defaultView;
  if (!windowObject) {
    throw new Error('createStickyLayoutController requires a document with a window');
  }

  const root = options.root ?? documentObject;
  const runtimeWindow = windowObject as Window & {
    ResizeObserver?: typeof ResizeObserver;
    MutationObserver?: typeof MutationObserver;
  };
  const usesNativeAnimationFrame = typeof windowObject.requestAnimationFrame === 'function';
  const requestFrame = usesNativeAnimationFrame
    ? windowObject.requestAnimationFrame.bind(windowObject)
    : (callback: FrameRequestCallback) =>
        windowObject.setTimeout(() => callback(Date.now()), 16);
  const cancelFrame = usesNativeAnimationFrame
    ? windowObject.cancelAnimationFrame.bind(windowObject)
    : windowObject.clearTimeout.bind(windowObject);
  const readStyle: StickyStyleReader = (element) => windowObject.getComputedStyle(element);

  let galleryHost = options.galleryHost ?? null;
  let variantsHost = options.variantsHost ?? null;
  let optionHeader = options.optionHeader ?? null;
  const galleryFlowAnchorOwner = {};
  let originalGalleryTargetParent = retainedStickyGalleryParent(galleryHost);
  let galleryFlowAnchor = bindStickyGalleryFlowOrigin(
    galleryHost,
    originalGalleryTargetParent,
    galleryFlowAnchorOwner,
  );
  let started = false;
  let destroyed = false;
  let frameId: number | null = null;
  let measureAfterCurrentFrame = false;
  let resizeObserver: ResizeObserver | null = null;
  let mutationObserver: MutationObserver | null = null;
  let resizeObservedElements: Element[] = [];
  let motionHeaderElements: Element[] = [];
  const activeHeaderMotions = new Map<Element, Map<string, number>>();
  const motionTargetIds = new WeakMap<EventTarget, number>();
  let nextMotionTargetId = 1;
  let repairsNeedReconciliation = false;
  let hasMeasured = false;
  let sizingHeaderOffset = 0;
  const emittedDiagnostics = new Set<StickyLayoutDiagnosticCode>();
  const emittedBlockingAncestors = new WeakSet<HTMLElement>();
  const ownedRepairs = new Map<HTMLElement, StickyOwnedWrapperRepair>();
  let galleryColumnStretchRepair: StickyGalleryColumnStretchRepair | null = null;
  let galleryColumnStretchFailure: StickyGalleryColumnStretchFailure | null = null;
  let relinquishedGalleryColumnStretch: HTMLElement | null = null;
  const hostCssSnapshots = new Map<HTMLElement, StickyHostCssSnapshot>();
  let snapshot: StickyLayoutSnapshot = {
    headerOffset: 0,
    topGap: DEFAULT_STICKY_GAP,
    bottomGap: DEFAULT_STICKY_GAP,
    optionHeaderHeight: 0,
    headerElements: [],
    headerStatus: 'not-found',
    headerSource: 'auto',
    ancestorBlockers: [],
    requiresBodyFallback: false,
    fallbackBoundary: null,
  };

  const reportDiagnostic = (diagnostic: StickyLayoutDiagnostic): void => {
    if (diagnostic.code === 'sticky-blocking-ancestor') {
      if (!diagnostic.element || emittedBlockingAncestors.has(diagnostic.element)) return;
      emittedBlockingAncestors.add(diagnostic.element);
    } else {
      if (emittedDiagnostics.has(diagnostic.code)) return;
      emittedDiagnostics.add(diagnostic.code);
    }

    if (options.onDiagnostic) {
      options.onDiagnostic(diagnostic);
    } else {
      console.warn(`[OV25-UI] ${diagnostic.message}`);
    }
  };

  const reconnectResizeObserver = (elements: Array<Element | null | undefined>): void => {
    const nextElements = uniqueElements(elements.filter((element) => element?.isConnected));
    if (sameElements(resizeObservedElements, nextElements)) return;

    resizeObserver?.disconnect();
    for (const element of nextElements) resizeObserver?.observe(element);
    resizeObservedElements = nextElements;
  };

  // Key for tracking header animations
  const headerMotionKey = (event: Event): string => {
    const target = event.target ?? event.currentTarget;
    let targetId = target ? motionTargetIds.get(target) : undefined;
    if (target && targetId === undefined) {
      targetId = nextMotionTargetId++;
      motionTargetIds.set(target, targetId);
    }
    const motionEvent = event as Event & {
      animationName?: string;
      propertyName?: string;
      pseudoElement?: string;
    };
    const kind = event.type.startsWith('transition') ? 'transition' : 'animation';
    const name = kind === 'transition' ? motionEvent.propertyName : motionEvent.animationName;
    return `${kind}:${targetId ?? 0}:${name ?? ''}:${motionEvent.pseudoElement ?? ''}`;
  };

  const onHeaderMotionStart = (event: Event): void => {
    if (!(event.currentTarget instanceof Element)) return;
    const element = event.currentTarget;
    const motions = activeHeaderMotions.get(element) ?? new Map<string, number>();
    const key = headerMotionKey(event);
    motions.set(key, (motions.get(key) ?? 0) + 1);
    activeHeaderMotions.set(element, motions);
    scheduleMeasure();
  };

  const onHeaderMotionEnd = (event: Event): void => {
    if (!(event.currentTarget instanceof Element)) return;
    const element = event.currentTarget;
    const motions = activeHeaderMotions.get(element);
    if (motions) {
      const key = headerMotionKey(event);
      const remaining = (motions.get(key) ?? 0) - 1;
      if (remaining > 0) motions.set(key, remaining);
      else motions.delete(key);
      if (motions.size === 0) activeHeaderMotions.delete(element);
    }
    scheduleMeasure();
  };

  const removeHeaderMotionListeners = (element: Element): void => {
    element.removeEventListener('transitionstart', onHeaderMotionStart);
    element.removeEventListener('transitionend', onHeaderMotionEnd);
    element.removeEventListener('transitioncancel', onHeaderMotionEnd);
    element.removeEventListener('animationstart', onHeaderMotionStart);
    element.removeEventListener('animationend', onHeaderMotionEnd);
    element.removeEventListener('animationcancel', onHeaderMotionEnd);
    activeHeaderMotions.delete(element);
  };

  const reconnectHeaderMotionListeners = (headerElements: readonly Element[]): void => {
    // A transform can temporarily move an otherwise valid header outside auto-detection bounds.
    const nextElements = uniqueElements(
      [...motionHeaderElements, ...headerElements].filter(
        (element): element is Element => element.isConnected,
      ),
    );
    if (sameElements(motionHeaderElements, nextElements)) return;

    for (const element of motionHeaderElements) removeHeaderMotionListeners(element);
    for (const element of nextElements) {
      element.addEventListener('transitionstart', onHeaderMotionStart);
      element.addEventListener('transitionend', onHeaderMotionEnd);
      element.addEventListener('transitioncancel', onHeaderMotionEnd);
      element.addEventListener('animationstart', onHeaderMotionStart);
      element.addEventListener('animationend', onHeaderMotionEnd);
      element.addEventListener('animationcancel', onHeaderMotionEnd);
    }
    motionHeaderElements = nextElements;
  };

  const restoreOwnedRepairs = (): void => {
    for (const repair of ownedRepairs.values()) repair.restore();
    ownedRepairs.clear();
  };

  // Restore the original style only while OV25 still owns the stretch. If client code replaced
  // it, relinquish the element so a later measurement does not immediately reapply the repair.
  const releaseGalleryColumnStretchRepair = (): void => {
    const repair = galleryColumnStretchRepair;
    if (!repair) return;
    if (!repair.restore()) relinquishedGalleryColumnStretch = repair.element;
    galleryColumnStretchRepair = null;
  };

  const restoreGalleryColumnStretchRepair = (): void => {
    releaseGalleryColumnStretchRepair();
    galleryColumnStretchFailure = null;
    relinquishedGalleryColumnStretch = null;
  };

  const applyHostVariables = (
    host: HTMLElement,
    variables: StickyLayoutOwnedCssVariables,
  ): void => {
    if (!hostCssSnapshots.has(host)) {
      hostCssSnapshots.set(host, captureHostCssVariables(host));
    }
    applyCssVariables(host, variables);
  };

  const restoreHostVariables = (host: HTMLElement | null): void => {
    if (!host) return;
    const previous = hostCssSnapshots.get(host);
    if (!previous) return;
    restoreHostCssVariables(host, previous);
    hostCssSnapshots.delete(host);
  };

  /**
   * Classifies sticky blockers for both hosts (galleryHost, variantsHost), applies reversible repairs where OV25 owns the
   * affected wrapper, and selects a product-scoped body-fallback boundary for anything unresolved.
   */
  const inspectAndRepairHostAncestors = (stickyTop: number): {
    blockers: StickyBlockingAncestor[];
    requiresBodyFallback: boolean;
    boundary: HTMLElement | null;
    observedBlockers: HTMLElement[];
  } => {
    const hosts = uniqueElements([galleryHost, variantsHost]);
    const activeElements = new Set<HTMLElement>();
    const blockerByElement = new Map<HTMLElement, StickyBlockingAncestor>();
    const galleryBlockerElements = new Set<HTMLElement>();
    const reconcilingRepairs = repairsNeedReconciliation;
    repairsNeedReconciliation = false;
    // Temporarily restore owned wrappers before reclassification so previous repairs cannot hide
    // a client-side layout change that makes a repair unnecessary or changes its required fields.
    if (reconcilingRepairs) {
      for (const repair of ownedRepairs.values()) repair.suspend();
    }

    // Merge blocker reasons found from the gallery and variants chains while retaining which
    // blockers affect the gallery, since only those can require body-level gallery relocation.
    for (const host of hosts) {
      const inspection = inspectStickyAncestors(host, readStyle);
      const affectsGallery = host === galleryHost;
      activeElements.add(host);
      for (const ancestor of inspection.ancestors) activeElements.add(ancestor);
      for (const blocker of inspection.blockers) {
        if (affectsGallery) galleryBlockerElements.add(blocker.element);
        const existing = blockerByElement.get(blocker.element);
        if (existing) {
          existing.reasons = [...new Set([...existing.reasons, ...blocker.reasons])];
        } else {
          blockerByElement.set(blocker.element, {
            ...blocker,
            reasons: [...blocker.reasons],
          });
        }
      }
    }

    // Native sticky also needs enough vertical travel inside the gallery's original parent. Use
    // the retained flow anchor because the live host may already be inside the body fallback.
    const galleryTravelBoundary = originalGalleryTargetParent;
    const scrollY = normalizePixelValue(windowObject.scrollY);
    const galleryNaturalDocumentTop = naturalDocumentTopFromAnchor(
      galleryFlowAnchor,
      windowObject,
    );
    const travelMeasurementOptions: StickyTravelMeasurementOptions = {
      naturalDocumentTop: galleryNaturalDocumentTop ?? undefined,
      scrollY,
    };
    const galleryBlockerState = captureGalleryBlockerState(
      blockerByElement.values(),
      galleryBlockerElements,
    );
    const cacheGalleryColumnStretchFailure = (): void => {
      if (!galleryHost || !galleryTravelBoundary) {
        galleryColumnStretchFailure = null;
        return;
      }
      galleryColumnStretchFailure = {
        element: galleryTravelBoundary,
        signature: galleryColumnStretchFailureSignature(
          galleryHost,
          galleryTravelBoundary,
          stickyTop,
          travelMeasurementOptions,
          readStyle,
        ),
        blockers: galleryBlockerState,
      };
    };
    // A column stretch cannot solve overflow, containment, or transform blockers on client-owned
    // ancestors. In that case preserve client layout and proceed directly toward fallback.
    const hasExternalGalleryBlocker = [...blockerByElement.values()].some(
      (blocker) => {
        if (!galleryBlockerElements.has(blocker.element) || blocker.ownedByOv25) {
          return false;
        }
        const isTravelBoundaryConstraint =
          blocker.element === galleryTravelBoundary &&
          blocker.reasons.every((reason) => reason === 'constrained-height');
        return !isTravelBoundaryConstraint;
      },
    );
    if (hasExternalGalleryBlocker) {
      releaseGalleryColumnStretchRepair();
      galleryColumnStretchFailure = null;
    }
    let galleryTravel =
      galleryHost && galleryTravelBoundary
        ? measureStickyTravel(
            galleryHost,
            galleryTravelBoundary,
            stickyTop,
            travelMeasurementOptions,
          )
        : null;
    // Revalidate an active stretch after geometry or authored styles change. If OV25 no longer
    // owns the applied value, release it without overwriting the replacement client value.
    if (galleryColumnStretchRepair) {
      const repair = galleryColumnStretchRepair;
      const repairIsCurrent =
        repair.element === galleryTravelBoundary &&
        repair.container === galleryTravelBoundary?.parentElement &&
        repair.matchesAppliedStyle() &&
        isGalleryColumnStretchEligible(repair.element, readStyle);
      if (!repairIsCurrent || galleryTravel?.insufficient) {
        releaseGalleryColumnStretchRepair();
        galleryTravel =
          galleryHost && galleryTravelBoundary
            ? measureStickyTravel(
                galleryHost,
                galleryTravelBoundary,
                stickyTop,
                travelMeasurementOptions,
              )
            : null;
        if (galleryHost && galleryTravelBoundary && galleryTravel?.insufficient) {
          cacheGalleryColumnStretchFailure();
        } else {
          galleryColumnStretchFailure = null;
        }
      }
    }
    // Before relocating the host, try the narrow repair used by common two-column flex/grid
    // layouts: stretch the original gallery column so it shares the variants column's height.
    if (
      galleryHost &&
      galleryTravelBoundary &&
      !isDocumentFallbackBoundary(galleryTravelBoundary) &&
      galleryTravel?.insufficient &&
      !galleryColumnStretchRepair &&
      !hasExternalGalleryBlocker &&
      relinquishedGalleryColumnStretch !== galleryTravelBoundary
    ) {
      const failureSignature = galleryColumnStretchFailureSignature(
        galleryHost,
        galleryTravelBoundary,
        stickyTop,
        travelMeasurementOptions,
        readStyle,
      );
      const alreadyFailed =
        galleryColumnStretchFailure?.element === galleryTravelBoundary &&
        galleryColumnStretchFailure.signature === failureSignature &&
        sameGalleryBlockerState(
          galleryColumnStretchFailure.blockers,
          galleryBlockerState,
        );
      if (!alreadyFailed) {
        const repair = applyGalleryColumnStretchRepair(galleryTravelBoundary, readStyle);
        if (repair) {
          const repairedTravel = measureStickyTravel(
            galleryHost,
            galleryTravelBoundary,
            stickyTop,
            travelMeasurementOptions,
          );
          if (!repairedTravel.insufficient) {
            galleryColumnStretchRepair = repair;
            galleryColumnStretchFailure = null;
            galleryTravel = repairedTravel;
          } else {
            repair.restore();
            galleryTravel = measureStickyTravel(
              galleryHost,
              galleryTravelBoundary,
              stickyTop,
              travelMeasurementOptions,
            );
            cacheGalleryColumnStretchFailure();
          }
        } else {
          cacheGalleryColumnStretchFailure();
        }
      }
    } else if (!galleryTravel?.insufficient) {
      galleryColumnStretchFailure = null;
    }
    // Failed travel is represented as another blocker so it participates in the same unresolved
    // blocker diagnostics and fallback decision as CSS overflow/containment blockers.
    if (
      galleryHost &&
      galleryTravelBoundary &&
      !isDocumentFallbackBoundary(galleryTravelBoundary) &&
      galleryTravel?.insufficient
    ) {
      galleryBlockerElements.add(galleryTravelBoundary);
      const existing = blockerByElement.get(galleryTravelBoundary);
      if (existing) {
        existing.reasons = [
          ...new Set([...existing.reasons, 'insufficient-sticky-travel' as const]),
        ];
        existing.repairable = existing.reasons.some(
          (reason) => reason !== 'insufficient-sticky-travel',
        );
      } else {
        blockerByElement.set(galleryTravelBoundary, {
          element: galleryTravelBoundary,
          reasons: ['insufficient-sticky-travel'],
          ownedByOv25: isOv25OwnedElement(galleryTravelBoundary),
          repairable: false,
        });
      }
    }

    // Remove repairs for ancestors no longer in either host chain. During reconciliation, also
    // discard repairs whose blocker disappeared, changed ownership, or is no longer repairable.
    for (const [element, repair] of ownedRepairs) {
      if (!activeElements.has(element)) {
        repair.restore();
        ownedRepairs.delete(element);
        continue;
      }
      if (reconcilingRepairs) {
        const blocker = blockerByElement.get(element);
        if (
          !blocker?.ownedByOv25 ||
          !blocker.repairable ||
          options.repairOwnedWrappers === false
        ) {
          repair.restore();
          ownedRepairs.delete(element);
        }
      }
    }

    // Repair only positively identified OV25 wrappers. Any remaining gallery blocker requires
    // body fallback; variants-only blockers are reported but do not relocate the gallery.
    const unresolved: StickyBlockingAncestor[] = [];
    let galleryNeedsFallback = false;
    for (const blocker of blockerByElement.values()) {
      const travelReasons = blocker.reasons.filter(
        (reason) => reason === 'insufficient-sticky-travel',
      );
      const repairableReasons = blocker.reasons.filter(
        (reason) => reason !== 'insufficient-sticky-travel',
      );
      let unresolvedBlocker = blocker;
      const shouldRepair =
        blocker.ownedByOv25 &&
        repairableReasons.length > 0 &&
        options.repairOwnedWrappers !== false;
      if (shouldRepair) {
        const repairableBlocker: StickyBlockingAncestor = {
          ...blocker,
          reasons: repairableReasons,
          repairable: true,
        };
        let repair = ownedRepairs.get(blocker.element);
        if (!repair) {
          repair = repairOv25OwnedStickyBlocker(repairableBlocker) ?? undefined;
          if (repair) ownedRepairs.set(blocker.element, repair);
        } else {
          repair.reconcile(
            reconcilingRepairs
              ? repairableBlocker
              : {
                  ...repairableBlocker,
                  reasons: [...new Set([...repair.reasons, ...repairableReasons])],
                },
          );
        }
        if (repair) {
          reportDiagnostic({
            code: 'sticky-blocking-ancestor',
            message: `Repaired an OV25-owned sticky wrapper (${repairableReasons.join(', ')}).`,
            element: blocker.element,
            reasons: repairableReasons,
            ownedByOv25: true,
            requiresBodyFallback: false,
          });
          if (travelReasons.length === 0) continue;
          unresolvedBlocker = {
            ...blocker,
            reasons: travelReasons,
            repairable: false,
          };
        }
      }

      unresolved.push(unresolvedBlocker);
      const affectsGallery = galleryBlockerElements.has(unresolvedBlocker.element);
      if (affectsGallery) galleryNeedsFallback = true;
      if (!unresolvedBlocker.ownedByOv25) {
        reportDiagnostic({
          code: 'sticky-blocking-ancestor',
          message: affectsGallery
            ? `Client ancestor blocks gallery sticky positioning (${unresolvedBlocker.reasons.join(', ')}); body-host fallback is required.`
            : `Client ancestor blocks variants sticky positioning (${unresolvedBlocker.reasons.join(', ')}); gallery body-host fallback is not required.`,
          element: unresolvedBlocker.element,
          reasons: unresolvedBlocker.reasons,
          ownedByOv25: false,
          requiresBodyFallback: affectsGallery,
        });
      }
    }

    // Once another gallery blocker requires fallback, retaining a column stretch would mutate the
    // client layout without providing native sticky behavior, so restore it before relocation.
    if (galleryNeedsFallback && galleryColumnStretchRepair) {
      releaseGalleryColumnStretchRepair();
      cacheGalleryColumnStretchFailure();
    }

    // Keep body relocation constrained to the product layout so the fixed gallery stops and
    // scrolls away at the end of the product rather than remaining fixed across the whole page.
    const needsFallback = galleryNeedsFallback;
    let boundary = findCommonStickyBoundary(hosts);
    if (
      needsFallback &&
      !boundary &&
      isUsefulStickyBoundary(originalGalleryTargetParent, documentObject)
    ) {
      boundary = originalGalleryTargetParent;
      reportDiagnostic({
        code: 'sticky-boundary-parent-fallback',
        message: 'Sticky hosts have no useful common boundary; using the original gallery target parent.',
        element: boundary,
        requiresBodyFallback: true,
      });
    }
    const initialBoundary = boundary;
    // Walk outward when the nearest product boundary is too short to provide the required travel.
    if (needsFallback && boundary && galleryHost) {
      boundary = findSufficientStickyBoundary(
        boundary,
        galleryHost,
        stickyTop,
        travelMeasurementOptions,
      );
      if (boundary !== initialBoundary) {
        reportDiagnostic({
          code: 'sticky-boundary-insufficient-travel',
          message: boundary
            ? 'The nearest sticky boundary is too short; using a broader product boundary for body-host fallback.'
            : 'Sticky body-host fallback is disabled because no product-scoped boundary provides enough travel.',
          element: boundary ?? initialBoundary ?? undefined,
          reasons: ['insufficient-sticky-travel'],
          requiresBodyFallback: boundary !== null,
        });
      }
    }
    if (needsFallback && !boundary) {
      reportDiagnostic({
        code: 'sticky-boundary-missing',
        message: 'Sticky body-host fallback is disabled because no useful product boundary was found.',
        requiresBodyFallback: false,
      });
    }

    return {
      blockers: unresolved,
      requiresBodyFallback: needsFallback && boundary !== null,
      boundary,
      observedBlockers: uniqueElements([
        ...blockerByElement.keys(),
        ...ownedRepairs.keys(),
        galleryColumnStretchRepair?.element,
        galleryColumnStretchRepair?.container,
        initialBoundary,
      ]),
    };
  };

  const measure = (): void => {
    frameId = null;
    if (!started || destroyed) return;

    const viewportHeight = viewportHeightForWindow(windowObject);
    const viewportWidth = viewportWidthForWindow(windowObject);
    const headerResolution = resolveStickyHeaderElements(root, options.headerSelector, {
      viewportHeight,
      viewportWidth,
      scrollY: windowObject.scrollY,
      readStyle,
    });
    const headerDiagnostic = resolutionDiagnostic(headerResolution);
    if (headerDiagnostic) reportDiagnostic(headerDiagnostic);

    reconnectHeaderMotionListeners(headerResolution.elements);
    const headerOffset = getLargestVisibleHeaderBottom(
      headerResolution.elements,
      viewportHeight,
      readStyle,
    );
    // Header collapse may move the sticky top, but must not make the rendered gallery grow.
    sizingHeaderOffset = Math.max(sizingHeaderOffset, headerOffset);
    const resolvedGaps = resolveStickyLayoutGaps(galleryHost, variantsHost, windowObject);
    const gaps = {
      top: options.topGapOverride ?? resolvedGaps.top,
      bottom: options.bottomGapOverride ?? resolvedGaps.bottom,
    };
    const ancestorState = inspectAndRepairHostAncestors(headerOffset + gaps.top);

    reconnectResizeObserver([
      ...motionHeaderElements,
      galleryHost,
      variantsHost,
      optionHeader,
      ...ancestorState.observedBlockers,
      ancestorState.boundary,
      originalGalleryTargetParent,
    ]);

    const nextSnapshot: StickyLayoutSnapshot = {
      headerOffset,
      topGap: gaps.top,
      bottomGap: gaps.bottom,
      optionHeaderHeight: measureElementHeight(optionHeader, readStyle),
      headerElements: [...headerResolution.elements],
      headerStatus: headerResolution.status,
      headerSource: headerResolution.source,
      ancestorBlockers: ancestorState.blockers,
      requiresBodyFallback: ancestorState.requiresBodyFallback,
      fallbackBoundary: ancestorState.boundary,
    };
    const variables: StickyLayoutOwnedCssVariables = {
      ...createStickyLayoutCssVariables(
        nextSnapshot.headerOffset,
        nextSnapshot.optionHeaderHeight,
        nextSnapshot.topGap,
        nextSnapshot.bottomGap,
      ),
      [STICKY_LAYOUT_CSS_PROPERTIES.sizingHeaderOffset]: toPixels(sizingHeaderOffset),
      [STICKY_LAYOUT_CSS_PROPERTIES.galleryBottom]: toViewportPixels(
        galleryHost?.getBoundingClientRect().bottom ?? 0,
      ),
      [STICKY_LAYOUT_CSS_PROPERTIES.viewportWidth]: toPixels(
        documentObject.documentElement.clientWidth,
      ),
    };
    for (const host of uniqueElements([galleryHost, variantsHost])) {
      applyHostVariables(host, variables);
    }

    const changed = !hasMeasured || !sameSnapshot(snapshot, nextSnapshot);
    hasMeasured = true;
    snapshot = nextSnapshot;
    if (changed) options.onChange?.(cloneSnapshot(snapshot));
    if (galleryHost) notifyStickyGalleryFlowOrigin(galleryHost);
    const shouldMeasureAgain = measureAfterCurrentFrame;
    measureAfterCurrentFrame = false;
    if (activeHeaderMotions.size > 0 || shouldMeasureAgain) {
      scheduleMeasure();
    }
  };

  const scheduleMeasure = (scheduleOptions?: { afterCurrentFrame?: boolean }): void => {
    if (!started || destroyed) return;
    if (scheduleOptions?.afterCurrentFrame && frameId !== null) {
      measureAfterCurrentFrame = true;
      return;
    }
    if (frameId !== null) return;
    frameId = requestFrame(measure);
  };

  const onViewportScroll = (): void => scheduleMeasure();
  const onViewportResize = (): void => {
    repairsNeedReconciliation = true;
    scheduleMeasure();
  };

  const onMutations: MutationCallback = (records): void => {
    if (
      records.length === 0 ||
      records.some((record) => {
        if (record.type !== 'attributes' || !(record.target instanceof HTMLElement)) return true;
        const repair = ownedRepairs.get(record.target);
        const isManagedGalleryStretch =
          galleryColumnStretchRepair?.element === record.target &&
          galleryColumnStretchRepair.matchesAppliedStyle();
        return !(
          record.attributeName === 'style' &&
          (repair?.matchesAppliedStyle() || isManagedGalleryStretch)
        );
      })
    ) {
      repairsNeedReconciliation = true;
    }
    scheduleMeasure();
  };

  const start = (): void => {
    if (started || destroyed) return;
    const currentGalleryParent = galleryHost?.parentElement ?? null;
    if (
      currentGalleryParent !== originalGalleryTargetParent &&
      !isStickyBodyLayer(currentGalleryParent)
    ) {
      releaseStickyGalleryFlowOrigin(
        galleryHost,
        galleryFlowAnchorOwner,
        false,
      );
      originalGalleryTargetParent = currentGalleryParent;
      galleryFlowAnchor = bindStickyGalleryFlowOrigin(
        galleryHost,
        originalGalleryTargetParent,
        galleryFlowAnchorOwner,
      );
    }
    started = true;

    if (runtimeWindow.ResizeObserver) {
      resizeObserver = new runtimeWindow.ResizeObserver(() => {
        repairsNeedReconciliation = true;
        scheduleMeasure();
      });
    }
    if (runtimeWindow.MutationObserver) {
      mutationObserver = new runtimeWindow.MutationObserver(onMutations);
      const mutationRoot = root === documentObject ? documentObject.documentElement : (root as Node);
      if (mutationRoot) {
        mutationObserver.observe(mutationRoot, {
          attributes: true,
          childList: true,
          subtree: true,
        });
      }
    }

    documentObject.addEventListener('scroll', onViewportScroll, {
      capture: true,
      passive: true,
    });
    windowObject.addEventListener('scroll', onViewportScroll, { passive: true });
    windowObject.addEventListener('resize', onViewportResize, { passive: true });
    windowObject.addEventListener('orientationchange', onViewportResize, { passive: true });
    windowObject.visualViewport?.addEventListener('resize', onViewportResize, { passive: true });
    windowObject.visualViewport?.addEventListener('scroll', onViewportScroll, { passive: true });
    scheduleMeasure();
  };

  const setElements = (elements: StickyLayoutControllerElements): void => {
    const nextGalleryHost =
      'galleryHost' in elements ? elements.galleryHost ?? null : galleryHost;
    const nextGalleryParent = retainedStickyGalleryParent(nextGalleryHost);
    const galleryBindingChanged =
      'galleryHost' in elements &&
      (nextGalleryHost !== galleryHost || nextGalleryParent !== originalGalleryTargetParent);
    const hostsChanged =
      galleryBindingChanged ||
      ('variantsHost' in elements && elements.variantsHost !== variantsHost);
    if (hostsChanged) {
      restoreOwnedRepairs();
      restoreGalleryColumnStretchRepair();
    }
    if (galleryBindingChanged) {
      const previousGalleryHost = galleryHost;
      if (nextGalleryHost !== previousGalleryHost) restoreHostVariables(previousGalleryHost);
      releaseStickyGalleryFlowOrigin(
        previousGalleryHost,
        galleryFlowAnchorOwner,
        false,
      );
      galleryHost = nextGalleryHost;
      originalGalleryTargetParent = nextGalleryParent;
      galleryFlowAnchor = bindStickyGalleryFlowOrigin(
        galleryHost,
        originalGalleryTargetParent,
        galleryFlowAnchorOwner,
      );
    }
    if ('variantsHost' in elements && elements.variantsHost !== variantsHost) {
      restoreHostVariables(variantsHost);
      variantsHost = elements.variantsHost ?? null;
    }
    if ('optionHeader' in elements) optionHeader = elements.optionHeader ?? null;
    scheduleMeasure();
  };

  const destroy = (): void => {
    if (destroyed) return;
    destroyed = true;
    started = false;
    if (frameId !== null) {
      cancelFrame(frameId);
      frameId = null;
    }
    measureAfterCurrentFrame = false;
    resizeObserver?.disconnect();
    mutationObserver?.disconnect();
    resizeObservedElements = [];
    for (const element of motionHeaderElements) removeHeaderMotionListeners(element);
    motionHeaderElements = [];
    activeHeaderMotions.clear();
    documentObject.removeEventListener('scroll', onViewportScroll, { capture: true });
    windowObject.removeEventListener('scroll', onViewportScroll);
    windowObject.removeEventListener('resize', onViewportResize);
    windowObject.removeEventListener('orientationchange', onViewportResize);
    windowObject.visualViewport?.removeEventListener('resize', onViewportResize);
    windowObject.visualViewport?.removeEventListener('scroll', onViewportScroll);
    restoreOwnedRepairs();
    restoreGalleryColumnStretchRepair();
    releaseStickyGalleryFlowOrigin(
      galleryHost,
      galleryFlowAnchorOwner,
      true,
    );
    restoreHostVariables(galleryHost);
    if (variantsHost !== galleryHost) restoreHostVariables(variantsHost);
  };

  return {
    start,
    scheduleMeasure,
    setElements,
    getSnapshot: () => cloneSnapshot(snapshot),
    destroy,
  };
}
