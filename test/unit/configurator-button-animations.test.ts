import { describe, expect, it } from 'vitest';
import postcss from 'postcss';
import {
  extractThemeButtonAnimations, generateThemeButtonAnimationCss, mergeThemeButtonAnimationCss,
  validateThemeButtonAnimations, type ThemeButtonAnimation,
} from '../../setup/src/components/ConfiguratorSetup/button-animations';

const fade: ThemeButtonAnimation = { target: 'cta', effect: 'fade', durationMs: 200, easing: 'ease-in-out', source: 'assets/theme.css' };

describe('bounded button animation recipes', () => {
  it('accepts only the four recipes, unique targets and bounded parameters from observed files', () => {
    expect(validateThemeButtonAnimations([fade], ['assets/theme.css'])).toEqual([fade]);
    for (const recipe of [
      { ...fade, effect: 'arbitrary' }, { ...fade, easing: 'steps(4)' }, { ...fade, durationMs: -1 },
      { ...fade, durationMs: 1001 }, { ...fade, durationMs: 20.5 }, { ...fade, distancePx: 2 },
      { ...fade, effect: 'lift', distancePx: 9 }, { ...fade, effect: 'lift', distancePx: 0 },
      { ...fade, direction: 'left' }, { ...fade, effect: 'underline', direction: 'up' },
      { ...fade, css: 'body{display:none}' }, { ...fade, source: 'assets/unread.css' },
    ]) expect(() => validateThemeButtonAnimations([recipe], ['assets/theme.css'])).toThrow();
    expect(() => validateThemeButtonAnimations([fade, fade])).toThrow();
    expect(() => validateThemeButtonAnimations([fade, { ...fade, target: 'secondary' }, fade])).toThrow();
  });

  for (const effect of ['fade', 'lift', 'slide-fill', 'underline'] as const) {
    it(`${effect}: creates valid scoped CSS with keyboard, pointer, disabled and reduced-motion handling`, () => {
      const recipe = { ...fade, effect };
      const css = generateThemeButtonAnimationCss([recipe], {
        scope: '[data-palette="example"]', targets: { cta: '.sample-primary' },
        variables: { cta: { background: 'var(--preview-normal)', hoverBackground: 'var(--preview-hover)' } },
      });
      const parsed = postcss.parse(css);
      const selectors: string[] = [];
      parsed.walkRules(rule => { selectors.push(rule.selector); });
      expect(selectors.length).toBeGreaterThan(2);
      for (const selector of selectors) {
        expect(selector).toContain('[data-palette="example"] :is(.sample-primary)');
        expect(selector).toContain(':not(:disabled)');
        expect(selector).toContain(':not([aria-disabled="true"])');
        expect(selector).toContain(':not(:has(button:disabled, [aria-disabled="true"]))');
      }
      expect(css).toContain('@media (hover: hover) and (pointer: fine)');
      expect(css).toContain(':is(:focus-visible, :has(:focus-visible))');
      expect(css).toContain('@media (prefers-reduced-motion: reduce)');
      expect(css).toContain('transition-duration: 0ms');
      expect(css).toContain('var(--preview-normal)');
      expect(css).toContain('var(--preview-hover)');
      expect(css).not.toContain('::before');
      expect(css).not.toContain('.ov25-cta');
      if (effect === 'lift') expect(css).toContain('translate: none');
      if (effect === 'slide-fill') {
        expect(css).toContain('background-size: 0% 100%');
        expect(css).toContain('background-size: 100% 100%');
      }
      if (effect === 'underline') expect(css).toContain('background-size: 100% 2px');
    });
  }

  it('targets the visible split checkout once and excludes disabled buttons and groups', () => {
    document.body.innerHTML = `
      <button class="ov25-cta" id="normal">Configure</button>
      <button class="ov25-cta" disabled id="disabled">Configure</button>
      <button class="ov25-cta" aria-disabled="true" id="aria-disabled">Configure</button>
      <div class="ov25-checkout-combo-button" id="split"><button class="ov25-cta">Buy</button><button>Cart</button></div>
      <div class="ov25-checkout-combo-button" id="disabled-split"><button class="ov25-cta" disabled>Buy</button></div>
      <button class="ov25-variant-control" id="secondary">Fabric</button>`;
    const parsed = postcss.parse(generateThemeButtonAnimationCss([fade]));
    const firstRule = parsed.nodes[0];
    if (firstRule.type !== 'rule') throw new Error('Expected the enabled button rule');
    expect([...document.querySelectorAll(firstRule.selector)].map(node => node.id)).toEqual(['normal', 'split']);
    expect(generateThemeButtonAnimationCss([fade])).toContain('.ov25-cta { background-color: transparent; color: inherit; }');
  });

  it('replaces its block idempotently and preserves handwritten CSS before and after it', () => {
    const manual = '/* Merchant rule */\n.custom { color: red; }';
    const once = mergeThemeButtonAnimationCss(manual, [fade]);
    expect(once.startsWith(`${manual}\n\n`)).toBe(true);
    expect(extractThemeButtonAnimations(once)).toEqual([fade]);
    expect(mergeThemeButtonAnimationCss(once, [fade])).toBe(once);
    const suffix = '\n.user-rule:hover { opacity: .9; }';
    const lift: ThemeButtonAnimation = { ...fade, effect: 'lift', distancePx: 3 };
    const updated = mergeThemeButtonAnimationCss(once + suffix, [lift]);
    expect(updated.startsWith(`${manual}\n\n`)).toBe(true);
    expect(updated.endsWith(suffix)).toBe(true);
    expect(extractThemeButtonAnimations(updated)).toEqual([lift]);
    expect(mergeThemeButtonAnimationCss(updated)).toBe(updated);
    const cleared = mergeThemeButtonAnimationCss(updated, []);
    expect(cleared).toBe(`${manual}\n\n${suffix}`);
    expect(extractThemeButtonAnimations(cleared)).toEqual([]);
    expect(mergeThemeButtonAnimationCss(cleared, [])).toBe(cleared);
  });

  it('never interprets manual CSS or untrusted metadata as a recipe', () => {
    const css = 'body { color: red }';
    expect(extractThemeButtonAnimations(css)).toEqual([]);
    const malformed = '/* OV25 theme button animations v1: [{"effect":"evil"}] */ body {display:none} /* End OV25 theme button animations */';
    expect(extractThemeButtonAnimations(malformed)).toEqual([]);
    const unusualSource = { ...fade, source: 'assets/a*/</style>.css' };
    const generated = mergeThemeButtonAnimationCss('', [unusualSource]);
    expect(generated).not.toContain('</style>');
    expect(generated).not.toContain('a*/');
    expect(extractThemeButtonAnimations(generated)).toEqual([unusualSource]);
  });
});
