import type { UnifiedSkuPayload } from '../types/inject-config.js';

/** A checkout callback needs a concrete SKU as well as a concrete price. */
export function isUsableIframeSkuPayload(payload: UnifiedSkuPayload | null): boolean {
  if (!payload) return false;
  return payload.lines.length > 0 && payload.lines.every((line) => line.skuString.trim().length > 0);
}

export function isCheckoutPayloadReady(hasReceivedPrice: boolean, hasReceivedSku: boolean): boolean {
  return hasReceivedPrice && hasReceivedSku;
}
