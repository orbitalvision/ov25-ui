# Darlings / Savor performance fixture

Open <http://localhost:3008/tests/performance-darlings-savor.html>, or choose
**PERFORMANCE → Darlings fabrics · Savor sticky layout** in the fixture index.

Uses Darlings product 7449 through `VITE_DARLINGS_APIKEY`. Verified on 5 November
2026: 235 fabric choices, 247 total option cards, a real WebGL scene and four
live angle thumbnails. Catalogue values may change; they are not frozen mock data.
No credentials are hardcoded in the fixture or saved in the timing results.

The fixture recreates Savor's two-column product grid, its stretched media column,
and its single-column/two-row mobile layout, plus a collapsing header. The current
UI's native sticky repairs remain active; this does not deliberately restore old
runtime bugs. It is a focused reproduction of that structure, not a complete
Savor theme export.

## Running

Use the normal fixture server on port 3008, with `VITE_DARLINGS_APIKEY` configured
in ov25-ui's local environment. It reads published OV25 viewer/data/assets; no
Shopify API calls, database scripts or AI calls are involved. Cart callbacks do
nothing. Do not use this fixture to test commerce.

The fixture imports current UI **source JavaScript** for immediate local edits.
It explicitly adopts `dist/index.css` because that stylesheet needs the library's
Tailwind generation and shadow-host postprocessing. Rebuild the UI after changing
its CSS. The profiling results are development-source results, not production
bundle benchmarks.

- **Run scroll measurement** performs two full down/up sweeps over twelve seconds
  and reports parent animation-frame gaps. The button waits for controls to load;
  let the model/thumbnails finish loading before measuring.
- To check physical touch behaviour, tap an angle thumbnail, then drag-scroll
  across the sticky boundaries and through the fabric list.
- Run the detailed headless profiler from ov25-ui:

```sh
node scripts/profile-darlings-sticky.mjs
```

`OV25_PERF_BASE_URL` overrides the fixture server URL. The script requires local
Playwright Chromium and WebKit browsers. It checks at least 200 real cards,
a visible viewer canvas and two real angle thumbnails, warms the lazy-image
scroll path, then runs three six-second sweeps per mode and engine. Rotation
runs click an actual cutout thumbnail; ordinary material images are not used.
It verifies the manual button becomes enabled and captures both viewport sizes.

Temporary browser-response instrumentation times the controller phases without
modifying runtime source or dist. Outputs in `outputs/darlings-sticky-profile/`:
`summary.json`, per-engine raw timings, and mobile/desktop screenshots. Chromium
also records parent-target CDP layout/style/script counters. These counters do
not include all cross-origin iframe work. Parent and viewer RAF probes are both
recorded; RAF timing is a scheduling indicator, not a count of rendered 3D frames.

## Baseline — 5 November 2026

Warm local headless runs on this Mac; 390 × 844 viewport. Chromium uses software
WebGL via SwiftShader. WebKit runs on the Mac, not a physical iPhone.

| Engine | Scenario | Mean controller update | Controller p95 | Parent frame gap p95 | Viewer frame gap p95 |
| --- | --- | ---: | ---: | ---: | ---: |
| chromium | idle-model | 0.40 ms | 0.9 ms | 14.3 ms | 14.3 ms |
| chromium | rotate-then-scroll | 0.34 ms | 0.8 ms | 14.3 ms | 14.3 ms |
| webkit | idle-model | 7.39 ms | 9.0 ms | 140.0 ms | 143.0 ms |
| webkit | rotate-then-scroll | 7.37 ms | 9.0 ms | 138.0 ms | 144.0 ms |

The full-product fixture exposes substantially worse frame scheduling in WebKit
than Chromium. It does **not** prove the controller causes every delay or that
caching ancestor inspection will solve it. In WebKit most measured controller
time falls in the first phase, which includes viewport reads as well as header
resolution. Those reads can force pending layout; the label `headerDiscovery`
must not be interpreted as proof that selector searching itself is expensive.

The controller is only part of the total frame time. Use this baseline for a
controlled before/after comparison and finish with real iPhone touch testing.
No scroll fast-path optimization has been implemented as part of this fixture.

Earlier exploratory runs before the fixture adopted built shadow CSS are invalid
for comparison and have been replaced by these results.
