export const MOBILE_WIDTH_BREAKPOINT_PX = 768;
export const PORTRAIT_TABLET_MAX_WIDTH_PX = 1024;
export const ANY_HOVER_CAPABILITY_MEDIA_QUERY = '(any-hover: hover)';

type ComputeIsMobileViewportInput = {
  width: number;
  height: number;
  forceMobile?: boolean;
  isSnap2?: boolean;
};

/**
 * Mobile viewport check used by ov25-ui shell decisions.
 * Snap2 can additionally treat portrait tablet viewports as mobile.
 */
export function computeIsMobileViewport({
  width,
  height,
  forceMobile = false,
  isSnap2 = false,
}: ComputeIsMobileViewportInput): boolean {
  if (forceMobile) return true;
  if (width < MOBILE_WIDTH_BREAKPOINT_PX) return true;

  if (isSnap2) {
    const isPortrait = height > width;
    const isTabletWidth =
      width >= MOBILE_WIDTH_BREAKPOINT_PX && width <= PORTRAIT_TABLET_MAX_WIDTH_PX;
    if (isPortrait && isTabletWidth) return true;
  }

  return false;
}

/**
 * Selection details configured as a desktop tooltip need an input capable of
 * hovering. A touch-only tablet keeps its desktop shell, but must use the
 * configured mobile details surface so a tap can open it.
 */
export function computeSelectionDetailsUsesMobileMode({
  isMobile,
  canHover,
}: {
  isMobile: boolean;
  canHover: boolean;
}): boolean {
  return isMobile || !canHover;
}
