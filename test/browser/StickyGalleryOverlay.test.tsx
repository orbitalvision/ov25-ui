import React from 'react';
import { createPortal } from 'react-dom';
import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { useStickyHostRelocation } from '../../src/hooks/useStickyHostRelocation';
import {
  BODY_POPOVER_PORTAL_Z_INDEX,
  BODY_SELECTION_DETAILS_PORTAL_Z_INDEX,
  BODY_SWATCHBOOK_PORTAL_Z_INDEX,
} from '../../src/lib/config/layers';
import {
  registerTopLayerPortal,
  resetTopLayerOverlaysForTests,
} from '../../src/lib/top-layer-overlays';

test('suspends the native top-layer gallery for overlays without reloading its iframe', async () => {
  const boundary = document.createElement('section');
  boundary.style.cssText = 'position: absolute; left: 0; top: 0; width: 400px; height: 1200px; overflow: hidden;';
  const host = document.createElement('div');
  host.style.cssText = 'position: relative; width: 240px; height: 180px;';
  const iframe = document.createElement('iframe');
  iframe.title = 'Product viewer';
  iframe.style.cssText = 'width: 100%; height: 100%; border: 0;';
  iframe.srcdoc = '<body>Product viewer</body>';
  host.append(iframe);
  boundary.append(host);
  document.body.append(boundary);

  function OverlayHarness() {
    const [open, setOpen] = React.useState(false);
    useStickyHostRelocation({
      host,
      active: true,
      requiresBodyFallback: true,
      stickyTop: 60,
      boundary,
      overlayOpen: open,
      fullscreenOpen: false,
      layerKey: 'overlay-browser-regression',
    });
    return <>
      <button style={{ position: 'fixed', left: 20, top: 340 }} onClick={() => setOpen(!open)}>
        {open ? 'Close swatches' : 'Open swatches'}
      </button>
      {open && createPortal(<div role="dialog" aria-label="Swatches" style={{ position: 'fixed', inset: '0 auto auto 0', width: 400, height: 300, background: 'white', zIndex: BODY_SWATCHBOOK_PORTAL_Z_INDEX }}>Swatches</div>, document.body)}
    </>;
  }

  const view = await render(<OverlayHarness />);
  try {
    await expect.poll(() => host.matches(':popover-open')).toBe(true);
    await expect.poll(() => iframe.contentDocument?.body.textContent).toBe('Product viewer');
    const viewerDocument = iframe.contentDocument;
    expect(document.elementFromPoint(100, 100)).toBe(iframe);

    await view.getByRole('button', { name: 'Open swatches' }).click();
    await expect.poll(() => ({ topLayer: host.matches(':popover-open'), overlay: Boolean(document.querySelector('[role="dialog"]')) })).toEqual({ topLayer: false, overlay: true });
    expect(document.elementFromPoint(100, 100)?.getAttribute('role')).toBe('dialog');
    expect(host.parentElement).toBe(boundary);
    expect(host.querySelector('iframe')).toBe(iframe);
    expect(iframe.contentDocument).toBe(viewerDocument);

    await view.getByRole('button', { name: 'Close swatches' }).click();
    await expect.poll(() => host.matches(':popover-open')).toBe(true);
    expect(document.elementFromPoint(100, 100)).toBe(iframe);
    expect(iframe.contentDocument).toBe(viewerDocument);
  } finally {
    await view.unmount();
    boundary.remove();
  }
});

function createBodyPortal(id: string, zIndex: number) {
  const container = document.createElement('div');
  container.id = id;
  container.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: ${zIndex};`;
  container.append(document.createElement('span'));
  document.body.append(container);
  const shadowRoot = container.attachShadow({ mode: 'open' });
  return { container, shadowRoot };
}

// Vitest's browser viewport is 414px wide: gallery x 0–300 / y 60–260, tooltips y 80–200.
function SelectionTooltip({ label, left = 60 }: { label: string; left?: number }) {
  return (
    <div
      role="tooltip"
      aria-label={label}
      style={{
        position: 'fixed',
        left,
        top: 80,
        width: 180,
        height: 120,
        background: 'white',
        pointerEvents: 'auto',
      }}
    >
      {label}
    </div>
  );
}

test('raises selection-details tooltips above a top-layer sticky gallery without moving the gallery', async () => {
  resetTopLayerOverlaysForTests();
  const boundary = document.createElement('section');
  boundary.style.cssText = 'position: absolute; left: 0; top: 0; width: 360px; height: 1200px; overflow: hidden;';
  const host = document.createElement('div');
  host.style.cssText = 'position: relative; width: 300px; height: 200px;';
  const iframe = document.createElement('iframe');
  iframe.title = 'Product viewer';
  iframe.style.cssText = 'width: 100%; height: 100%; border: 0;';
  iframe.srcdoc = '<body>Product viewer</body>';
  host.append(iframe);
  boundary.append(host);
  document.body.append(boundary);
  const details = createBodyPortal(
    'ov25-selection-details-portal-container-top-layer-test',
    BODY_SELECTION_DETAILS_PORTAL_Z_INDEX,
  );
  const unregister = registerTopLayerPortal(
    details.container,
    details.shadowRoot,
    BODY_SELECTION_DETAILS_PORTAL_Z_INDEX,
  );

  function TooltipHarness() {
    const [open, setOpen] = React.useState(false);
    useStickyHostRelocation({
      host,
      active: true,
      requiresBodyFallback: true,
      stickyTop: 60,
      boundary,
      overlayOpen: false,
      fullscreenOpen: false,
      layerKey: 'tooltip-top-layer-regression',
    });
    return <>
      <button style={{ position: 'fixed', left: 20, top: 400 }} onClick={() => setOpen(!open)}>
        {open ? 'Hide details' : 'Show details'}
      </button>
      {open && createPortal(<SelectionTooltip label="Fabric details" />, details.shadowRoot)}
    </>;
  }

  const view = await render(<TooltipHarness />);
  const pointInsideTooltipOverGallery = () => document.elementFromPoint(150, 140);
  try {
    await expect.poll(() => host.matches(':popover-open')).toBe(true);
    await expect.poll(() => iframe.contentDocument?.body.textContent).toBe('Product viewer');
    const viewerDocument = iframe.contentDocument;
    expect(pointInsideTooltipOverGallery()).toBe(iframe);
    expect(details.container.hasAttribute('popover')).toBe(false);

    await view.getByRole('button', { name: 'Show details' }).click();
    await expect.poll(() => details.container.matches(':popover-open')).toBe(true);
    // The gallery stays in the top layer (no un-stick jump); the tooltip is painted above it.
    expect(host.matches(':popover-open')).toBe(true);
    expect(pointInsideTooltipOverGallery()).toBe(details.container);
    expect(details.shadowRoot.elementFromPoint(150, 140)?.getAttribute('role')).toBe('tooltip');
    // UA popover box styles are neutralised so the portal keeps its full-viewport fixed box.
    const rect = details.container.getBoundingClientRect();
    expect({ left: rect.left, top: rect.top, width: rect.width, height: rect.height }).toEqual({
      left: 0,
      top: 0,
      width: document.documentElement.clientWidth,
      height: window.innerHeight,
    });
    const computed = getComputedStyle(details.container);
    expect(computed.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(computed.borderTopWidth).toBe('0px');
    expect(computed.paddingTop).toBe('0px');
    expect(computed.pointerEvents).toBe('none');
    // Click-through outside the tooltip still reaches the gallery.
    expect(document.elementFromPoint(280, 240)).toBe(iframe);
    expect(iframe.contentDocument).toBe(viewerDocument);

    await view.getByRole('button', { name: 'Hide details' }).click();
    await expect.poll(() => details.container.hasAttribute('popover')).toBe(false);
    expect(details.container.style.getPropertyValue('margin')).toBe('');
    expect(details.container.style.zIndex).toBe(String(BODY_SELECTION_DETAILS_PORTAL_Z_INDEX));
    expect(pointInsideTooltipOverGallery()).toBe(iframe);
    expect(host.matches(':popover-open')).toBe(true);
  } finally {
    unregister();
    await view.unmount();
    details.container.remove();
    boundary.remove();
    resetTopLayerOverlaysForTests();
  }
});

test('keeps raised portals above a sticky gallery that is re-shown and in z-index tier order', async () => {
  resetTopLayerOverlaysForTests();
  const boundary = document.createElement('section');
  boundary.style.cssText = 'position: absolute; left: 0; top: 0; width: 360px; height: 1200px; overflow: hidden;';
  const host = document.createElement('div');
  host.style.cssText = 'position: relative; width: 300px; height: 200px; background: rgb(10, 20, 30);';
  boundary.append(host);
  document.body.append(boundary);
  const details = createBodyPortal(
    'ov25-selection-details-portal-container-order-test',
    BODY_SELECTION_DETAILS_PORTAL_Z_INDEX,
  );
  const popover = createBodyPortal('ov25-popover-portal-container-order-test', BODY_POPOVER_PORTAL_Z_INDEX);
  // Register in reverse tier order to prove ordering follows the tier, not registration.
  const unregisterDetails = registerTopLayerPortal(
    details.container,
    details.shadowRoot,
    BODY_SELECTION_DETAILS_PORTAL_Z_INDEX,
  );
  const unregisterPopover = registerTopLayerPortal(
    popover.container,
    popover.shadowRoot,
    BODY_POPOVER_PORTAL_Z_INDEX,
  );

  function OrderHarness({ overlayOpen }: { overlayOpen: boolean }) {
    useStickyHostRelocation({
      host,
      active: true,
      requiresBodyFallback: true,
      stickyTop: 60,
      boundary,
      overlayOpen,
      fullscreenOpen: false,
      layerKey: 'tooltip-top-layer-order',
    });
    return <>
      {createPortal(<SelectionTooltip label="Selection details" left={40} />, details.shadowRoot)}
      {createPortal(<SelectionTooltip label="Dropdown" left={160} />, popover.shadowRoot)}
    </>;
  }

  const view = await render(<OrderHarness overlayOpen={false} />);
  const topRoleLabelAt = (x: number, y: number) => {
    const hit = document.elementFromPoint(x, y);
    const root = hit === details.container ? details.shadowRoot : hit === popover.container ? popover.shadowRoot : null;
    return root?.elementFromPoint(x, y)?.getAttribute('aria-label') ?? hit?.tagName;
  };
  try {
    await expect.poll(() => host.matches(':popover-open')).toBe(true);
    await expect.poll(() => details.container.matches(':popover-open')).toBe(true);
    expect(popover.container.matches(':popover-open')).toBe(true);
    // Overlap at x=190: details (higher tier) must win over the dropdown.
    expect(topRoleLabelAt(190, 140)).toBe('Selection details');
    expect(topRoleLabelAt(100, 140)).toBe('Selection details');
    expect(topRoleLabelAt(300, 140)).toBe('Dropdown');

    // An overlay that suspends the gallery drops it from the top layer; portals return to z-index stacking.
    await view.rerender(<OrderHarness overlayOpen />);
    await expect.poll(() => host.matches(':popover-open')).toBe(false);
    expect(details.container.hasAttribute('popover')).toBe(false);
    expect(popover.container.hasAttribute('popover')).toBe(false);

    // Re-showing the gallery puts it on top of the top layer; portals must be re-raised above it.
    await view.rerender(<OrderHarness overlayOpen={false} />);
    await expect.poll(() => host.matches(':popover-open')).toBe(true);
    await expect.poll(() => details.container.matches(':popover-open')).toBe(true);
    expect(topRoleLabelAt(100, 140)).toBe('Selection details');
    expect(topRoleLabelAt(190, 140)).toBe('Selection details');
    expect(topRoleLabelAt(300, 140)).toBe('Dropdown');
  } finally {
    unregisterDetails();
    unregisterPopover();
    await view.unmount();
    details.container.remove();
    popover.container.remove();
    boundary.remove();
    resetTopLayerOverlaysForTests();
  }
});
