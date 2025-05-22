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
        "orbitalvision:absolute orbitalvision:w-full orbitalvision:pointer-events-none orbitalvision:h-full orbitalvision:inset-0 orbitalvision:gap-2 orbitalvision:p-4 orbitalvision:flex orbitalvision:justify-end orbitalvision:items-end orbitalvision:z-[101]",
        "orbitalvision:text-[var(--ov25-configurator-view-controls-text-color)]"
      )}>
        {canAnimate && (
          <button onClick={toggleAnimation} className={cn(
            'orbitalvision:cursor-pointer orbitalvision:pointer-events-auto orbitalvision:flex orbitalvision:gap-2 orbitalvision:p-2 orbitalvision:md:px-4 orbitalvision:border orbitalvision:items-center orbitalvision:justify-center',
            'orbitalvision:rounded-[var(--ov25-configurator-view-controls-border-radius)]',
            'orbitalvision:border-[var(--ov25-configurator-view-controls-border-color)]',
            'orbitalvision:bg-[var(--ov25-overlay-button-color)]',
          )}>
              <Rotate3D strokeWidth={1} className="orbitalvision:w-5 orbitalvision:h-5"/>
              {!isMobile && (
              <p className="orbitalvision:text-sm orbitalvision:font-light">{handleAnimationButtonText()}</p>
              )}
          </button>
        )}
    </div>
    <div className={cn(
        "orbitalvision:absolute orbitalvision:w-full orbitalvision:pointer-events-none orbitalvision:h-full orbitalvision:inset-0 orbitalvision:gap-2 orbitalvision:p-4 orbitalvision:flex orbitalvision:justify-end orbitalvision:items-end orbitalvision:z-[101]",
        "orbitalvision:text-[var(--ov25-configurator-view-controls-text-color)]"
      )}>
        <div className="orbitalvision:flex orbitalvision:flex-col orbitalvision:w-full orbitalvision:gap-2 orbitalvision:h-full">
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
          <div className="orbitalvision:mt-auto orbitalvision:self-end">
            {showDimensionsToggle && (
              <button onClick={handleToggleDimensions} className={cn(
                'orbitalvision:cursor-pointer orbitalvision:pointer-events-auto orbitalvision:flex orbitalvision:gap-2 orbitalvision:p-2 orbitalvision:md:px-4 orbitalvision:border orbitalvision:items-center orbitalvision:justify-center',
                'orbitalvision:rounded-[var(--ov25-configurator-view-controls-border-radius)]',
                'orbitalvision:border-[var(--ov25-configurator-view-controls-border-color)]',
                'orbitalvision:bg-[var(--ov25-overlay-button-color)]',
                )}>
                <DimensionsIcon strokeWidth={1} className="orbitalvision:w-6 orbitalvision:h-6"/>
                {!isMobile && (
                  <p className="orbitalvision:text-sm orbitalvision:text-[var(--ov25-text-color)]">Dimensions</p>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
      {!isVariantsOpen && (<div className="orbitalvision:absolute orbitalvision:ov25-controls-hidden orbitalvision:size-full orbitalvision:md:flex orbitalvision:pointer-events-none orbitalvision:inset-0 orbitalvision:p-4 orbitalvision:justify-end orbitalvision:items-start orbitalvision:z-[101]">
          <button className={cn(
            'orbitalvision:cursor-pointer orbitalvision:aspect-square orbitalvision:p-2 orbitalvision:pointer-events-auto orbitalvision:flex orbitalvision:gap-2 orbitalvision:ml-auto orbitalvision:border orbitalvision:items-center orbitalvision:justify-center',
            'orbitalvision:rounded-[var(--ov25-configurator-view-controls-border-radius)]',
            'orbitalvision:border-[var(--ov25-configurator-view-controls-border-color)]',
            'orbitalvision:bg-[var(--ov25-overlay-button-color)]',
        )}
          onClick={toggleFullscreen}>
            <ExpandIcon strokeWidth={1} className="orbitalvision:w-4 orbitalvision:h-4"/>
          </button>
      </div>)}
    </>
  )
}

export default ConfiguratorViewControls 