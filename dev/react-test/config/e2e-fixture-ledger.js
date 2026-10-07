import {
  PIXEL_BASELINE_PRESET_IDS,
  SNAP2_CLOSE_PRESET_IDS,
  expectedResponsiveLayout,
  presetSize,
  presetViewportLabel,
  responsiveLayoutLedgerTests,
  responsivePreset,
  responsiveScreenshotNames,
} from './responsive-layout.js';

export const E2E_FIXTURE_LEDGER_VERSION = 1;

export const E2E_FIXTURE_RUNNER_COMMAND = 'node scripts/run-fixture-e2e.mjs';

const RESPONSIVE_NOTE =
  'The responsive layout tests attach a screenshot of each state at every viewport preset, including touch and mobile emulation for phones and tablets; page screenshots are taken with the gallery scrolled into view.';

/** Ledger rows for the @visual tests titled `${subject} matches its baseline at <preset> (<size>)`. */
function pixelBaselineTests(subject, covers) {
  return PIXEL_BASELINE_PRESET_IDS.map((id) => {
    const preset = responsivePreset(id);
    return Object.freeze({
      title: `${subject} matches its baseline at ${preset.id} (${presetSize(preset)})`,
      viewport: presetViewportLabel(preset),
      mode: 'Pixel baseline · headless',
      covers,
    });
  });
}

/** Committed baselines for `toHaveScreenshot(`${name}-<preset>.png`)` in a spec. */
function pixelBaselineFiles(specFile, name) {
  return PIXEL_BASELINE_PRESET_IDS.map((id) => `${specFile}-snapshots/${name}-${id}-chromium-darwin.png`);
}

const SNAP2_CLOSE_TESTS = Object.freeze(
  SNAP2_CLOSE_PRESET_IDS.map((id) => {
    const preset = responsivePreset(id);
    const onDesktop = expectedResponsiveLayout(preset, 'snap2') === 'desktop';
    return Object.freeze({
      title: `snap2 builder closes through the save dialog at ${preset.id} (${presetSize(preset)})`,
      viewport: presetViewportLabel(preset),
      mode: `Snap2 · ${onDesktop ? 'desktop builder' : 'mobile drawer'}`,
      covers: onDesktop
        ? 'Closing the settings panel and then the builder shows the save dialog; No closes the builder and brings back Configure.'
        : 'The builder opens, loads and shows the save dialog on close; tapping No is expected to fail for a known bug (the Snap2 mobile 3D layer sits above the drawer and covers the dialog, so a tap on No dismisses the dialog and the builder stays open). Playwright reports the test as unexpectedly passing once the bug is fixed.',
    });
  }),
);

export const HIDDEN_LOGO_REPORT_SCREENSHOTS = Object.freeze({
  desktopRangeLogoHidden: 'desktop-range-logo-hidden.png',
  desktopRangeLogoRestored: 'desktop-range-logo-restored.png',
  desktopSnap2HeaderHidden: 'desktop-snap2-header-hidden.png',
  desktopSnap2LogoRestored: 'desktop-snap2-logo-restored.png',
  mobileRangeControlsHideLogoDisabled: 'mobile-range-controls-hide-disabled.png',
  mobileRangeDrawerHideLogoDisabled: 'mobile-range-drawer-logo-free-hide-disabled.png',
  mobileRangeControlsHideLogoEnabled: 'mobile-range-controls-hide-enabled.png',
  mobileRangeDrawerHideLogoEnabled: 'mobile-range-drawer-logo-free-hide-enabled.png',
});

const CAROUSEL_RELOCATION_TESTS = Object.freeze([
  ...[
    { name: 'desktop', viewport: 'Desktop 1280 × 900', surface: 'sheet' },
    { name: 'mobile', viewport: 'Mobile 390 × 844', surface: 'drawer' },
  ].flatMap(({ name, viewport, surface }) => [
    Object.freeze({
      title: `relocates an ordinary ${name} carousel to its viewport target`,
      viewport,
      mode: `Carousel · ${surface}`,
      covers:
        `The only carousel renders inside the page's ${name} target instead of under the gallery, with the branding cssString adopted in its shadow root, while the other target stays empty.`,
    }),
    Object.freeze({
      title: `${name} carousel thumbnails switch the gallery between an image and the 3D view`,
      viewport,
      mode: `Carousel · ${surface}`,
      covers:
        'Clicking the relocated first image tile selects it and shows that image in the main gallery; clicking the 360° tile selects it again and brings back the 3D view.',
    }),
    Object.freeze({
      title: `${name} carousel stays in its target while the configurator opens and closes`,
      viewport,
      mode: `Carousel · ${surface}`,
      covers:
        `Opening and closing the ${surface} leaves exactly one carousel in the ${name} target and keeps the same 3D iframe element.`,
    }),
  ]),
  Object.freeze({
    title: 'switches viewport targets without duplicate carousels or iframe reload',
    viewport: 'Desktop 1280 × 900 → Mobile 390 × 844 → Desktop',
    mode: 'Carousel · sheet / drawer',
    covers:
      'Resizing moves the single carousel between the desktop and mobile targets without duplicates, and the 3D iframe element survives every switch.',
  }),
]);

const NO_PRICING_VARIANT_DISPLAY_MODES = Object.freeze([
  'wizard',
  'guided-overview',
  'list',
  'tabs',
  'accordion',
  'tree',
]);

const NO_PRICING_TESTS = Object.freeze([
  ...['standard', 'snap2'].flatMap((profile) =>
    NO_PRICING_VARIANT_DISPLAY_MODES.map((displayMode) =>
      Object.freeze({
        title: `${profile} / ${displayMode}: hides page pricing and purchase actions`,
        viewport: 'Desktop 1440 × 900',
        mode: `${profile === 'snap2' ? 'Snap2' : 'Standard'} · ${displayMode}`,
        covers:
          `flags.hidePricing removes product-page pricing and visible checkout actions before and after opening the rendered ${displayMode} variants surface.` +
          (displayMode === 'guided-overview'
            ? ' The hidden Buy Now action reserves no column, and Previous/Next share two equal columns.'
            : ''),
      }),
    ),
  ),
  ...['tabs', 'tree'].map((displayMode) =>
    Object.freeze({
      title: `${displayMode} fills the drawer without reserving hidden checkout space`,
      viewport: 'Mobile 375 × 667',
      mode: `Standard · ${displayMode}`,
      covers:
        'flags.hidePricing removes the checkout action and its reserved drawer padding so the variants surface reaches the bottom edge.',
    }),
  ),
  Object.freeze({
    title: 'guided overview keeps only the viewer-level close button',
    viewport: 'Mobile 375 × 667',
    mode: 'Standard · guided-overview',
    covers:
      'The mobile drawer omits its duplicate local close control while retaining the viewer-level close button.',
  }),
  Object.freeze({
    title: 'wizard keeps Back in the same position on the final overview',
    viewport: 'Mobile 375 × 667',
    mode: 'Standard · wizard',
    covers:
      'The Back button keeps the same position and dimensions when the wizard advances to its final review.',
  }),
]);

const VARIANTS_PER_ROW_TESTS = Object.freeze(
  [
    {
      name: 'desktop',
      viewport: 'Desktop 1440 × 1000',
      surfaces: {
        inline: 'Inline',
        'inline-sticky': 'Inline-sticky',
        sheet: 'Sheet',
        modal: 'Modal',
        'variants-only-sheet': 'Variants-only sheet',
        'inline-sheet': 'Inline-sheet',
      },
    },
    {
      name: 'mobile',
      viewport: 'Mobile 390 × 844',
      surfaces: {
        inline: 'Inline',
        'inline-sticky': 'Inline-sticky',
        sheet: 'Drawer (sheet preset)',
        modal: 'Modal',
        'variants-only-sheet': 'Variants-only sheet',
        'inline-sheet': 'Drawer (inline-sheet preset)',
      },
    },
  ].flatMap(({ name, viewport, surfaces }) => [
    ...['wizard', 'guided-overview', 'list', 'tabs', 'accordion', 'tree'].map((variantMode) =>
      Object.freeze({
        title: `${name} ${variantMode} uses the shared variants-per-row value`,
        viewport,
        mode: `Inline · ${variantMode}`,
        covers:
          'With --ov25-variants-per-row at 4 the grid shows four columns and 64px thumbnails; moving the slider to 3 gives three columns and larger thumbnails.',
      }),
    ),
    Object.freeze({
      title: `${name} cards and thumbnails fluidly grow and shrink while four columns remain unchanged`,
      viewport,
      mode: 'Inline · tabs',
      covers:
        'From the default four columns, two columns widen the cards and thumbnails and six columns narrow them, with the grid picking up the slider value.',
    }),
    ...Object.entries(surfaces).map(([configuratorMode, surface]) =>
      Object.freeze({
        title: `${name} ${configuratorMode} configurator uses the shared grid`,
        viewport,
        mode: `${surface} · tabs`,
        covers: `With count=5, the tabs grid inside the ${surface.toLowerCase()} shows five columns.`,
      }),
    ),
  ]),
);

export const E2E_FIXTURE_LEDGER = Object.freeze([
  Object.freeze({
    id: 'hidden-logo',
    title: 'Hidden logo (hideLogo toggle)',
    fixturePath: '/tests/hidden-logo.html',
    fixtureDocumentTitle: 'Hidden logo (branding.hideLogo)',
    sourceFiles: Object.freeze([
      'dev/react-test/tests/hidden-logo.html',
      'dev/react-test/tests/hidden-logo.jsx',
    ]),
    specFiles: Object.freeze(['test/e2e/hidden-logo.test.ts']),
    tests: Object.freeze([
      Object.freeze({
        title: 'desktop range replaces the logo with the current product name and restores it',
        viewport: 'Desktop',
        mode: 'Range',
        covers:
          'The logo starts visible, hideLogo replaces it with the exact current product name, and turning hideLogo off restores the logo.',
      }),
      Object.freeze({
        title: 'desktop Snap2 removes and restores the complete header wrapper',
        viewport: 'Desktop',
        mode: 'Snap2',
        covers:
          'hideLogo removes the complete header wrapper, restoring it brings the logo back, and the Snap2 layout remains mounted throughout.',
      }),
      Object.freeze({
        title: 'mobile stays logo-free in Range and Snap2 regardless of hideLogo',
        viewport: 'Mobile 390 × 844',
        mode: 'Range + Snap2',
        covers:
          'Mobile renders no logo-bearing header by design; its empty marker remains mounted, desktop header/logo nodes stay absent, and the iframe and price survive Range/Snap2 and hideLogo toggles.',
      }),
      ...responsiveLayoutLedgerTests({ opens: 'configure' }),
    ]),
    visualArtifacts: Object.freeze({
      baselineScreenshots: Object.freeze([]),
      reportScreenshots: Object.freeze([
        ...Object.values(HIDDEN_LOGO_REPORT_SCREENSHOTS),
        ...responsiveScreenshotNames({ opens: 'configure' }),
      ]),
      traceScreenshotsOnLedgerRun: true,
      note:
        `Each ledger run attaches named PNG screenshots for the tested states and records an action-by-action Playwright trace. Each mobile state has a fixture-controls image showing the active hideLogo toggle and a matching Range drawer image; the drawer is logo-free because mobile has no visible logo header by design. These are review artifacts; there are no committed golden visual-regression baselines. ${RESPONSIVE_NOTE}`,
    }),
  }),
  Object.freeze({
    id: 'carousel-relocation',
    title: 'Carousel relocation',
    fixturePath: '/tests/carousel-relocation.html',
    fixtureDocumentTitle: 'Carousel relocation',
    sourceFiles: Object.freeze([
      'dev/react-test/tests/carousel-relocation.html',
      'dev/react-test/tests/carousel-relocation.jsx',
    ]),
    specFiles: Object.freeze(['test/e2e/carousel-relocation.test.ts']),
    tests: Object.freeze([
      ...CAROUSEL_RELOCATION_TESTS,
      ...responsiveLayoutLedgerTests({ opens: 'configure' }),
      ...pixelBaselineTests(
        'carousel strip',
        'The relocated carousel strip matches its committed image, with the remote fixture images served from a local file and the live 360° tile masked.',
      ),
    ]),
    visualArtifacts: Object.freeze({
      baselineScreenshots: Object.freeze(
        pixelBaselineFiles('test/e2e/carousel-relocation.test.ts', 'carousel-strip'),
      ),
      reportScreenshots: Object.freeze(responsiveScreenshotNames({ opens: 'configure' })),
      traceScreenshotsOnLedgerRun: false,
      note:
        `Behavioral coverage verifies the carousel lands in the target for each viewport, drives the gallery from there, and stays put through the sheet or drawer and viewport switches, and the responsive tests check it lands in the right target at every preset. ${RESPONSIVE_NOTE} The carousel strip is also compared against committed pixel baselines in headless runs. Ledger runs record an action-by-action Playwright trace.`,
    }),
  }),
  Object.freeze({
    id: 'single-no-pricing',
    title: 'No pricing',
    fixturePath: '/tests/single-no-pricing.html',
    fixtureDocumentTitle: 'Single Product - No Pricing',
    sourceFiles: Object.freeze([
      'dev/react-test/tests/single-no-pricing.html',
      'dev/react-test/tests/single-no-pricing.jsx',
    ]),
    specFiles: Object.freeze(['test/e2e/single-no-pricing.test.ts']),
    tests: Object.freeze([
      ...NO_PRICING_TESTS,
      ...['standard', 'snap2'].flatMap((profile) =>
        responsiveLayoutLedgerTests({ opens: 'configure', product: profile, variant: profile }),
      ),
      ...SNAP2_CLOSE_TESTS,
    ]),
    visualArtifacts: Object.freeze({
      baselineScreenshots: Object.freeze([]),
      reportScreenshots: Object.freeze(
        ['standard', 'snap2'].flatMap((profile) =>
          responsiveScreenshotNames({ opens: 'configure', variant: profile }),
        ),
      ),
      traceScreenshotsOnLedgerRun: false,
      note:
        `Behavioral coverage verifies the rendered Standard and Snap2 variant surfaces across every public Variants.displayMode, plus mobile drawer spacing and controls for the affected modes. The responsive tests check pricing and purchase actions stay hidden at every preset, including the Snap2 portrait-tablet rule. ${RESPONSIVE_NOTE} Ledger runs record an action-by-action Playwright trace; there are no committed screenshot baselines.`,
    }),
  }),
  Object.freeze({
    id: 'gallery-sheet-list-auto-open',
    title: 'Sheet auto-open',
    fixturePath: '/tests/gallery-sheet-list-auto-open.html',
    fixtureDocumentTitle: 'Gallery - Sheet + List Auto-open',
    sourceFiles: Object.freeze([
      'dev/react-test/tests/gallery-sheet-list-auto-open.html',
      'dev/react-test/tests/gallery-sheet-list-auto-open.jsx',
    ]),
    specFiles: Object.freeze(['test/e2e/gallery-sheet-list-auto-open.test.ts']),
    tests: Object.freeze([
      Object.freeze({
        title: 'desktop sheet auto-opens, closes, and reopens from Configure',
        viewport: 'Desktop 1280 × 900',
        mode: 'Sheet · list',
        covers:
          'flags.autoOpen slides the sheet into the viewport on load and locks page scroll; Close moves it off-screen and unlocks scroll; Configure reopens it.',
      }),
      Object.freeze({
        title: 'mobile drawer auto-opens, closes, and reopens from Configure',
        viewport: 'Mobile 390 × 844',
        mode: 'Drawer · list',
        covers:
          'flags.autoOpen opens the drawer on load and locks page scroll; the viewer Close button collapses it and unlocks scroll; Configure reopens it.',
      }),
      Object.freeze({
        title: 'mobile drawer auto-opens when desktop shows the configurator inline',
        viewport: 'Mobile 390 × 844',
        mode: 'Desktop inline · drawer',
        covers:
          'With ?desktopMode=inline, a page loaded on mobile still auto-opens the drawer and locks page scroll.',
      }),
      Object.freeze({
        title: 'desktop inline configurator stays closed through a resize to the mobile drawer',
        viewport: 'Desktop 1280 × 900 → Mobile 390 × 844',
        mode: 'Desktop inline · drawer',
        covers:
          'With ?desktopMode=inline, a desktop load renders the inline variants without locking scroll, and resizing to mobile leaves the drawer closed with scroll unlocked.',
      }),
      ...responsiveLayoutLedgerTests({ opens: 'on-load' }),
      ...pixelBaselineTests(
        'checkout bar',
        'The checkout bar in the auto-opened sheet or drawer matches its committed image, with the live price masked and an opaque backdrop so the swatches behind the mobile bar stay out of the image.',
      ),
    ]),
    visualArtifacts: Object.freeze({
      baselineScreenshots: Object.freeze(
        pixelBaselineFiles('test/e2e/gallery-sheet-list-auto-open.test.ts', 'checkout-bar'),
      ),
      reportScreenshots: Object.freeze(responsiveScreenshotNames({ opens: 'on-load' })),
      traceScreenshotsOnLedgerRun: false,
      note:
        `Behavioral coverage verifies the sheet and drawer open on load, close, and reopen, and that a desktop-inline configuration auto-opens only on mobile. ${RESPONSIVE_NOTE} The checkout bar is also compared against committed pixel baselines in headless runs. Ledger runs record an action-by-action Playwright trace.`,
    }),
  }),
  Object.freeze({
    id: 'variants-per-row',
    title: 'Variants per row',
    fixturePath: '/tests/variants-per-row.html',
    fixtureDocumentTitle: 'Variants Per Row',
    sourceFiles: Object.freeze([
      'dev/react-test/tests/variants-per-row.html',
      'dev/react-test/tests/variants-per-row.jsx',
    ]),
    specFiles: Object.freeze(['test/e2e/variants-per-row.test.ts']),
    tests: Object.freeze([
      ...VARIANTS_PER_ROW_TESTS,
      ...responsiveLayoutLedgerTests({ opens: 'inline' }),
    ]),
    visualArtifacts: Object.freeze({
      baselineScreenshots: Object.freeze([]),
      reportScreenshots: Object.freeze(responsiveScreenshotNames({ opens: 'inline' })),
      traceScreenshotsOnLedgerRun: false,
      note:
        `Behavioral coverage verifies the shared column count and fluid card and thumbnail sizing across every Variants.displayMode and every configurator display mode, at desktop and mobile widths, and the responsive tests check the default grid keeps four columns at every preset. ${RESPONSIVE_NOTE} Ledger runs record an action-by-action Playwright trace; there are no committed screenshot baselines.`,
    }),
  }),
]);
