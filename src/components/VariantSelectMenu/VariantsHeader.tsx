import * as React from 'react'
import { cn } from '../../lib/utils.js';
import { ChevronUp, X } from 'lucide-react';
import { useOV25UI } from '../../contexts/ov25-ui-context.js';
import { capitalizeWords } from './DesktopVariants.js';
import { OVOrBrandLogo } from '../OVOrBrandLogo.js';
import { VariantsCloseButton } from './VariantsCloseButton.js';



export interface VariantsHeaderProps {
  /** When true, omit {@link VariantsCloseButton} (e.g. variants-only sheet already has its own X). */
  hideCloseButton?: boolean;
}

export const VariantsHeader = ({ hideCloseButton = false }: VariantsHeaderProps = {}) => {
  const { logoURL, hideLogo, handleNextOption, handlePreviousOption, activeOptionId, allOptions, showOptional, isSnap2Mode, isMobile, currentProduct } = useOV25UI();

  if (isMobile) return <div id="ov25-variants-header-mobile" className='w-full h-1'></div>;

  const currentOption = allOptions.find(opt => opt.id === activeOptionId);

  return (
    <>
      {/* Desktop Controls: Title with close button top right */}
      {!(hideLogo && isSnap2Mode) && <div id="ov25-variants-header-wrapper" className={cn(
        "ov:hidden ov:relative",
        isSnap2Mode ? "ov:lg:block" : "ov:md:block"
      )}>
        <div id="ov25-variants-header" className={cn(
          'ov:flex ov:items-center ov:justify-center ov:w-full ov:border-none ov:p-4 ov:min-h-25 ov:py-4.5 ov:relative ',
          'ov:bg-(--ov25-background-color)'
        )}>
          {!hideLogo ?
            <OVOrBrandLogo imageUrl={logoURL} className="ov:h-full" /> :
            <div className="ov25-variants-header-name ov:w-full ov:h-full ov:text-(--ov25-secondary-text-color) ov:text-xl ov:text-center">{currentProduct?.name}</div>}
          {!hideCloseButton && <VariantsCloseButton />}
        </div>
      </div>}

      {/* Mobile(ipad size) Controls: Title with separate chevron buttons */}
      <div id="ov25-carousel-controls" className={cn(
        "ov25-mobile-variants-carousel-controls ov:relative ov:flex ov:cursor-pointer ov:items-center ov:justify-between ov:w-full ov:p-4 ov:py-4.5 ov:pt-6",
        isSnap2Mode ? "ov:lg:hidden" : "ov:md:hidden"
      )}>
        <div className="ov:absolute ov:inset-0 ov:w-full ov:flex ov:justify-center ov:items-center ov:pb-5 ov:pt-10 ov:border-b ov:border-(--ov25-border-color)">
          <p data-optional={currentOption?.hasNonOption ? 'true' : 'false'} className="ov:text-(--ov25-secondary-text-color)">
            {currentOption && capitalizeWords(currentOption.name + ((currentOption.hasNonOption && showOptional) ? ' (Optional)' : ''))}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePreviousOption();
          }}
          className="ov:p-2 ov:-m-2 ov:hover:bg-accent ov:rounded-full ov:cursor-pointer ov:pt-5.5"
        >
          <ChevronUp strokeWidth={1} className="ov:rotate-270 ov:fill-transparent ov:text-(--ov25-secondary-text-color) ov:h-5.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNextOption();
          }}
          className="ov:p-2 ov:-m-2 ov:hover:bg-accent ov:hover:full ov:cursor-pointer ov:pt-5.5"
        >
          <ChevronUp strokeWidth={1} className="ov:rotate-90 ov:h-5.5 ov:fill-transparent ov:text-(--ov25-secondary-text-color)" />
        </button>
      </div>
    </>
  );
};