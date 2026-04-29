import React from 'react';
import { createPortal } from 'react-dom';
import { useOV25UI } from '../contexts/ov25-ui-context.js';
import { Snap2SettingsSheet } from './Snap2SettingsSheet.js';
import { Snap2Wrapper } from './VariantSelectMenu/Snap2Wrapper.js';
import { closeModuleSelectMenu } from '../utils/configurator-utils.js';

type SheetSide = 'left' | 'right';

/**
 * Snap2: compatible-modules sheet on LEFT or RIGHT while the variant sheet uses the other edge.
 * Uses the same {@link Snap2SettingsSheet} chrome as variants with only the Modules option (not
 * {@link ModuleBottomPanel}, which is the bottom strip). Tab/list shell only — never wizard mode.
 */
export const Snap2ModulesSheet: React.FC<{
  portalTarget: Element;
  sheetSide: SheetSide;
}> = ({ portalTarget, sheetSide }) => {
  const { isModulePanelOpen, setIsModulePanelOpen } = useOV25UI();

  const handleClose = () => {
    setIsModulePanelOpen(false);
    closeModuleSelectMenu();
  };

  return createPortal(
    <Snap2SettingsSheet
      mode="modal"
      sheetSide={sheetSide}
      open={isModulePanelOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        } else {
          setIsModulePanelOpen(true);
        }
      }}
      sheetZClass="ov:z-[101] ov:pointer-events-auto"
      showCloseButton={false}
    >
      <div
        id="ov25-snap2-modules-sheet"
        className="ov25-snap2-modules-sheet ov:flex ov:flex-col ov:h-full ov:min-h-0 ov:bg-(--ov25-background-color)"
      >
        <div className="ov:flex ov:flex-1 ov:min-h-0 ov:flex-col ov:overflow-hidden">
          <Snap2Wrapper snap2ModulesOnlySideSheet />
        </div>
      </div>
    </Snap2SettingsSheet>,
    portalTarget
  );
};
