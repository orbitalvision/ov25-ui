import React, { useEffect } from 'react';
import { page } from 'vitest/browser';
import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import {
  OV25UIProvider,
  useOV25UI,
  type Selection,
  type Swatch,
} from '../../src/contexts/ov25-ui-context';
import { DefaultVariantCard } from '../../src/components/VariantSelectMenu/variant-cards/DefaultVariantCard';
import { SelectionDetailsSurface } from '../../src/components/VariantSelectMenu/variant-cards/SelectionDetailsSurface';
import { SELECTION_DETAILS_TOOLTIP_HOVER_DELAY_CSS_VARIABLE } from '../../src/lib/config/selection-details-tooltip-hover-delay';
import { generateElementCSS } from '../../setup/src/lib/config/configurator-style-variables';
import '../../globals.css';

const IMAGE_DATA_URL =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="8" height="8"%3E%3Crect width="8" height="8" fill="%235b7c8d"/%3E%3C/svg%3E';

const swatch: Swatch = {
  manufacturerId: 42,
  option: 'Fabric',
  group: 'Plain',
  name: 'Ocean swatch',
  description: 'A durable blue weave.',
  sku: 'OCEAN-1',
  thumbnail: {
    thumbnail: IMAGE_DATA_URL,
    miniThumbnails: {
      small: IMAGE_DATA_URL,
      medium: IMAGE_DATA_URL,
      large: IMAGE_DATA_URL,
    },
  },
};

function selection(includeSwatch: boolean): Selection {
  return {
    id: 'ocean',
    name: 'Ocean selection',
    price: 0,
    blurHash: '',
    groupId: 'plain',
    thumbnail: IMAGE_DATA_URL,
    miniThumbnails: {
      small: IMAGE_DATA_URL,
      medium: IMAGE_DATA_URL,
      large: IMAGE_DATA_URL,
    },
    swatch: includeSwatch ? swatch : undefined,
  };
}

const providerProps = {
  productLink: null,
  apiKey: 'test-api-key',
  configurationUuid: '',
  buyNowFunction: () => undefined,
  addToBasketFunction: () => undefined,
  buySwatchesFunction: () => undefined,
  isProductGalleryStacked: false,
  carouselLayout: 'carousel' as const,
  hasConfigureButton: false,
};

function DetailsHarness({
  enabled,
  includeSwatch,
  onSelect,
  productId,
  selectionName,
}: {
  enabled: boolean;
  includeSwatch: boolean;
  onSelect: () => void;
  productId?: string;
  selectionName?: string;
}) {
  const { setCurrentProductId, setSwatchRulesData } = useOV25UI();
  const source = {
    ...selection(includeSwatch),
    ...(selectionName ? { name: selectionName } : {}),
  };

  useEffect(() => {
    setSwatchRulesData({
      enabled,
      freeSwatchLimit: 4,
      canExeedFreeLimit: false,
      pricePerSwatch: 0,
      minSwatches: 0,
      maxSwatches: 4,
    });
  }, [enabled, setSwatchRulesData]);

  useEffect(() => {
    if (productId) setCurrentProductId(productId);
  }, [productId, setCurrentProductId]);

  return (
    <>
      <DefaultVariantCard
        variant={{
          id: source.id,
          optionId: 'fabric',
          groupId: source.groupId,
          name: source.name,
          price: source.price,
          image: source.miniThumbnails?.medium ?? '',
          blurHash: source.blurHash,
          swatch: source.swatch,
          selection: source,
          isSelected: false,
        }}
        index={0}
        isMobile={false}
        onSelect={onSelect}
      />
      <SelectionDetailsSurface />
    </>
  );
}

test.beforeEach(async () => {
  await page.viewport(1024, 768);
  document.documentElement.style.setProperty('--ov25-border-color', '#e5e5e5');
  localStorage.removeItem('ov25-selected-swatches');
});

test('opens rich swatch details without applying until the primary action', async () => {
  const onSelect = vi.fn();
  const { container, getByRole } = await render(
    <OV25UIProvider
      {...providerProps}
      selectionDetailsDisplayModeDesktop="modal"
      selectionDetailsDisplayModeMobile="modal"
    >
      <DetailsHarness enabled includeSwatch onSelect={onSelect} />
    </OV25UIProvider>,
  );

  await expect.poll(() => container.querySelector('[data-swatch-eligible="true"]')).not.toBeNull();
  (container.querySelector('.ov25-default-variant-card') as HTMLElement).click();

  await expect.poll(() => container.querySelector('.ov25-selection-details-surface')).not.toBeNull();
  expect(onSelect).not.toHaveBeenCalled();
  await expect.element(getByRole('heading', { name: 'Ocean swatch' })).toBeInTheDocument();
  await expect.element(getByRole('button', { name: 'Add to swatchbook' })).toBeInTheDocument();

  await getByRole('button', { name: 'Apply to Model' }).click();
  expect(onSelect).toHaveBeenCalledTimes(1);

  await expect.poll(() =>
    container.querySelector('.ov25-selection-details-surface'),
  ).toBeNull();
  (container.querySelector('.ov25-default-variant-card') as HTMLElement).click();
  await expect.element(getByRole('button', { name: 'Applied' })).toBeDisabled();
});

test('waits for detail image decode and paint before passive preload, ignoring a closed request', async () => {
  const iframe = document.createElement('iframe');
  iframe.id = 'ov25-configurator-iframe-selection-details-preload';
  document.body.appendChild(iframe);
  const receivedMessages: unknown[] = [];
  iframe.contentWindow?.addEventListener('message', (event) => {
    receivedMessages.push(event.data);
  });
  const resolveDecodes: Array<() => void> = [];
  const decode = vi.spyOn(HTMLImageElement.prototype, 'decode').mockImplementation(() =>
    new Promise<void>((resolve) => {
      resolveDecodes.push(resolve);
    }),
  );

  try {
    const onSelect = vi.fn();
    const { container, getByRole } = await render(
      <OV25UIProvider
        {...providerProps}
        uniqueId="selection-details-preload"
        selectionDetailsDisplayModeDesktop="modal"
        selectionDetailsDisplayModeMobile="modal"
      >
        <DetailsHarness enabled includeSwatch onSelect={onSelect} productId="1682" />
      </OV25UIProvider>,
    );

    const trigger = container.querySelector('.ov25-default-variant-card') as HTMLElement;
    trigger.click();

    await expect.poll(() => resolveDecodes.length).toBe(1);
    expect(receivedMessages).toHaveLength(0);
    await getByRole('button', { name: 'Close' }).click();
    resolveDecodes[0]();
    await new Promise<void>((resolve) => window.setTimeout(resolve, 50));
    expect(receivedMessages).toHaveLength(0);

    await expect.poll(() =>
      container.querySelector('.ov25-selection-details-surface'),
    ).toBeNull();
    trigger.click();
    await expect.poll(() => resolveDecodes.length).toBe(2);
    expect(receivedMessages).toHaveLength(0);
    resolveDecodes[1]();
    await expect.poll(() => receivedMessages.length).toBe(1);
    expect(receivedMessages[0]).toEqual({
      type: 'PRELOAD_SELECTION',
      payload: JSON.stringify({
        requestId: 2,
        productId: '1682',
        optionId: 'fabric',
        groupId: 'plain',
        selectionId: 'ocean',
      }),
    });
    expect(onSelect).not.toHaveBeenCalled();
  } finally {
    decode.mockRestore();
    iframe.remove();
  }
});

test('shows selection-only fallback when swatches are disabled', async () => {
  const { container, getByRole } = await render(
    <OV25UIProvider
      {...providerProps}
      selectionDetailsDisplayModeDesktop="modal"
      selectionDetailsDisplayModeMobile="modal"
    >
      <DetailsHarness enabled={false} includeSwatch onSelect={() => undefined} />
    </OV25UIProvider>,
  );

  (container.querySelector('.ov25-default-variant-card') as HTMLElement).click();
  await expect.element(getByRole('heading', { name: 'Ocean selection' })).toBeInTheDocument();
  expect(container.querySelector('.ov25-selection-details-description')).toBeNull();
  expect(container.querySelector('.ov25-selection-details-swatch-toggle')).toBeNull();
});

test('wraps long unbroken sheet text without horizontal overflow', async () => {
  const longTitle = 'FABRIC__100_BRITISH_ROMNEY_WOOL__MATCHA';
  const { container } = await render(
    <OV25UIProvider
      {...providerProps}
      selectionDetailsDisplayModeDesktop="sheet"
      selectionDetailsDisplayModeMobile="fullscreen"
    >
      <DetailsHarness
        enabled={false}
        includeSwatch={false}
        onSelect={() => undefined}
        selectionName={longTitle}
      />
    </OV25UIProvider>,
  );

  (container.querySelector('.ov25-default-variant-card') as HTMLElement).click();

  await expect.poll(() =>
    container.querySelector('.ov25-selection-details-title')?.textContent,
  ).toBe(longTitle);

  const surface = container.querySelector(
    '.ov25-selection-details-surface',
  ) as HTMLElement;
  const copy = container.querySelector(
    '.ov25-selection-details-copy',
  ) as HTMLElement;
  const title = container.querySelector(
    '.ov25-selection-details-title',
  ) as HTMLElement;
  const scrollRegion = copy.parentElement as HTMLElement;
  const titleStyle = getComputedStyle(title);
  const lineHeight = Number.parseFloat(titleStyle.lineHeight);

  expect(getComputedStyle(scrollRegion).overflowX).toBe('hidden');
  expect(scrollRegion.scrollWidth).toBeLessThanOrEqual(scrollRegion.clientWidth);
  expect(surface.scrollWidth).toBeLessThanOrEqual(surface.clientWidth);
  expect(title.scrollWidth).toBeLessThanOrEqual(title.clientWidth);
  expect(titleStyle.overflowWrap).toBe('anywhere');
  expect(title.getBoundingClientRect().height).toBeGreaterThan(lineHeight * 1.5);
});

test('none keeps the legacy direct-select path and does not open details', async () => {
  const onSelect = vi.fn();
  const { container } = await render(
    <OV25UIProvider
      {...providerProps}
      selectionDetailsDisplayModeDesktop="none"
      selectionDetailsDisplayModeMobile="none"
    >
      <DetailsHarness enabled includeSwatch onSelect={onSelect} />
    </OV25UIProvider>,
  );

  (container.querySelector('.ov25-variant-image-container') as HTMLElement).click();
  expect(onSelect).toHaveBeenCalledTimes(1);
  expect(container.querySelector('.ov25-selection-details-surface')).toBeNull();
});

test('desktop tooltip previews on hover, has no actions, and applies directly on click or keyboard', async () => {
  const onSelect = vi.fn();
  const { container } = await render(
    <OV25UIProvider
      {...providerProps}
      selectionDetailsDisplayModeDesktop="tooltip"
      selectionDetailsDisplayModeMobile="fullscreen"
    >
      <DetailsHarness enabled includeSwatch onSelect={onSelect} />
    </OV25UIProvider>,
  );
  const trigger = container.querySelector('.ov25-default-variant-card') as HTMLElement;
  vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue(DOMRect.fromRect({
    x: 600,
    y: 100,
    width: 100,
    height: 100,
  }));
  trigger.style.setProperty(SELECTION_DETAILS_TOOLTIP_HOVER_DELAY_CSS_VARIABLE, '80ms');

  trigger.dispatchEvent(new PointerEvent('pointerover', { bubbles: true }));
  await new Promise<void>((resolve) => window.setTimeout(resolve, 20));
  await expect.poll(() => container.querySelector('.ov25-selection-details-surface')).toBeNull();
  trigger.dispatchEvent(new PointerEvent('pointerout', { bubbles: true }));
  await new Promise<void>((resolve) => window.setTimeout(resolve, 100));
  await expect.poll(() => container.querySelector('.ov25-selection-details-surface')).toBeNull();

  trigger.dispatchEvent(new PointerEvent('pointerover', { bubbles: true }));
  await expect.poll(() =>
    container.querySelector('.ov25-selection-details-surface')?.getAttribute('data-pinned'),
  ).toBe('false');
  await expect.poll(() =>
    container.querySelector('.ov25-selection-details-surface')?.getAttribute('data-present'),
  ).toBe('true');
  expect(container.querySelector('.ov25-selection-details-close')).toBeNull();
  expect(container.querySelector('.ov25-selection-details-footer')).toBeNull();
  expect(container.querySelector('.ov25-selection-details-apply')).toBeNull();
  expect(container.querySelector('.ov25-selection-details-swatch-toggle')).toBeNull();
  const surface = container.querySelector<HTMLElement>('.ov25-selection-details-surface')!;
  const imageFrame = surface.querySelector<HTMLElement>('.ov25-selection-details-image-frame')!;
  const title = surface.querySelector<HTMLElement>('.ov25-selection-details-title')!;
  const description = surface.querySelector<HTMLElement>('.ov25-selection-details-description')!;
  const surfaceStyle = getComputedStyle(surface);
  const titleStyle = getComputedStyle(title);
  const descriptionStyle = getComputedStyle(description);
  expect(surfaceStyle.width).toBe('240px');
  expect(surfaceStyle.height).toBe('360px');
  expect(surfaceStyle.borderColor).toBe('rgb(229, 229, 229)');
  expect(surfaceStyle.borderRadius).toBe('0px');
  expect(surfaceStyle.boxShadow).toBe('none');
  expect(surface.style.left).toBe('350px');
  expect(surface.style.borderRadius).toBe('');
  expect(surface.style.transformOrigin).toBe('');
  expect(surfaceStyle.transformOrigin).toBe('240px 180px');
  expect(Math.abs(
    imageFrame.getBoundingClientRect().width - imageFrame.getBoundingClientRect().height,
  )).toBeLessThanOrEqual(1);
  expect(title.style.color).toBe('');
  expect(titleStyle.left).toBe('12px');
  expect(titleStyle.top).toBe('12px');
  expect(titleStyle.color).toBe('rgb(255, 255, 255)');
  expect(titleStyle.fontSize).toBe('14px');
  expect(titleStyle.textShadow).toBe('none');
  expect(description.style.fontSize).toBe('');
  expect(descriptionStyle.height).toBe('120px');
  expect(descriptionStyle.fontSize).toBe('11px');

  trigger.click();
  expect(onSelect).toHaveBeenCalledTimes(1);
  await expect.poll(() => container.querySelector('.ov25-selection-details-surface')).toBeNull();

  trigger.blur();
  trigger.focus();
  await expect.poll(() => container.querySelector('.ov25-selection-details-surface')).not.toBeNull();
  expect(container.querySelector('.ov25-selection-details-surface')).toHaveAttribute(
    'data-pinned',
    'false',
  );
  trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  expect(onSelect).toHaveBeenCalledTimes(2);
  await expect.poll(() => container.querySelector('.ov25-selection-details-surface')).toBeNull();
});

test('Setup element styles override fixed selection-details defaults', async () => {
  const customStyles = document.createElement('style');
  customStyles.textContent = generateElementCSS({
    '.ov25-selection-details-surface': {
      'background-color': '#102030',
      'border-radius': '17px',
      'border-width': '3px',
    },
    '.ov25-selection-details-title': {
      color: '#f43f5e',
      'font-size': '21px',
      'font-weight': '700',
    },
    '.ov25-selection-details-description': {
      'background-color': '#1e293b',
      color: '#fde68a',
      'font-size': '15px',
      padding: '18px',
    },
  });
  document.head.appendChild(customStyles);

  try {
    const { container } = await render(
      <OV25UIProvider
        {...providerProps}
        selectionDetailsDisplayModeDesktop="tooltip"
        selectionDetailsDisplayModeMobile="fullscreen"
      >
        <DetailsHarness enabled includeSwatch onSelect={() => undefined} />
      </OV25UIProvider>,
    );
    const trigger = container.querySelector('.ov25-default-variant-card') as HTMLElement;
    trigger.focus();

    await expect.poll(() => container.querySelector('.ov25-selection-details-surface')).not.toBeNull();
    const surface = container.querySelector<HTMLElement>('.ov25-selection-details-surface')!;
    const title = surface.querySelector<HTMLElement>('.ov25-selection-details-title')!;
    const description = surface.querySelector<HTMLElement>(
      '.ov25-selection-details-description',
    )!;

    expect(getComputedStyle(surface).backgroundColor).toBe('rgb(16, 32, 48)');
    expect(getComputedStyle(surface).borderRadius).toBe('17px');
    expect(getComputedStyle(surface).borderWidth).toBe('3px');
    expect(getComputedStyle(title).color).toBe('rgb(244, 63, 94)');
    expect(getComputedStyle(title).fontSize).toBe('21px');
    expect(getComputedStyle(title).fontWeight).toBe('700');
    expect(getComputedStyle(description).backgroundColor).toBe('rgb(30, 41, 59)');
    expect(getComputedStyle(description).color).toBe('rgb(253, 230, 138)');
    expect(getComputedStyle(description).fontSize).toBe('15px');
    expect(getComputedStyle(description).padding).toBe('18px');

    expect(surface.style.borderRadius).toBe('');
    expect(title.style.color).toBe('');
    expect(description.style.padding).toBe('');
  } finally {
    customStyles.remove();
  }
});

test('tooltip cancels only a sent, uncommitted preload', async () => {
  const iframe = document.createElement('iframe');
  iframe.id = 'ov25-configurator-iframe-selection-details-tooltip-preload';
  document.body.appendChild(iframe);
  const receivedMessages: unknown[] = [];
  iframe.contentWindow?.addEventListener('message', (event) => {
    receivedMessages.push(event.data);
  });
  const resolveDecodes: Array<() => void> = [];
  const decode = vi.spyOn(HTMLImageElement.prototype, 'decode').mockImplementation(() =>
    new Promise<void>((resolve) => {
      resolveDecodes.push(resolve);
    }),
  );

  try {
    const onSelect = vi.fn();
    const { container } = await render(
      <OV25UIProvider
        {...providerProps}
        uniqueId="selection-details-tooltip-preload"
        selectionDetailsDisplayModeDesktop="tooltip"
        selectionDetailsDisplayModeMobile="fullscreen"
      >
        <DetailsHarness enabled includeSwatch onSelect={onSelect} productId="1682" />
      </OV25UIProvider>,
    );
    const trigger = container.querySelector('.ov25-default-variant-card') as HTMLElement;
    trigger.style.setProperty(SELECTION_DETAILS_TOOLTIP_HOVER_DELAY_CSS_VARIABLE, '0ms');

    // Leaving before image decode/paint has completed must not emit either
    // a preload or a cancellation.
    trigger.dispatchEvent(new PointerEvent('pointerover', { bubbles: true }));
    await expect.poll(() => resolveDecodes.length).toBe(1);
    trigger.dispatchEvent(new PointerEvent('pointerout', { bubbles: true }));
    await new Promise<void>((resolve) => window.setTimeout(resolve, 180));
    resolveDecodes[0]();
    await new Promise<void>((resolve) => window.setTimeout(resolve, 50));
    expect(receivedMessages).toHaveLength(0);

    // A displayed tooltip preloads after its image paints and cancels that
    // speculative work when the unpinned preview closes.
    trigger.dispatchEvent(new PointerEvent('pointerover', { bubbles: true }));
    await expect.poll(() => resolveDecodes.length).toBe(2);
    resolveDecodes[1]();
    await expect.poll(() => receivedMessages.length).toBe(1);
    expect(receivedMessages[0]).toEqual({
      type: 'PRELOAD_SELECTION',
      payload: JSON.stringify({
        requestId: 2,
        productId: '1682',
        optionId: 'fabric',
        groupId: 'plain',
        selectionId: 'ocean',
      }),
    });
    trigger.dispatchEvent(new PointerEvent('pointerout', { bubbles: true }));
    await expect.poll(() => receivedMessages.length).toBe(2);
    expect(receivedMessages[1]).toEqual({
      type: 'CANCEL_PRELOAD_SELECTION',
      payload: JSON.stringify({
        requestId: 2,
        productId: '1682',
        optionId: 'fabric',
        groupId: 'plain',
        selectionId: 'ocean',
      }),
    });

    // Selecting the same preview commits it, so its close does not cancel.
    trigger.dispatchEvent(new PointerEvent('pointerover', { bubbles: true }));
    await expect.poll(() => resolveDecodes.length).toBe(3);
    resolveDecodes[2]();
    await expect.poll(() => receivedMessages.length).toBe(3);
    trigger.click();
    expect(onSelect).toHaveBeenCalledTimes(1);
    await new Promise<void>((resolve) => window.setTimeout(resolve, 50));
    expect(receivedMessages).toHaveLength(3);
  } finally {
    decode.mockRestore();
    iframe.remove();
  }
});

test('sheet paints offscreen before sliding in from the right', async () => {
  const originalViewport = { width: window.innerWidth, height: window.innerHeight };
  await page.viewport(1024, 768);

  const requestFrame = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(
    (callback) => window.setTimeout(() => callback(performance.now()), 50),
  );
  const cancelFrame = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(
    (handle) => window.clearTimeout(handle),
  );

  try {
    const { container } = await render(
      <OV25UIProvider
        {...providerProps}
        selectionDetailsDisplayModeDesktop="sheet"
        selectionDetailsDisplayModeMobile="fullscreen"
      >
        <DetailsHarness enabled includeSwatch onSelect={() => undefined} />
      </OV25UIProvider>,
    );

    (container.querySelector('.ov25-default-variant-card') as HTMLElement).click();

    await expect.poll(() =>
      container.querySelector<HTMLElement>('.ov25-selection-details-surface')?.dataset.present,
    ).toBe('false');
    expect(container.querySelector('.ov25-selection-details-backdrop')).toBeNull();
    const surface = container.querySelector<HTMLElement>('.ov25-selection-details-surface')!;
    expect(surface.getBoundingClientRect().width).toBe(384);
    expect(surface.style.transform).toBe('translateX(100%)');

    await expect.poll(() => surface.dataset.present).toBe('true');
    expect(surface.style.transform).toBe('translateX(0px)');
    expect(surface.style.transition).toContain('cubic-bezier(0.32, 0.72, 0, 1)');
  } finally {
    requestFrame.mockRestore();
    cancelFrame.mockRestore();
    await page.viewport(originalViewport.width, originalViewport.height);
  }
});

test('desktop fullscreen remains instant', async () => {
  const originalViewport = { width: window.innerWidth, height: window.innerHeight };
  await page.viewport(1024, 768);

  try {
    const { container } = await render(
      <OV25UIProvider
        {...providerProps}
        selectionDetailsDisplayModeDesktop="fullscreen"
        selectionDetailsDisplayModeMobile="fullscreen"
      >
        <DetailsHarness enabled includeSwatch onSelect={() => undefined} />
      </OV25UIProvider>,
    );

    (container.querySelector('.ov25-default-variant-card') as HTMLElement).click();

    await expect.poll(() =>
      container.querySelector<HTMLElement>('.ov25-selection-details-surface')?.dataset.present,
    ).toBe('true');
    const surface = container.querySelector<HTMLElement>('.ov25-selection-details-surface')!;
    expect(surface).toHaveAttribute('data-layout', 'split');
    expect(surface.style.transition).toBe('');
    expect(surface.style.transform).toBe('');
  } finally {
    await page.viewport(originalViewport.width, originalViewport.height);
  }
});

test('mobile fullscreen paints offscreen before sliding in from the right', async () => {
  const originalViewport = { width: window.innerWidth, height: window.innerHeight };
  await page.viewport(390, 844);

  const requestFrame = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(
    (callback) => window.setTimeout(() => callback(performance.now()), 50),
  );
  const cancelFrame = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(
    (handle) => window.clearTimeout(handle),
  );

  try {
    const { container } = await render(
      <OV25UIProvider
        {...providerProps}
        selectionDetailsDisplayModeDesktop="tooltip"
        selectionDetailsDisplayModeMobile="fullscreen"
      >
        <DetailsHarness enabled includeSwatch onSelect={() => undefined} />
      </OV25UIProvider>,
    );

    (container.querySelector('.ov25-default-variant-card') as HTMLElement).click();

    await expect.poll(() =>
      container.querySelector<HTMLElement>('.ov25-selection-details-surface')?.dataset.present,
    ).toBe('false');
    const surface = container.querySelector<HTMLElement>('.ov25-selection-details-surface')!;
    expect(surface).toHaveAttribute('data-display-mode', 'fullscreen');
    expect(surface).toHaveAttribute('data-layout', 'stacked');
    expect(surface.getBoundingClientRect().width).toBe(390);
    expect(surface.style.transform).toBe('translateX(100%)');
    expect(
      surface.querySelector('.ov25-selection-details-image-frame'),
    ).toHaveAttribute('data-image-presentation', 'contain');

    await expect.poll(() => surface.dataset.present).toBe('true');
    expect(surface.style.transform).toBe('translateX(0px)');
    expect(surface.style.transition).toContain('cubic-bezier(0.32, 0.72, 0, 1)');
  } finally {
    requestFrame.mockRestore();
    cancelFrame.mockRestore();
    await page.viewport(originalViewport.width, originalViewport.height);
  }
});
