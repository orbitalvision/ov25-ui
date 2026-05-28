---
name: ov25-compatibility-guard
description: Prevent breaking changes across OV25 packages and storefront integrations. Use when editing, reviewing, planning, or releasing ov25-ui, ov25-ui-react18, ov25-setup, shopify-plugin, ov25-woo-extension, or OV25 changes, especially when changes may affect automatic plugin/client updates, public APIs, payloads, CSS selectors, metafields, cart/checkout behavior, Shopify runtime behavior, or release compatibility.
---

# OV25 Compatibility Guard

## Purpose

Keep OV25 packages and client integrations safe for automatic updates. Treat backwards compatibility as the default requirement across:

- `ov25-ui`
- `ov25-ui-react18`
- `ov25-setup`
- `shopify-plugin`
- `ov25-woo-extension`
- `OV25`

The goal is that patch/minor updates can be rolled out automatically without breaking client sites.

## Core Rule

Do not introduce breaking changes unless the user explicitly requests a breaking release and the change includes a migration plan, compatibility shim, release notes, and manual rollout path.

When in doubt, preserve old behavior and add new behavior behind an additive option, feature flag, runtime version, or fallback path.

## Compatibility Contract

### Public TypeScript/API Surface

Preserve:

- Existing exports from `ov25-ui/src/index.ts`.
- Existing `injectConfigurator` options.
- Existing callback names and call timing.
- Existing commerce payload fields.
- Existing normalized SKU/price payload shapes.
- Existing `ov25-setup` payload fields.

Allowed:

- Add optional fields.
- Add new exports.
- Add new enum/string values only when old values still work.
- Add helper APIs.

Not allowed without explicit breaking-release approval:

- Removing exports.
- Renaming fields.
- Changing required fields.
- Changing callback payload shape without aliases.
- Changing defaults in a way that alters existing storefront behavior.

### DOM, CSS, And Selector Contracts

Preserve:

- Existing ids and class names that client CSS or Shopify/WooCommerce adapters may target.
- Shadow-root ids such as price/name/selectors unless a compatibility wrapper remains.
- Existing `data-*` attributes used by fixtures, themes, or integrations.
- CSS variable names and meanings.

Allowed:

- Add wrapper elements if existing selectors still resolve.
- Add new stable selector ids/classes.
- Add CSS variables with defaults.

Not allowed without explicit breaking-release approval:

- Moving existing ids out of their shadow/root context.
- Removing ids/classes used by themes.
- Renaming CSS variables.
- Changing selector defaults in Shopify/WooCommerce adapters.

### Shopify Compatibility

The Shopify app/plugin must stay safe for live client sites.

Preserve:

- Existing metafield names and fallback handling.
- Existing `window.*` globals until the stable shell/runtime migration is complete.
- Existing cart item property names, especially `_ov25_*`.
- Existing checkout/invoice request payload shapes.
- Existing Snap2 and bed-configurator handling.

Allowed:

- Pass through new raw metafields as inert data.
- Add new theme settings with safe defaults.
- Add versioned runtime behavior gated by `stable`, `next`, or `pinned`.
- Add new optional cart properties while preserving old ones.

Not allowed without explicit breaking-release approval:

- Changing checkout interception behavior globally.
- Removing old metafield fallbacks.
- Changing `_ov25_*` property semantics.
- Bundling risky new runtime logic directly into the stable Shopify shell.
- Making a Shopify app version update immediately activate behavior that should be client-tested on staging.

### WooCommerce Compatibility

Preserve:

- Existing dependency names and expected versions.
- PHP plugin version sync behavior.
- Existing frontend imports from `ov25-ui-react18` and `ov25-setup`.
- Existing cart item data keys and hidden input property names.
- Existing build/zip release expectations.

Allowed:

- Add optional support for new payload fields.
- Add fallback parsing for new normalized payloads.
- Add admin UI fields if old saved settings still hydrate.

Not allowed without explicit breaking-release approval:

- Removing legacy payload parsing.
- Changing cart item keys.
- Requiring a new UI payload without migration/defaults.
- Changing checkout behavior without preserving old paths.

### OV25 App Compatibility

OV25 handles configurator/admin/runtime data, so it is part of the compatibility boundary.

Preserve:

- Existing package imports from `ov25-ui`, `ov25-ui-react18`, and `ov25-setup`.
- Existing configurator data sent to `ov25-ui`.
- Existing saved setup/config payloads.
- Existing product/configurator identifiers and mode prefixes (`snap2/`, `bed-configurator/`, standard ids).

Allowed:

- Add new config fields.
- Add migrations that preserve old saved data.
- Add server-side defaults for missing fields.

Not allowed without explicit breaking-release approval:

- Requiring newly saved config fields without defaults.
- Changing configurator id conventions.
- Changing payload shapes consumed by existing published runtimes.

## Required Review Checklist

Before finishing any change, answer these questions:

- Does this remove or rename any public export, type, option, callback, field, selector, CSS variable, metafield, or cart property?
- Does this change default behavior for existing clients?
- Does this require Shopify or WooCommerce clients to update theme/app/plugin code immediately?
- Does this change checkout, cart, price, SKU, or invoice behavior?
- Does this change Snap2, bed-configurator, or standard configurator behavior differently?
- Does this preserve old saved setup/config payloads?
- Is there a fallback for missing/unknown/new fields?
- Is there a test or fixture covering old behavior and new behavior?

If any answer indicates risk, either add a compatibility layer or flag the change as requiring explicit breaking-release approval.

## Implementation Rules

- Prefer additive changes over replacements.
- Keep old fields populated when introducing new fields.
- Normalize at boundaries; keep public payloads stable.
- Gate new behavior with optional config, feature flag, runtime version, or migration default.
- Keep platform-specific mapping in adapters. Do not put Shopify-specific context into `injectConfigurator`.
- Keep `injectConfigurator` platform-neutral.
- Treat unknown config/metafield keys as ignored, not fatal.
- Treat missing config/metafield keys as default behavior, not fatal.
- Add explicit deprecation notes before removal, and do not remove in the same release.

## Release Classification

Use this compatibility bar:

- `patch`: bug fixes only; no new required config; no behavior changes except correcting broken behavior.
- `minor`: additive features or optional fields; old clients continue working unchanged.
- `major`: breaking changes, removals, changed required fields, changed default behavior, or migration-required updates.

Automatic client updates are only safe for patch/minor releases that pass the checklist.

## Testing Expectations

For compatibility-sensitive changes, add or run tests that cover:

- Existing/legacy config payloads.
- Missing optional fields.
- Unknown extra fields.
- Existing selectors/classes/ids still present.
- Existing commerce payloads still parse.
- Shopify standard, Snap2, and bed-configurator fixtures where relevant.
- WooCommerce cart/property mapping where relevant.
- OV25 saved config hydration where relevant.

If tests cannot be run, state exactly what remains unverified.

## Final Response Requirement

When using this skill, include a concise compatibility note:

- `Compatibility: preserved` when the change is additive/backwards-compatible.
- `Compatibility risk: ...` when behavior may affect clients.
- `Breaking-change approval needed: ...` when the change should not ship automatically.

