import {  Check } from "lucide-react"
import { ChevronRight } from "lucide-react"
import { ScrollArea } from "./ui/scroll-area"
import { Carousel, CarouselContent,  CarouselItem } from "./ui/carousel"
import { useState } from "react"
import { useMediaQuery } from "../hooks/use-media-query"
import * as React from 'react'
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
  VariantCard = FallbackVariantCard,
  basis = 'basis-[43%]',
  onNext,
  onPrevious
}: ProductVariantsProps) => {
  const isGrouped = Array.isArray(variants) && variants.length > 0 && 'groupName' in variants[0]
  const isSingleGroup = isGrouped && (variants as VariantGroup[]).length === 1
  const isMobile = useMediaQuery(1280)

  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0)

  return (
    <div className="xl:border mt-8 mb-4 pointer-events-auto  border-[#E5E5E5] bg-white ">
      {/* Desktop: Full width button */}
      <div className="hidden xl:block">
        <button 
          onClick={onClose}
          className="flex items-center justify-between w-full border-b xl:border-b-0 p-4 py-[1.125rem] xl:hover:bg-accent"
        >
          <div className="flex items-center gap-2 justify-center w-full relative">
            <div className="absolute w-full inset-0 h-full flex items-center">
              <ChevronRight className="rotate-180 h-4" />
            </div>
            <h3 className="text-base font-[400] z-10">{title}</h3>
          </div>
        </button>
      </div>

      {/* Mobile: Title with separate chevron buttons */}
      <div className="flex xl:hidden items-center justify-between w-full border-b p-4 py-[1.125rem]">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onPrevious?.();
          }}
          className="p-2 -m-2 hover:bg-accent rounded-full"
        >
          <ChevronRight className="rotate-180 h-4" />
        </button>
        <h3 className="text-base font-[400] z-10">{title}</h3>
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

      {isGrouped && !isSingleGroup ? (
          // Multiple groups - show carousel of group selectors
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
              <div className={`grid px-2 grid-cols-${gridDivide} gap-4`}>
                {(variants as VariantGroup[])[selectedGroupIndex].variants.map(
                  (variant, index) => (
                    <VariantCard
                      key={variant.id}
                      variant={variant}
                      onSelect={onSelect}
                      index={index}
                      isMobile={isMobile}
                    />
                  )
                )}
              </div>
            ) : (
              drawerSize === 'small' ? (
                <Carousel opts={{dragFree: true, loop: false}}>
                  <CarouselContent className='ml-16'>    
                    {(variants as VariantGroup[])[selectedGroupIndex].variants.map((variant, index) => (
                      <CarouselItem key={variant.id} className={basis}>
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
              ) : (
                <ScrollArea className={`heightMinusWidth`}>
                  <div className={`grid px-2  pb-32 grid-cols-${gridDivide}`}>
                    {(variants as VariantGroup[])[selectedGroupIndex].variants.map((variant, index) => (
                      <VariantCard
                        key={variant.id}
                        variant={variant}
                        onSelect={onSelect}
                        index={index}
                        isMobile={isMobile}
                      />
                    ))}
                  </div>
                </ScrollArea>
              )
            )}
          </div>
        ) : (
          // Single group or ungrouped variants
          !isMobile ? (
          <div className={`grid px-0 grid-cols-${gridDivide}`}>
            {(isGrouped ? (variants as VariantGroup[])[0].variants : variants as Variant[]).map((variant, index) => (
              <VariantCard
                key={variant.id}
                variant={variant}
                onSelect={onSelect}
                index={index}
                isMobile={isMobile}
              />
            ))}
          </div>
          ) : (
            drawerSize === 'small' ? (
                <Carousel opts={{dragFree: true, loop: false}} >
                <CarouselContent className='ml-16'>    
                {(isGrouped ? (variants as VariantGroup[])[0].variants : variants as Variant[]).map((variant, index) => (
                    <CarouselItem className={basis}>
                <VariantCard
                    key={variant.id}
                    variant={variant}
                    onSelect={onSelect}
                    index={index}
                    isMobile={isMobile}
                />
                </CarouselItem>
                ))}
                </CarouselContent>
                </Carousel>
            ) : (
                <ScrollArea className={`heightMinusWidth`}>
                <div className={`grid px-0 pb-32 grid-cols-${gridDivide}`}>
                {(isGrouped ? (variants as VariantGroup[])[0].variants : variants as Variant[]).map((variant, index) => (
                <VariantCard
                    key={variant.id}
                    variant={variant}
                    onSelect={onSelect}
                    index={index}
                    isMobile={isMobile}
                />
                ))}
                </div>
              </ScrollArea>
            )
          )
        )}
    </div>
  )
}





const FallbackVariantCard = ({ variant, onSelect, index, isMobile }: VariantCardProps) => {
  return (
    <button
      onClick={() => onSelect(variant)}
      className="relative flex flex-col items-center gap-4 w-full p-2  bg-white text-left  hover:bg-accent"
    >
        <div className="relative aspect-[65/47] w-full pt-2 overflow-hidden rounded-none bg-transparent">
      

          <img src={variant.image || "/placeholder.svg"} alt={variant.name} className="object-cover w-full h-full" width={100} height={100} />


            {variant.isSelected && (
            <div className="absolute inset-0 bg-transparent">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-6 h-6 rounded-full bg-black/50 mt-1.5 flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center xl:justify-start items-center xl:items-start -mt-1 pb-2 w-full xl:px-3">
          <h3 className="font-[350] text-[12px]">{variant.name}</h3>
        </div>
    </button>
  )
}
