import { Variant, VariantCardProps } from "./ProductVariants.js";
import { DefaultVariantCard } from "./variant-cards/DefaultVariantCard.js"
import * as React from 'react'

export const VariantsContent = ({ variantsToRender, VariantCard = DefaultVariantCard, isMobile, onSelect }
    : { variantsToRender: Variant[], 
        VariantCard: React.ComponentType<VariantCardProps>,
        isMobile: boolean,
        onSelect: (variant: Variant) => void
    }) => {
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
