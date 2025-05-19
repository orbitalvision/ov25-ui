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
        <div className="ov25-controls-hidden md:block!">
          <button 
            onClick={() => setIsVariantsOpen(false)}
            className={cn(
              'flex items-center cursor-pointer justify-between w-full border-b-1 p-4 py-[1.125rem]',
              'bg-[var(--ov25-primary-color)]'
            )}
          >
            <div className="flex items-center gap-2 justify-center w-full relative">
              <div className="absolute cursor-pointer w-full inset-0 h-full flex items-center text-[var(--ov25-background-color)]">
                <ChevronLeft className=" h-4"/>
              </div>
              {logoURL ? (
                <img src={logoURL} alt="Logo" className="w-40 h-full"/>
              ) : (
                <h3 className="text-base font-[400] z-10">{range?.name}</h3>
              )}
            </div>
          </button>
        </div>
   
        {/* Mobile(ipad size) Controls: Title with separate chevron buttons */}
        <div className=" relative flex cursor-pointer md:hidden items-center justify-between w-full p-4  py-[1.125rem] pt-6">
            <div className="absolute inset-0 w-full flex justify-center items-center pb-5 pt-10  border-b border-[var(--ov25-border-color)]">
                <p className="text-[var(--ov25-secondary-text-color)]">
                {currentOption && capitalizeWords(currentOption.name) }
                </p>
            </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handlePreviousOption();
            }}
            className="p-2 -m-2 hover:bg-accent rounded-full cursor-pointer pt-5.5"
          >
            <ChevronUp strokeWidth={1}  className="rotate-270 fill-transparent text-[var(--ov25-secondary-text-color)] h-5.5" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleNextOption();
            }}
            className="p-2 -m-2 hover:bg-accent hover:full cursor-pointer pt-5.5"
          >
            <ChevronUp  strokeWidth={1} className="rotate-90 h-5.5 fill-transparent text-[var(--ov25-secondary-text-color)]" />
          </button>
        </div>
      </>
    );
  };