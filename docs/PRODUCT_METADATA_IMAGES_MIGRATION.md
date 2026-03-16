# Product Metadata Images – Structure Migration

## Current State (Inconsistent)

| Field | Structure | Issue |
|-------|-----------|-------|
| `heroImage` | `{ alt: string, urls: { hero, image, original, small_image, thumbnail } }` | ✅ Consistent |
| `cutoutImage` | `{ alt: string, urls: { hero, image, original, small_image, thumbnail } }` | ✅ Consistent |
| `images` | `string[]` (raw URLs) | ❌ Inconsistent – no alt, no size variants |

The `images` array is a flat list of URLs (currently `small_image` URLs). The UI pack cannot reliably pick sizes or provide alt text.

---

## Target State (Unified)

All image fields should use the same shape:

```ts
interface ProductImage {
  alt: string;
  urls: {
    hero?: string;
    image?: string;
    original?: string;
    small_image?: string;
    thumbnail?: string;
  };
}

interface ProductMetadata {
  heroImage?: ProductImage;
  cutoutImage?: ProductImage;
  images: ProductImage[];  // was string[]
  // ... other fields
}
```

---

## Migration Tasks for OV25 Backend

1. **Type the metadata schema** – Add strict types for `ProductMetadata` and `ProductImage` so the structure is explicit and documented.

2. **Convert `images` storage** – When saving/returning product metadata, store each gallery image as `ProductImage` instead of a raw URL string. Ensure `urls` includes at least `image` (or `original`) for display; `thumbnail` and `small_image` for thumbnails; `hero` if a hero variant exists.

3. **API response** – Ensure `getIframeConfigurator` and any product endpoints return `images` as `ProductImage[]`, not `string[]`.

4. **Backward compatibility** – If needed, support a transition period where the UI pack accepts both `string` and `ProductImage` and normalises to `ProductImage` internally.

---

## UI Pack Consumption (ov25-ui)

Once migrated, the UI pack will:

- Use `image` or `original` for main gallery display
- Use `thumbnail` or `small_image` for carousel thumbnails
- Use `alt` for accessibility
- Order gallery as: `heroImage` → `cutoutImage` → `images[]`

---

## Summary

**Action:** OV25 engineer should type `ProductMetadata` and convert `images` from `string[]` to `ProductImage[]` with `alt` and `urls`, matching the structure of `heroImage` and `cutoutImage`.
