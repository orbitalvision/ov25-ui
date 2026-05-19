---
name: ov25-string-replacements
description: Implement and review stringReplacements coverage for customer-facing visible copy in ov25-ui. Use when modifying ov25-ui/src React components, adding visible text, buttons, labels, placeholders, toasts, dialogs, Snap2 UI, swatch-book UI, checkout UI, or auditing hardcoded runtime strings. Scope is ov25-ui runtime code only; do not apply to ov25-setup admin/editor copy or non-visible accessibility/metadata attributes such as ARIA, title, or alt text except when surfacing replacement definition metadata.
---

# OV25 String Replacements

## Purpose

Keep customer-facing `ov25-ui` runtime copy configurable through `injectConfigurator({ stringReplacements })`.

Do not convert `ov25-setup` admin/editor interface text. Setup may display `STRING_REPLACEMENT_DEFINITIONS` and serialize `stringReplacements`, but its own labels and helper text are out of scope.

## Current Architecture

- `src/types/string-replacements.ts`: public config and definition types.
- `src/lib/strings/string-keys.ts`: `STRING_REPLACEMENT_DEFINITIONS`, the setup-facing catalog of replaceable keys.
- `src/lib/strings/resolve-string-replacement.ts`: rule resolution and `${VAR}` interpolation.
- `src/contexts/ov25-ui-context.tsx`: provider-level `getString(key, vars, fallback)`.
- `src/lib/strings/use-ov25-string.ts`: hook wrapper around context `getString`.
- `src/types/inject-config.ts` and `src/utils/inject.tsx`: accept and pass `stringReplacements`.
- `src/index.ts`: exports replacement definitions, types, and `useOv25String`.
- `test/unit/resolve-string-replacement.test.ts`: resolver behavior coverage.

Rules are evaluated in order: matching triggered rules first, then first catch-all rule, then the component fallback. Trigger matching is trimmed and case-insensitive. Missing interpolation vars become an empty string.

## What Must Be Replaceable

Route new or changed customer-facing strings through `getString(...)` in `ov25-ui/src/**`.

This includes:

- Visible text in rendered UI.
- Button/link text, dialog titles, empty states, loading states, checkout labels, Snap2 controls, swatch-book text, filters, wizard copy, AR/share/capture copy.
- Customer-visible form copy such as `placeholder` text.
- Toasts and user-visible error/success messages.
- Dynamic customer-facing strings assembled from data, for example `Select ${OPTION_NAME}` or `Total: ${FORMATTED_PRICE}`.

Usually exclude:

- `setup/src/**` admin/editor copy.
- Internal enum values, option ids, CSS class names, DOM ids, selectors, test names, and object keys.
- Non-visible accessibility/metadata attributes such as `aria-label`, custom `ariaLabel`, `aria-describedby`, `title`, and `alt`. Keep these stable and descriptive; do not route them through `stringReplacements`.
- `console.*` messages and developer-only thrown errors unless the message is shown to customers.
- Product/range/variant names as raw data, except where the surrounding label or formatting is controlled by OV25 UI.

## Implementation Workflow

1. Find every customer-facing string touched by the change.
   - Search local components plus neighboring files; visible copy can hide in props, toasts, placeholders, and helper functions.
   - Run `node .codex/skills/ov25-string-replacements/scripts/audit-ov25-string-replacements.mjs` from the repo root for a candidate list.

2. Add or update a definition in `src/lib/strings/string-keys.ts`.
   - Use a stable camelCase key grouped near related UI.
   - Set `defaultTemplate` to the current UI fallback.
   - Add every runtime interpolation variable to `interpolationValues`.
   - Use uppercase variable names such as `PRODUCT_NAME`, `OPTION_NAME`, `FORMATTED_PRICE`, `SWATCH_COUNT`.
   - Keep labels setup-friendly, because setup renders this catalog.

3. Resolve the string at render time.
   - In components already using `useOV25UI()`, destructure `getString`.
   - Otherwise use `useOv25String()` only inside React components.
   - In pure helpers, pass resolved strings or a `getString` callback in; do not call hooks.

4. Keep fallback and definition in sync.
   - The third `getString` argument should preserve current behavior when no replacement exists.
   - When editing existing copy, update both the component fallback and `defaultTemplate`.

5. Validate API surface only when needed.
   - Most new keys only require `string-keys.ts` plus component usage.
   - Touch setup code only if the definition shape, serialization shape, or editor behavior changes.

## Coding Pattern

```tsx
const { getString } = useOV25UI();

const label = getString(
  'checkoutAddToBasket',
  {
    PRICE: formattedPrice,
    SUBTOTAL: formattedSubtotal,
    DISCOUNT_AMOUNT: discount.formattedAmount,
    DISCOUNT_PERCENTAGE: discount.percentage,
  },
  'Add to basket',
);
```

Matching definition:

```ts
{
  key: 'checkoutAddToBasket',
  label: 'Checkout add to basket text',
  defaultTemplate: 'Add to basket',
  interpolationValues: [
    { name: 'PRICE', description: 'Current formatted price.' },
    { name: 'SUBTOTAL', description: 'Current formatted subtotal.' },
    { name: 'DISCOUNT_AMOUNT', description: 'Formatted discount amount.' },
    { name: 'DISCOUNT_PERCENTAGE', description: 'Discount percentage.' },
  ],
}
```

## Dynamic And Rich Text

- Prefer one key for one user-facing phrase, with vars for runtime data.
- Replace concatenation such as `'Select ' + option.name` with a key like `selectOptionLabel` and var `{ OPTION_NAME: option.name }`.
- For text containing an interactive child, use one key for the full phrase and a second key for the clickable child label when needed. Preserve current behavior if the replacement omits or moves the child text.
- Reuse one resolved string for repeated visible text unless those instances need separate wording. Do not use `stringReplacements` for ARIA, `title`, or `alt` text.
- For plural or suffix behavior, either pass the resolved suffix as a var or create distinct keys for distinct states.

## Review Checklist

- No new customer-facing hardcoded English copy in `src/**`.
- Every `getString('key', ...)` key exists in `STRING_REPLACEMENT_DEFINITIONS`.
- Every interpolation var used by a component appears in that key's `interpolationValues`.
- `defaultTemplate` and component fallback match unless there is a deliberate richer-rendering reason.
- Existing `children` or prop overrides still take precedence where the component supported them.
- ARIA, `title`, and `alt` text remains hardcoded/descriptive and is not added to `STRING_REPLACEMENT_DEFINITIONS`.
- No `ov25-setup` admin labels were converted just because they are strings.
- Unit tests still cover resolver behavior if resolution semantics change.

## Validation

Run focused checks from the repo root:

```bash
node .codex/skills/ov25-string-replacements/scripts/audit-ov25-string-replacements.mjs
npm run type-check
npm run test:unit
```

Use browser/dev test coverage when copy affects visible UI flows, especially `dev/react-test/tests/string-replacement.jsx`.
