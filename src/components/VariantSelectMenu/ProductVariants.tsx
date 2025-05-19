import * as React from 'react'
import { DefaultVariantCard } from "./variant-cards/DefaultVariantCard.js"
import { cn } from "../../lib/utils.js"
import { VariantsHeader } from "./VariantsHeader.js"
import { CheckoutButton } from "./CheckoutButton.js"
import DesktopVariants from "./DesktopVariants.js"
import { MobileVariants } from "./MobileVariants.js"

export interface Variant {
  id: string
  groupId?: string
  optionId?: string
  name: string
  price: number
  image: string
  blurHash: string
  data?: any
  isSelected?: boolean
}

export type DrawerSizes = 'closed' | 'small' | 'large'


export interface VariantGroup {
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
  variants,
  onSelect,
  drawerSize,
  gridDivide = 3,
  VariantCard = DefaultVariantCard,
  basis = 'basis-[43%]',
  isMobile,
}: ProductVariantsProps) => {

  return (
    <div className={cn(
      'md:flex md:flex-col mb-4 max-h-full h-full ',
      'md:bg-[var(--ov25-background-color)]',
      'xl:border-[var(--ov25-border-color)]',
      'w-full'
    )}>
      <VariantsHeader />
      {isMobile ? (
        <MobileVariants 
          variants={variants}
          VariantCard={VariantCard}
          isMobile={isMobile}
          onSelect={onSelect}
          gridDivide={gridDivide}
        />
      ) : (
        <DesktopVariants 
          variants={variants}
          VariantCard={VariantCard}
          isMobile={isMobile}
          onSelect={onSelect}
          gridDivide={gridDivide}
        />
      )}
      {!isMobile ? <CheckoutButton /> : null}
    </div>
  )
}
