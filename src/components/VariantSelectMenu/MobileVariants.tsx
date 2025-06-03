import * as React from 'react'
import { useState,  useMemo } from "react";
import { Variant, VariantCardProps, VariantGroup } from "./ProductVariants.js";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel.js"
import { capitalizeWords, getGridColsClass } from './DesktopVariants.js';
import { useOV25UI } from '../../contexts/ov25-ui-context.js';
import { VariantsContent } from './VariantsContent.js';

const VariantsContentWithCarousel = ({ variantsToRender, VariantCard, onSelect, isMobile, isGrouped = false }: { variantsToRender: Variant[], VariantCard: React.ComponentType<VariantCardProps>, onSelect: (variant: Variant) => void, isMobile: boolean, isGrouped: boolean }) => {
    const {allOptions, activeOptionId} = useOV25UI()
    const activeOption = allOptions.find((option) => option.id === activeOptionId)
    const activeOptionName = activeOption?.name ?? ''
    return (
      <>
        <Carousel opts={{ dragFree: true, loop: false }}>
          <CarouselContent>
            <CarouselItem key={`spacer`} style={{flexBasis: `9%`}} className="ov:cursor-pointer">

                </CarouselItem>
            {variantsToRender.map((variant, index) => {
              const basis =   Math.min(variantsToRender.length, activeOptionName === 'size' ? 2  : false ? 3 : 5);
              const flexBasis = {
                1: '100%',
                2: '50%',
                3: '33.333%',
                4: '25%',
                5: '20%'
              }[basis];
              return (
                <CarouselItem key={`${variant.id}-${variant.isSelected ? 'selected' : 'unselected'}`} style={{flexBasis}}   className="ov:cursor-pointer">
                  <VariantCard
                    variant={variant}
                    onSelect={onSelect}
                    index={index}
                    isMobile={isMobile}
                    isGrouped={isGrouped}
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
        <div className="ov:">
          <Carousel opts={{ dragFree: true, loop: false }}>
            <CarouselContent className="ov:px-4 ov:-ml-2 ov:pr-4">
              <CarouselItem key={'placeholder'} className="ov:basis-[37%] ov:py-2">
                <div className="ov:w-full ov:h-full ov:bg-transparent"></div>
              </CarouselItem>
              {(variants as VariantGroup[]).map((group, index) => (
                <CarouselItem key={group.groupName} className="ov:basis-1/4 ov:py-2">
                  <button
                    onClick={() => setSelectedGroupIndex(index)}
                    className={`ov25-group-control ov:w-full ov:py-2 ov:rounded-full ov:shadow-md ov:text-neutral-500 ov:border ${selectedGroupIndex === index
                      ? 'ov:border-neutral-900 ov:text-neutral-900'
                      : ''
                      } ov:flex ov:items-center ov:justify-center ov:text-xs ov:gap-2 ov:whitespace-nowrap`}
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
              isGrouped={isGrouped && !shouldDestructureGroups}
            />
          ) : (
            <div id="ov25-mobile-variants-content" className='ov:h-full ov:max-h-full ov:overflow-y-scroll'>
              <div style={{ display: 'grid' }} className={`ov:px-2 ov:pb-32 ${getGridColsClass(gridDivide)}`}>
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
          isGrouped={isGrouped && !shouldDestructureGroups}
        />
      } else {
        return (
            <div id="ov25-mobile-variants-content" className='ov:h-full ov:max-h-full ov:overflow-y-scroll'>
            <div style={{ display: 'grid' }} className={`ov:px-0 ov:pb-32 ov:gap-2 ${getGridColsClass(gridDivide)}`}>
              <VariantsContent variantsToRender={variantsToRender} VariantCard={VariantCard} isMobile={isMobile} onSelect={onSelect} />
            </div>
          </div>
        );
      }
    }
  });