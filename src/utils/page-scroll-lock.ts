type SavedInlineStyleDeclaration = {
  property: string;
  value: string;
  priority: string;
};

type PageScrollLockSnapshot = {
  bodyDeclarations: SavedInlineStyleDeclaration[];
  htmlDeclarations: SavedInlineStyleDeclaration[];
  scrollX: number;
  scrollY: number;
};

const BODY_PAGE_LOCK_PROPERTIES = new Set([
  'width',
  'min-width',
  'max-width',
  'min-height',
  'box-sizing',
]);
const HTML_PAGE_LOCK_PROPERTIES = new Set([
  'overflow',
  'overflow-x',
  'overflow-y',
  'scrollbar-gutter',
]);

let pageScrollLockCount = 0;
let pageScrollLockSnapshot: PageScrollLockSnapshot | null = null;

function captureInlineStyleDeclarations(
  element: HTMLElement,
  properties: Set<string>,
): SavedInlineStyleDeclaration[] {
  const declarations: SavedInlineStyleDeclaration[] = [];
  for (let index = 0; index < element.style.length; index += 1) {
    const property = element.style.item(index);
    if (!properties.has(property)) continue;
    declarations.push({
      property,
      value: element.style.getPropertyValue(property),
      priority: element.style.getPropertyPriority(property),
    });
  }
  return declarations;
}

function restoreInlineStyleDeclarations(
  element: HTMLElement,
  properties: Set<string>,
  declarations: SavedInlineStyleDeclaration[],
): void {
  for (const property of properties) element.style.removeProperty(property);
  for (const declaration of declarations) {
    element.style.setProperty(
      declaration.property,
      declaration.value,
      declaration.priority,
    );
  }
}

function setPageLockStyle(
  element: HTMLElement,
  property: string,
  value: string,
): void {
  element.style.setProperty(property, value, 'important');
}

/**
 * Freeze the merchant page at its current geometry while a modal-style
 * overlay is mounted. Calls are reference counted so nested overlays share a
 * single snapshot and restore the original inline styles only after the final
 * overlay releases its lock. The body deliberately stays in normal flow so
 * merchant sticky/fixed elements do not recompute when an overlay opens.
 */
export function acquirePageScrollLock(): () => void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return () => {};

  pageScrollLockCount += 1;
  if (pageScrollLockCount === 1) {
    const body = document.body;
    const html = document.documentElement;
    const hasReservedScrollbar = window.innerWidth > html.clientWidth;
    const bodyStyle = window.getComputedStyle(body);
    const bodyRect = body.getBoundingClientRect();
    const bodyScrollHeight = body.scrollHeight;
    const zoom = bodyStyle.getPropertyValue('zoom').trim();
    const zoomIsNormal =
      !zoom ||
      zoom === 'normal' ||
      Math.abs((Number.parseFloat(zoom) || 1) - 1) < 0.001;
    const canFreezeBodyWidth =
      bodyStyle.display !== 'contents' &&
      bodyStyle.transform === 'none' &&
      zoomIsNormal &&
      bodyRect.width > 0;

    pageScrollLockSnapshot = {
      bodyDeclarations: captureInlineStyleDeclarations(body, BODY_PAGE_LOCK_PROPERTIES),
      htmlDeclarations: captureInlineStyleDeclarations(html, HTML_PAGE_LOCK_PROPERTIES),
      scrollX: window.scrollX,
      scrollY: window.scrollY,
    };

    // Removing a classic scrollbar normally widens the root layout viewport.
    // Preserve the body's existing border box while leaving it in normal flow,
    // so merchant sticky/fixed elements keep their scrolling context. OV25's
    // fixed portal hosts can then use the newly exposed physical viewport edge.
    if (hasReservedScrollbar && canFreezeBodyWidth) {
      const frozenWidth = `${bodyRect.width}px`;
      setPageLockStyle(body, 'box-sizing', 'border-box');
      setPageLockStyle(body, 'width', frozenWidth);
      setPageLockStyle(body, 'min-width', frozenWidth);
      setPageLockStyle(body, 'max-width', frozenWidth);
      if (bodyScrollHeight > bodyRect.height) {
        setPageLockStyle(body, 'min-height', `${bodyScrollHeight}px`);
      }
      setPageLockStyle(html, 'scrollbar-gutter', 'auto');
    } else if (hasReservedScrollbar) {
      // Unusual transformed/zoomed/display:contents bodies cannot be measured
      // safely. Preserve their layout viewport with the native gutter instead.
      setPageLockStyle(html, 'scrollbar-gutter', 'stable');
    }
    setPageLockStyle(html, 'overflow-x', 'hidden');
    setPageLockStyle(html, 'overflow-y', 'hidden');
  }

  let released = false;
  return () => {
    if (released) return;
    released = true;
    pageScrollLockCount = Math.max(0, pageScrollLockCount - 1);
    if (pageScrollLockCount !== 0) return;

    const snapshot = pageScrollLockSnapshot;
    pageScrollLockSnapshot = null;
    if (!snapshot) return;

    restoreInlineStyleDeclarations(
      document.body,
      BODY_PAGE_LOCK_PROPERTIES,
      snapshot.bodyDeclarations,
    );
    restoreInlineStyleDeclarations(
      document.documentElement,
      HTML_PAGE_LOCK_PROPERTIES,
      snapshot.htmlDeclarations,
    );
    window.scrollTo(snapshot.scrollX, snapshot.scrollY);
  };
}
