import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createCarouselTargetController,
  EXTERNAL_CAROUSEL_HOST_ATTRIBUTE,
  isHTMLElementInOwnerDocument,
  MOBILE_INLINE_STICKY_CAROUSEL_TARGET_SELECTOR,
  resolveCarouselTargetSelectorForViewport,
  resolveCarouselTarget,
} from '../../src/lib/carousel-target-controller';

function createProduct(id: string) {
  const product = document.createElement('section');
  product.id = id;
  product.innerHTML = `
    <div data-gallery></div>
    <div data-variants></div>
    <div class="carousel-target"></div>
  `;
  document.body.appendChild(product);
  return {
    product,
    galleryHost: product.querySelector<HTMLElement>('[data-gallery]')!,
    variantsHost: product.querySelector<HTMLElement>('[data-variants]')!,
    target: product.querySelector<HTMLElement>('.carousel-target')!,
  };
}

async function flushMutations() {
  await Promise.resolve();
  await Promise.resolve();
}

afterEach(() => {
  document.body.replaceChildren();
});

describe('carousel target controller', () => {
  it('selects only the current viewport target and limits the built-in fallback to mobile inline-sticky', () => {
    const desktopSelector = { selector: '#desktop-carousel', replace: false };
    const mobileSelector = '#mobile-carousel';
    const resolve = (
      overrides: Partial<Parameters<typeof resolveCarouselTargetSelectorForViewport>[0]> = {},
    ) => resolveCarouselTargetSelectorForViewport({
      desktopSelector,
      mobileSelector,
      isMobile: false,
      mobileInlineSticky: false,
      isSnap2: false,
      ...overrides,
    });

    expect(resolve()).toBe(desktopSelector);
    expect(resolve({ isMobile: true })).toBe(mobileSelector);
    expect(resolve({ desktopSelector: '   ' })).toBeUndefined();
    expect(resolve({ isMobile: true, mobileSelector: { selector: '' } })).toBeUndefined();
    expect(resolve({
      isMobile: true,
      mobileSelector: undefined,
      mobileInlineSticky: true,
    })).toBe(MOBILE_INLINE_STICKY_CAROUSEL_TARGET_SELECTOR);
    expect(resolve({
      isMobile: true,
      mobileSelector: ' ',
      mobileInlineSticky: true,
      isSnap2: true,
    })).toBeUndefined();
  });

  it('resolves duplicate selectors inside each configurator scope', () => {
    const first = createProduct('first');
    const second = createProduct('second');

    expect(resolveCarouselTarget({
      document,
      selector: '.carousel-target',
      galleryHost: first.galleryHost,
      variantsHost: first.variantsHost,
    }).target).toBe(first.target);
    expect(resolveCarouselTarget({
      document,
      selector: '.carousel-target',
      galleryHost: second.galleryHost,
      variantsHost: second.variantsHost,
    }).target).toBe(second.target);
  });

  it('does not borrow a document target when a meaningful configurator scope has no match', () => {
    const product = createProduct('scoped-miss');
    product.target.remove();
    const siblingTarget = document.createElement('div');
    siblingTarget.className = 'carousel-target';
    document.body.appendChild(siblingTarget);

    expect(resolveCarouselTarget({
      document,
      selector: '.carousel-target',
      galleryHost: product.galleryHost,
      variantsHost: product.variantsHost,
    })).toMatchObject({
      status: 'not-found',
      target: null,
      scope: product.product,
    });
  });

  it('uses the target owner document realm instead of ambient HTMLElement', () => {
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    const foreignDocument = iframe.contentDocument!;
    const product = foreignDocument.createElement('section');
    product.innerHTML = `
      <div data-gallery></div>
      <div data-variants></div>
      <div class="carousel-target"></div>
    `;
    foreignDocument.body.appendChild(product);
    const target = product.querySelector<HTMLElement>('.carousel-target')!;

    expect(isHTMLElementInOwnerDocument(target)).toBe(true);
    expect(resolveCarouselTarget({
      document: foreignDocument,
      selector: '.carousel-target',
      galleryHost: product.querySelector<HTMLElement>('[data-gallery]'),
      variantsHost: product.querySelector<HTMLElement>('[data-variants]'),
    })).toMatchObject({ status: 'resolved', target, scope: product });
  });

  it('resolves and observes direct siblings in a shared shadow root', async () => {
    const shadowHost = document.createElement('div');
    document.body.appendChild(shadowHost);
    const shadowRoot = shadowHost.attachShadow({ mode: 'open' });
    const galleryHost = document.createElement('div');
    const variantsHost = document.createElement('div');
    shadowRoot.append(galleryHost, variantsHost);
    const onChange = vi.fn();
    const controller = createCarouselTargetController({
      document,
      selector: '.carousel-target',
      galleryHost,
      variantsHost,
      onChange,
    });

    controller.start();
    expect(onChange.mock.lastCall?.[0]).toMatchObject({
      status: 'not-found',
      scope: shadowRoot,
    });

    const target = document.createElement('div');
    target.className = 'carousel-target';
    shadowRoot.appendChild(target);
    await flushMutations();
    expect(onChange.mock.lastCall?.[0]).toMatchObject({
      status: 'resolved',
      target,
      scope: shadowRoot,
    });

    controller.destroy();
  });

  it('tracks target appearance, replacement, and removal', async () => {
    const product = createProduct('dynamic');
    product.target.remove();
    const onChange = vi.fn();
    const controller = createCarouselTargetController({
      document,
      selector: '.carousel-target',
      galleryHost: product.galleryHost,
      variantsHost: product.variantsHost,
      onChange,
    });

    controller.start();
    expect(onChange.mock.lastCall?.[0]).toMatchObject({ status: 'not-found', target: null });

    const target = document.createElement('div');
    target.className = 'carousel-target';
    product.product.appendChild(target);
    await flushMutations();
    expect(onChange.mock.lastCall?.[0]).toMatchObject({ status: 'resolved', target });

    const replacement = document.createElement('div');
    replacement.className = 'carousel-target';
    target.replaceWith(replacement);
    await flushMutations();
    expect(onChange.mock.lastCall?.[0]).toMatchObject({ status: 'resolved', target: replacement });

    replacement.remove();
    await flushMutations();
    expect(onChange.mock.lastCall?.[0]).toMatchObject({ status: 'not-found', target: null });

    controller.destroy();
    const callCount = onChange.mock.calls.length;
    product.product.appendChild(document.createElement('div')).className = 'carousel-target';
    await flushMutations();
    expect(onChange).toHaveBeenCalledTimes(callCount);
  });

  it('ignores owned-host mutations and keeps an empty-selector target stable', async () => {
    const product = createProduct('owned-host');
    product.target.id = 'empty-carousel-target';
    const onChange = vi.fn();
    const controller = createCarouselTargetController({
      document,
      selector: '#empty-carousel-target:empty',
      galleryHost: product.galleryHost,
      variantsHost: product.variantsHost,
      onChange,
    });

    controller.start();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.lastCall?.[0]).toMatchObject({
      status: 'resolved',
      target: product.target,
    });

    const ownedHost = document.createElement('div');
    ownedHost.setAttribute(EXTERNAL_CAROUSEL_HOST_ATTRIBUTE, 'true');
    product.target.appendChild(ownedHost);
    await flushMutations();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(controller.measure()).toMatchObject({
      status: 'resolved',
      target: product.target,
    });

    ownedHost.remove();
    await flushMutations();
    expect(onChange).toHaveBeenCalledTimes(1);

    product.target.appendChild(ownedHost);
    product.target.appendChild(document.createElement('span'));
    await flushMutations();
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange.mock.lastCall?.[0]).toMatchObject({ status: 'not-found', target: null });

    controller.destroy();
  });

  it('remeasures selector-relevant merchant descendant attributes while an owned host is present', async () => {
    const product = createProduct('attribute-change');
    product.target.id = 'descendant-selector-target';
    const merchantChild = document.createElement('span');
    product.target.appendChild(merchantChild);
    const onChange = vi.fn();
    const controller = createCarouselTargetController({
      document,
      selector:
        '#descendant-selector-target:not(:has([data-selector-blocked]))' +
        `:not(:has([${EXTERNAL_CAROUSEL_HOST_ATTRIBUTE}]))`,
      galleryHost: product.galleryHost,
      variantsHost: product.variantsHost,
      onChange,
    });

    controller.start();
    const ownedHost = document.createElement('div');
    ownedHost.setAttribute(EXTERNAL_CAROUSEL_HOST_ATTRIBUTE, 'true');
    product.target.appendChild(ownedHost);
    await flushMutations();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(controller.measure()).toMatchObject({
      status: 'resolved',
      target: product.target,
    });

    merchantChild.setAttribute('data-selector-blocked', 'true');
    await flushMutations();
    expect(onChange.mock.lastCall?.[0]).toMatchObject({ status: 'not-found', target: null });

    controller.destroy();
  });

  it('rejects invalid and ambiguous selectors so the embedded carousel remains the fallback', () => {
    createProduct('first');
    createProduct('second');

    expect(resolveCarouselTarget({ document, selector: '[' }).status).toBe('invalid');
    expect(resolveCarouselTarget({ document, selector: '.carousel-target' })).toMatchObject({
      status: 'ambiguous',
      target: null,
    });
    expect(resolveCarouselTarget({ document, selector: undefined })).toMatchObject({
      status: 'missing',
      target: null,
    });
  });
});
