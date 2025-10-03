import React, { useState } from 'react';
import { DimensionsIcon } from '../lib/svgs/DimensionsIcon.js';
import { toggleDimensions, toggleMiniDimensions } from '../utils/configurator-utils.js';
import { useOV25UI } from '../contexts/ov25-ui-context.js';
import { cn } from '../lib/utils.js';
import { Eye, EyeClosed, TableRowsSplit } from 'lucide-react';
import SaveSnap2Menu from './SaveSnap2Menu.js';

const Snap2Controls: React.FC = () => {
  const { controlsHidden, toggleHideAll, allOptions, isVariantsOpen, setIsVariantsOpen, setActiveOptionId, isMobile } = useOV25UI();
  
  // Local state for dimensions
  const [canSeeDimensions, setCanSeeDimensions] = useState(false);
  const [canSeeMiniDimensions, setCanSeeMiniDimensions] = useState(false);

  const handleToggleDimensions = () => {
    toggleDimensions(canSeeDimensions, setCanSeeDimensions);
  };

  const handleToggleMiniDimensionsClick = () => {
    toggleMiniDimensions(canSeeMiniDimensions, setCanSeeMiniDimensions);
  };

  const handleVariantsClick = () => {
    if (isVariantsOpen) {
      setIsVariantsOpen(false);
    } else {
      // Show the first available option (which will include modules if in snap2 mode)
      if (allOptions.length > 0) {
        setActiveOptionId(allOptions[0].id);
        setIsVariantsOpen(true);
      }
    }
  };

  return (
    <div className={cn(
      "ov:absolute ov:top-4 ov:left-1/2 ov:transform ov:-translate-x-1/2 ov:z-[102]",
      "ov:flex ov:gap-2 ov:pointer-events-none"
    )}>
      <div className={cn(
        'ov:flex ov:gap-2 ov:pointer-events-auto ov:items-center ov:px-2 ov:py-1 ov:border',
        'ov:rounded-[var(--ov25-configurator-view-controls-border-radius)]',
        'ov:border-[var(--ov25-configurator-view-controls-border-color)]',
        'ov:bg-[var(--ov25-overlay-button-color)]',
        'ov:transition-all ov:duration-200'
      )}>
        {/* Dimensions Button with integrated mini toggle - only shown when not all hidden */}
        {!controlsHidden && (
          <div className="ov:flex ov:items-center ov:gap-1">
            <button 
              id="ov25-snap2-dimensions-button" 
              onClick={handleToggleDimensions} 
              className="ov:cursor-pointer ov:w-8 ov:h-8 ov:flex ov:items-center ov:justify-center ov:transition-all ov:duration-200 ov:hover:opacity-80 ov:border ov:border-[var(--ov25-configurator-view-controls-border-color)] ov:rounded-full"
            >
              <DimensionsIcon className="ov:w-[16px] ov:h-[16px]" color="var(--ov25-text-color)"/>
            </button>

            {/* Mini Dimensions Switch - only shown when dimensions are on */}
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
                  'ov:absolute ov:top-0.5 ov:left-0.5 ov:w-3 ov:h-3 ov:rounded-full ov:transition-all ov:duration-200',
                  canSeeMiniDimensions 
                    ? 'ov:translate-x-4 ov:bg-[var(--ov25-overlay-button-color)]' 
                    : 'ov:translate-x-0 ov:bg-[var(--ov25-text-color)] ov:opacity-60'
                )}></div>
              </button>
            )}
          </div>
        )}

        {/* Variants Button - only show on desktop */}
        {!controlsHidden && allOptions.length > 0 && !isMobile && (
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

        {/* Save Snap2 Menu - only shown when not all hidden */}
        {!controlsHidden && <SaveSnap2Menu />}

        {/* Hide All Toggle Button - always visible on the right */}
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
