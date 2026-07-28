import type { ElementSelector } from '../types/inject-config.js';

export type CarouselTargetStatus =
  | 'resolved'
  | 'missing'
  | 'invalid'
  | 'not-found'
  | 'ambiguous';

export interface CarouselTargetSnapshot {
  status: CarouselTargetStatus;
  selector?: string;
  target: HTMLElement | null;
  scope: ParentNode;
  error?: unknown;
}

export interface CarouselTargetControllerOptions {
  document: Document;
  selector?: ElementSelector;
  galleryHost?: HTMLElement | null;
  variantsHost?: HTMLElement | null;
  onChange: (snapshot: CarouselTargetSnapshot) => void;
  onDiagnostic?: (message: string, error?: unknown) => void;
}

export interface CarouselTargetController {
  start(): void;
  measure(): CarouselTargetSnapshot;
  destroy(): void;
}

export const EXTERNAL_CAROUSEL_HOST_ATTRIBUTE = 'data-ov25-external-carousel';

function selectorToString(selector: ElementSelector | undefined): string | undefined {
  const value = typeof selector === 'string' ? selector : selector?.selector ?? selector?.id;
  const trimmed = value?.trim();
  return trimmed || undefined;
}

export const MOBILE_INLINE_STICKY_CAROUSEL_TARGET_SELECTOR =
  '[data-ov25-sticky-mobile-carousel]';

export function resolveCarouselTargetSelectorForViewport(options: {
  desktopSelector?: ElementSelector;
  mobileSelector?: ElementSelector;
  isMobile: boolean;
  mobileInlineSticky: boolean;
  isSnap2: boolean;
}): ElementSelector | undefined {
  if (options.isSnap2) return undefined;
  const configuredSelector = options.isMobile
    ? options.mobileSelector
    : options.desktopSelector;
  if (selectorToString(configuredSelector)) return configuredSelector;
  return options.isMobile && options.mobileInlineSticky
    ? MOBILE_INLINE_STICKY_CAROUSEL_TARGET_SELECTOR
    : undefined;
}

function isElementNode(value: unknown): value is Element {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as Node).nodeType === 1 &&
    typeof (value as Element).getRootNode === 'function'
  );
}

function isShadowRootNode(value: unknown): value is ShadowRoot {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as Node).nodeType === 11 &&
    isElementNode((value as ShadowRoot).host) &&
    typeof (value as ShadowRoot).querySelectorAll === 'function'
  );
}

function isQueryableParentNode(value: unknown): value is ParentNode {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as ParentNode).querySelectorAll === 'function'
  );
}

export function isHTMLElementInOwnerDocument(value: unknown): value is HTMLElement {
  if (!isElementNode(value)) return false;
  const ownerDocument = value.ownerDocument;
  const HTMLElementConstructor = ownerDocument?.defaultView?.HTMLElement;
  if (HTMLElementConstructor) return value instanceof HTMLElementConstructor;

  return (
    value.namespaceURI === 'http://www.w3.org/1999/xhtml' &&
    typeof (value as HTMLElement).style?.setProperty === 'function'
  );
}

function parentScopeAcrossShadow(node: ParentNode): ParentNode | null {
  const parentNode = (node as Node).parentNode;
  if (isQueryableParentNode(parentNode)) return parentNode;
  if (isShadowRootNode(node)) return node.host;
  return null;
}

// Finds the nearest light/shadow-DOM query scope shared by the gallery and variants hosts,
// preventing cross-configurator matches (>=2 configurators on one page); falls back to document when no useful scope exists.
function commonHostScope(
  documentObject: Document,
  galleryHost?: HTMLElement | null,
  variantsHost?: HTMLElement | null,
): ParentNode {
  if (!galleryHost?.isConnected || !variantsHost?.isConnected) return documentObject;

  const galleryAncestors = new Set<ParentNode>();
  let current: ParentNode | null = galleryHost;
  while (current) {
    galleryAncestors.add(current);
    current = parentScopeAcrossShadow(current);
  }

  current = variantsHost;
  while (current) {
    if (galleryAncestors.has(current)) {
      if (
        current === documentObject ||
        current === documentObject.body ||
        current === documentObject.documentElement
      ) {
        return documentObject;
      }
      return current;
    }
    current = parentScopeAcrossShadow(current);
  }

  return documentObject;
}

function matchingElements(root: ParentNode, selector: string): Element[] {
  const matches = Array.from(root.querySelectorAll(selector));
  if (isElementNode(root) && root.matches(selector)) matches.unshift(root);
  return matches;
}

// Resolves exactly one valid HTML target in this configurator's scope, or returns a missing,
// not-found, ambiguous, or invalid status snapshot so callers can fall back to the
// embedded carousel.
export function resolveCarouselTarget(
  options: Pick<
    CarouselTargetControllerOptions,
    'document' | 'selector' | 'galleryHost' | 'variantsHost'
  >,
): CarouselTargetSnapshot {
  const { document: documentObject, galleryHost, variantsHost } = options;
  const scope = commonHostScope(documentObject, galleryHost, variantsHost);
  const selector = selectorToString(options.selector);
  if (!selector) return { status: 'missing', target: null, scope };

  try {
    const matches = matchingElements(scope, selector);
    if (matches.length === 0) {
      return { status: 'not-found', selector, target: null, scope };
    }
    if (matches.length > 1) {
      return { status: 'ambiguous', selector, target: null, scope };
    }
    if (!isHTMLElementInOwnerDocument(matches[0])) {
      return {
        status: 'invalid',
        selector,
        target: null,
        scope,
        error: new TypeError('Carousel target must be an HTML element.'),
      };
    }
    return { status: 'resolved', selector, target: matches[0], scope };
  } catch (error) {
    return { status: 'invalid', selector, target: null, scope, error };
  }
}

function shadowRootForScope(scope: ParentNode, documentObject: Document): ShadowRoot | null {
  if (isShadowRootNode(scope)) return scope;
  if (!isElementNode(scope)) return null;
  const root = scope.getRootNode();
  return root !== documentObject && isShadowRootNode(root) ? root : null;
}

function isWithinOwnedExternalHost(value: unknown): boolean {
  let current: Element | null = isElementNode(value) ? value : null;
  while (current) {
    if (current.hasAttribute(EXTERNAL_CAROUSEL_HOST_ATTRIBUTE)) return true;
    current = isElementNode(current.parentNode) ? current.parentNode : null;
  }
  return false;
}

function mutationOnlyChangesOwnedExternalHost(record: MutationRecord): boolean {
  if (isWithinOwnedExternalHost(record.target)) return true;
  if (record.type === 'attributes') return false;
  if (record.type !== 'childList') return false;
  const changedNodes = [...Array.from(record.addedNodes), ...Array.from(record.removedNodes)];
  return changedNodes.length > 0 && changedNodes.every(isWithinOwnedExternalHost);
}

function nodeContains(node: unknown, target: unknown): boolean {
  if (node === target) return true;
  return (
    isElementNode(node) &&
    typeof target === 'object' &&
    target !== null &&
    typeof (target as Node).nodeType === 'number' &&
    typeof node.contains === 'function' &&
    node.contains(target as Node)
  );
}

function mutationNodeAffectsTarget(node: unknown, target: HTMLElement): boolean {
  return nodeContains(node, target) || nodeContains(target, node);
}

function mutationRequiresSelectorRevalidation(
  record: MutationRecord,
  target: HTMLElement | null,
): boolean {
  if (!target) return false;
  if (record.type === 'attributes') return mutationNodeAffectsTarget(record.target, target);
  if (record.type !== 'childList') return false;
  return (
    mutationNodeAffectsTarget(record.target, target) ||
    Array.from(record.removedNodes).some((node) => mutationNodeAffectsTarget(node, target))
  );
}

function canRetainOwnedTarget(
  previous: CarouselTargetSnapshot | null,
  next: CarouselTargetSnapshot,
  forceSelectorRevalidation: boolean,
): previous is CarouselTargetSnapshot & { status: 'resolved'; target: HTMLElement } {
  return (
    !forceSelectorRevalidation &&
    previous?.status === 'resolved' &&
    previous.target !== null &&
    previous.target.isConnected &&
    previous.selector === next.selector &&
    previous.scope === next.scope &&
    next.status === 'not-found'
  );
}

function snapshotsEqual(a: CarouselTargetSnapshot | null, b: CarouselTargetSnapshot): boolean {
  return (
    a?.status === b.status &&
    a.selector === b.selector &&
    a.target === b.target &&
    a.scope === b.scope
  );
}

// desktop/mobile selector
//   -> resolve one valid target
//   -> monitor target lifecycle
//   -> report target to OV25 context
//   -> ProductGallery portals carousel there
export function createCarouselTargetController(
  options: CarouselTargetControllerOptions,
): CarouselTargetController {
  const windowObject = options.document.defaultView;
  let observer: MutationObserver | null = null;
  let observedShadowRoot: ShadowRoot | null | undefined;
  let snapshot: CarouselTargetSnapshot | null = null;
  let started = false;
  let destroyed = false;
  let measureQueued = false;
  let queuedSelectorRevalidation = false;
  let lastDiagnostic = '';

  const syncObservedRoots = (scope: ParentNode): void => {
    if (!observer) return;
    const nextShadowRoot = shadowRootForScope(scope, options.document);
    if (observedShadowRoot === nextShadowRoot) return;

    observer.disconnect();
    if (options.document.documentElement) {
      observer.observe(options.document.documentElement, {
        attributes: true,
        childList: true,
        subtree: true,
      });
    }
    if (nextShadowRoot) {
      observer.observe(nextShadowRoot, {
        attributes: true,
        childList: true,
        subtree: true,
      });
    }
    observedShadowRoot = nextShadowRoot;
  };

  const report = (next: CarouselTargetSnapshot): void => {
    if (next.status === 'resolved' || next.status === 'missing') {
      lastDiagnostic = '';
      return;
    }
    const diagnostic = `${next.status}:${next.selector ?? ''}`;
    if (diagnostic === lastDiagnostic) return;
    lastDiagnostic = diagnostic;
    const reason =
      next.status === 'ambiguous'
        ? 'matched more than one element in the configurator scope'
        : next.status === 'invalid'
          ? 'is invalid or does not identify an HTML element'
          : 'was not found';
    options.onDiagnostic?.(
      `[OV25-UI] Carousel target "${next.selector}" ${reason}; using the embedded carousel.`,
      next.error,
    );
  };

  const measureWithOptions = (forceSelectorRevalidation = false): CarouselTargetSnapshot => {
    const resolved = resolveCarouselTarget(options);
    const next = canRetainOwnedTarget(snapshot, resolved, forceSelectorRevalidation)
      ? snapshot
      : resolved;
    report(next);
    if (!snapshotsEqual(snapshot, next)) {
      snapshot = next;
      options.onChange(next);
    }
    syncObservedRoots(next.scope);
    return next;
  };

  const measure = (): CarouselTargetSnapshot => measureWithOptions(false);

  const queueMeasure = (forceSelectorRevalidation = false): void => {
    queuedSelectorRevalidation ||= forceSelectorRevalidation;
    if (measureQueued || destroyed) return;
    measureQueued = true;
    queueMicrotask(() => {
      measureQueued = false;
      const force = queuedSelectorRevalidation;
      queuedSelectorRevalidation = false;
      if (started && !destroyed) measureWithOptions(force);
    });
  };

  const handleMutations = (records: MutationRecord[]): void => {
    const relevantRecords = records.filter(
      (record) => !mutationOnlyChangesOwnedExternalHost(record),
    );
    if (relevantRecords.length === 0) return;
    const currentTarget = snapshot?.status === 'resolved' ? snapshot.target : null;
    queueMeasure(
      relevantRecords.some((record) =>
        mutationRequiresSelectorRevalidation(record, currentTarget),
      ),
    );
  };

  return {
    start() {
      if (started || destroyed) return;
      started = true;
      const MutationObserverConstructor = windowObject?.MutationObserver;
      if (MutationObserverConstructor) {
        observer = new MutationObserverConstructor(handleMutations);
      }
      measure();
    },
    measure,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      observer?.disconnect();
      observer = null;
      observedShadowRoot = undefined;
    },
  };
}
