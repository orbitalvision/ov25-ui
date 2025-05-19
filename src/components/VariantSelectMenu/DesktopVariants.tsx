import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel.js"
import * as React from 'react'
import { useOV25UI } from "../../contexts/ov25-ui-context.js"
import { VariantsContent } from "./VariantsContent.js";
import { Variant, VariantCardProps, VariantGroup } from "./ProductVariants.js";

export const getGridColsClass = (gridDivide: number) => {
  switch (gridDivide) {
    case 2: return 'orbitalvision:grid-cols-2!';
    case 4: return 'orbitalvision:grid-cols-4!';
    case 5: return 'orbitalvision:grid-cols-5!';
    case 6: return 'orbitalvision:grid-cols-6!';
    default: return 'orbitalvision:grid-cols-3!';
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
          <CarouselContent className="orbitalvision:divide-x orbitalvision:divide-[var(--ov25-border-color)] orbitalvision:border-b orbitalvision:border-[var(--ov25-border-color)]">
            {allOptions.map((option, index) => {
              const isSelected = option.id === activeOptionId;
              const basis = Math.min(allOptions.length, 4);
              const flexBasis = {
                2: '50%',
                3: '33.333%',
                4: '25%'
              }[basis];
              return (
                <CarouselItem key={`${option.id}-desktop-render`} style={{ flexBasis }} className={`orbitalvision:cursor-pointer orbitalvision:pr-4 orbitalvision:flex orbitalvision:justify-center orbitalvision:items-center`} onClick={() => handleOptionClick(option?.id)}>
                  <div className={`orbitalvision:cursor-pointer orbitalvision:my-4 ${isSelected ? 'orbitalvision:text-[var(--ov25-primary-color)]' : 'orbitalvision:text-[var(--ov25-secondary-text-color)]'}`}  >{capitalizeWords(option.name)}</div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
      }

      {(shouldDestructureGroups || !isGrouped) ? (<>

        <div className={`orbitalvision:max-h-full orbitalvision:overflow-auto orbitalvision:pb-8 orbitalvision:grid ${getGridColsClass(gridDivide)}`}>
          <VariantsContent variantsToRender={isGrouped ? (variantsToRender as VariantGroup[])[0].variants : variantsToRender as Variant[]} VariantCard={VariantCard} isMobile={isMobile} onSelect={onSelect} />
        </div></>
      ) : (
        (variantsToRender as VariantGroup[]).map((variantGroup) => (
          <div key={variantGroup.groupName} className={`orbitalvision:pt-4 orbitalvision:pb-8 orbitalvision:max-h-full orbitalvision:overflow-auto`}>
            <div className="orbitalvision:flex orbitalvision:items-center orbitalvision:mx-4 orbitalvision:justify-between">
              <h3 className="orbitalvision:text-lg orbitalvision:text-[var(--ov25-secondary-text-color)]">{variantGroup.groupName}</h3>
            </div>
            <div className={`orbitalvision:grid ${getGridColsClass(gridDivide)}`}>
              <VariantsContent variantsToRender={variantGroup.variants} VariantCard={VariantCard} isMobile={isMobile} onSelect={onSelect} />
            </div>
          </div>
        ))
      )}
    </>
  );
};

export default DesktopVariants