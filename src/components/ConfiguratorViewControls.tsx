import React, { useState } from 'react'
import { X as CloseIcon, Camera, Upload, Lightbulb } from 'lucide-react'
import { ExpandIcon, Rotate3D } from "lucide-react"
import { DimensionsIcon } from '../lib/svgs/DimensionsIcon.js'
import { toggleDimensions, toggleAnimation,  toggleFullscreen, getAnimationButtonText } from '../utils/configurator-utils.js'
import { useOV25UI } from '../contexts/ov25-ui-context.js'
import { cn } from '../lib/utils.js'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover.js'
import { toast } from 'sonner'
import Snap2Controls from './Snap2Controls.js'

interface ConfiguratorViewControlsProps {
  // All props now come from context, so no props needed
}

const ConfiguratorViewControls: React.FC<ConfiguratorViewControlsProps> = () => {

  const { 
    isVariantsOpen, 
    setIsVariantsOpen, 
    isMobile,
    canAnimate,
    animationState,
    currentProduct,
    availableCameras,
    selectCamera,
    availableLights,
    selectLightGroup,
    isSnap2Mode,
  } = useOV25UI();

  // Local state for dimensions
  const [canSeeDimensions, setCanSeeDimensions] = useState(false);
  // Local state for camera popover
  const [isCameraPopoverOpen, setIsCameraPopoverOpen] = useState(false);
  const cameraButtonRef = React.useRef<HTMLButtonElement>(null);
  // Local state for lights popover
  const [isLightPopoverOpen, setIsLightPopoverOpen] = useState(false);
  const lightButtonRef = React.useRef<HTMLButtonElement>(null);

  // Click outside handler to close popover
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isCameraPopoverOpen && !target.closest('[data-popover]')) {
        setIsCameraPopoverOpen(false);
      }
    };

    if (isCameraPopoverOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isCameraPopoverOpen]);

  // Click outside handler for lights popover
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isLightPopoverOpen && !target.closest('[data-popover]')) {
        setIsLightPopoverOpen(false);
      }
    };

    if (isLightPopoverOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isLightPopoverOpen]);

  // Calculate showDimensionsToggle from currentProduct
  const showDimensionsToggle = !isSnap2Mode && !!((currentProduct as any)?.dimensionX &&
    (currentProduct as any)?.dimensionY &&
    (currentProduct as any)?.dimensionZ);

  const handleToggleDimensions = () => {
    toggleDimensions(canSeeDimensions, setCanSeeDimensions);
  }
  
  const handleAnimationButtonText = () => {
    return getAnimationButtonText(canAnimate, animationState);
  }


  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Share link copied to clipboard!');
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Share link copied to clipboard!');
    }
  };




  const handleShare = async () => {
    const currentUrl = window.location.href;
    const productName = currentProduct?.name || 'product';
    const shareTitle = `Share this ${productName} configuration with your friends!`;
    const shareText = `I just designed this ${productName} — take a look!`;
    // Check if Web Share API is available (mobile devices)
    if (navigator.share && isMobile) {
        try {
          await navigator.share({
            title: shareTitle,
            text: shareText,
            url: currentUrl,
          });
        } catch (error) {
          // User cancelled or share failed — fallback
          await copyToClipboard(currentUrl);
        }
      } else {
        // Web Share API not available or desktop — fallback
        await copyToClipboard(currentUrl);
      }

    }


  return (
    <>
      {/* Snap2 Controls - shown only in snap2 mode */}
      {isSnap2Mode && <Snap2Controls />}
    
      {/* <div className={cn(
        "ov:absolute ov:w-full ov:pointer-events-none ov:h-full ov:inset-0 ov:gap-2 ov:p-4 ov:flex ov:justify-end ov:items-end ov:z-[101]",
        "ov:text-[var(--ov25-configurator-view-controls-text-color)]"
      )}>
        {canAnimate && (
          <button onClick={toggleAnimation} className={cn(
            'ov:cursor-pointer ov:pointer-events-auto ov:flex ov:gap-2.5 ov:p-2  ov:border ov:items-center ov:justify-center',
            'ov:rounded-[var(--ov25-configurator-view-controls-border-radius)]',
            'ov:border-[var(--ov25-configurator-view-controls-border-color)]',
            'ov:bg-[var(--ov25-overlay-button-color)]',
          )}>
              <Rotate3D strokeWidth={1} className="ov:w-[19px] ov:h-[19px] p-1"/>
              {!isMobile && (
              <p className="ov25-controls-text ov:text-sm ov:font-light">{handleAnimationButtonText()}</p>
              )}
          </button>
        )}
    </div> */}

    <div className={cn(
        "ov:pointer-events-none ov:absolute ov:w-full ov:h-full ov:inset-0 ov:gap-2 ov:p-4 ov:flex ov:justify-end ov:items-end ov:z-[101]",
        "ov:text-[var(--ov25-configurator-view-controls-text-color)]",
        "ov:transition-[height] ov:duration-500 ov:ease-[cubic-bezier(0.4,0,0.2,1)] "
      )}>
        <div className="ov:flex ov:flex-row ov:gap-2 ov:items-end">
          <button id="ov25-share-button" onClick={handleShare} className={cn(
            'ov:cursor-pointer ov:pointer-events-auto ov:flex ov:gap-2.5 ov:p-2 ov:border ov:items-center ov:justify-center',
            'ov:rounded-[var(--ov25-configurator-view-controls-border-radius)]',
            'ov:border-[var(--ov25-configurator-view-controls-border-color)]',
            'ov:bg-[var(--ov25-overlay-button-color)]',
          )}>
            <Upload strokeWidth={1} className="ov:w-[19px] ov:h-[19px] p-1"/>
            {!isMobile && (
              <p className="ov25-controls-text ov:text-sm ov:text-[var(--ov25-text-color)]">Share</p>
            )}
          </button>
          {canAnimate && (
            <button id="ov25-animation-toggle-button" onClick={toggleAnimation} className={cn(
              'ov:cursor-pointer ov:pointer-events-auto ov:flex ov:gap-2.5 ov:p-2  ov:border ov:items-center ov:justify-center',
              'ov:rounded-[var(--ov25-configurator-view-controls-border-radius)]',
              'ov:border-[var(--ov25-configurator-view-controls-border-color)]',
              'ov:bg-[var(--ov25-overlay-button-color)]',
            )}>
                <Rotate3D strokeWidth={1} className="ov:w-[19px] ov:h-[19px] p-1"/>
                {!isMobile && (
                <p className="ov25-controls-text ov:text-sm ov:font-light">{handleAnimationButtonText()}</p>
                )}
            </button>
          )}
          
        {/* 
          <button id="ov25-ar-toggle-button" onClick={toggleAR} className={cn(
            'ov:cursor-pointer ov:pointer-events-auto ov:flex ov:gap-2.5 ov:p-2 ov:border ov:items-center ov:justify-center',
            'ov:rounded-[var(--ov25-configurator-view-controls-border-radius)]',
            'ov:border-[var(--ov25-configurator-view-controls-border-color)]',
            'ov:bg-[var(--ov25-overlay-button-color)]',
          )}>
            <ArIcon className="ov:w-[19px] ov:h-[19px] p-1" color="var(--ov25-text-color)"/>
            {!isMobile && (
              <p className="ov25-controls-text ov:text-sm ov:text-[var(--ov25-text-color)]">View in your room</p>
            )}
          </button> */}

          {showDimensionsToggle && (
            <button id="ov25-desktop-dimensions-toggle-button" onClick={handleToggleDimensions} className={cn(
              'ov:cursor-pointer ov:pointer-events-auto ov:flex ov:gap-2.5 ov:p-2  ov:border ov:items-center ov:justify-center',
              'ov:rounded-[var(--ov25-configurator-view-controls-border-radius)]',
              'ov:border-[var(--ov25-configurator-view-controls-border-color)]',
              'ov:bg-[var(--ov25-overlay-button-color)]',
              )}>
              <DimensionsIcon className="ov:w-[19px] ov:h-[19px] p-1" color="var(--ov25-text-color)"/>
              {!isMobile && (
                <p className="ov25-controls-text ov:text-sm ov:text-[var(--ov25-text-color)]">Dimensions</p>
              )}
            </button>
          )}

          {availableCameras.length > 1 && (
            <div data-popover>
              <Popover open={isCameraPopoverOpen} onOpenChange={setIsCameraPopoverOpen}>
                <PopoverTrigger onClick={() => setIsCameraPopoverOpen(!isCameraPopoverOpen)}>
                  <button 
                    ref={cameraButtonRef}
                    id="ov25-camera-toggle-button" 
                    className={cn(
                      'ov:cursor-pointer ov:pointer-events-auto ov:flex ov:gap-2.5 ov:p-2 ov:border ov:items-center ov:justify-center',
                      'ov:rounded-[var(--ov25-configurator-view-controls-border-radius)]',
                      'ov:border-[var(--ov25-configurator-view-controls-border-color)]',
                      'ov:bg-[var(--ov25-overlay-button-color)]',
                    )}
                  >
                    <Camera strokeWidth={1} className="ov:w-[19px] ov:h-[19px] p-1"/>
                    {!isMobile && (
                      <p className="ov25-controls-text ov:text-sm ov:text-[var(--ov25-text-color)]">Camera</p>
                    )}
                  </button>
                </PopoverTrigger>
                {isCameraPopoverOpen && (
                  <PopoverContent triggerRef={cameraButtonRef}>
                    <div className="ov:flex ov:flex-col ov:gap-1">
                      {availableCameras.map((camera, index) => (
                        <button
                          key={camera.id}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            selectCamera(camera.id);
                            setIsCameraPopoverOpen(false);
                          }}
                          className={cn(
                            'ov:px-3 ov:py-2 ov:text-sm ov:rounded ov:cursor-pointer ov:hover:bg-gray-100',
                            'ov:transition-colors ov:duration-200 ov:text-left ov:w-full ov:bg-transparent ov:border-none'
                          )}
                        >
                          {camera.displayName && camera.displayName.trim() !== '' ? camera.displayName : `Camera ${index + 1}`}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                )}
              </Popover>
            </div>
          )}

          {availableLights.length > 1 && (
            <div data-popover>
              <Popover open={isLightPopoverOpen} onOpenChange={setIsLightPopoverOpen}>
                <PopoverTrigger onClick={() => setIsLightPopoverOpen(!isLightPopoverOpen)}>
                  <button 
                    ref={lightButtonRef}
                    id="ov25-light-toggle-button" 
                    className={cn(
                      'ov:cursor-pointer ov:pointer-events-auto ov:flex ov:gap-2.5 ov:p-2 ov:border ov:items-center ov:justify-center',
                      'ov:rounded-[var(--ov25-configurator-view-controls-border-radius)]',
                      'ov:border-[var(--ov25-configurator-view-controls-border-color)]',
                      'ov:bg-[var(--ov25-overlay-button-color)]',
                    )}
                  >
                    <Lightbulb strokeWidth={1} className="ov:w-[19px] ov:h-[19px] p-1"/>
                    {!isMobile && (
                      <p className="ov25-controls-text ov:text-sm ov:text-[var(--ov25-text-color)]">Lights</p>
                    )}
                  </button>
                </PopoverTrigger>
                {isLightPopoverOpen && (
                  <PopoverContent triggerRef={lightButtonRef}>
                    <div className="ov:flex ov:flex-col ov:gap-1">
                      {availableLights.map((group, index) => (
                        <button
                          key={group.id}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            selectLightGroup(group.id);
                            setIsLightPopoverOpen(false);
                          }}
                          className={cn(
                            'ov:px-3 ov:py-2 ov:text-sm ov:rounded ov:cursor-pointer ov:hover:bg-gray-100',
                            'ov:transition-colors ov:duration-200 ov:text-left ov:w-full ov:bg-transparent ov:border-none'
                          )}
                        >
                          {group.displayName && group.displayName.trim() !== '' ? group.displayName : `Group ${index + 1}`}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                )}
              </Popover>
            </div>
          )}

        </div>
      </div>
      {!isVariantsOpen && !isMobile && (
        <div className="ov:absolute ov:ov25-controls-hidden ov:size-full ov:md:flex ov:pointer-events-none ov:inset-0 ov:p-4 ov:justify-end ov:items-start ov:z-[101]">
            <button id="ov25-desktop-fullscreen-button" className={cn(
              'ov:cursor-pointer ov:aspect-square ov:p-2 ov:pointer-events-auto ov:flex ov:gap-2.5 ov:ml-auto ov:border ov:items-center ov:justify-center',
              'ov:rounded-[var(--ov25-configurator-view-controls-border-radius)]',
              'ov:border-[var(--ov25-configurator-view-controls-border-color)]',
              'ov:bg-[var(--ov25-overlay-button-color)]',
          )}
            onClick={toggleFullscreen}>
              <ExpandIcon strokeWidth={1} className="ov:w-[19px] ov:h-[19px] p-1"/>
            </button>
        </div>
      )}
      {isMobile && isVariantsOpen && (
        <div className="ov:absolute ov:w-full ov:pointer-events-none ov:h-full ov:inset-0 ov:gap-2 ov:p-4 ov:flex ov:justify-end ov:items-start ov:z-[101]">
          <button 
            id="ov25-mobile-close-button"
            onClick={() => setIsVariantsOpen(false)}
            className={cn(
              'ov:cursor-pointer ov:pointer-events-auto ov:flex ov:gap-2.5 ov:p-2 ov:border ov:items-center ov:justify-center',
              'ov:rounded-[var(--ov25-configurator-view-controls-border-radius)]',
              'ov:border-[var(--ov25-configurator-view-controls-border-color)]',
              'ov:bg-[var(--ov25-overlay-button-color)]',
            )}
          >
            <CloseIcon strokeWidth={1} className="ov:w-[19px] ov:h-[19px]"/>
          </button>
        </div>
      )}
    </>
  )
}

export default ConfiguratorViewControls 