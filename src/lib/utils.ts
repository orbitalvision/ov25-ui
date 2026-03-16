import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type ProductImageInput = string | { alt?: string; urls?: Record<string, string> }

function toImageInput(val: unknown): ProductImageInput | null {
  if (typeof val === 'string' && val) return val
  if (val && typeof val === 'object' && 'urls' in val && typeof (val as any).urls === 'object') return val as ProductImageInput
  return null
}

export function resolveImageUrl(
  img: ProductImageInput,
  size: 'stacked' | 'carousel' | 'fullscreen' | 'main'
): string {
  if (typeof img === 'string') return img
  const urls = img?.urls
  if (!urls || typeof urls !== 'object') return ''
  if (size === 'fullscreen') {
    return urls.original ?? urls.hero ?? urls.image ?? urls.small_image ?? urls.thumbnail ?? ''
  }
  if (size === 'main') {
    return urls.hero ?? urls.image ?? urls.small_image ?? urls.thumbnail ?? ''
  }
  if (size === 'stacked') {
    return urls.image ?? urls.original ?? urls.hero ?? urls.small_image ?? urls.thumbnail ?? ''
  }
  return urls.small_image ?? urls.image ?? urls.thumbnail ?? urls.original ?? urls.hero ?? ''
}

export function getProductGalleryImages(metadata: {
  images?: (string | { alt?: string; urls?: Record<string, string> })[]
  heroImage?: string | { alt?: string; urls?: Record<string, string> }
  cutoutImage?: string | { alt?: string; urls?: Record<string, string> }
} | null | undefined, opts?: { cutoutFirst?: boolean }): ProductImageInput[] {
  if (!metadata) return []
  const hero = toImageInput(metadata.heroImage)
  const cutout = toImageInput(metadata.cutoutImage)
  const gallery = (metadata.images || []).map(toImageInput).filter((x): x is ProductImageInput => x !== null)
  if (opts?.cutoutFirst && cutout && hero) {
    return [cutout, hero, ...gallery]
  }
  return [
    ...(hero ? [hero] : []),
    ...(cutout ? [cutout] : []),
    ...gallery,
  ]
}

/** Index of cutout image in gallery, or -1 if none. Depends on same cutoutFirst as getProductGalleryImages. */
export function getCutoutIndex(metadata: Parameters<typeof getProductGalleryImages>[0], opts?: { cutoutFirst?: boolean }): number {
  if (!metadata) return -1
  const hasHero = !!toImageInput(metadata.heroImage)
  const hasCutout = !!toImageInput(metadata.cutoutImage)
  if (!hasCutout) return -1
  if (opts?.cutoutFirst && hasHero) return 0
  return hasHero ? 1 : 0
} 