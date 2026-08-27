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
]);
