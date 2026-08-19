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
]);
