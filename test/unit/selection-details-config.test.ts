import { describe, expect, it, vi } from 'vitest';
import { SelectionDetailsDisplayMode } from '../../src/types/config-enums';
import {
  normalizeInjectConfig,
  type InjectConfiguratorOptions,
  type SelectionDetailsConfig,
} from '../../src/types/inject-config';
import {
  buildFormStateFromInitialPayload,
  type ConfiguratorSetupPayload,
} from '../../setup/src/components/ConfiguratorSetup/initial-config-from-payload';
import { buildSerializableConfig } from '../../setup/src/components/ConfiguratorSetup/serialize-config';
import {
  DEFAULT_TYPE_SETTINGS,
  type TypeSettings,
} from '../../setup/src/components/ConfiguratorSetup/types';
import { mergeStoredTypeSettings } from '../../setup/src/components/ConfiguratorSetup/useConfiguratorSetup';
import {
  resolveEligibleSelectionDetailsSwatch,
  resolveSelectionDetailsImage,
  resizeSelectionDetailsImage,
} from '../../src/components/VariantSelectMenu/variant-cards/SelectionDetailsSurface';
import {
  DEFAULT_SELECTION_DETAILS_TOOLTIP_HOVER_DELAY_MS,
  MAX_SELECTION_DETAILS_TOOLTIP_HOVER_DELAY_MS,
  parseSelectionDetailsTooltipHoverDelay,
} from '../../src/lib/config/selection-details-tooltip-hover-delay';
import { STRING_REPLACEMENT_DEFINITIONS } from '../../src/lib/strings/string-keys';
import { PLACEHOLDER_IMAGE_URL } from '../../src/lib/placeholder-image';
import type { SelectionDetailsItem, Swatch } from '../../src/contexts/ov25-ui-context';
import {
  ELEMENT_SELECTORS,
  elementCssPropertiesFor,
  generateElementCSS,
} from '../../setup/src/lib/config/configurator-style-variables';

function groupedConfig(selectionDetails?: SelectionDetailsConfig): InjectConfiguratorOptions {
  return {
    apiKey: 'api-key',
    productLink: '1682',
    selectors: {},
    configurator: {
      displayMode: { desktop: 'sheet', mobile: 'drawer' },
      variants: {
        displayMode: { desktop: 'tree', mobile: 'list' },
        ...(selectionDetails ? { selectionDetails } : {}),
      },
    },
    callbacks: {
      addToBasket: () => undefined,
      buyNow: () => undefined,
      buySwatches: () => undefined,
    },
  };
}

function detailsItem(overrides: Partial<SelectionDetailsItem> = {}): SelectionDetailsItem {
  return {
    id: 'selection-1',
    optionId: 'fabric',
    groupId: 'plain',
    name: 'Selection one',
    selection: {
      id: 'selection-1',
      name: 'Selection one',
      price: 0,
      blurHash: '',
    },
    ...overrides,
  };
}

describe('selection details inject config', () => {
  it('exports stable display-mode values', () => {
    expect(SelectionDetailsDisplayMode).toEqual({
      None: 'none',
      Sheet: 'sheet',
      Fullscreen: 'fullscreen',
      Modal: 'modal',
      Tooltip: 'tooltip',
    });
  });

  it('keeps legacy behaviour when selectionDetails is omitted', () => {
    const normalized = normalizeInjectConfig(groupedConfig());

    expect(normalized.selectionDetailsDisplayModeDesktop).toBe('none');
    expect(normalized.selectionDetailsDisplayModeMobile).toBe('none');
  });

  it.each([
    ['none', 'none'],
    ['sheet', 'fullscreen'],
    ['fullscreen', 'fullscreen'],
    ['modal', 'modal'],
    ['tooltip', 'fullscreen'],
  ] as const)('inherits mobile mode from desktop %s as %s', (desktop, mobile) => {
    const normalized = normalizeInjectConfig(
      groupedConfig({ displayMode: { desktop } }),
    );

    expect(normalized.selectionDetailsDisplayModeDesktop).toBe(desktop);
    expect(normalized.selectionDetailsDisplayModeMobile).toBe(mobile);
  });

  it('preserves an explicit supported mobile mode', () => {
    const normalized = normalizeInjectConfig(
      groupedConfig({ displayMode: { desktop: 'tooltip', mobile: 'fullscreen' } }),
    );

    expect(normalized.selectionDetailsDisplayModeDesktop).toBe('tooltip');
    expect(normalized.selectionDetailsDisplayModeMobile).toBe('fullscreen');
  });

  it('warns and falls back when JavaScript supplies mobile tooltip', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const invalid = groupedConfig({
      displayMode: { desktop: 'modal', mobile: 'fullscreen' },
    }) as unknown as Record<string, any>;
    invalid.configurator.variants.selectionDetails.displayMode.mobile = 'tooltip';

    const normalized = normalizeInjectConfig(invalid as unknown as InjectConfiguratorOptions);

    expect(normalized.selectionDetailsDisplayModeDesktop).toBe('modal');
    expect(normalized.selectionDetailsDisplayModeMobile).toBe('fullscreen');
    expect(warn).toHaveBeenCalledOnce();
    expect(warn).toHaveBeenCalledWith(
      '[OV25-UI] Selection details tooltip display mode is not supported on mobile; falling back to fullscreen.',
    );
    warn.mockRestore();
  });

  it('maps legacy mobile sheet to fullscreen', () => {
    const legacy = groupedConfig({
      displayMode: { desktop: 'tooltip', mobile: 'fullscreen' },
    }) as unknown as Record<string, any>;
    legacy.configurator.variants.selectionDetails.displayMode.mobile = 'sheet';

    const normalized = normalizeInjectConfig(legacy as unknown as InjectConfiguratorOptions);

    expect(normalized.selectionDetailsDisplayModeMobile).toBe('fullscreen');
  });
});

describe('selection-details tooltip hover delay CSS variable', () => {
  it.each([
    [undefined, DEFAULT_SELECTION_DETAILS_TOOLTIP_HOVER_DELAY_MS],
    ['', DEFAULT_SELECTION_DETAILS_TOOLTIP_HOVER_DELAY_MS],
    ['invalid', DEFAULT_SELECTION_DETAILS_TOOLTIP_HOVER_DELAY_MS],
    ['300ms', 300],
    ['0.25s', 250],
    [' 1.5s ', 1_500],
    ['320', 320],
    ['-20ms', 0],
    ['100s', MAX_SELECTION_DETAILS_TOOLTIP_HOVER_DELAY_MS],
  ])('parses %j as %d milliseconds', (value, expected) => {
    expect(parseSelectionDetailsTooltipHoverDelay(value)).toBe(expected);
  });
});

describe('ConfiguratorSetup selection details', () => {
  it('exposes selection-details classes in Element styles', () => {
    const selectionDetailsSelectors = ELEMENT_SELECTORS
      .filter(({ selector }) => selector.startsWith('.ov25-selection-details-'))
      .map(({ selector, label, element }) => ({ selector, label, element }));

    expect(selectionDetailsSelectors).toEqual([
      { selector: '.ov25-selection-details-root', label: 'Selection details overlay', element: 'div' },
      { selector: '.ov25-selection-details-backdrop', label: 'Selection details backdrop', element: 'div' },
      { selector: '.ov25-selection-details-surface', label: 'Selection details surface', element: 'div' },
      { selector: '.ov25-selection-details-close', label: 'Selection details close button', element: 'button' },
      { selector: '.ov25-selection-details-image-frame', label: 'Selection details image frame', element: 'div' },
      { selector: '.ov25-selection-details-image', label: 'Selection details image', element: 'img' },
      { selector: '.ov25-selection-details-copy', label: 'Selection details text area', element: 'div' },
      { selector: '.ov25-selection-details-title', label: 'Selection details title', element: 'h2' },
      { selector: '.ov25-selection-details-description', label: 'Selection details description', element: 'p' },
      { selector: '.ov25-selection-details-footer', label: 'Selection details actions', element: 'div' },
      { selector: '.ov25-selection-details-swatch-toggle', label: 'Selection details swatchbook button', element: 'button' },
      { selector: '.ov25-selection-details-apply', label: 'Selection details apply button', element: 'button' },
    ]);
    expect(ELEMENT_SELECTORS).toContainEqual({
      selector: '.ov25-default-variant-card',
      label: 'Variant card',
      element: 'div',
    });
  });

  it('does not offer opacity where selection-details animation owns it', () => {
    expect(elementCssPropertiesFor('.ov25-selection-details-surface')).not.toContain('opacity');
    expect(elementCssPropertiesFor('.ov25-selection-details-backdrop')).not.toContain('opacity');
    expect(elementCssPropertiesFor('.ov25-selection-details-title')).toContain('opacity');
  });

  it('generates ordinary class rules that can override selection-details defaults', () => {
    expect(generateElementCSS({
      '.ov25-selection-details-surface': {
        'background-color': '#102030',
        'border-radius': '17px',
      },
      '.ov25-selection-details-title': {
        color: '#f43f5e',
        'font-size': '21px',
      },
    })).toBe(`.ov25-selection-details-surface {
  background-color: #102030;
  border-radius: 17px;
}

.ov25-selection-details-title {
  color: #f43f5e;
  font-size: 21px;
}`);
  });

  it.each(['standard', 'snap2', 'bedConfigurator'] as const)(
    'defaults new %s configs to tooltip/fullscreen and serializes them for preview',
    (layout) => {
      const state = buildFormStateFromInitialPayload({});
      const settings = state.typeSettings[layout];
      const serialized = buildSerializableConfig(layout, settings);

      expect(settings.configurator.selectionDetailsDisplayModeDesktop).toBe('tooltip');
      expect(settings.configurator.selectionDetailsDisplayModeMobile).toBe('fullscreen');
      expect(serialized.configurator?.variants?.selectionDetails?.displayMode).toEqual({
        desktop: 'tooltip',
        mobile: 'fullscreen',
      });
    },
  );

  it('hydrates a legacy saved payload as none/none', () => {
    const state = buildFormStateFromInitialPayload({
      standard: {
        flags: { hidePricing: true },
      },
    } as unknown as Partial<ConfiguratorSetupPayload>);
    const settings = state.typeSettings.standard;
    const serialized = buildSerializableConfig('standard', settings);

    expect(settings.configurator.selectionDetailsDisplayModeDesktop).toBe('none');
    expect(settings.configurator.selectionDetailsDisplayModeMobile).toBe('none');
    expect(serialized.configurator?.variants?.selectionDetails?.displayMode).toEqual({
      desktop: 'none',
      mobile: 'none',
    });
  });

  it('keeps omitted and empty layouts disabled in a partial legacy payload', () => {
    const state = buildFormStateFromInitialPayload({
      standard: {
        configurator: {
          variants: {
            selectionDetails: {
              displayMode: { desktop: 'modal', mobile: 'fullscreen' },
            },
          },
        },
      },
      snap2: {},
    } as Partial<ConfiguratorSetupPayload>);

    expect(state.typeSettings.standard.configurator.selectionDetailsDisplayModeDesktop).toBe(
      'modal',
    );
    expect(state.typeSettings.standard.configurator.selectionDetailsDisplayModeMobile).toBe(
      'fullscreen',
    );
    for (const layout of ['snap2', 'bedConfigurator'] as const) {
      expect(state.typeSettings[layout].configurator.selectionDetailsDisplayModeDesktop).toBe(
        'none',
      );
      expect(state.typeSettings[layout].configurator.selectionDetailsDisplayModeMobile).toBe(
        'none',
      );
    }
  });

  it('hydrates selection details and derives omitted mobile mode', () => {
    const state = buildFormStateFromInitialPayload({
      standard: {
        configurator: {
          variants: {
            displayMode: { desktop: 'tree', mobile: 'list' },
            selectionDetails: { displayMode: { desktop: 'tooltip' } },
          },
        },
      },
    } as Partial<ConfiguratorSetupPayload>);

    expect(state.typeSettings.standard.configurator.selectionDetailsDisplayModeDesktop).toBe(
      'tooltip',
    );
    expect(state.typeSettings.standard.configurator.selectionDetailsDisplayModeMobile).toBe(
      'fullscreen',
    );
  });

  it('migrates a saved mobile sheet to fullscreen', () => {
    const state = buildFormStateFromInitialPayload({
      standard: {
        configurator: {
          variants: {
            displayMode: { desktop: 'tree', mobile: 'list' },
            selectionDetails: {
              displayMode: { desktop: 'tooltip', mobile: 'sheet' },
            },
          },
        },
      },
    } as unknown as Partial<ConfiguratorSetupPayload>);

    expect(state.typeSettings.standard.configurator.selectionDetailsDisplayModeMobile).toBe(
      'fullscreen',
    );
  });

  it('keeps legacy localStorage form state on none/none', () => {
    const legacySettings = {
      configurator: {
        ...DEFAULT_TYPE_SETTINGS.standard.configurator,
        selectionDetailsDisplayModeDesktop: undefined,
        selectionDetailsDisplayModeMobile: undefined,
      },
    } as unknown as Partial<TypeSettings>;

    const merged = mergeStoredTypeSettings(DEFAULT_TYPE_SETTINGS.standard, legacySettings);

    expect(merged.configurator.selectionDetailsDisplayModeDesktop).toBe('none');
    expect(merged.configurator.selectionDetailsDisplayModeMobile).toBe('none');
  });

  it('keeps a layout omitted from legacy localStorage on none/none', () => {
    const merged = mergeStoredTypeSettings(DEFAULT_TYPE_SETTINGS.snap2, {});

    expect(merged.configurator.selectionDetailsDisplayModeDesktop).toBe('none');
    expect(merged.configurator.selectionDetailsDisplayModeMobile).toBe('none');
  });

  it('migrates a localStorage mobile sheet to fullscreen', () => {
    const legacySettings = {
      configurator: {
        ...DEFAULT_TYPE_SETTINGS.standard.configurator,
        selectionDetailsDisplayModeDesktop: 'modal',
        selectionDetailsDisplayModeMobile: 'sheet',
      },
    } as unknown as Partial<TypeSettings>;

    const merged = mergeStoredTypeSettings(DEFAULT_TYPE_SETTINGS.standard, legacySettings);

    expect(merged.configurator.selectionDetailsDisplayModeMobile).toBe('fullscreen');
  });
});

describe('selection details content', () => {
  const swatch: Swatch = {
    manufacturerId: 7,
    option: 'Fabric',
    name: 'Natural weave',
    thumbnail: {
      thumbnail: 'swatch-original.jpg',
      miniThumbnails: {
        large: 'swatch-large.jpg',
        medium: 'swatch-medium.jpg',
        small: 'swatch-small.jpg',
      },
    },
  };

  it('uses original selection, original swatch, then responsive images', () => {
    expect(resolveSelectionDetailsImage(detailsItem({
      selection: {
        id: 'selection-1',
        name: 'Selection one',
        price: 0,
        blurHash: '',
        thumbnail: 'selection-original.jpg',
        miniThumbnails: { large: 'selection-large.jpg' },
        swatch,
      },
    }))).toBe('selection-original.jpg');

    expect(resolveSelectionDetailsImage(detailsItem({
      selection: {
        id: 'selection-1',
        name: 'Selection one',
        price: 0,
        blurHash: '',
        swatch,
      },
    }))).toBe('swatch-original.jpg');

    expect(resolveSelectionDetailsImage(detailsItem({
      selection: {
        id: 'selection-1',
        name: 'Selection one',
        price: 0,
        blurHash: '',
        miniThumbnails: { medium: 'selection-medium.jpg' },
      },
    }))).toBe('selection-medium.jpg');
  });

  it('requests the agreed selection-details widths from the image CDN', () => {
    const original = 'https://cdn.orbital.vision/general/assets/fabric.jpg';
    expect(resizeSelectionDetailsImage(original, 400)).toBe(
      'https://cdn.orbital.vision/rs/general/assets/fabric.jpg?w=400',
    );
    expect(resizeSelectionDetailsImage(original, 800)).toBe(
      'https://cdn.orbital.vision/rs/general/assets/fabric.jpg?w=800',
    );

    const existingResize = 'https://cdn.orbital.vision/rs/general/assets/fabric.jpg?w=250';
    expect(resizeSelectionDetailsImage(existingResize, 800)).toBe(
      'https://cdn.orbital.vision/rs/general/assets/fabric.jpg?w=800',
    );
  });

  it('leaves non-CDN and placeholder images unchanged', () => {
    expect(resizeSelectionDetailsImage('https://example.com/fabric.jpg', 400)).toBe(
      'https://example.com/fabric.jpg',
    );
    expect(resizeSelectionDetailsImage(PLACEHOLDER_IMAGE_URL, 800)).toBe(
      PLACEHOLDER_IMAGE_URL,
    );
  });

  it('falls back to the placeholder and gates swatch enrichment by rules', () => {
    const item = detailsItem({ swatch });
    expect(resolveEligibleSelectionDetailsSwatch(item, true)).toBe(swatch);
    expect(resolveEligibleSelectionDetailsSwatch(item, false)).toBeUndefined();
    expect(resolveEligibleSelectionDetailsSwatch(detailsItem(), true)).toBeUndefined();
    expect(resolveSelectionDetailsImage(detailsItem())).toBe(PLACEHOLDER_IMAGE_URL);
  });

  it('registers every replaceable selection-details string', () => {
    const definitions = new Map(
      STRING_REPLACEMENT_DEFINITIONS.map((definition) => [definition.key, definition.defaultTemplate]),
    );
    expect(definitions.get('selectionDetailsApply')).toBe('Apply to Model');
    expect(definitions.get('selectionDetailsApplied')).toBe('Applied');
    expect(definitions.get('selectionDetailsAddToSwatchbook')).toBe('Add to swatchbook');
    expect(definitions.get('selectionDetailsRemoveFromSwatchbook')).toBe('Remove from swatchbook');
    expect(definitions.get('selectionDetailsClose')).toBe('Close');
  });
});
