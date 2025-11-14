import { Variant, VariantCardProps } from "./ProductVariants.js";
import { DefaultVariantCard } from "./variant-cards/DefaultVariantCard.js"
import * as React from 'react'

export const VariantsContent = ({ variantsToRender, VariantCard = DefaultVariantCard, isMobile, onSelect, showImage, showDimensions }
    : { variantsToRender: Variant[], 
        VariantCard: React.ComponentType<VariantCardProps>,
        isMobile: boolean,
        onSelect: (variant: Variant) => void,
        showImage?: boolean,
        showDimensions?: boolean
    }) => {
    return (
      <>
        {variantsToRender.map((variant, index) => {
          const cardProps: any = {
            key: variant.id + (variant.groupId || '') + (variant.optionId || ''),
            variant,
            onSelect,
            index,
            isMobile
          };
          
          if (showImage !== undefined) cardProps.showImage = showImage;
          if (showDimensions !== undefined) cardProps.showDimensions = showDimensions;
          
          return <VariantCard {...cardProps} />;
        })}
      </>
    )
  };
