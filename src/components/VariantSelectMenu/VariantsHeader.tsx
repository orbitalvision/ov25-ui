import * as React from 'react'
import { cn } from '../../lib/utils.js';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useOV25UI } from '../../contexts/ov25-ui-context.js';



export const VariantsHeader = () => {
    const {
        setIsVariantsOpen,
        logoURL,
        range,
        handleNextOption,
        handlePreviousOption,
      } = useOV25UI();
    return (
      <>
        {/* Desktop Controls: Full width button */}
        <div className="hidden md:block">
          <button 
            onClick={() => setIsVariantsOpen(false)}
            className={cn(
              'flex items-center cursor-pointer justify-between w-full border-b-1 p-4 py-[1.125rem]',
              'bg-[var(--ov25-primary-color)]'
            )}
          >
            <div className="flex items-center gap-2 justify-center w-full relative">
              <div className="absolute cursor-pointer w-full inset-0 h-full flex items-center text-[var(--ov25-button-text-color)]">
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
        <div className="flex cursor-pointer md:hidden items-center justify-between w-full p-4 py-[1.125rem]">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handlePreviousOption();
            }}
            className="p-2 -m-2 hover:bg-accent rounded-full"
          >
            <ChevronRight className="rotate-180 h-4" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleNextOption();
            }}
            className="p-2 -m-2 hover:bg-accent hover:full"
          >
            <ChevronRight className="h-4" />
          </button>
        </div>
      </>
    );
  };