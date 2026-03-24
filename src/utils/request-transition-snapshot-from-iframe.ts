import {
  IFRAME_MSG_REQUEST_TRANSITION_SNAPSHOT,
  IFRAME_MSG_TRANSITION_SNAPSHOT,
  IFRAME_MSG_TRANSITION_SNAPSHOT_ERROR,
  TRANSITION_SNAPSHOT_TIMEOUT_MS,
} from '../lib/config/iframe-transition-snapshot.js'

function getConfiguratorIframe(uniqueId?: string): HTMLIFrameElement | null {
  const iframeId = uniqueId ? `ov25-configurator-iframe-${uniqueId}` : 'ov25-configurator-iframe'
  return document.getElementById(iframeId) as HTMLIFrameElement | null
}

/**
 * Asks the OV25 iframe for one composited WebGL frame (ImageBitmap transfer).
 * Returns null on timeout, missing iframe, or capture failure.
 */
export function requestTransitionSnapshotFromIframe(uniqueId?: string): Promise<ImageBitmap | null> {
  const iframe = getConfiguratorIframe(uniqueId)
  const contentWindow = iframe?.contentWindow ?? null
  if (!contentWindow) {
    return Promise.resolve(null)
  }

  const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`

  return new Promise((resolve) => {
    const finish = (bitmap: ImageBitmap | null) => {
      window.clearTimeout(timeoutId)
      window.removeEventListener('message', onMessage)
      resolve(bitmap)
    }

    const onMessage = (event: MessageEvent) => {
      if (event.source !== contentWindow) return
      const data = event.data
      if (!data || typeof data !== 'object') return
      if (data.requestId !== requestId) return
      if (data.type === IFRAME_MSG_TRANSITION_SNAPSHOT && data.bitmap instanceof ImageBitmap) {
        finish(data.bitmap)
      } else if (data.type === IFRAME_MSG_TRANSITION_SNAPSHOT_ERROR) {
        finish(null)
      }
    }

    const timeoutId = window.setTimeout(() => finish(null), TRANSITION_SNAPSHOT_TIMEOUT_MS)

    window.addEventListener('message', onMessage)
    contentWindow.postMessage(
      {
        type: IFRAME_MSG_REQUEST_TRANSITION_SNAPSHOT,
        payload: JSON.stringify({ requestId }),
      },
      '*'
    )
  })
}
