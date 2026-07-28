import { describe, expect, it } from 'vitest';
import { resolveVariantSelectMenuVisibility } from '../../src/components/VariantSelectMenu/VariantSelectMenu';

describe('VariantSelectMenu portal roles', () => {
  it('switches stable variants and configure portals without duplicate content', () => {
    expect(resolveVariantSelectMenuVisibility({
      activeInlineMode: true,
      portalRole: 'variants',
      hasConfigureTarget: true,
    })).toEqual({ renderInline: true, renderOverlay: false });
    expect(resolveVariantSelectMenuVisibility({
      activeInlineMode: true,
      portalRole: 'configure',
      hasConfigureTarget: true,
    })).toEqual({ renderInline: false, renderOverlay: false });

    expect(resolveVariantSelectMenuVisibility({
      activeInlineMode: false,
      portalRole: 'variants',
      hasConfigureTarget: true,
    })).toEqual({ renderInline: false, renderOverlay: false });
    expect(resolveVariantSelectMenuVisibility({
      activeInlineMode: false,
      portalRole: 'configure',
      hasConfigureTarget: true,
    })).toEqual({ renderInline: false, renderOverlay: true });
  });

  it('keeps the variants portal as the sole non-inline trigger without a configure target', () => {
    expect(resolveVariantSelectMenuVisibility({
      activeInlineMode: false,
      portalRole: 'variants',
      hasConfigureTarget: false,
    })).toEqual({ renderInline: false, renderOverlay: true });
  });
});
