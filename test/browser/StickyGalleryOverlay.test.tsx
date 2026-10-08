import React from 'react';
import { createPortal } from 'react-dom';
import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { useStickyHostRelocation } from '../../src/hooks/useStickyHostRelocation';
import { BODY_SWATCHBOOK_PORTAL_Z_INDEX } from '../../src/lib/config/layers';

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
