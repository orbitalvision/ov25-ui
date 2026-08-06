# Draft Client Email: OV25 UI 0.8.1

Status: **Draft only - do not send before staging approval**

Internal review evidence: [context](context.md), [JSON context](context.json),
[commits](commits.txt), [changed files](changed-files.txt), [diff stat](diff-stat.txt),
[committed diff](diff.patch), and [release test summary](test-summary.md).

No version, tag, push, package publication, or deployment was performed while preparing this draft.

**To:** [Client / recipient names]

**Cc:** [Account / technical contacts]

**Subject:** OV25 configurator 0.8.1 patch ready for staging

Hi [Client name],

We are preparing OV25 configurator version `0.8.1`, a small compatibility patch for Shopify themes
that hide empty page elements.

On affected product pages, the theme could treat the injected 3D gallery container as empty because
its visible content is isolated inside the configurator. This could collapse the product-media
column and prevent both the 3D viewer and variant controls from loading. The patch keeps the gallery
available without adding visible content or changing the storefront layout.

There are no new settings, saved-configuration changes, cart changes, or migration steps. Existing
`0.8.0` layouts and settings remain valid. Internal release validation has passed.

## Shopify Rollout

We will first build a Shopify app version using `ov25-ui-react18@0.8.1` and select it on a duplicate
or staging theme. Testing will confirm that:

- the 3D viewer and product-media column remain visible;
- variant options load correctly;
- Inline (sticky) works on desktop and mobile; and
- ordinary product layouts and cart actions remain unchanged.

After staging approval, [OV25 technical contact] will promote the exact tested app version to live.
Rollback is to reselect the previous Shopify app/extension version containing the `0.8.0` runtime.

## WooCommerce Rollout

For WooCommerce sites, we will build the plugin with exact `0.8.1` packages and test it on staging
before updating production. Rollback is to reinstall the previous `0.8.0` plugin build; saved
configurator settings do not need conversion.

Please send any affected product URLs or client-specific themes that should be included in staging
checks.

Regards,

[Sender name]

[Role / OV25 team]

[Support email / phone]
