import React from 'react'
import { Ruler as DimensionsIcon, RulerDimensionLineIcon, X as CloseIcon } from 'lucide-react'
import { ExpandIcon, Rotate3D } from "lucide-react"
import { toggleDimensions, toggleAnimation,  toggleFullscreen, getAnimationButtonText } from '../utils/configurator-utils.js'
import { useOV25UI } from '../contexts/ov25-ui-context.js'
import { cn } from '../lib/utils.js'

interface ConfiguratorViewControlsProps {
  canAnimate: boolean
  animationState: "unavailable" | "open" | "close" | "loop" | "stop"
  showDimensionsToggle: boolean
  canSeeDimensions: boolean
  setCanSeeDimensions: React.Dispatch<React.SetStateAction<boolean>>
}

const ConfiguratorViewControls: React.FC<ConfiguratorViewControlsProps> = ({
  canAnimate,
  animationState,
  showDimensionsToggle,
  canSeeDimensions,
  setCanSeeDimensions
}) => {

  const { isVariantsOpen, setIsVariantsOpen, isMobile } = useOV25UI();
  const handleToggleDimensions = () => {
    toggleDimensions(canSeeDimensions, setCanSeeDimensions);
  }
  
  const handleAnimationButtonText = () => {
    return getAnimationButtonText(canAnimate, animationState);
  }

  return (
    <>
      {/* <div className={cn(
        "ov:absolute ov:w-full ov:pointer-events-none ov:h-full ov:inset-0 ov:gap-2 ov:p-4 ov:flex ov:justify-end ov:items-end ov:z-[101]",
        "ov:text-[var(--ov25-configurator-view-controls-text-color)]"
      )}>
        {canAnimate && (
          <button onClick={toggleAnimation} className={cn(
            'ov:cursor-pointer ov:pointer-events-auto ov:flex ov:gap-2.5 ov:p-2 ov:md:px-4 ov:border ov:items-center ov:justify-center',
            'ov:rounded-[var(--ov25-configurator-view-controls-border-radius)]',
            'ov:border-[var(--ov25-configurator-view-controls-border-color)]',
            'ov:bg-[var(--ov25-overlay-button-color)]',
          )}>
              <Rotate3D strokeWidth={2} className="ov:w-[19px] ov:h-[19px] p-1"/>
              {!isMobile && (
              <p className="ov25-controls-text ov:text-sm ov:font-light">{handleAnimationButtonText()}</p>
              )}
          </button>
        )}
    </div> */}
    <div className={cn(
        "ov:absolute ov:w-full ov:h-full ov:inset-0 ov:gap-2 ov:p-4 ov:flex ov:justify-end ov:items-end ov:z-[101]",
        "ov:text-[var(--ov25-configurator-view-controls-text-color)]",
        "ov:transition-[height] ov:duration-500 ov:ease-[cubic-bezier(0.4,0,0.2,1)]"
      )}>
        <div className="ov:flex ov:flex-row ov:gap-2 ov:items-end">
          {canAnimate && (
            <button id="ov25-animation-toggle-button" onClick={toggleAnimation} className={cn(
              'ov:cursor-pointer ov:pointer-events-auto ov:flex ov:gap-2.5 ov:p-2 ov:md:px-4 ov:border ov:items-center ov:justify-center',
              'ov:rounded-[var(--ov25-configurator-view-controls-border-radius)]',
              'ov:border-[var(--ov25-configurator-view-controls-border-color)]',
              'ov:bg-[var(--ov25-overlay-button-color)]',
            )}>
                <Rotate3D strokeWidth={2} className="ov:w-[19px] ov:h-[19px] p-1"/>
                {!isMobile && (
                <p className="ov25-controls-text ov:text-sm ov:font-light">{handleAnimationButtonText()}</p>
                )}
            </button>
          )}

          {showDimensionsToggle && (
            <button id="ov25-desktop-dimensions-toggle-button" onClick={handleToggleDimensions} className={cn(
              'ov:cursor-pointer ov:pointer-events-auto ov:flex ov:gap-2.5 ov:p-2 ov:md:px-4 ov:border ov:items-center ov:justify-center',
              'ov:rounded-[var(--ov25-configurator-view-controls-border-radius)]',
              'ov:border-[var(--ov25-configurator-view-controls-border-color)]',
              'ov:bg-[var(--ov25-overlay-button-color)]',
              )}>
              <RulerDimensionLineIcon strokeWidth={2} className="ov:w-[19px] ov:h-[19px] p-1"/>
              {!isMobile && (
                <p className="ov25-controls-text ov:text-sm ov:text-[var(--ov25-text-color)]">Dimensions</p>
              )}
            </button>
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
              <ExpandIcon strokeWidth={2} className="ov:w-[19px] ov:h-[19px] p-1"/>
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
            <CloseIcon strokeWidth={2} className="ov:w-[19px] ov:h-[19px]"/>
          </button>
        </div>
      )}
    </>
  )
}

export default ConfiguratorViewControls 