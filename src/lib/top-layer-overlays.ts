/**
 * Keeps OV25 body portals visible above a sticky gallery host that the relocation fallback has
 * promoted into the browser top layer (see `useStickyHostRelocation`).
 *
 * Top-layer elements paint above the whole document regardless of z-index, so a body portal such as
 * the selection-details tooltip can never win against a relocated gallery by z-index alone. While at
 * least one sticky host is in the top layer, every registered portal that currently renders content is
 * also shown as a manual popover. Top-layer paint order is "most recently shown on top", so portals
 * are (re)shown after the gallery, in ascending z-index tier, which keeps the existing body stacking
 * contract (`lib/config/layers.ts`) intact inside the top layer.
 *
 * Nothing changes when no sticky host is in the top layer (native sticky, or the body-layer fallback),
 * or when the Popover API is unavailable: portals keep their ordinary z-index stacking.
 */

type StyleSnapshot = { value: string; priority: string };

interface TopLayerPortalEntry {
  container: HTMLElement;
  root: ParentNode;
  tier: number;
  order: number;
  occupied: boolean;
  shown: boolean;
  prepared: boolean;
  popoverAttribute: string | null;
  styleSnapshots: Map<string, StyleSnapshot>;
  observer: MutationObserver | null;
}

type PopoverElement = HTMLElement & {
  showPopover?: () => void;
  hidePopover?: () => void;
};

/**
 * A `[popover]` element receives UA styles (`inset: 0; margin: auto; border; padding: 0.25em;
 * overflow: auto; color: CanvasText; background-color: Canvas`). Portal containers must keep their
 * fixed, full-viewport, transparent, click-through box. `!important` also guards against merchant
 * `[popover]` rules.
 */
const TOP_LAYER_PORTAL_STYLES: ReadonlyArray<readonly [string, string]> = [
  ['position', 'fixed'],
  ['top', '0'],
  ['left', '0'],
  ['right', 'auto'],
  ['bottom', 'auto'],
  ['width', '100%'],
  ['height', '100%'],
  ['max-width', 'none'],
  ['max-height', 'none'],
  ['margin', '0'],
  ['padding', '0'],
  ['border', '0'],
  ['overflow', 'visible'],
  ['background', 'transparent'],
  ['color', 'inherit'],
  ['pointer-events', 'none'],
];

const stickyHostsInTopLayer = new Set<HTMLElement>();
const entries = new Map<HTMLElement, TopLayerPortalEntry>();
/** Raised portals in the order they were shown (bottom → top of the top layer). */
let shownStack: TopLayerPortalEntry[] = [];
let registrationCounter = 0;

export function supportsTopLayerPopover(element: HTMLElement): boolean {
  const popover = element as PopoverElement;
  return typeof popover.showPopover === 'function' && typeof popover.hidePopover === 'function';
}

/** A portal is occupied while its root renders any element (React portals unmount when closed). */
function hasRenderedContent(root: ParentNode): boolean {
  for (const child of Array.from(root.children)) {
    const tag = child.tagName;
    if (tag !== 'STYLE' && tag !== 'LINK' && tag !== 'TEMPLATE') return true;
  }
  return false;
}

function prepare(entry: TopLayerPortalEntry): void {
  if (entry.prepared) return;
  const { container } = entry;
  entry.popoverAttribute = container.getAttribute('popover');
  for (const [property, value] of TOP_LAYER_PORTAL_STYLES) {
    entry.styleSnapshots.set(property, {
      value: container.style.getPropertyValue(property),
      priority: container.style.getPropertyPriority(property),
    });
    container.style.setProperty(property, value, 'important');
  }
  container.setAttribute('popover', 'manual');
  entry.prepared = true;
}

function release(entry: TopLayerPortalEntry): void {
  if (!entry.prepared) return;
  const { container } = entry;
  if (entry.popoverAttribute === null) container.removeAttribute('popover');
  else container.setAttribute('popover', entry.popoverAttribute);
  // Restore in reverse so shorthands (`margin`, `border`, …) cannot clobber restored longhands.
  for (const [property] of [...TOP_LAYER_PORTAL_STYLES].reverse()) {
    const previous = entry.styleSnapshots.get(property);
    if (previous?.value) container.style.setProperty(property, previous.value, previous.priority);
    else container.style.removeProperty(property);
  }
  entry.styleSnapshots.clear();
  entry.popoverAttribute = null;
  entry.prepared = false;
}

function show(entry: TopLayerPortalEntry): boolean {
  const popover = entry.container as PopoverElement;
  if (!supportsTopLayerPopover(popover) || !popover.isConnected) return false;
  prepare(entry);
  try {
    popover.showPopover!();
    entry.shown = true;
    return true;
  } catch {
    entry.shown = false;
    release(entry);
    return false;
  }
}

function hide(entry: TopLayerPortalEntry): void {
  if (!entry.shown) return;
  entry.shown = false;
  try {
    (entry.container as PopoverElement).hidePopover?.();
  } catch {
    // Already closed or disconnected; attribute/style restoration still applies.
  }
}

function pruneDisconnected(): void {
  for (const [container, entry] of entries) {
    if (container.isConnected) continue;
    entry.observer?.disconnect();
    entry.shown = false;
    entries.delete(container);
  }
  shownStack = shownStack.filter((entry) => entries.has(entry.container));
}

/**
 * Reconciles which portals are raised and their top-layer order.
 * `fromBottom` re-shows every raised portal, e.g. after a sticky host was (re)shown above them.
 */
function sync(fromBottom = false): void {
  pruneDisconnected();
  const desired = stickyHostsInTopLayer.size === 0
    ? []
    : [...entries.values()]
        .filter((entry) => entry.occupied)
        .sort((a, b) => a.tier - b.tier || a.order - b.order);

  let keep = 0;
  if (!fromBottom) {
    while (
      keep < shownStack.length &&
      keep < desired.length &&
      shownStack[keep] === desired[keep] &&
      shownStack[keep].shown
    ) {
      keep += 1;
    }
  }

  for (let index = shownStack.length - 1; index >= keep; index -= 1) hide(shownStack[index]);
  shownStack = shownStack.slice(0, keep);
  for (const entry of desired.slice(keep)) {
    if (show(entry)) shownStack.push(entry);
  }
  for (const entry of entries.values()) {
    if (!entry.shown) release(entry);
  }
}

/** Called by the sticky relocation after its host has been shown as a top-layer popover. */
export function notifyStickyHostEnteredTopLayer(host: HTMLElement): void {
  stickyHostsInTopLayer.add(host);
  // The host is now the most recently shown element, so every raised portal must be re-shown.
  sync(true);
}

/** Called by the sticky relocation after its host has left the top layer. */
export function notifyStickyHostLeftTopLayer(host: HTMLElement): void {
  if (!stickyHostsInTopLayer.delete(host)) return;
  sync();
}

/**
 * Lets a body-level portal container follow a top-layer sticky gallery. `root` is where the portal's
 * React content renders (normally the container's ShadowRoot) and `tier` is its body z-index, used to
 * order raised portals. Returns an unregister function. Registering the same container again
 * replaces its previous registration.
 */
export function registerTopLayerPortal(
  container: HTMLElement,
  root: ParentNode,
  tier: number,
): () => void {
  const existing = entries.get(container);
  if (existing) {
    existing.observer?.disconnect();
    hide(existing);
    release(existing);
    entries.delete(container);
  }

  const entry: TopLayerPortalEntry = {
    container,
    root,
    tier,
    order: registrationCounter += 1,
    occupied: hasRenderedContent(root),
    shown: false,
    prepared: false,
    popoverAttribute: null,
    styleSnapshots: new Map(),
    observer: null,
  };
  entries.set(container, entry);

  const MutationObserverCtor = container.ownerDocument.defaultView?.MutationObserver;
  if (MutationObserverCtor) {
    entry.observer = new MutationObserverCtor(() => {
      const occupied = hasRenderedContent(root);
      if (occupied === entry.occupied) return;
      entry.occupied = occupied;
      sync();
    });
    entry.observer.observe(root as Node, { childList: true });
  }
  if (stickyHostsInTopLayer.size > 0) sync();

  return () => {
    if (entries.get(container) !== entry) return;
    entry.observer?.disconnect();
    hide(entry);
    release(entry);
    entries.delete(container);
    sync();
  };
}

/** Test-only: whether a registered portal is currently raised into the top layer. */
export function isTopLayerPortalRaised(container: HTMLElement): boolean {
  return entries.get(container)?.shown ?? false;
}

/** Test-only: clears all registrations and tracked hosts. */
export function resetTopLayerOverlaysForTests(): void {
  for (const entry of entries.values()) {
    entry.observer?.disconnect();
    hide(entry);
    release(entry);
  }
  entries.clear();
  stickyHostsInTopLayer.clear();
  shownStack = [];
  registrationCounter = 0;
}
