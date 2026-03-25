# Changelog

## 0.5.95

### Commerce payloads (minor, additive for runtime; TypeScript callback types updated)

- **`onChange`, `addToBasket`, `buyNow`** now receive **normalized** SKU and price objects:
  - **`payload.skus`**: discriminated union — `mode: 'single'` includes legacy `skuString` / `skuMap` plus `lines` (one row); `mode: 'multi'` (Snap2) has **`lines` only** (no top-level `skuString`).
  - **`payload.price`**: includes `mode`, order-level totals, **`lines`** (per-product breakdown), and optional passthrough of raw **`priceBreakdown`** (single) or **`productBreakdowns`** (Snap2).
- New exported types: `UnifiedSkuPayload`, `UnifiedPricePayload`, `UnifiedOnChangePayload`, `CommerceLineItemSku`, `CommerceLineItemPrice`, `CommerceLineItemSelection`.
- New helpers for raw `postMessage` users: `normalizeSkuPayload`, `normalizePricePayload`, `parseIframeJsonPayload`.
- **TypeScript**: `OnChangeSkuPayload` / `OnChangePricePayload` are aliases of the unified types; narrow with `payload.skus.mode === 'single'` when you require `skuString` on SKU.

Integrators should prefer **`payload.skus.lines`** and **`payload.price.lines`** for new multi-line cart logic.
