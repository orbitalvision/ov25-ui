import { describe, expect, it } from 'vitest';
import {
  BODY_MOBILE_DRAWER_PORTAL_Z_INDEX,
  BODY_SELECTION_DETAILS_PORTAL_Z_INDEX,
  BODY_SNAP2_CHECKOUT_SHEET_PORTAL_Z_INDEX,
  BODY_STICKY_FULLSCREEN_PORTAL_Z_INDEX,
  BODY_STICKY_PORTAL_Z_INDEX,
  BODY_SWATCHBOOK_PORTAL_Z_INDEX,
  BODY_TOASTER_PORTAL_Z_INDEX,
} from '../../src/lib/config/layers.js';

describe('body portal layer order', () => {
  it('keeps details, the SwatchBook, and toasts on permanent tiers', () => {
    expect(BODY_STICKY_PORTAL_Z_INDEX).toBeLessThan(
      BODY_STICKY_FULLSCREEN_PORTAL_Z_INDEX,
    );
    expect(BODY_STICKY_FULLSCREEN_PORTAL_Z_INDEX).toBeLessThan(
      BODY_MOBILE_DRAWER_PORTAL_Z_INDEX,
    );
    expect(BODY_MOBILE_DRAWER_PORTAL_Z_INDEX).toBeLessThan(
      BODY_SNAP2_CHECKOUT_SHEET_PORTAL_Z_INDEX,
    );
    expect(BODY_SNAP2_CHECKOUT_SHEET_PORTAL_Z_INDEX).toBeLessThan(
      BODY_SELECTION_DETAILS_PORTAL_Z_INDEX,
    );
    expect(BODY_SELECTION_DETAILS_PORTAL_Z_INDEX).toBeLessThan(
      BODY_SWATCHBOOK_PORTAL_Z_INDEX,
    );
    expect(BODY_SWATCHBOOK_PORTAL_Z_INDEX).toBeLessThan(
      BODY_TOASTER_PORTAL_Z_INDEX,
    );
  });
});
