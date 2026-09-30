export const E2E_FIXTURE_LEDGER_VERSION = 1;

export const E2E_FIXTURE_RUNNER_COMMAND = 'node scripts/run-fixture-e2e.mjs';

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
    ]),
    visualArtifacts: Object.freeze({
      baselineScreenshots: Object.freeze([]),
      reportScreenshots: Object.freeze(Object.values(HIDDEN_LOGO_REPORT_SCREENSHOTS)),
      traceScreenshotsOnLedgerRun: true,
      note:
        'Each ledger run attaches named PNG screenshots for the tested states and records an action-by-action Playwright trace. Each mobile state has a fixture-controls image showing the active hideLogo toggle and a matching Range drawer image; the drawer is logo-free because mobile has no visible logo header by design. These are review artifacts; there are no committed golden visual-regression baselines.',
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
    tests: NO_PRICING_TESTS,
    visualArtifacts: Object.freeze({
      baselineScreenshots: Object.freeze([]),
      reportScreenshots: Object.freeze([]),
      traceScreenshotsOnLedgerRun: false,
      note:
        'Behavioral coverage verifies the rendered Standard and Snap2 variant surfaces across every public Variants.displayMode, plus mobile drawer spacing and controls for the affected modes. Ledger runs record an action-by-action Playwright trace; there are no committed screenshot baselines or named report screenshots.',
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
    ]),
    visualArtifacts: Object.freeze({
      baselineScreenshots: Object.freeze([]),
      reportScreenshots: Object.freeze([]),
      traceScreenshotsOnLedgerRun: false,
      note:
        'Behavioral coverage verifies the sheet and drawer open on load, close, and reopen, and that a desktop-inline configuration auto-opens only on mobile. Ledger runs record an action-by-action Playwright trace; there are no committed screenshot baselines or named report screenshots.',
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
    tests: VARIANTS_PER_ROW_TESTS,
    visualArtifacts: Object.freeze({
      baselineScreenshots: Object.freeze([]),
      reportScreenshots: Object.freeze([]),
      traceScreenshotsOnLedgerRun: false,
      note:
        'Behavioral coverage verifies the shared column count and fluid card and thumbnail sizing across every Variants.displayMode and every configurator display mode, at desktop and mobile widths. Ledger runs record an action-by-action Playwright trace; there are no committed screenshot baselines or named report screenshots.',
    }),
  }),
]);
