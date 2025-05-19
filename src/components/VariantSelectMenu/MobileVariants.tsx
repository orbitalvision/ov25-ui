import * as React from 'react'
import { useState,  useMemo } from "react";
import { Variant, VariantCardProps, VariantGroup } from "./ProductVariants.js";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel.js"
import { capitalizeWords, getGridColsClass } from './DesktopVariants.js';
import { useOV25UI } from '../../contexts/ov25-ui-context.js';
import { VariantsContent } from './VariantsContent.js';

const VariantsContentWithCarousel = ({ variantsToRender, VariantCard, onSelect, isMobile }: { variantsToRender: Variant[], VariantCard: React.ComponentType<VariantCardProps>, onSelect: (variant: Variant) => void, isMobile: boolean }) => {
    const {allOptions, activeOptionId} = useOV25UI()
    const activeOption = allOptions.find((option) => option.id === activeOptionId)
    const activeOptionName = activeOption?.name ?? ''
    return (
      <>
        <Carousel opts={{ dragFree: true, loop: false }}>
          <CarouselContent>
            <CarouselItem key={`spacer`} style={{flexBasis: `9%`}} className="cursor-pointer">

                </CarouselItem>
            {variantsToRender.map((variant, index) => {
              const basis =   Math.min(variantsToRender.length, activeOptionName === 'size' ? 2  : activeOptionName === 'Legs' ? 3 : 5);
              const flexBasis = {
                1: '100%',
                2: '50%',
                3: '33.333%',
                4: '25%',
                5: '20%'
              }[basis];
              return (
                <CarouselItem key={`${variant.id}-${variant.isSelected ? 'selected' : 'unselected'}`} style={{flexBasis}}   className="cursor-pointer">
                  <VariantCard
                    variant={variant}
                    onSelect={onSelect}
                    index={index}
                    isMobile={isMobile}
                  />
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
      </>
    )
  };


export const MobileVariants = React.memo(({variants, VariantCard, isMobile, onSelect, gridDivide} 
    : {
        variants: VariantGroup[] | Variant[], 
        VariantCard: React.ComponentType<VariantCardProps>,
        isMobile: boolean,
        onSelect: (variant: Variant) => void
        gridDivide: number,
    }) => {
    const [selectedGroupIndex, setSelectedGroupIndex] = useState(0)


    const isGrouped = Array.isArray(variants) && variants.length > 0 && 'groupName' in variants[0]
    const shouldDestructureGroups = isGrouped && variants.length < 2 

    const variantsToRender = useMemo(() => 
        isGrouped ? (variants as VariantGroup[])[0].variants : variants as Variant[],
        [isGrouped, variants]
    );



    const {
        drawerSize
      } = useOV25UI();

    if (isGrouped && !shouldDestructureGroups) {
      const variantsToRender = (variants as VariantGroup[])[selectedGroupIndex].variants;
      return (
        <div className=" ">
          <Carousel opts={{ dragFree: true, loop: false }}>
            <CarouselContent className="px-4 -ml-2 pr-4">
              <CarouselItem key={'placeholder'} className="basis-[37%]  py-2">
                <div className="w-full h-full bg-transparent"></div>
              </CarouselItem>
              {(variants as VariantGroup[]).map((group, index) => (
                <CarouselItem key={group.groupName} className="basis-1/4 py-2">
                  <button
                    onClick={() => setSelectedGroupIndex(index)}
                    className={`w-full py-2 rounded-full shadow-md text-neutral-500 border  ${selectedGroupIndex === index
                      ? 'border-neutral-900 text-neutral-900 '
                      : ''
                      } flex items-center justify-center text-xs gap-2 whitespace-nowrap`}
                  >
                    <span>{capitalizeWords(group.groupName)}</span>
                  </button>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {drawerSize === 'small' ? (
            <VariantsContentWithCarousel 
              variantsToRender={variantsToRender}
              VariantCard={VariantCard}
              onSelect={onSelect}
              isMobile={isMobile}
            />
          ) : (
            <div className='h-full max-h-full overflow-y-scroll'>
              <div style={{ display: 'grid' }} className={` px-2 pb-32 ${getGridColsClass(gridDivide)}`}>
                <VariantsContent variantsToRender={variantsToRender} VariantCard={VariantCard} isMobile={isMobile} onSelect={onSelect} />
              </div>
            </div>
          )
          }
        </div>
      );
    } else {
      if (drawerSize === 'small') {
        return <VariantsContentWithCarousel 
          variantsToRender={variantsToRender}
          VariantCard={VariantCard}
          onSelect={onSelect}
          isMobile={isMobile}
        />
      } else {
        return (
            <div className='h-full max-h-full overflow-y-scroll'>
            <div style={{ display: 'grid' }} className={` px-0 pb-32 ${getGridColsClass(gridDivide)}`}>
              <VariantsContent variantsToRender={variantsToRender} VariantCard={VariantCard} isMobile={isMobile} onSelect={onSelect} />
            </div>
          </div>
        );
      }
    }
  });