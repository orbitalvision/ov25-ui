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
        "ov:absolute ov:w-full ov:pointer-events-none ov:h-full ov:inset-0 ov:gap-2 ov:p-4 ov:flex ov:justify-end ov:items-end ov:z-[101]",
        "ov:text-[var(--ov25-configurator-view-controls-text-color)]"
      )}>
        {canAnimate && (
          <button onClick={toggleAnimation} className={cn(
            'ov:cursor-pointer ov:pointer-events-auto ov:flex ov:gap-2 ov:p-2 ov:md:px-4 ov:border ov:items-center ov:justify-center',
            'ov:rounded-[var(--ov25-configurator-view-controls-border-radius)]',
            'ov:border-[var(--ov25-configurator-view-controls-border-color)]',
            'ov:bg-[var(--ov25-overlay-button-color)]',
          )}>
              <Rotate3D strokeWidth={1} className="ov:w-5 ov:h-5"/>
              {!isMobile && (
              <p className="ov:text-sm ov:font-light">{handleAnimationButtonText()}</p>
              )}
          </button>
        )}
    </div>
    <div className={cn(
        "ov:absolute ov:w-full ov:pointer-events-none ov:h-full ov:inset-0 ov:gap-2 ov:p-4 ov:flex ov:justify-end ov:items-end ov:z-[101]",
        "ov:text-[var(--ov25-configurator-view-controls-text-color)]"
      )}>
        <div className="ov:flex ov:flex-col ov:w-full ov:gap-2 ov:h-full">
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
          <div className="ov:mt-auto ov:self-end">
            {showDimensionsToggle && (
              <button onClick={handleToggleDimensions} className={cn(
                'ov:cursor-pointer ov:pointer-events-auto ov:flex ov:gap-2 ov:p-2 ov:md:px-4 ov:border ov:items-center ov:justify-center',
                'ov:rounded-[var(--ov25-configurator-view-controls-border-radius)]',
                'ov:border-[var(--ov25-configurator-view-controls-border-color)]',
                'ov:bg-[var(--ov25-overlay-button-color)]',
                )}>
                <DimensionsIcon strokeWidth={1} className="ov:w-6 ov:h-6"/>
                {!isMobile && (
                  <p className="ov:text-sm ov:text-[var(--ov25-text-color)]">Dimensions</p>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
      {!isVariantsOpen && (<div className="ov:absolute ov:ov25-controls-hidden ov:size-full ov:md:flex ov:pointer-events-none ov:inset-0 ov:p-4 ov:justify-end ov:items-start ov:z-[101]">
          <button className={cn(
            'ov:cursor-pointer ov:aspect-square ov:p-2 ov:pointer-events-auto ov:flex ov:gap-2 ov:ml-auto ov:border ov:items-center ov:justify-center',
            'ov:rounded-[var(--ov25-configurator-view-controls-border-radius)]',
            'ov:border-[var(--ov25-configurator-view-controls-border-color)]',
            'ov:bg-[var(--ov25-overlay-button-color)]',
        )}
          onClick={toggleFullscreen}>
            <ExpandIcon strokeWidth={1} className="ov:w-4 ov:h-4"/>
          </button>
      </div>)}
    </>
  )
}

export default ConfiguratorViewControls 