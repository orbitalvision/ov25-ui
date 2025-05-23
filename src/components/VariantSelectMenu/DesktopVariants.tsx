import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel.js"
import * as React from 'react'
import { useOV25UI } from "../../contexts/ov25-ui-context.js"
import { VariantsContent } from "./VariantsContent.js";
import { Variant, VariantCardProps, VariantGroup } from "./ProductVariants.js";

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
    gridDivide: number,

  }) => {

  const isGrouped = Array.isArray(variants) && variants.length > 0 && 'groupName' in variants[0]
  const shouldDestructureGroups = isGrouped && variants.length < 2 && (variants as VariantGroup[])[0].groupName === 'Default Group'

  const variantsToRender = isGrouped ? (variants as VariantGroup[]) : variants as Variant[];
  const {
    allOptions,
    handleOptionClick,
    activeOptionId
  } = useOV25UI();


  return (
    <>
      {
        allOptions.length > 1 && <Carousel opts={{ dragFree: true, loop: false }}>
          <CarouselContent className="ov:divide-x ov:divide-[var(--ov25-border-color)] ov:border-b ov:border-[var(--ov25-border-color)]">
            {allOptions.map((option, index) => {
              const isSelected = option.id === activeOptionId;
              const basis = Math.min(allOptions.length, 4);
              const flexBasis = {
                2: '50%',
                3: '33.333%',
                4: '25%'
              }[basis];
              return (
                <CarouselItem key={`${option.id}-desktop-render`} style={{ flexBasis }} className={`ov:cursor-pointer ov:pr-4 ov:flex ov:justify-center ov:items-center`} onClick={() => handleOptionClick(option?.id)}>
                  <div className={`ov:cursor-pointer ov:my-4 ${isSelected ? 'ov:text-[var(--ov25-primary-color)]' : 'ov:text-[var(--ov25-secondary-text-color)]'}`}  >{capitalizeWords(option.name)}</div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
      }

      {(shouldDestructureGroups || !isGrouped) ? (<>

        <div className={`ov:max-h-full ov:overflow-auto ov:pb-8 ov:grid ${getGridColsClass(gridDivide)}`}>
          <VariantsContent variantsToRender={isGrouped ? (variantsToRender as VariantGroup[])[0].variants : variantsToRender as Variant[]} VariantCard={VariantCard} isMobile={isMobile} onSelect={onSelect} />
        </div></>
      ) : (
        (variantsToRender as VariantGroup[]).map((variantGroup) => (
          <div key={variantGroup.groupName} className={`ov:pt-4 ov:pb-8 ov:max-h-full ov:overflow-auto`}>
            <div className="ov:flex ov:items-center ov:mx-4 ov:justify-between">
              <h3 className="ov:text-lg ov:text-[var(--ov25-secondary-text-color)]">{variantGroup.groupName}</h3>
            </div>
            <div className={`ov:grid ${getGridColsClass(gridDivide)}`}>
              <VariantsContent variantsToRender={variantGroup.variants} VariantCard={VariantCard} isMobile={isMobile} onSelect={onSelect} />
            </div>
          </div>
        ))
      )}
    </>
  );
};

export default DesktopVariants