import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { AccordionTrigger } from './AccordionTrigger.js';
import { VariantsContent } from './VariantsContent.js';
import { GroupedVariantsList } from './GroupedVariantsList.js';
import { SizeVariantCard } from './variant-cards/SizeVariantCard.js';
import { DefaultVariantCard } from './variant-cards/DefaultVariantCard.js';
import { useOV25UI } from '../../contexts/ov25-ui-context.js';
import { Variant } from './ProductVariants.js';
import { getGridColsClass } from './DesktopVariants.js';
import { FilterControls } from './FilterControls.js';
import { FilterContent } from './FilterContent.js';

const capitalizeWords = (str: string) =>
  str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

export type AccordionVariantsMode = 'inline' | 'drawer';

export interface AccordionVariantsProps {
  mode: AccordionVariantsMode;
}

export const AccordionVariants: React.FC<AccordionVariantsProps> = ({ mode }) => {
  const {
    sizeOption,
    handleSelectionSelect,
    currentProductId,
    selectedSelections,
    products,
    allOptionsWithoutModules,
    applySearchAndFilters,
    searchQueries,
    availableProductFilters,
    isMobile,
    isVariantsOpen,
    setActiveOptionId,
    expandToOptionIdOnOpen,
  } = useOV25UI();

  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState<Record<string, boolean>>({});

  const toggleFilter = useCallback((optionId: string) => {
    setIsFilterOpen(prev => ({ ...prev, [optionId]: !prev[optionId] }));
  }, []);


  const handleVariantSelect = useCallback((variant: Variant) => {
    const selection = {
      id: variant.id,
      name: variant.name,
      price: variant.price,
      blurHash: variant.blurHash || '',
      groupId: variant.groupId,
      thumbnail: variant.image,
      miniThumbnails: variant.image ? { medium: variant.image } : undefined,
    };
    handleSelectionSelect(selection as any, variant.optionId);
  }, [handleSelectionSelect]);

  const filteredOptions = useMemo(() => {
    return allOptionsWithoutModules.map(option => {
      if (option.id === 'size') return option;
      return applySearchAndFilters(option, option.id);
    });
  }, [allOptionsWithoutModules, applySearchAndFilters, searchQueries, availableProductFilters]);

  const sizeVariants = useMemo(() => {
    if (!sizeOption?.groups?.[0]?.selections) return [];
    return sizeOption.groups[0].selections.map(selection => ({
      id: selection?.id,
      optionId: 'size',
      name: selection?.name,
      price: selection?.price,
      image: selection?.thumbnail || '/placeholder.svg?height=200&width=200',
      blurHash: (selection as any)?.blurHash,
      data: products?.find(p => p?.id === selection?.id),
      isSelected: selection.id === currentProductId || selectedSelections.some(
        sel => sel.optionId === 'size' && sel.selectionId === selection.id
      )
    }));
  }, [sizeOption, currentProductId, selectedSelections, products]);

  const allOptionsVariants = useMemo(() => {
    return filteredOptions
      .map((filteredOption, index) => {
        const option = allOptionsWithoutModules[index];
        if (option.id === 'size') return null;
        return {
          optionId: option.id,
          optionName: option.name,
          variants: filteredOption.groups
            ?.filter(group => 'name' in group && group.name)
            ?.map(group => ({
              groupName: 'name' in group ? group.name : 'Default Group',
              variants: group?.selections?.map(selection => ({
                id: selection?.id,
                groupId: group?.id,
                optionId: option.id,
                name: selection?.name,
                price: selection?.price,
                image: (selection as any)?.miniThumbnails?.medium || '/placeholder.svg?height=200&width=200',
                blurHash: (selection as any).blurHash,
                isSelected: selectedSelections.some(
                  sel => sel.optionId === option.id &&
                    sel.groupId === group.id &&
                    sel.selectionId === selection.id
                ),
                swatch: (selection as any)?.swatch
              })).sort((a, b) => a.name.localeCompare(b.name))
            })) || []
        };
      })
      .filter((item): item is { optionId: string; optionName: string; variants: any[] } => item !== null);
  }, [filteredOptions, allOptionsWithoutModules, selectedSelections]);

  const showSize = allOptionsWithoutModules.some((o) => o.id === 'size') && sizeVariants.length > 0;

  const tabIds = useMemo(() => {
    return showSize ? ['size', ...allOptionsVariants.map((o) => o.optionId)] : allOptionsVariants.map((o) => o.optionId);
  }, [showSize, allOptionsVariants]);

  const prevOpenRef = React.useRef(false);
  useEffect(() => {
    const justOpened = isVariantsOpen && !prevOpenRef.current;
    prevOpenRef.current = isVariantsOpen;
    if (justOpened) {
      setExpandedAccordion(expandToOptionIdOnOpen && tabIds.includes(expandToOptionIdOnOpen) ? expandToOptionIdOnOpen : null);
    }
  }, [isVariantsOpen, expandToOptionIdOnOpen, tabIds]);

  const handleAccordionClick = useCallback((optionId: string) => {
    const next = expandedAccordion === optionId ? null : optionId;
    setExpandedAccordion(next);
    setActiveOptionId(next);
  }, [expandedAccordion, setActiveOptionId]);

  return (
    <div
      data-ov25-accordion-variants-mode={mode}
      className="ov25-accordion-variants-container ov:flex ov:flex-col ov:min-h-0 ov:h-full ov:overflow-hidden  ov:pb-0"
    >
      {showSize && (
        <>
          <AccordionTrigger
            label={capitalizeWords('Size')}
            isExpanded={expandedAccordion === 'size'}
            onClick={() => handleAccordionClick('size')}
          />
          {expandedAccordion === 'size' && (
            <div className={`ov:min-h-0 ov:max-h-full ov:overflow-y-auto  ov:pt-4 ov:pb-4 ${mode === 'drawer' && isMobile ? 'ov:pb-20' : ''}`}>
              <div className={`ov:grid ${getGridColsClass(2)}`}>
                <VariantsContent
                  variantsToRender={sizeVariants}
                  VariantCard={SizeVariantCard}
                  isMobile={isMobile}
                  onSelect={handleVariantSelect}
                />
              </div>
            </div>
          )}
        </>
      )}
      {allOptionsVariants.map(({ optionId, optionName, variants }) => {
        const isExpanded = expandedAccordion === optionId;
        return (
          <React.Fragment key={optionId}>
            <AccordionTrigger
              label={capitalizeWords(optionName)}
              isExpanded={isExpanded}
              onClick={() => handleAccordionClick(optionId)}
            />
            {isExpanded && (
              <div className="ov:relative ov:min-h-0 ov:max-h-full ov:flex ov:flex-col">
                  <FilterControls
                    isFilterOpen={!!isFilterOpen[optionId]}
                    setIsFilterOpen={() => toggleFilter(optionId)}
                    isGrouped={false}
                    optionId={optionId}
                  />
                <div className="ov:relative ov:min-h-0 ov:flex-1 ov:flex ov:flex-col ov:pb-4">
                  <div className={`ov:min-h-0 ov:flex-1 ${mode === 'drawer' && isMobile ? 'ov:pb-20' : ''} ${isFilterOpen[optionId] ? 'ov:overflow-hidden' : 'ov:overflow-y-auto'}`}>
                    <GroupedVariantsList
                      groups={variants}
                      gridColsClass={getGridColsClass(4)}
                      VariantCard={DefaultVariantCard}
                      isMobile={isMobile}
                      onSelect={handleVariantSelect}
                      showGroupHeaders={variants.length > 1}
                      compactSpacing
                    />
                  </div>
                  {isFilterOpen[optionId] && (
                    <FilterContent optionId={optionId} wrapperVariant="accordion" />
                  )}
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
