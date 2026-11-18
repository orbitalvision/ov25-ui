import { useEffect, useRef, useState, type RefObject } from 'react';

/** Position the portaled viewer before allowing its first navigation. */
export function useStackedGalleryPositioning({
  enabled, isOpen, anchored, shadowRoot, slotRef, instantCloseRef,
}: {
  enabled: boolean;
  isOpen: boolean;
  anchored: boolean;
  shadowRoot: ShadowRoot | null;
  slotRef: RefObject<HTMLDivElement | null>;
  instantCloseRef: RefObject<boolean>;
}) {
  const [positioned, setPositioned] = useState(false);
  const wasOpen = useRef(isOpen);

  // Runs after useIframePositioning, which owns drawer styles and the instant-close flag.
  useEffect(() => {
    const justClosed = wasOpen.current && !isOpen;
    wasOpen.current = isOpen;
    if (!enabled || !shadowRoot) return;

    let frameId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const sync = () => {
      const slot = slotRef.current;
      const viewer = shadowRoot.getElementById('true-ov25-configurator-iframe-container');
      if (slot && viewer) {
        if (!isOpen && !anchored) {
          // Remove the viewer from normal flow before measuring its reserved slot.
          // Otherwise its fallback aspect ratio can change the slot's flex layout.
          viewer.style.position = 'fixed';
          const rect = slot.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            Object.assign(viewer.style, {
              top: `${rect.top}px`, left: `${rect.left}px`,
              width: `${rect.width}px`, height: `${rect.height}px`, zIndex: '3',
            });
            setPositioned(true);
          }
        } else {
          // The open drawer or mobile sticky CSS owns this viewport. Do not overwrite it.
          const rect = viewer.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            setPositioned(true);
            return;
          }
        }
      }
      frameId = requestAnimationFrame(sync);
    };

    const instantClose = instantCloseRef.current;
    if (justClosed) instantCloseRef.current = false;
    // Only a real animated close needs the legacy slide-out delay. Initial load,
    // host mounting and layout changes must synchronise immediately.
    if (justClosed && !instantClose && !anchored) timeoutId = setTimeout(sync, 500);
    else sync();

    return () => {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      if (frameId !== undefined) cancelAnimationFrame(frameId);
    };
  }, [enabled, isOpen, anchored, shadowRoot, slotRef, instantCloseRef]);

  // Latch readiness: drawer/fullscreen transitions must never clear src or reload the scene.
  return !enabled || positioned;
}
