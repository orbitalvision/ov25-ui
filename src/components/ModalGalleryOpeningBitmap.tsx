import React, { useCallback, useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import { getResolvedConfiguratorIframeBackgroundColor } from '../utils/configurator-dom-queries.js';

type ModalGalleryOpeningBitmapProps = {
  bitmap: ImageBitmap;
  slotRef: RefObject<HTMLDivElement | null>;
};

/**
 * Fills the modal gallery slot with a snapshot (object-fit: cover) while the shell opens; removed once the iframe is shown.
 */
export function ModalGalleryOpeningBitmap({ bitmap, slotRef }: ModalGalleryOpeningBitmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const slot = slotRef.current;
    const canvas = canvasRef.current;
    if (!slot || !canvas) return;
    const w = Math.max(1, Math.round(slot.clientWidth));
    const h = Math.max(1, Math.round(slot.clientHeight));
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const bw = bitmap.width;
    const bh = bitmap.height;
    if (bw < 1 || bh < 1) return;
    ctx.fillStyle = getResolvedConfiguratorIframeBackgroundColor();
    ctx.fillRect(0, 0, w, h);
    const scale = Math.max(w / bw, h / bh);
    const dw = bw * scale;
    const dh = bh * scale;
    const dx = (w - dw) / 2;
    const dy = (h - dh) / 2;
    ctx.drawImage(bitmap, dx, dy, dw, dh);
  }, [bitmap, slotRef]);

  useLayoutEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const slot = slotRef.current;
    if (!slot || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      draw();
    });
    ro.observe(slot);
    return () => ro.disconnect();
  }, [slotRef, draw]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="ov:pointer-events-none ov:absolute ov:inset-0 ov:z-[6] ov:rounded-none ov:block ov:w-full ov:h-full"
    />
  );
}
