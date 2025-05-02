import { ChevronRight } from "lucide-react"
import { ScrollArea } from "../ui/scroll-area.js"
import { Carousel, CarouselContent,  CarouselItem } from "../ui/carousel.js"
import { useState } from "react"
import * as React from 'react'
import { DefaultVariantCard } from "./variant-cards/DefaultVariantCard.js"
interface Variant {
  id: number
  groupId?: number
  optionId?: number | 'size'
  name: string
  price: number
  image: string
  blurHash: string
  data?: any
  isSelected?: boolean
}

export type DrawerSizes = 'closed' | 'small' | 'large'


interface VariantGroup {
  groupName: string
  variants: Variant[]
}

export interface VariantCardProps {
    variant: Variant
    onSelect: (variant: Variant) => void
    index: number
    isMobile: boolean
  }

interface ProductVariantsProps {
  isOpen: boolean
  onClose: () => void
  title: string
  variants: Variant[] | VariantGroup[]
  onSelect: (variant: Variant) => void
  VariantCard?: React.ComponentType<VariantCardProps>
  onAccordionChange?: () => void
  gridDivide?: number
  drawerSize?: DrawerSizes
  onNext?: () => void
  onPrevious?: () => void
  basis?: string
  isMobile: boolean
}

export const ProductVariants = ({
  isOpen,
  onClose,
  title,
  variants,
  onSelect,
  onAccordionChange,
  drawerSize,
  gridDivide = 3,
  VariantCard = DefaultVariantCard,
  basis = 'basis-[43%]',
  onNext,
  onPrevious,
  isMobile
}: ProductVariantsProps) => {
  const isGrouped = Array.isArray(variants) && variants.length > 0 && 'groupName' in variants[0]
  const isSingleGroup = isGrouped && (variants as VariantGroup[]).length === 1

  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0)
  
  // Helper function to determine grid columns class based on gridDivide prop
  const getGridColsClass = () => {
    switch (gridDivide) {
      case 2: return 'grid-cols-2';
      case 4: return 'grid-cols-4';
      case 5: return 'grid-cols-5';
      case 6: return 'grid-cols-6';
      default: return 'grid-cols-3';
    }
  };

  const renderVariantsContent = (variantsToRender: Variant[]) => {
    return (
      <>
        {variantsToRender.map((variant, index) => (
          <VariantCard
            key={`${variant.id}-${variant.isSelected ? 'selected' : 'unselected'}`}
            variant={variant}
            onSelect={onSelect}
            index={index}
            isMobile={isMobile}
          />
        ))}
      </>
    )
  };

  const renderVariantsContentWithCarousel = (variantsToRender: Variant[]) => {
    return (
      <>
        <Carousel opts={{dragFree: true, loop: false}}>
          <CarouselContent>
            {variantsToRender.map((variant, index) => (
              <CarouselItem key={`${variant.id}-${variant.isSelected ? 'selected' : 'unselected'}`} className={basis}>
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

  const renderControls = () => {
    return (
      <>
        {/* Desktop Controls: Full width button */}
        <div className="hidden xl:block">
          <button 
            onClick={onClose}
            className="flex items-center justify-between w-full border-[var(--ov25-configurator-variant-sheet-border-color)] border-b-1 p-4 py-[1.125rem]"
          >
            <div className="flex items-center gap-2 justify-center w-full relative">
              <div className="absolute w-full inset-0 h-full flex items-center">
                <ChevronRight className="rotate-180 h-4" />
              </div>
              <h3 className="text-base font-[400] z-10">{title}</h3>
            </div>
          </button>
        </div>
   
        {/* Mobile(ipad size) Controls: Title with separate chevron buttons */}
        <div className="flex xl:hidden items-center justify-between w-full p-4 py-[1.125rem]">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onPrevious?.();
            }}
            className="p-2 -m-2 hover:bg-accent rounded-full"
          >
            <ChevronRight className="rotate-180 h-4" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onNext?.();
            }}
            className="p-2 -m-2 hover:bg-accent hover:full"
          >
            <ChevronRight className="h-4" />
          </button>
        </div>
      </>
    );
  };

  const renderDesktop = () => {
    const variantsToRender = isGrouped ? (variants as VariantGroup[])[0].variants : variants as Variant[];
    return (
      <ScrollArea className={`h-[calc(100vh-150px)]`}>
        <div className={`grid px-0 ${getGridColsClass()}`}>
          {renderVariantsContent(variantsToRender)}
        </div>
      </ScrollArea>
    );
  };

  const renderMobile = () => {
    const variantsToRender = isGrouped ? (variants as VariantGroup[])[0].variants : variants as Variant[];
    if (drawerSize === 'small') {
      return renderVariantsContentWithCarousel(variantsToRender);
    }
    
    //drawerSize === large
    return (
      <ScrollArea className={`h-full`}>
        <div className={`grid px-0 pb-32 ${getGridColsClass()}`}>
          {renderVariantsContent(variantsToRender)}
        </div>
      </ScrollArea>
    );
  };

  const renderMultipleGroups = () => {
    const variantsToRender = (variants as VariantGroup[])[selectedGroupIndex].variants;
    return (
      <div className=" ">
        <Carousel opts={{dragFree: true, loop: false}}>
          <CarouselContent className="px-4 -ml-2">
            <CarouselItem key={'placeholder'} className="basis-1/3  py-2">
                <div className="w-full h-full bg-transparent"></div>
              </CarouselItem>
            {(variants as VariantGroup[]).map((group, index) => (
              <CarouselItem key={group.groupName} className="basis-1/3 py-2">
                <button
                  onClick={() => setSelectedGroupIndex(index)}
                  className={`w-full py-2 rounded-full shadow-md text-neutral-500 border  ${
                    selectedGroupIndex === index
                      ? 'border-neutral-900 text-neutral-900 '
                      : ''
                  } flex items-center justify-center text-xs gap-2 whitespace-nowrap`}
                >
                  <span>{group.groupName}</span>
                </button>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        
        {!isMobile ? (
          <div className={`grid px-2 ${getGridColsClass()} gap-4`}>
            {renderVariantsContent(variantsToRender)}
          </div>
        ) : (
          drawerSize === 'small' ? (
            renderVariantsContentWithCarousel(variantsToRender)
          ) : (
            <ScrollArea className={`heightMinusWidth`}>
              <div className={`grid px-2 pb-32 ${getGridColsClass()}`}>
                {renderVariantsContent(variantsToRender)}
              </div>
            </ScrollArea>
          )
        )}
      </div>
    );
  };
  
  return (
    <div className="xl:border mb-4 pointer-events-auto h-full rounded-[var(--ov25-configurator-variant-menu-border-radius)]  border-[var(--ov25-configurator-variant-sheet-border-color)]  ">
      {renderControls()}
      {isGrouped && !isSingleGroup ? (
        //This renders mobile or desktop, it has lots of extra css
        renderMultipleGroups()
      ) : (
        // Single group or ungrouped variants
        isMobile ? (
          renderMobile()
        ) : (
          renderDesktop()
        )
      )}
    </div>
  )
}
