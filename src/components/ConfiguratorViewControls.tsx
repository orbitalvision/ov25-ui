import React from 'react'
import { Ruler as DimensionsIcon } from 'lucide-react'
import { ExpandIcon, Rotate3D } from "lucide-react"
import { Box as ArIcon } from 'lucide-react'
import { toggleDimensions, toggleAnimation, toggleAR, toggleFullscreen, getAnimationButtonText } from '../utils/configurator-utils.js'

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
  const handleToggleDimensions = () => {
    toggleDimensions(canSeeDimensions, setCanSeeDimensions);
  }
  
  const handleAnimationButtonText = () => {
    return getAnimationButtonText(canAnimate, animationState);
  }

  return (
    <>
      <div className="absolute w-full pointer-events-none h-full text-[var(--ov25-configurator-view-controls-text-color)] inset-0 gap-2 p-4 flex justify-end items-end z-[9990]">
        {canAnimate && (
          <button className="rounded-[var(--ov25-configurator-view-controls-border-radius)] cursor-pointer pointer-events-auto flex gap-2 p-2 bg-[var(--ov25-configurator-view-controls-background-color)] md:px-4 border border-[var(--ov25-configurator-view-controls-border-color)] items-center justify-center" onClick={toggleAnimation}>
              <Rotate3D strokeWidth={1} className="w-5 h-5 " />
              {!isMobile && (
              <p className="text-sm font-light">{handleAnimationButtonText()}</p>
              )}
          </button>
        )}
        {showDimensionsToggle && (
          <button className="rounded-[var(--ov25-configurator-view-controls-border-radius)] cursor-pointer  pointer-events-auto flex gap-2 p-2 bg-[var(--ov25-configurator-view-controls-background-color)] md:px-4 border border-[var(--ov25-configurator-view-controls-border-color)] items-center justify-center" onClick={handleToggleDimensions}>
            <DimensionsIcon strokeWidth={1}  className="w-5 h-5 " />
            {!isMobile && (
              <p className="text-sm  font-light">Dimensions</p>
            )}
          </button>
        )}
        <button className="rounded-[var(--ov25-configurator-view-controls-border-radius)] cursor-pointer  pointer-events-auto flex gap-2 bg-[var(--ov25-configurator-view-controls-background-color)] p-2 md:px-4 border border-[var(--ov25-configurator-view-controls-border-color)] items-center justify-center" onClick={toggleAR}>
          <ArIcon strokeWidth={1}  className="w-5 h-5 " />
          {!isMobile && (
            <p className="text-sm  font-light">View in your room</p>
          )}
        </button>
      </div>
      <div className="absolute ov25-controls-hidden md:flex w-full pointer-events-none h-full inset-0 p-4 justify-end items-start z-[9990]">
          <button className="rounded-[var(--ov25-configurator-view-controls-border-radius)] cursor-pointer  aspect-square p-2 pointer-events-auto flex gap-2 bg-[var(--ov25-configurator-view-controls-background-color)] border border-[var(--ov25-configurator-view-controls-border-color)] items-center justify-center" onClick={toggleFullscreen}>
            <ExpandIcon strokeWidth={1} className="w-4 h-4 " />
          </button>
      </div>
    </>
  )
}

export default ConfiguratorViewControls 