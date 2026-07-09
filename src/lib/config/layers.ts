/**
 * Body-level stacking contract for OV25 portals.
 *
 * These values intentionally sit near the browser's signed 32-bit maximum so
 * important injected UI stays above merchant page content and shadow-root UI,
 * while still giving overlays with ordering dependencies distinct layers.
 */
export const BODY_MOBILE_DRAWER_PORTAL_Z_INDEX = 2147483645;
export const BODY_POPOVER_PORTAL_Z_INDEX = 2147483645;
export const BODY_MODAL_PORTAL_Z_INDEX = 2147483645;
export const BODY_TRANSITION_PROXY_CLOSE_Z_INDEX = 2147483645;
export const BODY_SNAP2_CHECKOUT_SHEET_PORTAL_Z_INDEX = 2147483646;
export const BODY_SWATCHBOOK_PORTAL_Z_INDEX = 2147483646;
export const BODY_TRANSITION_PROXY_CLOSE_OVER_MOBILE_DRAWER_Z_INDEX = 2147483646;
export const BODY_DIALOG_OVERLAY_Z_INDEX = 2147483646;
export const BODY_DIALOG_CONTENT_Z_INDEX = 2147483646;
export const BODY_SNAP2_AR_DIALOG_HOST_Z_INDEX = 2147483646;
export const BODY_TOASTER_PORTAL_Z_INDEX = 2147483647;
export const BODY_TOASTER_SURFACE_Z_INDEX = 2147483647;
