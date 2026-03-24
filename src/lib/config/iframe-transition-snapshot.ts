/** Parent → iframe: request one ImageBitmap before repositioning the configurator shell. */
export const IFRAME_MSG_REQUEST_TRANSITION_SNAPSHOT = 'REQUEST_TRANSITION_SNAPSHOT' as const

/** Iframe → parent: transferable ImageBitmap (not JSON payload). */
export const IFRAME_MSG_TRANSITION_SNAPSHOT = 'TRANSITION_SNAPSHOT' as const

export const IFRAME_MSG_TRANSITION_SNAPSHOT_ERROR = 'TRANSITION_SNAPSHOT_ERROR' as const

/** Max wait for iframe to respond with a bitmap or error. */
export const TRANSITION_SNAPSHOT_TIMEOUT_MS = 350

/** Matches desktop sheet iframe slide in useIframePositioning. */
export const TRANSITION_PROXY_HOLD_DESKTOP_MS = 500

/** Opacity fade before releasing the bitmap after the slide completes. */
export const TRANSITION_PROXY_FADE_MS = 160

/** Closing proxy slides off with the desktop sheet (matches variant panel / prior iframe slide-out). */
export const TRANSITION_PROXY_CLOSE_SLIDE_MS = 500

export const TRANSITION_PROXY_CLOSE_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)'

/** Legacy: slot-only closing proxy (modal now fades the full overlay instead). */
export const TRANSITION_PROXY_CLOSE_MODAL_FADE_MS = 220

/** ConfiguratorModal backdrop + panel; iframe opacity in/out uses the same values. */
export const TRANSITION_MODAL_OVERLAY_IN_MS = 280

export const TRANSITION_MODAL_OVERLAY_OUT_MS = 240

/** Same stacking as the sheet iframe so the bitmap sits above the variant shell during close. */
export const TRANSITION_PROXY_CLOSE_Z_INDEX = 2147483645

/** Mobile drawer host uses 2147483646; proxy must sit above it during the height collapse. */
export const TRANSITION_PROXY_CLOSE_Z_INDEX_MOBILE_DRAWER = 2147483647

/** ProductGallery iframe slot background layer; used to resolve the transition proxy fill color. */
export const CONFIGURATOR_IFRAME_BACKGROUND_PROBE_ID = 'ov25-configurator-background-color' as const

export const CONFIGURATOR_IFRAME_BACKGROUND_CSS_VAR = '--ov25-configurator-iframe-background-color' as const

export const CONFIGURATOR_IFRAME_BACKGROUND_FALLBACK = '#ffffff' as const
