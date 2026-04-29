import React, { useEffect, useLayoutEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { useOV25UI } from '../contexts/ov25-ui-context.js';
import { Snap2Wrapper } from './VariantSelectMenu/Snap2Wrapper.js';
import { WizardVariants } from './VariantSelectMenu/WizardVariants.js';
import { VariantsHeader } from './VariantSelectMenu/VariantsHeader.js';
import { ModuleBottomPanel } from './VariantSelectMenu/ModuleBottomPanel.js';
import { Snap2ModulesSheet } from './Snap2ModulesSheet.js';
import { closeModuleSelectMenu } from '../utils/configurator-utils.js';
import InitialiseMenu from './VariantSelectMenu/InitialiseMenu.js';
import { Snap2SettingsSheet } from './Snap2SettingsSheet.js';
import { Ov25ShadowHost } from './Ov25ShadowHost.js';
import { findElementByIdInShadowOrRegularDOM } from '../utils/configurator-dom-queries.js';

/**
 * Desktop Snap2 `inline-sheet`: variants + checkout rails and module panel over the in-page gallery
 * (same `Snap2SettingsSheet` / module panel stack as {@link Snap2ConfiguratorModal}, portaled
 * to `#ov25-snap2-inline-sheet-stage` so the rail sits above the iframe).
 */
export const Snap2InlineSheetDesktopShell: React.FC = () => {
  const {
    configuratorState,
    isProductGalleryStacked,
    uniqueId,
    variantDisplayStyleOverlay,
    variantDisplayStyleOverlayMobile,
    isMobile,
    isVariantsOpen,
    setIsVariantsOpen,
    isSnap2CheckoutSheetOpen,
    setIsSnap2CheckoutSheetOpen,
    useInlineVariantControls,
    iframeResetKey,
    configuratorDisplayMode,
    snap2VariantSheetSide,
    snap2ModulesEmbedInVariantSheet,
    snap2ModuleSheetPosition,
    isModulePanelOpen,
    setIsModulePanelOpen,
    initialiseMenuUsesExternalSelector,
  } = useOV25UI();

  const effectiveOverlayStyle = isMobile ? variantDisplayStyleOverlayMobile : variantDisplayStyleOverlay;

  const [stageEl, setStageEl] = useState<HTMLElement | null>(null);
  const [portalTargetEl, setPortalTargetEl] = useState<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const id = uniqueId ? `ov25-snap2-inline-sheet-stage-${uniqueId}` : 'ov25-snap2-inline-sheet-stage';
    let raf = 0;
    let attempts = 0;
    const maxAttempts = 120;
    const tick = () => {
      const next = document.getElementById(id) as HTMLElement | null;
      if (next) {
        setStageEl(next);
        return;
      }
      attempts += 1;
      if (attempts < maxAttempts) {
        raf = requestAnimationFrame(tick);
      } else {
        setStageEl(null);
      }
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [uniqueId, iframeResetKey]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (isModulePanelOpen) {
        setIsModulePanelOpen(false);
        closeModuleSelectMenu();
        return;
      }
      if (isSnap2CheckoutSheetOpen) {
        setIsSnap2CheckoutSheetOpen(false);
        return;
      }
      if (isVariantsOpen) {
        setIsVariantsOpen(false);
      }
    },
    [
      isModulePanelOpen,
      setIsModulePanelOpen,
      isSnap2CheckoutSheetOpen,
      setIsSnap2CheckoutSheetOpen,
      isVariantsOpen,
      setIsVariantsOpen,
    ]
  );

  useEffect(() => {
    if (!isVariantsOpen && !isSnap2CheckoutSheetOpen && !isModulePanelOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVariantsOpen, isSnap2CheckoutSheetOpen, isModulePanelOpen, handleKeyDown]);

  if (isMobile || configuratorDisplayMode !== 'inline-sheet' || !stageEl) {
    return null;
  }

  const controlsHost = findElementByIdInShadowOrRegularDOM(
    uniqueId ? `true-configurator-view-controls-container-${uniqueId}` : 'true-configurator-view-controls-container'
  );
  const initialiseMenuPortalParent = controlsHost?.parentElement ?? document.body;

  return createPortal(
    <Ov25ShadowHost
      id="ov25-snap2-inline-shell"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 55,
        /* Let gallery / iframe receive hits unless a child opts in (open rail, InitialiseMenu). */
        pointerEvents: 'none',
      }}
      data-ov25-snap2-shell="inline-sheet"
    >
      <div className="ov:relative ov:w-full ov:h-full ov:min-h-0 ov:overflow-hidden ov:pointer-events-none">
        <div
          ref={setPortalTargetEl}
          className="ov:absolute ov:inset-0 ov:z-10 ov:w-full ov:h-full ov:min-h-0 ov:pointer-events-none ov:flex ov:rounded-none"
        >
          <Snap2SettingsSheet
            mode="modal"
            sheetSide={snap2VariantSheetSide}
            open={isVariantsOpen}
            onOpenChange={setIsVariantsOpen}
            sheetZClass="ov:z-102 ov:pointer-events-auto"
            showCloseButton={false}
          >
            {effectiveOverlayStyle === 'wizard' ? (
              <div className="ov:flex ov:flex-col ov:h-full ov:bg-(--ov25-background-color)">
                <VariantsHeader />
                <div className="ov:flex ov:flex-col ov:flex-1 ov:min-h-0 ov:overflow-hidden">
                  <WizardVariants mode="drawer" />
                </div>
              </div>
            ) : (
              <Snap2Wrapper />
            )}
          </Snap2SettingsSheet>

          {portalTargetEl &&
            !useInlineVariantControls &&
            !snap2ModulesEmbedInVariantSheet &&
            snap2ModuleSheetPosition === 'bottom' && <ModuleBottomPanel portalTarget={portalTargetEl} />}
          {portalTargetEl &&
            !useInlineVariantControls &&
            !snap2ModulesEmbedInVariantSheet &&
            (snap2ModuleSheetPosition === 'left' || snap2ModuleSheetPosition === 'right') && (
              <Snap2ModulesSheet portalTarget={portalTargetEl} sheetSide={snap2ModuleSheetPosition} />
            )}

          {!initialiseMenuUsesExternalSelector &&
            (!configuratorState?.snap2Objects || configuratorState.snap2Objects.length === 0) &&
            (isProductGalleryStacked ? (
              createPortal(
                <Ov25ShadowHost
                  style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 103,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'auto',
                  }}
                >
                  <div className="ov:absolute ov:inset-0 ov:z-103 ov:bg-(--ov25-background-color)">
                    <InitialiseMenu />
                  </div>
                </Ov25ShadowHost>,
                initialiseMenuPortalParent
              )
            ) : (
              <div className="ov:absolute ov:inset-0 ov:z-103 ov:pointer-events-auto ov:bg-(--ov25-background-color)">
                <InitialiseMenu />
              </div>
            ))}
        </div>
      </div>
    </Ov25ShadowHost>,
    stageEl
  );
};
