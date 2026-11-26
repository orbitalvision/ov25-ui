/** AI describes a bounded recipe; it never supplies executable CSS. */
export interface ThemeButtonAnimation {
  target: 'cta' | 'secondary';
  effect: 'fade' | 'lift' | 'slide-fill' | 'underline';
  durationMs: number;
  easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  distancePx?: number;
  direction?: 'left' | 'right';
  source: string;
}

interface ButtonColours {
  background: string;
  hoverBackground: string;
  text: string;
  hoverText: string;
}

export interface ThemeButtonAnimationCssOptions {
  /** Trusted application selectors only. Model output cannot choose targets. */
  targets?: Partial<Record<ThemeButtonAnimation['target'], string>>;
  scope?: string;
  variables?: Partial<Record<ThemeButtonAnimation['target'], Partial<ButtonColours>>>;
}

const TARGETS = {
  // Animate the split checkout's visible surface once, not its invisible hit areas.
  cta: '.ov25-cta:not(.ov25-checkout-combo-button *), .ov25-checkout-combo-button',
  secondary: '.ov25-variant-control',
};
const COLOURS: Record<ThemeButtonAnimation['target'], ButtonColours> = {
  cta: {
    background: 'var(--ov25-cta-color, #22c55e)', hoverBackground: 'var(--ov25-cta-color-hover, #16a34a)',
    text: 'var(--ov25-cta-text-color, #ffffff)', hoverText: 'var(--ov25-cta-text-color-hover, #ffffff)',
  },
  secondary: {
    background: 'var(--ov25-primary-color, #ffffff)', hoverBackground: 'var(--ov25-button-hover-background-color, #f3f4f6)',
    text: 'var(--ov25-button-text-color, #000000)', hoverText: 'var(--ov25-button-hover-text-color, #000000)',
  },
};
const START = 'OV25 theme button animations v1: ';
const END = 'End OV25 theme button animations';
const managedBlock = () => /\/\* OV25 theme button animations v1: ([^\r\n]*?) \*\/[\s\S]*?\/\* End OV25 theme button animations \*\//g;
const ALLOWED_KEYS = new Set(['target', 'effect', 'durationMs', 'easing', 'distancePx', 'direction', 'source']);

export function validateThemeButtonAnimations(value: unknown, sourceFiles?: readonly string[]): ThemeButtonAnimation[] {
  const error = () => new Error('The theme analysis returned unsupported button animations.');
  if (!Array.isArray(value) || value.length > 2) throw error();
  const targets = new Set<string>();
  for (const item of value) {
    if (!item || typeof item !== 'object' || Array.isArray(item) || Object.keys(item).some(key => !ALLOWED_KEYS.has(key)) ||
        !['cta', 'secondary'].includes(item.target) || targets.has(item.target) ||
        !['fade', 'lift', 'slide-fill', 'underline'].includes(item.effect) ||
        !Number.isInteger(item.durationMs) || item.durationMs < 0 || item.durationMs > 1000 ||
        !['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out'].includes(item.easing) ||
        typeof item.source !== 'string' || !item.source.trim() || item.source.length > 500 || /[\r\n\u0000]/.test(item.source) ||
        (sourceFiles && !sourceFiles.includes(item.source)) ||
        (item.distancePx !== undefined && (item.effect !== 'lift' || !Number.isInteger(item.distancePx) || item.distancePx < 1 || item.distancePx > 8)) ||
        (item.direction !== undefined && (!['slide-fill', 'underline'].includes(item.effect) || !['left', 'right'].includes(item.direction)))) throw error();
    targets.add(item.target);
  }
  return value.map(item => ({ ...item }));
}

/** Uses existing colour variables so subsequent Style edits also update the effect. */
export function generateThemeButtonAnimationCss(animations: readonly ThemeButtonAnimation[], options: ThemeButtonAnimationCssOptions = {}): string {
  const recipes = validateThemeButtonAnimations(animations);
  const blocks: string[] = [];
  const prefix = options.scope ? `${options.scope} ` : '';
  for (const recipe of recipes) {
    const target = `${prefix}:is(${options.targets?.[recipe.target] ?? TARGETS[recipe.target]})`;
    const enabled = `${target}:not(:disabled):not([aria-disabled="true"]):not(:has(button:disabled, [aria-disabled="true"]))`;
    const colours = { ...COLOURS[recipe.target], ...options.variables?.[recipe.target] };
    const duration = `${recipe.durationMs}ms`;
    const properties = ['background-color', 'color', 'border-color'];
    const base = [`background-color: ${colours.background}`, `color: ${colours.text}`];
    const active = [`background-color: ${colours.hoverBackground}`, `color: ${colours.hoverText}`];
    if (recipe.effect === 'lift') {
      properties.push('translate');
      base.push('translate: 0 0');
      active.push(`translate: 0 -${recipe.distancePx ?? 2}px`);
    } else if (recipe.effect === 'slide-fill' || recipe.effect === 'underline') {
      // Background layers sit behind text and icons without new markup or pseudo-element collisions.
      const fill = recipe.effect === 'slide-fill';
      const colour = fill ? colours.hoverBackground : 'currentColor';
      properties.push('background-size');
      base.push(`background-image: linear-gradient(${colour}, ${colour})`, 'background-repeat: no-repeat',
        `background-position: ${recipe.direction ?? 'left'} ${fill ? 'center' : 'bottom'}`,
        `background-size: 0% ${fill ? '100%' : '2px'}`);
      if (!fill) base.push('background-origin: content-box');
      if (fill) active[0] = `background-color: ${colours.background}`;
      active.push(`background-size: 100% ${fill ? '100%' : '2px'}`);
    }
    base.push(`transition-property: ${properties.join(', ')}`, `transition-duration: ${duration}`, `transition-timing-function: ${recipe.easing}`);
    blocks.push(`${enabled} { ${base.join('; ')}; }`);
    blocks.push(`@media (hover: hover) and (pointer: fine) {\n  ${enabled}:hover { ${active.join('; ')}; }\n}`);
    // :has covers the split checkout's focusable children; focus rings remain untouched.
    blocks.push(`${enabled}:is(:focus-visible, :has(:focus-visible)) { ${active.join('; ')}; }`);
    blocks.push(`@media (prefers-reduced-motion: reduce) {\n  ${enabled} { transition-duration: 0ms;${recipe.effect === 'lift' ? ' translate: none;' : ''} }\n${recipe.effect === 'lift' ? `  ${enabled}:is(:hover, :focus-visible, :has(:focus-visible)) { translate: none; }\n` : ''}}`);
    if (recipe.target === 'cta' && !options.targets?.cta) {
      blocks.push(`${prefix}.ov25-checkout-combo-button:not(:has(button:disabled, [aria-disabled="true"])) .ov25-cta { background-color: transparent; color: inherit; }`);
    }
  }
  return blocks.join('\n');
}

/** Metadata is validated and re-generated for previews; stored CSS is never evaluated there. */
export function extractThemeButtonAnimations(css: string): ThemeButtonAnimation[] {
  const matches = [...css.matchAll(managedBlock())];
  const last = matches[matches.length - 1];
  if (!last || last[1].length > 3000) return [];
  try { return validateThemeButtonAnimations(JSON.parse(last[1])); } catch { return []; }
}

export function extractThemeButtonAnimationBlock(css: string): string | undefined {
  const matches = [...css.matchAll(managedBlock())];
  return extractThemeButtonAnimations(css).length ? matches[matches.length - 1]?.[0] : undefined;
}

/** Undefined keeps prior effects; [] explicitly clears only our marked block. */
export function mergeThemeButtonAnimationCss(css: string, animations?: readonly ThemeButtonAnimation[]): string {
  if (animations === undefined) return css;
  const recipes = validateThemeButtonAnimations(animations);
  // Escape comment terminators and HTML delimiters in source attribution, even though
  // that metadata is only ever JSON parsed and style elements are inserted as text.
  const metadata = JSON.stringify(recipes).replace(/\*/g, '\\u002a').replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
  const block = recipes.length ? `/* ${START}${metadata} */\n${generateThemeButtonAnimationCss(recipes)}\n/* ${END} */` : '';
  let replaced = false;
  const updated = css.replace(managedBlock(), () => {
    if (replaced) return '';
    replaced = true;
    return block;
  });
  if (replaced || !block) return updated;
  return `${css}${css ? '\n\n' : ''}${block}`;
}
