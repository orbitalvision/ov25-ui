import React, { useEffect, useRef, useState } from 'react';
import { useOV25UI } from '../../contexts/ov25-ui-context.js';
import { requestTransitionSnapshotFromIframe } from '../../utils/request-transition-snapshot-from-iframe.js';
import { ConfiguratorModal } from '../ConfiguratorModal.js';

/**
 * Standard configurator in a modal. Body scroll lock with variants open; backdrop + panel animate first
 * with an optional snapshot in the gallery slot, then `isDrawerOrDialogOpen` flips so the iframe snaps into the slot.
 */
export function ModalConfiguratorDesktop() {
  const {
    isVariantsOpen,
    isDrawerOrDialogOpen,
    setIsVariantsOpen,
    setIsDrawerOrDialogOpen,
    uniqueId,
    configuratorGalleryIsDeferred,
    setUseInstantIframeCloseRestore,
    releaseConfiguratorTransitionProxy,
  } = useOV25UI();
  const [galleryOpeningBitmap, setGalleryOpeningBitmap] = useState<ImageBitmap | null>(null);

  const originalStyles = useRef<{
    body: { overflow: string; position: string; width: string; top: string };
    html: { overflow: string };
  } | null>(null);

  const shellReadyRef = useRef(false);
  const snapshotDoneRef = useRef(false);
  const revealCommittedRef = useRef(false);
  const openCycleRef = useRef(0);
  const isDrawerOpenRef = useRef(isDrawerOrDialogOpen);
  isDrawerOpenRef.current = isDrawerOrDialogOpen;

  const tryRevealIframeRef = useRef(() => {});
  tryRevealIframeRef.current = () => {
    if (revealCommittedRef.current) return;
    if (!shellReadyRef.current || !snapshotDoneRef.current) return;
    revealCommittedRef.current = true;
    setIsDrawerOrDialogOpen(true);
  };

  const handleModalShellOpeningComplete = () => {
    shellReadyRef.current = true;
    tryRevealIframeRef.current();
  };

  useEffect(() => {
    let cancelled = false;

    if (isVariantsOpen) {
      openCycleRef.current += 1;
      const cycle = openCycleRef.current;
      shellReadyRef.current = false;
      snapshotDoneRef.current = false;
      revealCommittedRef.current = false;

      setGalleryOpeningBitmap((prev) => {
        prev?.close();
        return null;
      });

      originalStyles.current = {
        body: {
          overflow: document.body.style.overflow,
          position: document.body.style.position,
          width: document.body.style.width,
          top: document.body.style.top,
        },
        html: { overflow: document.documentElement.style.overflow },
      };
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${window.scrollY}px`;
      document.documentElement.style.overflow = 'hidden';

      if (configuratorGalleryIsDeferred) {
        snapshotDoneRef.current = true;
      } else {
        void (async () => {
          const bitmap = await requestTransitionSnapshotFromIframe(uniqueId);
          if (cancelled || openCycleRef.current !== cycle) {
            bitmap?.close();
            return;
          }
          snapshotDoneRef.current = true;
          if (bitmap) {
            setGalleryOpeningBitmap(bitmap);
          }
          tryRevealIframeRef.current();
        })();
      }
    } else {
      const scrollY = document.body.style.top;
      if (originalStyles.current) {
        document.body.style.overflow = originalStyles.current.body.overflow;
        document.body.style.position = originalStyles.current.body.position;
        document.body.style.width = originalStyles.current.body.width;
        document.body.style.top = originalStyles.current.body.top;
        document.documentElement.style.overflow = originalStyles.current.html.overflow;
      } else {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        document.documentElement.style.overflow = '';
      }
      window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
      releaseConfiguratorTransitionProxy();
      setGalleryOpeningBitmap((prev) => {
        prev?.close();
        return null;
      });
      if (isDrawerOpenRef.current) {
        setUseInstantIframeCloseRestore(true);
      }
      setIsDrawerOrDialogOpen(false);
      originalStyles.current = null;
    }

    return () => {
      cancelled = true;
    };
  }, [
    isVariantsOpen,
    setIsDrawerOrDialogOpen,
    uniqueId,
    configuratorGalleryIsDeferred,
    setUseInstantIframeCloseRestore,
    releaseConfiguratorTransitionProxy,
  ]);

  useEffect(() => {
    if (!isDrawerOrDialogOpen || !galleryOpeningBitmap) return;
    let raf1 = 0;
    let raf2 = 0;
    const toClose = galleryOpeningBitmap;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        toClose.close();
        setGalleryOpeningBitmap((prev) => (prev === toClose ? null : prev));
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [isDrawerOrDialogOpen, galleryOpeningBitmap]);

  useEffect(() => {
    return () => {
      if (originalStyles.current) {
        document.body.style.overflow = originalStyles.current.body.overflow;
        document.body.style.position = originalStyles.current.body.position;
        document.body.style.width = originalStyles.current.body.width;
        document.body.style.top = originalStyles.current.body.top;
        document.documentElement.style.overflow = originalStyles.current.html.overflow;
      } else {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        document.documentElement.style.overflow = '';
      }
      releaseConfiguratorTransitionProxy();
      setIsDrawerOrDialogOpen(false);
    };
  }, [releaseConfiguratorTransitionProxy, setIsDrawerOrDialogOpen]);

  return (
    <ConfiguratorModal
      isOpen={isVariantsOpen}
      onClose={() => setIsVariantsOpen(false)}
      useGallerySlot
      galleryOpeningBitmap={galleryOpeningBitmap}
      suppressGalleryOpeningBitmap={isDrawerOrDialogOpen}
      onModalShellOpeningComplete={handleModalShellOpeningComplete}
      earlyShellReadyForDeferredGallery={configuratorGalleryIsDeferred}
    />
  );
}
