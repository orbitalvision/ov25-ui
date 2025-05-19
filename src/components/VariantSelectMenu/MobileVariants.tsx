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
            <CarouselItem key={`spacer`} style={{flexBasis: `9%`}} className="orbitalvision:cursor-pointer">

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
                <CarouselItem key={`${variant.id}-${variant.isSelected ? 'selected' : 'unselected'}`} style={{flexBasis}}   className="orbitalvision:cursor-pointer">
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
        <div className="orbitalvision:">
          <Carousel opts={{ dragFree: true, loop: false }}>
            <CarouselContent className="orbitalvision:px-4 orbitalvision:-ml-2 orbitalvision:pr-4">
              <CarouselItem key={'placeholder'} className="orbitalvision:basis-[37%] orbitalvision:py-2">
                <div className="orbitalvision:w-full orbitalvision:h-full orbitalvision:bg-transparent"></div>
              </CarouselItem>
              {(variants as VariantGroup[]).map((group, index) => (
                <CarouselItem key={group.groupName} className="orbitalvision:basis-1/4 orbitalvision:py-2">
                  <button
                    onClick={() => setSelectedGroupIndex(index)}
                    className={`orbitalvision:w-full orbitalvision:py-2 orbitalvision:rounded-full orbitalvision:shadow-md orbitalvision:text-neutral-500 orbitalvision:border ${selectedGroupIndex === index
                      ? 'orbitalvision:border-neutral-900 orbitalvision:text-neutral-900'
                      : ''
                      } orbitalvision:flex orbitalvision:items-center orbitalvision:justify-center orbitalvision:text-xs orbitalvision:gap-2 orbitalvision:whitespace-nowrap`}
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
            <div className='orbitalvision:h-full orbitalvision:max-h-full orbitalvision:overflow-y-scroll'>
              <div style={{ display: 'grid' }} className={`orbitalvision:px-2 orbitalvision:pb-32 ${getGridColsClass(gridDivide)}`}>
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
            <div className='orbitalvision:h-full orbitalvision:max-h-full orbitalvision:overflow-y-scroll'>
            <div style={{ display: 'grid' }} className={`orbitalvision:px-0 orbitalvision:pb-32 ${getGridColsClass(gridDivide)}`}>
              <VariantsContent variantsToRender={variantsToRender} VariantCard={VariantCard} isMobile={isMobile} onSelect={onSelect} />
            </div>
          </div>
        );
      }
    }
  });