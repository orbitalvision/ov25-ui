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
  'overflow',
  'overflow-x',
  'overflow-y',
  'position',
  'inset',
  'top',
  'right',
  'bottom',
  'left',
  'width',
  'min-width',
  'max-width',
  'box-sizing',
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
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
 * overlay releases its lock.
 */
export function acquirePageScrollLock(): () => void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return () => {};

  pageScrollLockCount += 1;
  if (pageScrollLockCount === 1) {
    const body = document.body;
    const html = document.documentElement;
    const bodyStyle = window.getComputedStyle(body);
    const bodyRect = body.getBoundingClientRect();
    const zoom = bodyStyle.getPropertyValue('zoom').trim();
    const zoomIsNormal = !zoom || zoom === 'normal' || Math.abs((Number.parseFloat(zoom) || 1) - 1) < 0.001;
    const canFreezeMeasuredBody =
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

    // Once the body becomes fixed, its authored root overflow stops being
    // propagated to the viewport and can clip content that extends beyond a
    // percentage-height body. Keep both axes visible and let the locked root
    // element own viewport clipping instead. Both axes are required because a
    // non-visible value on either axis can coerce the other axis to `auto`.
    setPageLockStyle(body, 'overflow-x', 'visible');
    setPageLockStyle(body, 'overflow-y', 'visible');
    setPageLockStyle(body, 'position', 'fixed');

    if (canFreezeMeasuredBody) {
      const frozenWidth = `${bodyRect.width}px`;
      setPageLockStyle(body, 'box-sizing', 'border-box');
      setPageLockStyle(body, 'margin-top', '0px');
      setPageLockStyle(body, 'margin-right', '0px');
      setPageLockStyle(body, 'margin-bottom', '0px');
      setPageLockStyle(body, 'margin-left', '0px');
      setPageLockStyle(body, 'top', `${bodyRect.top}px`);
      setPageLockStyle(body, 'right', 'auto');
      setPageLockStyle(body, 'bottom', 'auto');
      setPageLockStyle(body, 'left', `${bodyRect.left}px`);
      setPageLockStyle(body, 'width', frozenWidth);
      setPageLockStyle(body, 'min-width', frozenWidth);
      setPageLockStyle(body, 'max-width', frozenWidth);
      setPageLockStyle(html, 'scrollbar-gutter', 'auto');
    } else {
      setPageLockStyle(body, 'top', `${-window.scrollY}px`);
      setPageLockStyle(body, 'width', '100%');
      if (window.innerWidth > html.clientWidth) {
        setPageLockStyle(html, 'scrollbar-gutter', 'stable');
      }
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
