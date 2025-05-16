import React from 'react'
import { Ruler as DimensionsIcon } from 'lucide-react'
import { ExpandIcon, Rotate3D } from "lucide-react"
import { toggleDimensions, toggleAnimation,  toggleFullscreen, getAnimationButtonText } from '../utils/configurator-utils.js'
import { useOV25UI } from '../contexts/ov25-ui-context.js'
import { cn } from '../lib/utils.js'

interface ConfiguratorViewControlsProps {
  canAnimate: boolean
  animationState: "unavailable" | "open" | "close" | "loop" | "stop"
  showDimensionsToggle: boolean
  isMobile: boolean
  canSeeDimensions: boolean
  setCanSeeDimensions: React.Dispatch<React.SetStateAction<boolean>>
}

const ConfiguratorViewControls: React.FC<ConfiguratorViewControlsProps> = ({
  canAnimate,
  animationState,
  showDimensionsToggle,
  isMobile,
  canSeeDimensions,
  setCanSeeDimensions
}) => {

  const { isVariantsOpen, setIsVariantsOpen } = useOV25UI();
  const handleToggleDimensions = () => {
    toggleDimensions(canSeeDimensions, setCanSeeDimensions);
  }
  
  const handleAnimationButtonText = () => {
    return getAnimationButtonText(canAnimate, animationState);
  }

  return (
    <>
      <div className={cn(
        "absolute w-full pointer-events-none h-full inset-0 gap-2 p-4 flex justify-end items-end z-[9990]",
        " text-[var(--ov25-configurator-view-controls-text-color)] "
      )}>
        {canAnimate && (
          <button onClick={toggleAnimation} className={cn(
            'cursor-pointer pointer-events-auto flex gap-2 p-2 md:px-4 border  items-center justify-center',
            'rounded-[var(--ov25-configurator-view-controls-border-radius)]',
            'border-[var(--ov25-configurator-view-controls-border-color)]',
            'bg-[var(--ov25-overlay-button-color)]',
          )}>
              <Rotate3D strokeWidth={1} className="w-5 h-5"/>
              {!isMobile && (
              <p className="text-sm font-light">{handleAnimationButtonText()}</p>
              )}
          </button>
        )}
    </div>
    <div className={cn(
        "absolute w-full pointer-events-none h-full inset-0 gap-2 p-4 flex justify-end items-end z-[9990]",
        " text-[var(--ov25-configurator-view-controls-text-color)] "
      )}>
        <div className="flex flex-col w-full gap-2 h-full">
          {/* <div className="self-start">
            {isVariantsOpen && !isMobile && (<>
              <button onClick={handleClosePanel} className={cn(
                'cursor-pointer  p-2 pointer-events-auto flex gap-1 pr-4  text-[var(--ov25-secondary-text-color)] border items-center justify-center',
                'rounded-[var(--ov25-configurator-view-controls-border-radius)]',
                'border-[var(--ov25-configurator-view-controls-border-color)]',
                'bg-[var(--ov25-overlay-button-color)]',
              )}>
                
                <ChevronLeft strokeWidth={1} className="w-6 h-6"/>
                <span className=''>Back</span>
              </button>
               
                  </>
            )}
          </div> */}
          <div className="mt-auto self-end">
            {showDimensionsToggle && (
              <button onClick={handleToggleDimensions} className={cn(
                'cursor-pointer pointer-events-auto flex gap-2 p-2 md:px-4 border items-center justify-center',
                'rounded-[var(--ov25-configurator-view-controls-border-radius)]',
                'border-[var(--ov25-configurator-view-controls-border-color)]',
                'bg-[var(--ov25-overlay-button-color)]',
                )}>
                <DimensionsIcon strokeWidth={1} className="w-6 h-6"/>
                {!isMobile && (
                  <p className="text-sm text-[var(--ov25-text-color)]">Dimensions</p>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
      {!isVariantsOpen && (<div className="absolute ov25-controls-hidden size-full  md:flex  pointer-events-none  inset-0 p-4 justify-end items-start z-[9990]">
          <button className={cn(
            'cursor-pointer  aspect-square p-2 pointer-events-auto flex gap-2 ml-auto border items-center justify-center',
            'rounded-[var(--ov25-configurator-view-controls-border-radius)]',
            'border-[var(--ov25-configurator-view-controls-border-color)]',
            'bg-[var(--ov25-overlay-button-color)]',
        )}
          onClick={toggleFullscreen}>
            <ExpandIcon strokeWidth={1} className="w-4 h-4"/>
          </button>
      </div>)}
    </>
  )
}

export default ConfiguratorViewControls 