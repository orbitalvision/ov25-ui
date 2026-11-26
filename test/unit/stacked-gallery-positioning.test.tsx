import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useStackedGalleryPositioning } from '../../src/hooks/useStackedGalleryPositioning';

describe('stacked gallery initial viewport', () => {
  let host: HTMLDivElement;
  let shadowRoot: ShadowRoot;
  let slot: HTMLDivElement;
  let viewer: HTMLDivElement;
  let width: number;
  let height: number;
  let frames: Map<number, FrameRequestCallback>;
  let sequence: number;
  const rect = (w: number, h: number) => ({ width: w, height: h, top: 120, left: 40 } as DOMRect);

  beforeEach(() => {
    vi.useFakeTimers();
    frames = new Map();
    sequence = 0;
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.set(++sequence, callback);
      return sequence;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
    host = document.createElement('div');
    document.body.append(host);
    shadowRoot = host.attachShadow({ mode: 'open' });
    slot = document.createElement('div');
    viewer = document.createElement('div');
    viewer.id = 'true-ov25-configurator-iframe-container';
    shadowRoot.append(slot, viewer);
    width = height = 605;
    vi.spyOn(slot, 'getBoundingClientRect').mockImplementation(() => {
      // Reproduce the provisional layout while the portaled viewer is still in flow.
      return rect(width, viewer.style.position === 'fixed' ? height : 204);
    });
    vi.spyOn(viewer, 'getBoundingClientRect').mockImplementation(() => rect(width, height));
  });
  afterEach(() => {
    cleanup();
    host.remove();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });
  function props(overrides = {}) {
    return { enabled: true, isOpen: false, anchored: false, shadowRoot: shadowRoot as ShadowRoot | null,
      slotRef: { current: slot }, instantCloseRef: { current: false }, ...overrides };
  }
  function frame() {
    act(() => {
      const callbacks = [...frames.values()];
      frames.clear();
      callbacks.forEach(callback => callback(0));
    });
  }

  it('applies the square slot before allowing navigation, without the 500ms wait', () => {
    const { result } = renderHook(useStackedGalleryPositioning, { initialProps: props() });
    expect(result.current).toBe(true);
    expect(viewer.style.width).toBe('605px');
    expect(viewer.style.height).toBe('605px');
    expect(viewer.style.top).toBe('120px');
    expect(vi.getTimerCount()).toBe(0);
    width = height = 540;
    frame();
    expect(viewer.style.height).toBe('540px');
  });

  it('waits for the shadow host and a nonzero slot instead of starting in fallback geometry', () => {
    const initialProps = props({ shadowRoot: null });
    const { result, rerender, unmount } = renderHook(useStackedGalleryPositioning, { initialProps });
    expect(result.current).toBe(false);
    width = height = 0;
    rerender({ ...initialProps, shadowRoot });
    expect(result.current).toBe(false);
    width = height = 605;
    frame();
    expect(result.current).toBe(true);
    expect(viewer.style.height).toBe('605px');
    unmount();
    expect(frames.size).toBe(0);
  });

  it('keeps the viewer ready and leaves drawer animation styles alone until a real close completes', () => {
    const initialProps = props();
    const { result, rerender } = renderHook(useStackedGalleryPositioning, { initialProps });
    viewer.style.width = '900px';
    viewer.style.transform = 'translateX(100%)';
    rerender({ ...initialProps, isOpen: true });
    expect(viewer.style.width).toBe('900px');
    rerender(initialProps);
    expect(result.current).toBe(true);
    act(() => vi.advanceTimersByTime(499));
    expect(viewer.style.width).toBe('900px');
    act(() => vi.advanceTimersByTime(1));
    expect(viewer.style.width).toBe('605px');
    expect(viewer.style.transform).toBe('translateX(100%)');
  });

  it('restores an instant close immediately', () => {
    const initialProps = props();
    const { rerender } = renderHook(useStackedGalleryPositioning, { initialProps });
    rerender({ ...initialProps, isOpen: true });
    viewer.style.width = '900px';
    initialProps.instantCloseRef.current = true;
    rerender(initialProps);
    expect(viewer.style.width).toBe('605px');
    expect(initialProps.instantCloseRef.current).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('leaves mobile sticky positioning to CSS', () => {
    viewer.style.position = 'absolute';
    const { result } = renderHook(useStackedGalleryPositioning, { initialProps: props({ anchored: true }) });
    expect(result.current).toBe(true);
    expect(viewer.style.position).toBe('absolute');
    expect(viewer.style.width).toBe('');
    expect(frames.size).toBe(0);
  });
});
