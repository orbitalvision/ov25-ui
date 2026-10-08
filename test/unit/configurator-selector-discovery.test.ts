import { describe, expect, it } from 'vitest';
import { applySelectorDiscoveryProposal, getAvailableSelectorDiscoveryTargets, getSelectorDiscoveryCurrentValue, getSelectorDiscoveryTargetAvailability, isSafeSelectorDiscoverySelector, validateSelectorDiscoveryProposal, type SelectorDiscoveryProposal } from '../../setup/src/components/ConfiguratorSetup/selector-discovery';
import { DEFAULT_TYPE_SETTINGS } from '../../setup/src/components/ConfiguratorSetup/types';
import type { StorefrontIntegrationConfig } from '../../setup/src/components/ConfiguratorSetup/storefront-integration';

const proposal: SelectorDiscoveryProposal = {
  schemaVersion: 1, method: 'source', generatedAt: '2026-10-05T12:00:00Z',
  source: { id: 'test-theme', label: 'Test theme', kind: 'local-theme', fingerprint: 'abc', files: ['sections/product.liquid'] },
  warnings: [],
  targets: [
    { key: 'gallery', selector: '.product-gallery', confidence: 'high', reason: 'The product template names this gallery.', sourceFiles: ['sections/product.liquid'] },
    { key: 'configureButton', selector: '.configure-product', confidence: 'medium', reason: 'This button opens product options.', sourceFiles: ['sections/product.liquid'] },
    { key: 'headerSelector', selector: '.site-header', confidence: 'high', reason: 'This header is sticky.', sourceFiles: ['sections/product.liquid'] },
  ],
};
const readyIntegration: StorefrontIntegrationConfig = {
  status: 'ready', platformLabel: 'Shopify',
  values: { headerSelector: '#old-header' },
  sections: [{ id: 'placement', title: 'Placement', fields: [{ type: 'selector', key: 'headerSelector', label: 'Header' }] }],
  onChange: () => undefined,
};

describe('page placement proposal contract', () => {
  it('copies valid bounded proposals, including source evidence up to 48 files', () => {
    expect(validateSelectorDiscoveryProposal(proposal)).toEqual(proposal);
    expect(validateSelectorDiscoveryProposal(proposal)).not.toBe(proposal);
    const files = Array.from({ length: 48 }, (_, index) => `sections/product-${index}.liquid`);
    expect(validateSelectorDiscoveryProposal({ ...proposal, source: { ...proposal.source, files }, targets: [] }).source.files).toHaveLength(48);
    expect(() => validateSelectorDiscoveryProposal({ ...proposal, source: { ...proposal.source, files: [...files, 'extra.liquid'] } })).toThrow();
  });

  it.each(['body', 'html', '*', 'main', ':root', '#root', '.app', '[id="root"]', '[role="main"]', 'body.product-page', 'main#MainContent', '.product *', '.gallery, body', ':is(.gallery,body)', '.gallery::before', '\\62 ody', '.gallery{display:none}', '.gallery;', '[broken'])('rejects unsafe or overly broad selector %s', (selector) => {
    expect(isSafeSelectorDiscoverySelector(selector)).toBe(false);
    expect(() => validateSelectorDiscoveryProposal({ ...proposal, targets: [{ ...proposal.targets[0], selector }] })).toThrow();
  });

  it.each(['.product-gallery', '#product-gallery', '[data-product-gallery]', 'main .product-gallery', 'form.cart', 'product-media', 'header.site-header', '.product > .gallery', '.gallery img:first-child'])('accepts a scoped CSS selector %s', (selector) => {
    expect(isSafeSelectorDiscoverySelector(selector)).toBe(true);
  });

  it('rejects duplicates, unknown evidence, unknown targets and executable fields', () => {
    const invalid: unknown[] = [
      { ...proposal, targets: [proposal.targets[0], proposal.targets[0]] },
      { ...proposal, targets: [{ ...proposal.targets[0], key: 'rawJS' }] },
      { ...proposal, targets: [{ ...proposal.targets[0], sourceFiles: ['sections/unread.liquid'] }] },
      { ...proposal, targets: [{ ...proposal.targets[0], sourceFiles: [] }] },
      { ...proposal, targets: [{ ...proposal.targets[0], confidence: 'certain' }] },
      { ...proposal, targets: [{ ...proposal.targets[0], reason: 'x'.repeat(1001) }] },
      { ...proposal, targets: [{ ...proposal.targets[0], rawJS: 'alert(1)' }] },
      { ...proposal, customCSS: 'body { display: none; }' },
      { ...proposal, rawJS: 'alert(1)' },
      { ...proposal, generatedAt: 'yesterday' },
      { ...proposal, source: { ...proposal.source, files: ['../outside.liquid'] } },
      { ...proposal, source: { ...proposal.source, files: ['/private/theme.liquid'] } },
    ];
    for (const value of invalid) expect(() => validateSelectorDiscoveryProposal(value)).toThrow();
  });

  it('includes only enabled, changed placements with exact writable host fields', () => {
    const settings = structuredClone(DEFAULT_TYPE_SETTINGS.standard);
    expect(getAvailableSelectorDiscoveryTargets(proposal, settings).map((target) => target.key)).toEqual(['gallery']);
    expect(getAvailableSelectorDiscoveryTargets(proposal, settings, readyIntegration).map((target) => target.key)).toEqual(['gallery', 'headerSelector']);
    settings.selectors.gallery.selector = '.product-gallery';
    expect(getAvailableSelectorDiscoveryTargets(proposal, settings, readyIntegration).map((target) => target.key)).toEqual(['headerSelector']);
    expect(getSelectorDiscoveryCurrentValue('headerSelector', settings, readyIntegration)).toBe('#old-header');
    expect(getSelectorDiscoveryTargetAvailability('configureButton', settings).available).toBe(false);
  });

  it('withholds integration targets for absent, loading, error, read-only and unavailable fields', () => {
    const settings = structuredClone(DEFAULT_TYPE_SETTINGS.standard);
    const cases: (StorefrontIntegrationConfig | undefined)[] = [undefined, { status: 'loading' }, { status: 'error', message: 'Unavailable' },
      { ...readyIntegration, readOnly: true }, { ...readyIntegration, sections: [] },
      { ...readyIntegration, sections: [{ id: 'test', title: 'Test', fields: [{ type: 'text', key: 'headerSelector', label: 'Header' }] }] },
      { ...readyIntegration, values: { headerSelector: false } }];
    for (const integration of cases) {
      expect(getSelectorDiscoveryTargetAvailability('headerSelector', settings, integration).available).toBe(false);
      expect(getAvailableSelectorDiscoveryTargets(proposal, settings, integration).map((target) => target.key)).toEqual(['gallery']);
    }
  });

  it('changes only enabled per-layout selector strings, preserving flags, styles and input data', () => {
    const settings = structuredClone(DEFAULT_TYPE_SETTINGS.standard);
    const original = structuredClone(settings);
    const result = applySelectorDiscoveryProposal(settings, proposal);
    expect(result.selectors.gallery.selector).toBe('.product-gallery');
    expect(result.selectors.configureButton).toEqual(original.selectors.configureButton);
    expect(result.selectors.gallery.replace).toBe(original.selectors.gallery.replace);
    expect(result.selectors.gallery.enabled).toBe(original.selectors.gallery.enabled);
    expect(result.branding).toBe(settings.branding);
    expect(result.style).toBe(settings.style);
    expect(result).not.toHaveProperty('headerSelector');
    expect(settings).toEqual(original);
  });
});
