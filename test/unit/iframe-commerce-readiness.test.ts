import { describe, expect, it } from 'vitest';
import {
  isCheckoutPayloadReady,
  isUsableIframeSkuPayload,
} from '../../src/commerce/iframe-commerce-readiness';

describe('iframe commerce readiness', () => {
  it('requires a usable SKU after a price arrives before a checkout callback is ready', () => {
    const sku = {
      mode: 'single' as const,
      skuString: 'OV25-001',
      lines: [{ id: 'OV25-001', skuString: 'OV25-001', skuMap: {}, quantity: 1 }],
    };

    expect(isUsableIframeSkuPayload(null)).toBe(false);
    expect(isCheckoutPayloadReady(true, false)).toBe(false);
    expect(isUsableIframeSkuPayload(sku)).toBe(true);
    expect(isCheckoutPayloadReady(true, true)).toBe(true);
  });

  it('returns to not-ready after a configurator reset clears both snapshots', () => {
    expect(isCheckoutPayloadReady(false, false)).toBe(false);
  });
});
