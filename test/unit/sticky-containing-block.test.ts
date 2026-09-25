import { afterEach, describe, expect, it } from 'vitest';
import { resolveStickyContainingBlock } from '../../src/lib/sticky-layout-controller';

describe('resolveStickyContainingBlock', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('returns a block ancestor unchanged', () => {
    document.body.innerHTML = '<div id="block"><div id="gallery"></div></div>';
    const block = document.getElementById('block')!;
    expect(resolveStickyContainingBlock(block)).toBe(block);
  });

  it('skips inline and display:contents wrappers to the first real box', () => {
    // Mirrors theme markup: <div block> > <is-land contents> > <product-media inline> > gallery.
    document.body.innerHTML = `
      <div id="block">
        <is-land id="island" style="display: contents">
          <product-media id="media" style="display: inline"><div id="gallery"></div></product-media>
        </is-land>
      </div>`;
    expect(resolveStickyContainingBlock(document.getElementById('media'))).toBe(
      document.getElementById('block'),
    );
  });

  it('treats inline-block, flex and grid wrappers as real boxes', () => {
    for (const display of ['inline-block', 'flex', 'grid', 'block']) {
      document.body.innerHTML = `<div id="wrap" style="display: ${display}"><div id="gallery"></div></div>`;
      const wrap = document.getElementById('wrap')!;
      expect(resolveStickyContainingBlock(wrap)).toBe(wrap);
    }
  });

  it('stops at body rather than walking to the document root', () => {
    document.body.innerHTML = '<span id="inline" style="display: inline"><div id="gallery"></div></span>';
    expect(resolveStickyContainingBlock(document.getElementById('inline'))).toBe(document.body);
  });

  it('passes through a missing parent', () => {
    expect(resolveStickyContainingBlock(null)).toBeNull();
  });
});
