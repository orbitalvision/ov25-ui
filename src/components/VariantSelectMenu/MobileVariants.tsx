import * as React from 'react'
import { useState,  useMemo } from "react";
import { Variant, VariantCardProps, VariantGroup } from "./ProductVariants.js";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel.js"
import { capitalizeWords, getGridColsClass } from './DesktopVariants.js';
import { useOV25UI } from '../../contexts/ov25-ui-context.js';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { VariantsContent } from './VariantsContent.js';

const VariantsContentWithCarousel = ({ variantsToRender, VariantCard, onSelect, isMobile }: { variantsToRender: Variant[], VariantCard: React.ComponentType<VariantCardProps>, onSelect: (variant: Variant) => void, isMobile: boolean }) => {
    return (
      <>
        <Carousel opts={{ dragFree: true, loop: false }}>
          <CarouselContent>
            {variantsToRender.map((variant, index) => (
              <CarouselItem key={`${variant.id}-${variant.isSelected ? 'selected' : 'unselected'}`} className={'basis-1/3'}>
                <VariantCard
                  variant={variant}
                  onSelect={onSelect}
                  index={index}
                  isMobile={isMobile}
                />
              </CarouselItem>
            ))}
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
            <CarouselContent className="px-4 -ml-2">
              <CarouselItem key={'placeholder'} className="basis-1/3  py-2">
                <div className="w-full h-full bg-transparent"></div>
              </CarouselItem>
              {(variants as VariantGroup[]).map((group, index) => (
                <CarouselItem key={group.groupName} className="basis-1/3 py-2">
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
            <ScrollArea className={`heightMinusWidth`}>
              <div style={{ display: 'grid' }} className={` px-2 pb-32 ${getGridColsClass(gridDivide)}`}>
                <VariantsContent variantsToRender={variantsToRender} VariantCard={VariantCard} isMobile={isMobile} onSelect={onSelect} />
              </div>
            </ScrollArea>
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
          <ScrollArea className={`h-full`}>
            <div style={{ display: 'grid' }} className={` px-0 pb-32 ${getGridColsClass(gridDivide)}`}>
              <VariantsContent variantsToRender={variantsToRender} VariantCard={VariantCard} isMobile={isMobile} onSelect={onSelect} />
            </div>
          </ScrollArea>
        );
      }
    }
  });