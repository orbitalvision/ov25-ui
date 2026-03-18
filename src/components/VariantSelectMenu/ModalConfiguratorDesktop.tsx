import React, { useEffect, useRef } from 'react';
import { useOV25UI } from '../../contexts/ov25-ui-context.js';
import { ConfiguratorModal } from '../ConfiguratorModal.js';

/**
 * Desktop configurator in a modal. Syncs isDrawerOrDialogOpen and body scroll lock with isVariantsOpen,
 * then renders ConfiguratorModal with useGallerySlot so the preloaded iframe is repositioned into the modal.
 */
export function ModalConfiguratorDesktop() {
  const {
    isVariantsOpen,
    setIsVariantsOpen,
    setIsDrawerOrDialogOpen,
  } = useOV25UI();
  const originalStyles = useRef<{
    body: { overflow: string; position: string; width: string; top: string };
    html: { overflow: string };
  } | null>(null);

  useEffect(() => {
    if (isVariantsOpen) {
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
      setIsDrawerOrDialogOpen(true);
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
      setIsDrawerOrDialogOpen(false);
      originalStyles.current = null;
    }
  }, [isVariantsOpen, setIsDrawerOrDialogOpen]);

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
      setIsDrawerOrDialogOpen(false);
    };
  }, [setIsDrawerOrDialogOpen]);

  return (
    <ConfiguratorModal
      isOpen={isVariantsOpen}
      onClose={() => setIsVariantsOpen(false)}
      useGallerySlot
    />
  );
}
