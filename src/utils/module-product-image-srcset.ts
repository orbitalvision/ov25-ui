import type { ImgHTMLAttributes } from 'react';

/** Subset of module product fields used for card and detail-panel preview images. */
export type ModuleProductPreviewSource = {
  hasImage: boolean;
  imageUrl: string;
  cutoutImage?: string;
  heroImage?: string;
  images?: string[];
};

/**
 * Up to two distinct preview URLs: cutout, hero, then gallery — same order as the module detail panel.
 */
export function getModuleProductPreviewImageUrls(product: ModuleProductPreviewSource): string[] {
  const c = product.cutoutImage;
  const h = product.heroImage;
  const gallery = product.images ?? [];
  const ordered = [...(c ? [c] : []), ...(h ? [h] : []), ...gallery].slice(0, 2).filter(Boolean);
  if (ordered.length > 0) return ordered;
  if (product.hasImage && product.imageUrl) return [product.imageUrl];
  return [];
}

/** Media-studio style tiers for the primary module list image (from OV25 product metadata). */
export type ModuleProductImageUrls = {
  thumbnail?: string;
  small_image?: string;
  image?: string;
  hero?: string;
  original?: string;
};

const TIER_ORDER: (keyof ModuleProductImageUrls)[] = ['thumbnail', 'small_image', 'image', 'hero', 'original'];

/** Nominal widths for `w` descriptors (browser picks using `sizes` + DPR). */
const TIER_WIDTH: Record<keyof ModuleProductImageUrls, number> = {
  thumbnail: 120,
  small_image: 320,
  image: 640,
  hero: 1024,
  original: 1920,
};

/**
 * `src` / `srcSet` / `sizes` for module card / InitialiseMenu thumbs when OV25 sends {@link ModuleProductImageUrls}.
 * Falls back to plain `src` when only a single URL is available.
 */
export function getModuleProductImageResponsiveAttrs(
  imageUrl: string,
  imageUrls?: ModuleProductImageUrls | null,
  sizes?: string
): Pick<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'sizes'> {
  if (!imageUrl) return { src: '' };
  if (!imageUrls) return { src: imageUrl };

  const parts: string[] = [];
  const seen = new Set<string>();
  for (const k of TIER_ORDER) {
    const u = imageUrls[k];
    if (typeof u !== 'string' || !u.trim() || seen.has(u)) continue;
    seen.add(u);
    parts.push(`${u} ${TIER_WIDTH[k]}w`);
  }
  if (parts.length < 2) return { src: imageUrl };

  const src =
    imageUrls.small_image ||
    imageUrls.image ||
    imageUrls.thumbnail ||
    imageUrl;

  return {
    src,
    srcSet: parts.join(', '),
    sizes: sizes ?? '(max-width: 768px) 40vw, 160px',
  };
}
