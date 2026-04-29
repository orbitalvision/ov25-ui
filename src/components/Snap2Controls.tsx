import React, { useState, useEffect } from 'react';
import { DimensionsIcon } from '../lib/svgs/DimensionsIcon.js';
import {
  type Snap2ScreenshotItem,
  requestSnap2Screenshots,
  toggleDimensions,
  toggleFullscreen,
  toggleMiniDimensions,
  toggleSnap2ShowFloor,
  switchSnap2ViewGroup,
} from '../utils/configurator-utils.js';
import { Snap2ViewCameras } from '../lib/config/snap2-view-cameras.js';
import { useOV25UI } from '../contexts/ov25-ui-context.js';
import { cn } from '../lib/utils.js';
import { Camera, Eye, EyeClosed, Grid3x3, Loader2, TableRowsSplit } from 'lucide-react';
import SaveSnap2Menu from './SaveSnap2Menu.js';
import { Snap2ScreenshotDialog } from './Snap2ScreenshotDialog.js';

const Snap2Controls: React.FC = () => {
  const {
    controlsHidden,
    toggleHideAll,
    shareDialogTrigger,
    isVariantsOpen,
    setIsVariantsOpen,
    activeOptionId,
    setActiveOptionId,
    allOptions,
    isMobile,
    configuratorState,
    isModalOpen,
    cssString,
    uniqueId,
    useInlineVariantControls,
  } = useOV25UI();

  const [canSeeDimensions, setCanSeeDimensions] = useState(false);
  const [canSeeMiniDimensions, setCanSeeMiniDimensions] = useState(false);
  const [showFloor, setShowFloor] = useState(false);
  const [viewGroupId, setViewGroupId] = useState(0);
  const [isCapturingScreenshots, setIsCapturingScreenshots] = useState(false);
  const [screenshotDialogOpen, setScreenshotDialogOpen] = useState(false);
  const [screenshotItems, setScreenshotItems] = useState<Snap2ScreenshotItem[]>([]);

  // Reset dimensions state when modal closes
  useEffect(() => {
    if (!isModalOpen) {
      setCanSeeDimensions(false);
      setCanSeeMiniDimensions(false);
      setShowFloor(false);
      setViewGroupId(0);
    }
  }, [isModalOpen]);

  const handleToggleDimensions = () => {
    toggleDimensions(canSeeDimensions, setCanSeeDimensions, uniqueId, cssString);
  };

  const handleToggleMiniDimensionsClick = () => {
    toggleMiniDimensions(canSeeMiniDimensions, setCanSeeMiniDimensions, uniqueId, cssString);
  };

  const handleToggleFloor = () => {
    toggleSnap2ShowFloor(uniqueId);
    setShowFloor((v) => !v);
  };

  const handleViewGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = Number(e.target.value);
    if (!Number.isFinite(next)) return;
    setViewGroupId(next);
    switchSnap2ViewGroup(next, uniqueId);
  };

  const handleCaptureScreenshots = async () => {
    if (isCapturingScreenshots) return;
    setIsCapturingScreenshots(true);
    try {
      const items = await requestSnap2Screenshots(uniqueId);
      setScreenshotItems(items);
      setScreenshotDialogOpen(true);
    } catch (e) {
      console.error('[Snap2Controls] Screenshot capture failed:', e);
    } finally {
      setIsCapturingScreenshots(false);
    }
  };

  const handleScreenshotDialogOpenChange = (open: boolean) => {
    setScreenshotDialogOpen(open);
    if (!open) {
      setScreenshotItems([]);
    }
  };
  
  const handleVariantsClick = () => {
    if (document.fullscreenElement) {
      toggleFullscreen(uniqueId);
    }
    if (isVariantsOpen) {
      if (isMobile && activeOptionId === 'modules') {
        const firstNonModulesOption = allOptions.find((opt) => opt.id !== 'modules');
        if (firstNonModulesOption) {
          setActiveOptionId(firstNonModulesOption.id);
          return;
        }
      }
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
    <>
    <div id="ov25-snap2-controls" className={cn(
      "ov:absolute ov:top-4 ov:left-1/2 ov:transform ov:-translate-x-1/2 ov:z-102",
      "ov:flex ov:gap-2 ov:pointer-events-none ov:transition-opacity ov:duration-200",
      (shareDialogTrigger !== 'none') && "ov:opacity-0 ov:pointer-events-none"
    )}>
      <div className={cn(
        'ov:flex ov:gap-2 ov:pointer-events-auto ov:items-center ov:px-2 ov:py-1',
        'ov:rounded-(--ov25-configurator-view-controls-border-radius)',
        'ov:shadow-sm ov:bg-(--ov25-overlay-button-color)',
        'ov:transition-all ov:duration-200'
      )}>
        {/* Dimensions Button with integrated mini toggle */}
        {!controlsHidden && (
          <div className="ov:flex ov:items-center ov:gap-1">
            <button 
              id="ov25-snap2-dimensions-button" 
              onClick={handleToggleDimensions} 
              className="ov:cursor-pointer ov:w-8 ov:h-8 ov:flex ov:items-center ov:justify-center ov:transition-all ov:duration-200 ov:hover:opacity-80 ov:shadow-sm ov:rounded-full ov:bg-(--ov25-overlay-button-color)"
            >
              <DimensionsIcon className="ov:w-[16px] ov:h-[16px]" color="var(--ov25-configurator-view-controls-text-color)"/>
            </button>

            {/* Mini Dimensions Switch */}
            {canSeeDimensions && (
              <button 
                id="ov25-snap2-mini-dimensions-switch" 
                onClick={handleToggleMiniDimensionsClick} 
                className={cn(
                  'ov:cursor-pointer ov:relative ov:w-8 ov:h-4 ov:rounded-full ov:shadow-sm ov:transition-all ov:duration-200',
                  canSeeMiniDimensions 
                    ? 'ov:bg-(--ov25-configurator-view-controls-text-color)' 
                    : 'ov:bg-(--ov25-overlay-button-color)',
                  'ov:hover:opacity-80'
                )}
              >
                <div className={cn(
                  'ov:absolute ov:top-px ov:left-px ov:w-3 ov:h-3 ov:rounded-full ov:transition-all ov:duration-200',
                  canSeeMiniDimensions 
                    ? 'ov:translate-x-4 ov:bg-(--ov25-overlay-button-color)' 
                    : 'ov:translate-x-0 ov:bg-(--ov25-configurator-view-controls-text-color) ov:opacity-60'
                )}></div>
              </button>
            )}
          </div>
        )}

        {!controlsHidden && (
          <>
            <button
              id="ov25-snap2-floor-grid-button"
              type="button"
              onClick={handleToggleFloor}
              title="Toggle floor grid"
              aria-label="Toggle floor grid"
              className={cn(
                'ov:cursor-pointer ov:w-8 ov:h-8 ov:flex ov:items-center ov:justify-center ov:transition-all ov:duration-200 ov:hover:opacity-80 ov:shadow-sm ov:rounded-full',
                showFloor ? 'ov:ring-2 ov:ring-neutral-400' : '',
                'ov:bg-(--ov25-overlay-button-color)'
              )}
            >
              <Grid3x3 className="ov:w-[16px] ov:h-[16px] ov:text-(--ov25-configurator-view-controls-text-color)" />
            </button>
            <label className="ov:sr-only" htmlFor="ov25-snap2-view-select">
              View
            </label>
            <select
              id="ov25-snap2-view-select"
              value={String(viewGroupId)}
              onChange={handleViewGroupChange}
              className="ov:h-8 ov:min-w-36 ov:max-w-44 ov:cursor-pointer ov:rounded-full ov:border-0 ov:bg-(--ov25-overlay-button-color) ov:px-2 ov:text-xs ov:font-medium ov:text-(--ov25-configurator-view-controls-text-color) ov:shadow-sm"
              aria-label="Camera view"
            >
              {Snap2ViewCameras.map((cam) => (
                <option key={cam.cameraGroupId} value={String(cam.cameraGroupId)}>
                  {cam.name}
                </option>
              ))}
            </select>
            <button
              id="ov25-snap2-screenshots-button"
              type="button"
              title="Capture screenshots"
              aria-label="Capture screenshots"
              disabled={isCapturingScreenshots}
              onClick={() => void handleCaptureScreenshots()}
              className={cn(
                'ov:cursor-pointer ov:w-8 ov:h-8 ov:flex ov:items-center ov:justify-center ov:transition-all ov:duration-200 ov:shadow-sm ov:rounded-full ov:bg-(--ov25-overlay-button-color)',
                'ov:hover:opacity-80 ov:disabled:opacity-50 ov:disabled:cursor-not-allowed',
              )}
            >
              {isCapturingScreenshots ? (
                <Loader2 className="ov:h-4 ov:w-4 ov:animate-spin ov:text-(--ov25-configurator-view-controls-text-color)" />
              ) : (
                <Camera className="ov:h-4 ov:w-4 ov:text-(--ov25-configurator-view-controls-text-color)" />
              )}
            </button>
          </>
        )}

        {/* Variants Button */}
        {!controlsHidden && allOptions.length > 0 && !useInlineVariantControls && (
          <button 
            id="ov25-snap2-variants-button" 
            onClick={handleVariantsClick} 
            className={cn(
              "ov:cursor-pointer ov:w-8 ov:h-8 ov:flex ov:items-center ov:justify-center ov:transition-all ov:duration-200 ov:hover:opacity-80 ov:shadow-sm ov:rounded-full",
              isVariantsOpen && !(isMobile && activeOptionId === 'modules')
                ? "ov:bg-gray-200"
                : "ov:bg-(--ov25-overlay-button-color)"
            )}
          >
            <TableRowsSplit 
              className="ov:w-[16px] ov:h-[16px]"
              color="var(--ov25-configurator-view-controls-text-color)"
            />
          </button>
        )}

        {/* Save Snap2 Menu - always available */}
        <SaveSnap2Menu />

        {/* Hide All Toggle Button */}
        <button 
          id="ov25-snap2-hide-all-button" 
          onClick={toggleHideAll} 
          className="ov:cursor-pointer ov:w-8 ov:h-8 ov:flex ov:items-center ov:justify-center ov:transition-all ov:duration-200 ov:hover:opacity-80 ov:shadow-sm ov:rounded-full ov:bg-(--ov25-overlay-button-color)"
        >
          {controlsHidden ? (
            <EyeClosed className="ov:w-[16px] ov:h-[16px]" color="var(--ov25-configurator-view-controls-text-color)"/>
          ) : (
            <Eye className="ov:w-[16px] ov:h-[16px]" color="var(--ov25-configurator-view-controls-text-color)"/>
          )}
        </button>

      </div>
    </div>
    <Snap2ScreenshotDialog
      open={screenshotDialogOpen}
      onOpenChange={handleScreenshotDialogOpenChange}
      screenshots={screenshotItems}
    />
    </>
  );
};

export default Snap2Controls;
