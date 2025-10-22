import * as React from 'react'
import { useOV25UI } from "../../contexts/ov25-ui-context.js"
import { VariantsContent } from "./VariantsContent.js";
import { Variant, VariantCardProps, VariantGroup } from "./ProductVariants.js";
import { ChevronUp } from "lucide-react";
import { useState } from 'react';
import { FilterControls } from './FilterControls.js';
import { FilterContent } from './FilterContent.js';
import { NoResults } from './NoResults.js';

export const getGridColsClass = (gridDivide: number) => {
  switch (gridDivide) {
    case 2: return 'ov:grid-cols-2!';
    case 4: return 'ov:grid-cols-4!';
    case 5: return 'ov:grid-cols-5!';
    case 6: return 'ov:grid-cols-6!';
    default: return 'ov:grid-cols-3!';
  }
};

export const capitalizeWords = (str: string) => {
  return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export const DesktopVariants = ({ variants, VariantCard, isMobile, onSelect, gridDivide }
  : {
    variants: VariantGroup[] | Variant[],
    VariantCard: React.ComponentType<VariantCardProps>,
    isMobile: boolean,
    onSelect: (variant: Variant) => void
    gridDivide: number
  }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const isGrouped = Array.isArray(variants) && variants.length > 0 && 'groupName' in variants[0]
  const shouldDestructureGroups = isGrouped && variants.length < 2 && (variants as VariantGroup[])[0].groupName === 'Default Group'

  const variantsToRender = isGrouped ? (variants as VariantGroup[]) : variants as Variant[];

  const {
    allOptionsWithoutModules,
    handleOptionClick,
    activeOptionId,
    handlePreviousOption,
    handleNextOption,
    showFilters,
    showOptional,
  } = useOV25UI();

  const currentOption = allOptionsWithoutModules.find(opt => opt.id === activeOptionId)

  const shouldShowFilters = ((isGrouped && !shouldDestructureGroups) && (variantsToRender as VariantGroup[]).some(group => group.variants.length > 0)) || showFilters;

  return (
    <>

    {allOptionsWithoutModules.length > 6 && (
         <div id="ov25-carousel-controls" className="ov25-desktop-variants-carousel-controls ov:relative   ov:hidden ov:cursor-pointer ov:md:flex ov:items-center ov:justify-between ov:w-full ov:p-4 ov:py-[1.125rem] pt-0 ">
         <div className="ov:absolute ov:inset-0 ov:w-full ov:flex ov:justify-center ov:items-center ov:pb-5 ov:pt-5 ov:border-b ov:border-[var(--ov25-border-color)]">
             <p data-optional={currentOption?.hasNonOption ? 'true' : 'false'} className="ov:text-[var(--ov25-secondary-text-color)]">
             {currentOption && capitalizeWords(currentOption.name) }
             </p>
         </div>
       <button 
         onClick={(e) => {
           e.stopPropagation();
           handlePreviousOption();
         }}
         className="ov:p-2 ov:-m-2 ov:hover:bg-accent ov:rounded-full ov:cursor-pointer ov:pt-2"
       >
         <ChevronUp strokeWidth={1} className="ov:rotate-270 ov:fill-transparent ov:text-[var(--ov25-secondary-text-color)] ov:h-5.5" />
       </button>
       <button 
         onClick={(e) => {
           e.stopPropagation();
           handleNextOption();
         }}
         className="ov:p-2 ov:-m-2 ov:hover:bg-accent ov:hover:full ov:cursor-pointer ov:pt-2"
       >
         <ChevronUp strokeWidth={1} className="ov:rotate-90 ov:h-5.5 ov:fill-transparent ov:text-[var(--ov25-secondary-text-color)]" />
       </button>
     </div>
    )}
      {
        allOptionsWithoutModules.length > 1 && allOptionsWithoutModules.length <= 6 && (
          <div id="ov25-option-selector-tabs" className="ov:flex ov:flex-wrap">
            {allOptionsWithoutModules.map((option, index) => {
              // Determine items per row: max 3 per row
              const itemsInFirstRow = Math.min(3, allOptionsWithoutModules.length);
              const itemsInSecondRow = allOptionsWithoutModules.length > 3 ? allOptionsWithoutModules.length - 3 : 0;
              // Figure out if this item is in the first or second row
              const isFirstRow = index < 3;
              const itemsThisRow = isFirstRow ? itemsInFirstRow : itemsInSecondRow;
              // Set width based on items in this row
              let widthClass = '';
              if (itemsThisRow === 1) widthClass = 'ov:basis-full';
              else if (itemsThisRow === 2) widthClass = 'ov:basis-1/2';
              else widthClass = 'ov:basis-1/3';
              // Add right border except for last item in each row
              let borderClass = '';
              if (isFirstRow && index < itemsInFirstRow - 1) borderClass = 'ov:border-r ov:border-[var(--ov25-border-color)]';
              if (!isFirstRow && (index - 3) < itemsInSecondRow - 1) borderClass = 'ov:border-r ov:border-[var(--ov25-border-color)]';
              return (
                <div
                  key={`${option.id}-desktop-render`}
                  className={`ov:cursor-pointer ov:flex ov:justify-center ov:items-center ov:my-0 ov:border-b ov:border-[var(--ov25-border-color)] ov:data-[selected=true]:bg-[var(--ov25-text-color)] ${widthClass} ${borderClass}`}
                  onClick={() => handleOptionClick(option?.id)}
                  style={{ maxWidth: itemsThisRow === 1 ? '100%' : itemsThisRow === 2 ? '50%' : '33.333%' }}
                  data-selected={option.id === activeOptionId ? "true" : "false"}
                >
                  <div
                    className={`ov:w-full ov:text-center ov:cursor-pointer ov:my-4 ov:data-[selected=true]:text-[var(--ov25-background-color)] ov:data-[selected=false]:text-[var(--ov25-secondary-text-color)]`}
                    data-selected={option.id === activeOptionId ? "true" : "false"}
                    data-optional={option.hasNonOption ? 'true' : 'false'}
                  >
                    {capitalizeWords(option.name + ((option.hasNonOption && showOptional) ? ' (Optional)' : ''))}
                  </div>
                </div>
              );
            })}
          </div>
        )
      }
      {
        <div id="ov25-filter-container" className="ov:relative ov:w-full ov:flex ov:flex-col ov:min-h-0 ov:h-full">
          {currentOption?.name.toLowerCase() !== 'size' && <FilterControls 
            isFilterOpen={isFilterOpen}
            setIsFilterOpen={setIsFilterOpen}
            isGrouped={isGrouped && !shouldDestructureGroups}
          />}
          <div id="ov25-content-area" className="ov:relative ov:flex-1 ov:min-h-0 ov:overflow-hidden ov:h-full">
            {variantsToRender.length === 0 && (
              <NoResults />
            )}
            {((shouldDestructureGroups || !isGrouped) ? (
              <div id="ov25-desktop-variants-content-ungrouped" className={`ov:grid ov:h-full ov:overflow-y-auto ov:pb-8 ov:content-start ${getGridColsClass(gridDivide)}`}>
                <VariantsContent variantsToRender={isGrouped ? (variantsToRender as VariantGroup[])[0].variants : variantsToRender as Variant[]} VariantCard={VariantCard} isMobile={isMobile} onSelect={onSelect} />
              </div>
            ) : (
              <div id="ov25-desktop-variants-content-grouped" className="ov:h-full ov:overflow-y-auto ov:py-4">
                {(variantsToRender as VariantGroup[]).map((variantGroup) => (
                  variantGroup.variants.length > 0 && (
                    <div key={variantGroup.groupName}>
                      <div className="ov:flex ov:items-center ov:mx-4 ov:justify-between ov:border-t ov:border-gray-200 ">
                        <h3 className="ov25-group-name ov:text-lg ov:py-2 ov:text-[var(--ov25-secondary-text-color)]">{variantGroup.groupName}</h3>
                      </div>
                      <div id="ov25-variant-group-content" className={`ov:grid ${getGridColsClass(gridDivide)} ov:pb-4`}>
                        <VariantsContent variantsToRender={variantGroup.variants} VariantCard={VariantCard} isMobile={isMobile} onSelect={onSelect} />
                      </div>
                    </div>
                  )
                ))}
              </div>
            ))}
            {shouldShowFilters && (
              <div data-open={isFilterOpen} id="ov25-filter-content-wrapper-desktop" className={`ov:flex ov:justify-end ov:flex-wrap ov:overflow-y-auto ov:absolute ov:inset-0 ov:h-full ov:p-2 ov:px-4 ov:bg-[var(--ov25-background-color)] ov:transition-transform ov:duration-500 ov:ease-in-out ${isFilterOpen ? 'ov:translate-y-0' : 'ov:-translate-y-full'}`}>
                <FilterContent />
              </div>
            )}
          </div>
        </div>
      }
    </>
  );
};

export default DesktopVariants