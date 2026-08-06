# OV25 UI 0.8.1

Status: **Approved on 2026-08-06**

Release type: **Patch**

Review evidence: [context](context.md), [JSON context](context.json), [commits](commits.txt),
[changed files](changed-files.txt), [diff stat](diff-stat.txt), [committed diff](diff.patch), and
[release test summary](test-summary.md).

## Customer-Facing Changes

### Features

- No new features in this patch.

### Improvements

- No new customer-facing improvements in this patch.

### Bug Fixes

- Fixed Shopify themes with generic empty-element styling hiding the injected 3D product gallery.
  The viewer, product-media column, and variant controls now initialise correctly on affected
  product pages, including Inline (sticky) layouts.

## Known Issues

- No new known issues were identified for `0.8.1`. Existing `0.8.0` known issues remain unchanged
  and are not addressed by this patch.

## Manual Testing Notes

- Re-test an affected Shopify theme, including Dawn, and confirm the 3D gallery has non-zero
  dimensions and variant controls populate.
- Test Inline (sticky) on desktop and mobile, including scrolling through a long variant list.
- Smoke-test an ordinary non-sticky product layout and cart actions.

## Developer And Integrator Notes

- The gallery host now includes a hidden, inert light-DOM child so theme selectors such as
  `div:empty { display: none; }` no longer hide a gallery whose visible UI lives in a shadow root.
- No `injectConfigurator` option, setup payload, callback, commerce payload, existing selector,
  CSS variable, or saved configuration changed. No migration is required.
- The reviewed range also contains the React 18-compatible typing wrapper used by the carousel
  fullscreen Popover. It has no intended runtime behavior change and was already included in the
  published `ov25-ui-react18@0.8.0` package.
- Full `release:test` validation passed for `0.8.1`: type-check, unit tests, browser/component
  tests, both package builds, frozen setup install, react-test build, and Playwright E2E tests.
- Shopify requires an exact `ov25-ui-react18@0.8.1` dependency update, bundle rebuild, and staged
  extension release. WooCommerce and OV25 require exact package synchronization only; no adapter
  mapping changes are needed.

No version, tag, push, package publication, Shopify deploy, WooCommerce release, or OV25 deploy was
performed while refreshing these notes.
