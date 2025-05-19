import * as React from 'react'
import { cn } from '../../lib/utils.js';
import { ChevronLeft,  ChevronUp,  Triangle } from 'lucide-react';
import { useOV25UI } from '../../contexts/ov25-ui-context.js';
import { capitalizeWords } from './DesktopVariants.js';



export const VariantsHeader = () => {
    const {
        setIsVariantsOpen,
        logoURL,
        range,
        handleNextOption,
        handlePreviousOption,
        activeOptionId,
        allOptions
      } = useOV25UI();

    const currentOption = allOptions.find(opt => opt.id === activeOptionId)
    return (
      <>
        {/* Desktop Controls: Full width button */}
        <div className="orbitalvision:hidden orbitalvision:md:block">
          <button 
            onClick={() => setIsVariantsOpen(false)}
            className={cn(
              'orbitalvision:flex orbitalvision:items-center orbitalvision:cursor-pointer orbitalvision:justify-between orbitalvision:w-full orbitalvision:border-b-1 orbitalvision:p-4 orbitalvision:py-[1.125rem]',
              'orbitalvision:bg-[var(--ov25-primary-color)]'
            )}
          >
            <div className="orbitalvision:flex orbitalvision:items-center orbitalvision:gap-2 orbitalvision:justify-center orbitalvision:w-full orbitalvision:relative">
              <div className="orbitalvision:absolute orbitalvision:cursor-pointer orbitalvision:w-full orbitalvision:inset-0 orbitalvision:h-full orbitalvision:flex orbitalvision:items-center orbitalvision:text-[var(--ov25-background-color)]">
                <ChevronLeft className="orbitalvision:h-4"/>
              </div>
              {logoURL ? (
                <img src={logoURL} alt="Logo" className="orbitalvision:w-40 orbitalvision:h-full"/>
              ) : (
                <h3 className="orbitalvision:text-base orbitalvision:font-[400] orbitalvision:z-10">{range?.name}</h3>
              )}
            </div>
          </button>
        </div>
   
        {/* Mobile(ipad size) Controls: Title with separate chevron buttons */}
        <div className="orbitalvision:relative orbitalvision:flex orbitalvision:cursor-pointer orbitalvision:md:hidden orbitalvision:items-center orbitalvision:justify-between orbitalvision:w-full orbitalvision:p-4 orbitalvision:py-[1.125rem] orbitalvision:pt-6">
            <div className="orbitalvision:absolute orbitalvision:inset-0 orbitalvision:w-full orbitalvision:flex orbitalvision:justify-center orbitalvision:items-center orbitalvision:pb-5 orbitalvision:pt-10 orbitalvision:border-b orbitalvision:border-[var(--ov25-border-color)]">
                <p className="orbitalvision:text-[var(--ov25-secondary-text-color)]">
                {currentOption && capitalizeWords(currentOption.name) }
                </p>
            </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handlePreviousOption();
            }}
            className="orbitalvision:p-2 orbitalvision:-m-2 orbitalvision:hover:bg-accent orbitalvision:rounded-full orbitalvision:cursor-pointer orbitalvision:pt-5.5"
          >
            <ChevronUp strokeWidth={1} className="orbitalvision:rotate-270 orbitalvision:fill-transparent orbitalvision:text-[var(--ov25-secondary-text-color)] orbitalvision:h-5.5" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleNextOption();
            }}
            className="orbitalvision:p-2 orbitalvision:-m-2 orbitalvision:hover:bg-accent orbitalvision:hover:full orbitalvision:cursor-pointer orbitalvision:pt-5.5"
          >
            <ChevronUp strokeWidth={1} className="orbitalvision:rotate-90 orbitalvision:h-5.5 orbitalvision:fill-transparent orbitalvision:text-[var(--ov25-secondary-text-color)]" />
          </button>
        </div>
      </>
    );
  };