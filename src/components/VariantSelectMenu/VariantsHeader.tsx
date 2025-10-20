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
        allOptions,
        showOptional,
        isModalOpen
      } = useOV25UI();

    const currentOption = allOptions.find(opt => opt.id === activeOptionId)

    return (
        <>
        {/* Desktop Controls: Full width button */}
        <div id="ov25-variants-header" className="ov:hidden ov:md:block">
          <button 
            onClick={() => setIsVariantsOpen(false)}
            className={cn(
              'ov:flex ov:items-center ov:cursor-pointer ov:justify-between ov:w-full ov:border-none ov:p-4 ov:py-[1.125rem]',
              'ov:bg-[var(--ov25-background-color)]',
              isModalOpen && 'ov:cursor-default'
            )}
          >
            <div className="ov:flex ov:items-center ov:gap-2 ov:justify-center ov:w-full ov:relative">
              <div className="ov:absolute ov:cursor-pointer ov:w-full ov:inset-0 ov:h-full ov:flex ov:items-center ov:text-[var(--ov25-text-color)]">
                <ChevronLeft className="ov:h-4"/>
              </div>
              {logoURL ? (
                <img src={logoURL} alt="Logo" className="ov:h-full ov:w-auto ov:object-contain"/>
              ) : (
                <h3 className="ov:text-base ov:font-[400] ov:z-10">{range?.name}</h3>
              )}
            </div>
          </button>
        </div>
   
        {/* Mobile(ipad size) Controls: Title with separate chevron buttons */}
        <div id="ov25-carousel-controls" className="ov25-mobile-variants-carousel-controls ov:relative ov:flex ov:cursor-pointer ov:md:hidden ov:items-center ov:justify-between ov:w-full ov:p-4 ov:py-[1.125rem] ov:pt-6">
            <div className="ov:absolute ov:inset-0 ov:w-full ov:flex ov:justify-center ov:items-center ov:pb-5 ov:pt-10 ov:border-b ov:border-[var(--ov25-border-color)]">
                <p data-optional={currentOption?.hasNonOption ? 'true' : 'false'} className="ov:text-[var(--ov25-secondary-text-color)]">
                {currentOption && capitalizeWords(currentOption.name + ((currentOption.hasNonOption && showOptional) ? ' (Optional)' : '')) }
                </p>
            </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handlePreviousOption();
            }}
            className="ov:p-2 ov:-m-2 ov:hover:bg-accent ov:rounded-full ov:cursor-pointer ov:pt-5.5"
          >
            <ChevronUp strokeWidth={1} className="ov:rotate-270 ov:fill-transparent ov:text-[var(--ov25-secondary-text-color)] ov:h-5.5" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleNextOption();
            }}
            className="ov:p-2 ov:-m-2 ov:hover:bg-accent ov:hover:full ov:cursor-pointer ov:pt-5.5"
          >
            <ChevronUp strokeWidth={1} className="ov:rotate-90 ov:h-5.5 ov:fill-transparent ov:text-[var(--ov25-secondary-text-color)]" />
          </button>
        </div>
      </>
    );
  };