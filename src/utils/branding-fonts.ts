import type { BrandingFont } from '../types/inject-config.js';

/** URLs come from observed theme font sources; never interpret CSS or data URLs. */
export function isAllowedBrandingFontUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return !url.username && !url.password && (url.protocol === 'https:' || (
      url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
    ));
  } catch { return false; }
}

export function normalizeBrandingFonts(value: unknown): BrandingFont[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 16).filter((font): font is BrandingFont => Boolean(
    font && typeof font.family === 'string' && font.family.trim().length > 0 && /^[\w \-]{1,100}$/u.test(font.family) &&
    typeof font.url === 'string' && font.url.length <= 2048 && isAllowedBrandingFontUrl(font.url) &&
    (font.weight === undefined || (typeof font.weight === 'string' && /^(normal|bold|(?:[1-9]\d{0,2}|1000)(?: (?:[1-9]\d{0,2}|1000))?)$/.test(font.weight))) &&
    (font.style === undefined || ['normal', 'italic', 'oblique'].includes(font.style)) &&
    (font.unicodeRange === undefined || (typeof font.unicodeRange === 'string' && font.unicodeRange.length <= 512 && /^(?:U\+[\dA-F?]{1,6}(?:-[\dA-F]{1,6})?)(?:\s*,\s*U\+[\dA-F?]{1,6}(?:-[\dA-F]{1,6})?)*$/i.test(font.unicodeRange)))
  )).map(font => ({family: font.family.trim(), url: font.url, ...(font.weight ? {weight: font.weight} : {}), ...(font.style ? {style: font.style} : {}), ...(font.unicodeRange ? {unicodeRange: font.unicodeRange} : {})}));
}

function hash(value: string): string {
  let result = 2166136261;
  for (let index = 0; index < value.length; index++) result = Math.imul(result ^ value.charCodeAt(index), 16777619);
  return (result >>> 0).toString(36);
}

/** Each distinct source set gets its own family, isolating it from storefront @font-face rules. */
export function brandingFontAliases(fonts: readonly BrandingFont[]): Map<string, string> {
  const sources = new Map<string, string[]>();
  for (const font of normalizeBrandingFonts(fonts)) {
    const key = font.family.toLowerCase();
    sources.set(key, [...(sources.get(key) ?? []), JSON.stringify(font)]);
  }
  return new Map([...sources].map(([family, definitions]) => [family, `OV25Theme_${hash(definitions.sort().join('|'))}`]));
}

/** Only rewrite structured typography controls. Merchant custom rules remain untouched. */
export function prepareBrandingFontCSS(css: string | undefined, fonts: readonly BrandingFont[] | undefined): string | undefined {
  if (!css || !fonts?.length) return css;
  const aliases = brandingFontAliases(fonts);
  return css.replace(/(--ov25-(?:360|heading|button)-font-family\s*:)\s*([^;}]+)/g, (_match, declaration: string, value: string) => {
    const first = value.split(',')[0].trim().replace(/^['"]|['"]$/g, '');
    const alias = aliases.get(first.toLowerCase());
    return alias ? `${declaration} '${alias}', ${value.trim()}` : `${declaration} ${value}`;
  });
}

const documents = new WeakMap<Document, Map<string, Promise<void>>>();

/** Non-blocking, per-document loading also works in Setup's independent preview iframe. */
export async function loadBrandingFonts(fonts: readonly BrandingFont[] | undefined, ownerDocument?: Document): Promise<void> {
  const doc = ownerDocument ?? (typeof document !== 'undefined' ? document : undefined);
  const FontFaceConstructor = (doc?.defaultView as (Window & {FontFace?: typeof FontFace}) | null)?.FontFace;
  if (!doc?.fonts || !FontFaceConstructor || !fonts?.length) return;
  const validated = normalizeBrandingFonts(fonts);
  const aliases = brandingFontAliases(validated);
  let loaded = documents.get(doc);
  if (!loaded) { loaded = new Map(); documents.set(doc, loaded); }
  await Promise.all(validated.map(font => {
    const family = aliases.get(font.family.toLowerCase())!;
    const key = JSON.stringify([family, font]);
    if (!loaded.has(key)) {
      const pending = (async () => {
        try {
          const face = new FontFaceConstructor(family, `url(${JSON.stringify(font.url)})`, {
            weight: font.weight ?? 'normal', style: font.style ?? 'normal',
            ...(font.unicodeRange ? {unicodeRange: font.unicodeRange} : {}),
          });
          await face.load();
          (doc.fonts as FontFaceSet & {add(font: FontFace): FontFaceSet}).add(face);
        } catch { /* Missing/CORS-blocked font sources retain the configured fallback family. */ }
      })();
      loaded!.set(key, pending);
    }
    return loaded!.get(key);
  }));
}
