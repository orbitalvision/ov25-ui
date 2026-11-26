import { VIEWPORT_PRESETS } from './viewport-presets.js';

/** Shared by the responsive layout Playwright helper and the E2E ledger, so titles and names agree. */
export const RESPONSIVE_LAYOUT_PRESETS = VIEWPORT_PRESETS;

/** Presets with committed pixel baselines, kept to one desktop and one phone. */
export const PIXEL_BASELINE_PRESET_IDS = Object.freeze(['desktop', 'phone-modern-portrait']);

/** One preset per Snap2 close path: the desktop builder, the phone drawer and the portrait-tablet drawer. */
export const SNAP2_CLOSE_PRESET_IDS = Object.freeze([
  'desktop',
  'phone-modern-portrait',
  'tablet-standard-portrait',
]);

/** The Snap2 close presets that use the mobile drawer: the phone and the portrait tablet. */
export const SNAP2_DRAWER_PRESET_IDS = Object.freeze(
  SNAP2_CLOSE_PRESET_IDS.filter((id) => expectedResponsiveLayout(responsivePreset(id), 'snap2') === 'mobile'),
);

/** Screenshot states each responsive test attaches, by how the fixture shows its configurator. */
export const RESPONSIVE_SCREENSHOT_STATES = Object.freeze({
  configure: Object.freeze(['page', 'open']),
  'on-load': Object.freeze(['open', 'page']),
  inline: Object.freeze(['page']),
});

const SURFACES = Object.freeze({
  standard: Object.freeze({ desktop: 'sheet', mobile: 'drawer' }),
  snap2: Object.freeze({ desktop: 'Snap2 builder', mobile: 'Snap2 drawer' }),
});

export function responsivePreset(id) {
  const preset = RESPONSIVE_LAYOUT_PRESETS.find((candidate) => candidate.id === id);
  if (!preset) throw new Error(`Unknown viewport preset: ${id}`);
  return preset;
}

/**
 * The layout ov25-ui should use at a preset. This repeats the rule in src/utils/viewport-mobile.ts on
 * purpose, so changing that rule fails these tests: below 768px wide is mobile, and Snap2 also treats
 * portrait tablets up to 1024px wide as mobile.
 */
export function expectedResponsiveLayout(preset, product = 'standard') {
  if (preset.width < 768) return 'mobile';
  const isPortraitTablet = preset.height > preset.width && preset.width <= 1024;
  return product === 'snap2' && isPortraitTablet ? 'mobile' : 'desktop';
}

export function responsiveSurface(preset, product = 'standard') {
  return SURFACES[product][expectedResponsiveLayout(preset, product)];
}

export function presetSize(preset) {
  return `${preset.width}×${preset.height}`;
}

/** How the ledger describes a preset in its viewport column. */
export function presetViewportLabel(preset) {
  return `${preset.label} ${preset.width} × ${preset.height}${preset.hasTouch ? ' · touch' : ''}`;
}

export function responsiveLayoutTestTitle(preset, variant) {
  return `${variant ? `${variant} ` : ''}layout fits the ${preset.id} viewport (${presetSize(preset)})`;
}

export function responsiveScreenshotName(preset, state, variant) {
  return `${variant ? `${variant}-` : ''}${preset.id}-${state}.png`;
}

export function responsiveScreenshotNames({ opens, variant }) {
  return RESPONSIVE_LAYOUT_PRESETS.flatMap((preset) =>
    RESPONSIVE_SCREENSHOT_STATES[opens].map((state) => responsiveScreenshotName(preset, state, variant)),
  );
}

/** Ledger rows for the tests `defineResponsiveLayoutTests` registers with the same options. */
export function responsiveLayoutLedgerTests({ opens, product = 'standard', variant }) {
  return RESPONSIVE_LAYOUT_PRESETS.map((preset) => {
    const layout = expectedResponsiveLayout(preset, product);
    const surface = responsiveSurface(preset, product);
    const landscape = preset.width > preset.height;
    const fits = [
      product === 'standard' ? 'the 3D view fits on screen without covering all of it' : null,
      opens === 'configure' || opens === 'on-load'
        ? landscape && product === 'standard'
          ? 'the Configure button shows beside the view'
          : 'the Configure button sits inside the viewport width'
        : null,
    ].filter(Boolean).join(', and ');
    const behaviour = {
      configure: `the ${surface} opens inside the viewport${product === 'snap2' ? '' : ' and closes again'}`,
      'on-load': `the ${surface} is open on load inside the viewport, then closes and leaves Configure visible`,
      inline: 'the inline variants render with no sheet or drawer open',
    }[opens];
    return Object.freeze({
      title: responsiveLayoutTestTitle(preset, variant),
      viewport: presetViewportLabel(preset),
      mode: `${layout === 'mobile' ? 'Mobile' : 'Desktop'} layout${variant ? ` · ${variant}` : ''}`,
      covers:
        `After the 3D view loads and the variant controls render, the ${layout} layout has no horizontal scroll, ${fits}; ${behaviour}. A screenshot of each state is attached.`,
    });
  });
}
