import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { TreeTrigger } from './TreeTrigger.js';
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

export type TreeVariantsMode = 'inline' | 'drawer';

export interface TreeVariantsProps {
  mode: TreeVariantsMode;
}

export const TreeVariants: React.FC<TreeVariantsProps> = ({ mode }) => {
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

  const [currentView, setCurrentView] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState<Record<string, boolean>>({});

  const toggleFilter = useCallback((optionId: string) => {
    setIsFilterOpen(prev => ({ ...prev, [optionId]: !prev[optionId] }));
  }, []);

  const handleTreeClick = useCallback((optionId: string) => {
    setCurrentView(optionId);
    setActiveOptionId(optionId);
  }, [setActiveOptionId]);

  const handleBack = useCallback(() => {
    setCurrentView(null);
    setActiveOptionId(null);
  }, [setActiveOptionId]);

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

  const validOptionIds = useMemo(() => {
    const ids = allOptionsVariants.map((o) => o.optionId);
    return showSize ? ['size', ...ids] : ids;
  }, [showSize, allOptionsVariants]);

  const prevOpenRef = React.useRef(false);
  useEffect(() => {
    const justOpened = isVariantsOpen && !prevOpenRef.current;
    prevOpenRef.current = isVariantsOpen;
    if (justOpened) {
      setCurrentView(expandToOptionIdOnOpen && validOptionIds.includes(expandToOptionIdOnOpen) ? expandToOptionIdOnOpen : null);
    }
  }, [isVariantsOpen, expandToOptionIdOnOpen, validOptionIds]);

  const scrollContentClass = mode === 'drawer' && isMobile ? 'ov:pb-20' : '';

  const backHeader = (title: string) => (
    <button
      type="button"
      onClick={handleBack}
      className="ov25-option-header ov:shrink-0 ov:w-full ov:flex ov:items-center ov:gap-2 ov:px-4 ov:py-3 ov:text-left ov:bg-[var(--ov25-background-color)] ov:text-[var(--ov25-secondary-text-color)] hover:ov:bg-[var(--ov25-hover-bg-color,transparent)] ov:border-b ov:border-[var(--ov25-border-color)] ov:cursor-pointer"
    >
      <ChevronLeft className="ov:size-5" />
      <span className="ov:text-lg ov:font-medium">{title}</span>
    </button>
  );

  const rootView = (
    <div className="ov:flex ov:flex-col ov:min-h-0 ov:h-full ov:overflow-hidden ">

      {showSize && (
        <TreeTrigger label={capitalizeWords('Size')} onClick={() => handleTreeClick('size')} />
      )}
      {allOptionsVariants.map(({ optionId, optionName }) => (
        <TreeTrigger
          key={optionId}
          label={capitalizeWords(optionName)}
          onClick={() => handleTreeClick(optionId)}
        />
      ))}
    </div>
  );

  const sizeChildView = (
    <div className="ov:flex ov:flex-col ov:min-h-0 ov:flex-1 ov:overflow-hidden">
      {backHeader(capitalizeWords('Size'))}
      <div className={`ov:min-h-0 ov:flex-1 ov:overflow-y-auto ov:px-4 ov:pt-4 ov:pb-4 ${scrollContentClass}`}>
        <div className={`ov:grid ${getGridColsClass(2)}`}>
          <VariantsContent
            variantsToRender={sizeVariants}
            VariantCard={SizeVariantCard}
            isMobile={isMobile}
            onSelect={handleVariantSelect}
          />
        </div>
      </div>
    </div>
  );

  const optionChildView = currentView ? (() => {
    const opt = allOptionsVariants.find(o => o.optionId === currentView);
    if (!opt) return null;
    return (
      <div className="ov:flex ov:flex-col ov:min-h-0 ov:flex-1 ov:overflow-hidden">
        {backHeader(capitalizeWords(opt.optionName))}
          <FilterControls
            isFilterOpen={!!isFilterOpen[currentView]}
            setIsFilterOpen={() => toggleFilter(currentView)}
            isGrouped={false}
            optionId={currentView}
          />
        <div className="ov:relative ov:min-h-0 ov:flex-1 ov:flex ov:flex-col ov:pt-0 ov:overflow-hidden">
          <div className={`ov:min-h-0 ov:flex-1 ov:pt-0 ${scrollContentClass} ${isFilterOpen[currentView] ? 'ov:overflow-hidden' : 'ov:overflow-y-auto'}`}>
            <GroupedVariantsList
              groups={opt.variants}
              gridColsClass={getGridColsClass(4)}
              VariantCard={DefaultVariantCard}
              isMobile={isMobile}
              onSelect={handleVariantSelect}
              showGroupHeaders={opt.variants.length > 1}
              compactSpacing
            />
          </div>
          {isFilterOpen[currentView] && (
            <FilterContent optionId={currentView} wrapperVariant="sheet" />
          )}
        </div>
      </div>
    );
  })() : null;

  const showPaddingX = mode !== 'inline' || !isMobile;

  return (
    <div
      data-ov25-tree-variants-mode={mode}
      className={`ov:flex ov:flex-col ov:min-h-0 ov:flex-1 ov:overflow-hidden ov:pb-0 ov:gap-1`}
    >
      {currentView === null && rootView}
      {currentView === 'size' && sizeChildView}
      {currentView && currentView !== 'size' && optionChildView}
    </div>
  );
};
