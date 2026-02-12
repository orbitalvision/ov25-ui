import React, { useState, useEffect } from 'react';
import { DimensionsIcon } from '../lib/svgs/DimensionsIcon.js';
import { toggleDimensions, toggleFullscreen, toggleMiniDimensions } from '../utils/configurator-utils.js';
import { useOV25UI } from '../contexts/ov25-ui-context.js';
import { cn } from '../lib/utils.js';
import { Eye, EyeClosed, TableRowsSplit } from 'lucide-react';
import SaveSnap2Menu from './SaveSnap2Menu.js';

const Snap2Controls: React.FC = () => {
  const { controlsHidden, toggleHideAll, shareDialogTrigger, isVariantsOpen, setIsVariantsOpen, setActiveOptionId, allOptions, isMobile, configuratorState, isModalOpen, cssString } = useOV25UI();
  
  const [canSeeDimensions, setCanSeeDimensions] = useState(false);
  const [canSeeMiniDimensions, setCanSeeMiniDimensions] = useState(false);

  // Reset dimensions state when modal closes
  useEffect(() => {
    if (!isModalOpen) {
      setCanSeeDimensions(false);
      setCanSeeMiniDimensions(false);
    }
  }, [isModalOpen]);

  const handleToggleDimensions = () => {
    toggleDimensions(canSeeDimensions, setCanSeeDimensions, undefined, cssString);
  };

  const handleToggleMiniDimensionsClick = () => {
    toggleMiniDimensions(canSeeMiniDimensions, setCanSeeMiniDimensions, undefined, cssString);
  };
  
  const handleVariantsClick = () => {
    if (document.fullscreenElement) {
      toggleFullscreen();
    }
    if (isVariantsOpen) {
      setIsVariantsOpen(false);
    } else {
      if (allOptions.length > 0) {
        const firstNonModulesOption = allOptions.find(opt => opt.id !== 'modules');
        if (firstNonModulesOption && configuratorState?.snap2Objects?.length) {
          setActiveOptionId(firstNonModulesOption.id);
        } else if (allOptions.length > 0) {
          setActiveOptionId(allOptions[0].id);
        }
        setIsVariantsOpen(true);
      }
    }
  };

  return (
    <div id="ov25-snap2-controls" className={cn(
      "ov:absolute ov:top-4 ov:left-1/2 ov:transform ov:-translate-x-1/2 ov:z-[102]",
      "ov:flex ov:gap-2 ov:pointer-events-none ov:transition-opacity ov:duration-200",
      (shareDialogTrigger !== 'none') && "ov:opacity-0 ov:pointer-events-none"
    )}>
      <div className={cn(
        'ov:flex ov:gap-2 ov:pointer-events-auto ov:items-center ov:px-2 ov:py-1 ov:border',
        'ov:rounded-[var(--ov25-configurator-view-controls-border-radius)]',
        'ov:border-[var(--ov25-configurator-view-controls-border-color)]',
        'ov:bg-[var(--ov25-overlay-button-color)]',
        'ov:transition-all ov:duration-200'
      )}>
        {/* Dimensions Button with integrated mini toggle */}
        {!controlsHidden && (
          <div className="ov:flex ov:items-center ov:gap-1">
            <button 
              id="ov25-snap2-dimensions-button" 
              onClick={handleToggleDimensions} 
              className="ov:cursor-pointer ov:w-8 ov:h-8 ov:flex ov:items-center ov:justify-center ov:transition-all ov:duration-200 ov:hover:opacity-80 ov:border ov:border-[var(--ov25-configurator-view-controls-border-color)] ov:rounded-full"
            >
              <DimensionsIcon className="ov:w-[16px] ov:h-[16px]" color="var(--ov25-text-color)"/>
            </button>

            {/* Mini Dimensions Switch */}
            {canSeeDimensions && (
              <button 
                id="ov25-snap2-mini-dimensions-switch" 
                onClick={handleToggleMiniDimensionsClick} 
                className={cn(
                  'ov:cursor-pointer ov:relative ov:w-8 ov:h-4 ov:rounded-full ov:border ov:transition-all ov:duration-200',
                  'ov:border-[var(--ov25-configurator-view-controls-border-color)]',
                  canSeeMiniDimensions 
                    ? 'ov:bg-[var(--ov25-text-color)]' 
                    : 'ov:bg-[var(--ov25-overlay-button-color)]',
                  'ov:hover:opacity-80'
                )}
              >
                <div className={cn(
                  'ov:absolute ov:top-[1px] ov:left-[1px] ov:w-3 ov:h-3 ov:rounded-full ov:transition-all ov:duration-200',
                  canSeeMiniDimensions 
                    ? 'ov:translate-x-4 ov:bg-[var(--ov25-overlay-button-color)]' 
                    : 'ov:translate-x-0 ov:bg-[var(--ov25-text-color)] ov:opacity-60'
                )}></div>
              </button>
            )}
          </div>
        )}

        {/* Variants Button - only show on desktop */}
        {!controlsHidden && allOptions.length > 0 && !(window.innerWidth < 1024) && (
          <button 
            id="ov25-snap2-variants-button" 
            onClick={handleVariantsClick} 
            className={cn(
              "ov:cursor-pointer ov:w-8 ov:h-8 ov:flex ov:items-center ov:justify-center ov:transition-all ov:duration-200 ov:hover:opacity-80 ov:border ov:rounded-full",
              isVariantsOpen 
                ? "ov:border-[var(--ov25-text-color)] ov:bg-gray-200" 
                : "ov:border-[var(--ov25-configurator-view-controls-border-color)]"
            )}
          >
            <TableRowsSplit 
              className="ov:w-[16px] ov:h-[16px]"
              color="var(--ov25-text-color)"
            />
          </button>
        )}

        {/* Save Snap2 Menu - always available */}
        <SaveSnap2Menu />

        {/* Hide All Toggle Button */}
        <button 
          id="ov25-snap2-hide-all-button" 
          onClick={toggleHideAll} 
          className="ov:cursor-pointer ov:w-8 ov:h-8 ov:flex ov:items-center ov:justify-center ov:transition-all ov:duration-200 ov:hover:opacity-80 ov:border ov:border-[var(--ov25-configurator-view-controls-border-color)] ov:rounded-full"
        >
          {controlsHidden ? (
            <EyeClosed className="ov:w-[16px] ov:h-[16px]" color="var(--ov25-text-color)"/>
          ) : (
            <Eye className="ov:w-[16px] ov:h-[16px]" color="var(--ov25-text-color)"/>
          )}
        </button>
      </div>
    </div>
  );
};

export default Snap2Controls;
