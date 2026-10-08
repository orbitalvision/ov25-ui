import { describe, expect, it } from 'vitest';
import {
  BODY_DIALOG_CONTENT_Z_INDEX,
  BODY_DIALOG_OVERLAY_Z_INDEX,
  BODY_MOBILE_GALLERY_Z_INDEX,
  BODY_MOBILE_DRAWER_PORTAL_Z_INDEX,
  BODY_SELECTION_DETAILS_PORTAL_Z_INDEX,
  BODY_SNAP2_AR_DIALOG_HOST_Z_INDEX,
  BODY_SNAP2_CHECKOUT_SHEET_PORTAL_Z_INDEX,
  BODY_SNAP2_MOBILE_MODULE_PICKER_Z_INDEX,
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
    expect(BODY_MOBILE_GALLERY_Z_INDEX).toBeLessThan(
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

  it('keeps the full-screen mobile viewer below every surface opened over it', () => {
    // The Snap2 mobile builder viewer covers the whole screen and takes touches, so anything that
    // must stay visible and tappable over it needs a higher tier.
    for (const surface of [
      BODY_MOBILE_DRAWER_PORTAL_Z_INDEX,
      BODY_DIALOG_OVERLAY_Z_INDEX,
      BODY_DIALOG_CONTENT_Z_INDEX,
      BODY_SNAP2_AR_DIALOG_HOST_Z_INDEX,
      BODY_SNAP2_CHECKOUT_SHEET_PORTAL_Z_INDEX,
      BODY_SNAP2_MOBILE_MODULE_PICKER_Z_INDEX,
    ]) {
      expect(BODY_MOBILE_GALLERY_Z_INDEX).toBeLessThan(surface);
    }
    expect(BODY_SNAP2_MOBILE_MODULE_PICKER_Z_INDEX).toBeLessThan(
      BODY_TOASTER_PORTAL_Z_INDEX,
    );
  });
});
