# Draft Client Email: OV25 UI 0.8.0

Status: **Draft only - do not send before release approval**

Internal review evidence: [context](context.md), [JSON context](context.json), [commits](commits.txt), [changed files](changed-files.txt), [diff stat](diff-stat.txt), and [committed diff](diff.patch).

Core release validation has passed. No version, tag, push, package publication, or deploy action was performed while refreshing this draft.

**To:** [Client / recipient names]

**Cc:** [Account / technical contacts]

**Subject:** Preview and approval requested: OV25 configurator 0.8.0

Hi [Client name],

We are preparing OV25 configurator version `0.8.0`, a minor update focused on long product-option pages, mobile Snap2 usability, storefront stability, accessibility, and additional configuration controls. The core package has passed type checks, automated tests, builds, and headless browser validation; package publication and the downstream OV25, Shopify, and WooCommerce completion steps remain.

Highlights include:

- an optional sticky inline layout that keeps the 3D viewer visible while customers browse long variant lists, including more reliable startup on asynchronously laid-out storefront pages;
- automatic storefront-header handling, with theme-specific overrides where required;
- independent desktop and mobile carousel placement for supported storefront integrations;
- improved Snap2 mobile dialogs, drawers, controls, checkout sheets, and saved-configuration prompts;
- separate settings to hide Buy Now and the 3D drag indicator;
- improved mobile accordion variants and Swatch Book layouts;
- descriptive 3D configurator iframe titles for accessibility;
- fallback imagery when a material selection has no thumbnail;
- smoother horizontal product-carousel scrolling; and
- reduced page movement when opening configurator sheets.

The sticky inline layout is opt-in, so existing layouts will not switch to it automatically. This release does change the default variant-thumbnail shape from round to square when no explicit shape has been configured. We will review that appearance and existing Snap2 panel positions on your staging site before rollout.

## Shopify Rollout

Please test the release on a duplicate or staging theme while the live theme remains on the current known-good version.

The matching Shopify source is committed locally and must reach remote `main`; the exact `0.8.0` package update, generated storefront bundle, and staging extension must then be finalized before this draft is sent. The live theme will remain pinned to the previous approved runtime while the staging theme selects the new extension/runtime. During staging we will verify the product page, header behavior, optional carousel block, saved settings, Snap2, cart actions, and desktop/mobile layouts.

After staging approval, [OV25 technical contact] will promote that exact tested extension/runtime to live. If a problem is found, we will reselect the previous extension/runtime and restore the previous `0.7.3` package behavior and saved settings.

## WooCommerce Rollout

The matching WooCommerce adapter is committed locally and must reach remote `main` before its exact-package release workflow runs. Please test the resulting plugin build on staging with a database and file backup. We will verify the product page, variant controls, cart actions, Snap2 where applicable, carousel placement, and responsive sticky behavior before updating production.

If a problem is found, rollback is to reinstall the previous plugin build and restore the previous settings.

## Approval

Please send any client-specific pages, themes, or product configurations that should be included in testing. We will confirm the final scope and release date after the remaining integration and release checks are complete.

Regards,

[Sender name]

[Role / OV25 team]

[Support email / phone]
