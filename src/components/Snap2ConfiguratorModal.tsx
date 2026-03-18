import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useOV25UI } from '../contexts/ov25-ui-context.js';
import { ConfiguratorModal } from './ConfiguratorModal.js';
import { ModuleBottomPanel } from './VariantSelectMenu/ModuleBottomPanel.js';
import InitialiseMenu from './VariantSelectMenu/InitialiseMenu.js';

interface Snap2ConfiguratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Snap2ConfiguratorModal: React.FC<Snap2ConfiguratorModalProps> = ({ isOpen, onClose, children }) => {
  const {
    configuratorState,
    isProductGalleryStacked,
    uniqueId,
  } = useOV25UI();
  const [portalTargetEl, setPortalTargetEl] = useState<HTMLDivElement | null>(null);

  const extraContent = (
    <>
      {portalTargetEl && <ModuleBottomPanel portalTarget={portalTargetEl} />}
      {(!configuratorState?.snap2Objects || configuratorState.snap2Objects.length === 0) && (
        isProductGalleryStacked ? (
          createPortal(
            <div className="ov:absolute ov:inset-0 ov:z-[103] ov:bg-[var(--ov25-background-color)]">
              <InitialiseMenu />
            </div>,
            document.getElementById(uniqueId ? `true-configurator-view-controls-container-${uniqueId}` : 'true-configurator-view-controls-container')?.parentElement ?? document.body
          )
        ) : (
          <div className="ov:absolute ov:inset-0 ov:z-[103] ov:bg-[var(--ov25-background-color)]">
            <InitialiseMenu />
          </div>
        )
      )}
    </>
  );

  return (
    <ConfiguratorModal
      isOpen={isOpen}
      onClose={onClose}
      contentRef={setPortalTargetEl}
      extraContent={extraContent}
    >
      {children}
    </ConfiguratorModal>
  );
};
