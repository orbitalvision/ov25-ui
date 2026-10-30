import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  isTopLayerPortalRaised,
  notifyStickyHostEnteredTopLayer,
  notifyStickyHostLeftTopLayer,
  registerTopLayerPortal,
  resetTopLayerOverlaysForTests,
} from '../../src/lib/top-layer-overlays';

type PopoverDescriptor = PropertyDescriptor | undefined;

const flushMutations = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

describe('top-layer overlay portals', () => {
  let originalShow: PopoverDescriptor;
  let originalHide: PopoverDescriptor;
  let showOrder: string[];

  beforeEach(() => {
    showOrder = [];
    originalShow = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'showPopover');
    originalHide = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'hidePopover');
    Object.defineProperty(HTMLElement.prototype, 'showPopover', {
      configurable: true,
      writable: true,
      value: function showPopover(this: HTMLElement) {
        showOrder.push(this.id);
      },
    });
    Object.defineProperty(HTMLElement.prototype, 'hidePopover', {
      configurable: true,
      writable: true,
      value: vi.fn(),
    });
  });

  afterEach(() => {
    resetTopLayerOverlaysForTests();
    document.body.innerHTML = '';
    for (const [name, descriptor] of [['showPopover', originalShow], ['hidePopover', originalHide]] as const) {
      if (descriptor) Object.defineProperty(HTMLElement.prototype, name, descriptor);
      else delete (HTMLElement.prototype as unknown as Record<string, unknown>)[name];
    }
  });

  function portal(id: string, zIndex: number) {
    const container = document.createElement('div');
    container.id = id;
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    container.style.zIndex = String(zIndex);
    document.body.append(container);
    const root = container.attachShadow({ mode: 'open' });
    return { container, root };
  }

  it('leaves portals on ordinary z-index stacking while no sticky host is in the top layer', async () => {
    const details = portal('details', 5);
    registerTopLayerPortal(details.container, details.root, 5);
    details.root.append(document.createElement('div'));
    await flushMutations();

    expect(isTopLayerPortalRaised(details.container)).toBe(false);
    expect(details.container.hasAttribute('popover')).toBe(false);
    expect(showOrder).toEqual([]);
  });

  it('raises occupied portals after the sticky host and lowers them when content unmounts', async () => {
    const host = document.createElement('div');
    const details = portal('details', 5);
    registerTopLayerPortal(details.container, details.root, 5);
    notifyStickyHostEnteredTopLayer(host);
    expect(isTopLayerPortalRaised(details.container)).toBe(false);

    const tooltip = document.createElement('div');
    details.root.append(tooltip);
    await flushMutations();
    expect(isTopLayerPortalRaised(details.container)).toBe(true);
    expect(details.container.getAttribute('popover')).toBe('manual');
    expect(details.container.style.getPropertyValue('margin')).toBe('0px');
    expect(details.container.style.getPropertyPriority('margin')).toBe('important');
    expect(details.container.style.getPropertyValue('background')).toContain('transparent');
    expect(details.container.style.getPropertyValue('pointer-events')).toBe('none');

    tooltip.remove();
    await flushMutations();
    expect(isTopLayerPortalRaised(details.container)).toBe(false);
    expect(HTMLElement.prototype.hidePopover).toHaveBeenCalled();
    expect(details.container.hasAttribute('popover')).toBe(false);
    expect(details.container.style.getPropertyValue('margin')).toBe('');
    expect(details.container.style.position).toBe('fixed');
    expect(details.container.style.width).toBe('100%');
    expect(details.container.style.getPropertyPriority('width')).toBe('');
    expect(details.container.style.zIndex).toBe('5');
  });

  it('re-raises portals in tier order whenever a sticky host is shown again', () => {
    const host = document.createElement('div');
    const toaster = portal('toaster', 9);
    const details = portal('details', 5);
    const dropdown = portal('dropdown', 3);
    toaster.root.append(document.createElement('section'));
    details.root.append(document.createElement('div'));
    dropdown.root.append(document.createElement('div'));
    registerTopLayerPortal(toaster.container, toaster.root, 9);
    registerTopLayerPortal(details.container, details.root, 5);
    registerTopLayerPortal(dropdown.container, dropdown.root, 3);

    notifyStickyHostEnteredTopLayer(host);
    expect(showOrder).toEqual(['dropdown', 'details', 'toaster']);

    showOrder = [];
    notifyStickyHostLeftTopLayer(host);
    expect(showOrder).toEqual([]);
    expect(toaster.container.hasAttribute('popover')).toBe(false);

    notifyStickyHostEnteredTopLayer(host);
    expect(showOrder).toEqual(['dropdown', 'details', 'toaster']);
  });

  it('only re-shows portals above a newly opened lower-tier portal', async () => {
    const host = document.createElement('div');
    const toaster = portal('toaster', 9);
    const details = portal('details', 5);
    toaster.root.append(document.createElement('section'));
    registerTopLayerPortal(details.container, details.root, 5);
    registerTopLayerPortal(toaster.container, toaster.root, 9);
    notifyStickyHostEnteredTopLayer(host);
    expect(showOrder).toEqual(['toaster']);

    showOrder = [];
    details.root.append(document.createElement('div'));
    await flushMutations();
    expect(showOrder).toEqual(['details', 'toaster']);
  });

  it('keeps current behaviour when the Popover API is unavailable or showing fails', async () => {
    Object.defineProperty(HTMLElement.prototype, 'showPopover', {
      configurable: true,
      writable: true,
      value: () => {
        throw new DOMException('not supported', 'NotSupportedError');
      },
    });
    const host = document.createElement('div');
    const details = portal('details', 5);
    details.root.append(document.createElement('div'));
    registerTopLayerPortal(details.container, details.root, 5);
    notifyStickyHostEnteredTopLayer(host);

    expect(isTopLayerPortalRaised(details.container)).toBe(false);
    expect(details.container.hasAttribute('popover')).toBe(false);
    expect(details.container.style.getPropertyValue('margin')).toBe('');
  });

  it('drops portals removed from the document and supports unregistering', () => {
    const host = document.createElement('div');
    const details = portal('details', 5);
    details.root.append(document.createElement('div'));
    const unregister = registerTopLayerPortal(details.container, details.root, 5);
    notifyStickyHostEnteredTopLayer(host);
    expect(isTopLayerPortalRaised(details.container)).toBe(true);

    unregister();
    expect(isTopLayerPortalRaised(details.container)).toBe(false);
    expect(details.container.hasAttribute('popover')).toBe(false);

    const replacement = portal('details', 5);
    replacement.root.append(document.createElement('div'));
    registerTopLayerPortal(replacement.container, replacement.root, 5);
    expect(isTopLayerPortalRaised(replacement.container)).toBe(true);
    replacement.container.remove();
    notifyStickyHostLeftTopLayer(host);
    notifyStickyHostEnteredTopLayer(host);
    expect(isTopLayerPortalRaised(replacement.container)).toBe(false);
  });
});
