import React  from 'react';
import { ProductVariants } from './ProductVariants.js';

import { useOV25UI } from "../../contexts/ov25-ui-context.js";

import { SizeVariantCard } from "./variant-cards/SizeVariantCard.js";
import { LegsVariantCard } from "./variant-cards/LegsVariantCard.js";


export type DrawerSizes = 'closed' | 'small' | 'large';

export function ProductVariantsWrapper() {
    const {
        isVariantsOpen,
        setIsVariantsOpen,
        isMobile,
        drawerSize,
        activeOptionId,
        activeOption,
        sizeOption,
        handleSelectionSelect,
        currentProductId,
        selectedSelections,
        products,
      } = useOV25UI();

    if (activeOptionId === 'size') {
      return (
        <ProductVariants
          isOpen={isVariantsOpen}
          gridDivide={2}
          onClose={() => setIsVariantsOpen(false)}
          title="Size"
          variants={sizeOption.groups[0].selections.map(selection => ({
            id: selection?.id,
            name: selection?.name,
            price: selection?.price,
            image: selection?.thumbnail || '/placeholder.svg?height=200&width=200',
            blurHash: (selection as any)?.blurHash,
            data: products?.find(p => p?.id === selection?.id),
            isSelected: selection.id === currentProductId || selectedSelections.some(
              sel => sel.optionId === 'size' && sel.selectionId === selection.id
            )
          }))}
          VariantCard={SizeVariantCard}
          drawerSize={drawerSize}
          onSelect={handleSelectionSelect}
          isMobile={isMobile}
        />
      );
    } else if (typeof activeOptionId === 'string') {
      // Check if the option name includes "leg" (case insensitive)
      const isLegOption = activeOption?.name?.toLowerCase().includes('leg');
      
      // Handle all non-size options the same way, but use LegsVariantCard when appropriate
      return (
        <ProductVariants
          isOpen={isVariantsOpen}
          basis={isMobile ? 'ov:basis-[33%]' : undefined}
          gridDivide={isLegOption ? 2 : (isMobile ? 4 : 4)}
          onClose={() => setIsVariantsOpen(false)}
          title={`${activeOption?.name || ''}`}
          variants={activeOption?.groups?.map(group => ({
            groupName: group?.name,
            variants: group?.selections?.map(selection => ({
              id: selection?.id,
              groupId: group?.id,
              optionId: activeOption?.id,
              name: selection?.name,
              price: selection?.price,
              image: (isLegOption ? selection?.miniThumbnails?.large : selection?.miniThumbnails?.medium) || '/placeholder.svg?height=200&width=200',
              blurHash: (selection as any).blurHash,
              isSelected: selectedSelections.some(
                sel => sel.optionId === activeOption.id && 
                      sel.groupId === group.id && 
                      sel.selectionId === selection.id
              )
            })).sort((a, b) => a.name.localeCompare(b.name))
          })) || []}
          VariantCard={isLegOption ? LegsVariantCard : undefined}
          drawerSize={drawerSize}
          onSelect={handleSelectionSelect}
          isMobile={isMobile}
        />
      );
    }
    
    return null;
  }