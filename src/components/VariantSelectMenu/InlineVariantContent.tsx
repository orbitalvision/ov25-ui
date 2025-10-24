import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useOV25UI } from '../../contexts/ov25-ui-context.js';
import { VariantsContent } from './VariantsContent.js';
import { NoResults } from './NoResults.js';
import { DefaultVariantCard } from './variant-cards/DefaultVariantCard.js';
import { SizeVariantCard } from './variant-cards/SizeVariantCard.js';
import { FilterControls } from './FilterControls.js';
import { FilterContent } from './FilterContent.js';

export const InlineVariantContent: React.FC = () => {
  const {
    allOptionsWithoutModules,
    selectedSelections,
    handleSelectionSelect,
    getSelectedValue,
    range,
    products,
    currentProductId,
    applySearchAndFilters,
  } = useOV25UI();

  const [expandedOptions, setExpandedOptions] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<{ [optionId: string]: number }>({});
  const [isFilterOpen, setIsFilterOpen] = useState<{ [optionId: string]: boolean }>({});
  const [previousFilteredCounts, setPreviousFilteredCounts] = useState<{ [optionId: string]: number }>({});

  const toggleOption = (optionId: string) => {
    setExpandedOptions(prev => 
      prev.includes(optionId) 
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const getVariantsPerPage = (optionId: string) => {
    // 2 rows 2 columns for size (4 variants), 3 rows 4 columns for others (12 variants)
    return optionId === 'size' ? 4 : 12;
  };

  const getTotalPages = (variants: any[], optionId: string) => {
    const variantsPerPage = getVariantsPerPage(optionId);
    return Math.ceil(variants.length / variantsPerPage);
  };

  const getCurrentPageVariants = (variants: any[], optionId: string) => {
    const variantsPerPage = getVariantsPerPage(optionId);
    const page = currentPage[optionId] || 0;
    const startIndex = page * variantsPerPage;
    return variants.slice(startIndex, startIndex + variantsPerPage);
  };

  const goToPage = (optionId: string, page: number) => {
    setCurrentPage(prev => ({
      ...prev,
      [optionId]: page
    }));
  };

  const toggleFilter = (optionId: string) => {
    setIsFilterOpen(prev => ({
      ...prev,
      [optionId]: !prev[optionId]
    }));
  };

  // Reset pagination when filtered results change
  useEffect(() => {
    allOptionsWithoutModules.forEach(option => {
      const filteredOption = option.id === 'size' ? option : applySearchAndFilters(option, option.id);
      const currentFilteredCount = filteredOption.groups?.flatMap(group => group.selections || []).length || 0;
      const previousCount = previousFilteredCounts[option.id] || 0;
      
      // If the filtered count changed, reset to page 0
      if (currentFilteredCount !== previousCount) {
        setCurrentPage(prev => ({
          ...prev,
          [option.id]: 0
        }));
        setPreviousFilteredCounts(prev => ({
          ...prev,
          [option.id]: currentFilteredCount
        }));
      }
    });
  }, [allOptionsWithoutModules, applySearchAndFilters, previousFilteredCounts]);

  return (
    <div className="ov:w-full ov:bg-[var(--ov25-background-color)]">
      {allOptionsWithoutModules.map(option => {
        const isExpanded = expandedOptions.includes(option.id);

        const filteredOption = option.id === 'size' ? option : applySearchAndFilters(option, option.id);
        
        const allVariants = filteredOption.groups?.flatMap((group: any) =>
          group.selections?.map((selection: any) => {
            return {
              id: selection.id,
              groupId: group.id,
              optionId: option.id,
              name: selection.name,
              price: selection.price,
              image: option.id === 'size' 
                ? (selection.thumbnail || '/placeholder.svg?height=200&width=200')
                : (selection.miniThumbnails?.medium || '/placeholder.svg?height=200&width=200'),
              blurHash: selection.blurHash,
              data: option.id === 'size' ? products?.find(p => p?.id === selection?.id) : selection.data,
              isSelected: option.id === 'size' 
                ? selection.id === currentProductId || selectedSelections.some(
                    sel => sel.optionId === option.id && sel.selectionId === selection.id
                  )
                : selectedSelections.some(
                    sel => sel.optionId === option.id && 
                          sel.groupId === group.id && 
                          sel.selectionId === selection.id
                  ),
              swatch: selection.swatch
            };
          }) || []
        ).sort((a: any, b: any) => a.name.localeCompare(b.name)) || [];

        const currentPageVariants = getCurrentPageVariants(allVariants, option.id);
        const totalPages = getTotalPages(allVariants, option.id);
        const currentPageNum = currentPage[option.id] || 0;
        const isFilterOpenForOption = isFilterOpen[option.id] || false;

        return (
          <div key={option.id} className="ov:border-b ov:border-[var(--ov25-border-color)] ov:last:border-b-0">
            {/* Option Header */}
            <button
              onClick={() => toggleOption(option.id)}
              className="ov:w-full ov:flex ov:justify-between ov:items-center ov:p-4 ov:py-3 ov:cursor-pointer ov:hover:bg-[var(--ov25-hover-color)] ov:transition-colors"
            >
              <div className="ov:flex ov:flex-col ov:items-start ov:text-left">
                <span className="ov:text-sm ov:font-light ov:uppercase ov:text-[var(--ov25-secondary-text-color)]">
                  Select {option.name}
                </span>
                <span className="ov:text-base ov:font-medium">
                  {option.name === 'size' 
                    ? (range?.name ? range.name + ' ' : '') + getSelectedValue(option)
                    : getSelectedValue(option)
                  }
                </span>
              </div>
              {isExpanded ? (
                <ChevronDown size={20} className="ov:text-[var(--ov25-secondary-text-color)]" />
              ) : (
                <ChevronRight size={20} className="ov:text-[var(--ov25-secondary-text-color)]" />
              )}
            </button>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="ov:border-t ov:min-w-[460px] ov:h-[440px] ov:border-[var(--ov25-border-color)] ov:bg-[var(--ov25-background-color)]">
                {/* Filter Controls - Only for non-size options */}
                {option.id !== 'size' && (
                  <div className="ov:p-1 ov:border-b ov:border-[var(--ov25-border-color)]">
                    <FilterControls 
                      isFilterOpen={isFilterOpenForOption}
                      setIsFilterOpen={() => toggleFilter(option.id)}
                      isGrouped={false}
                      optionId={option.id}
                    />
                  </div>
                )}
                
                {/* Variants Content */}
                <div className="ov:relative ov:w-full ov:flex ov:flex-col">
                  <div className="ov:relative ov:flex-1 ov:overflow-hidden ov:flex ov:flex-col">
                    {allVariants.length === 0 && (
                      <div className="ov:flex ov:items-center ov:justify-center ov:h-full">
                        <NoResults />
                      </div>
                    )}
                    {allVariants.length > 0 && (
                      <div className="ov:flex-1 ov:overflow-hidden">
                        <div className={`ov:grid ov:h-full ov:content-start ov:p-4 ${option.id === 'size' ? 'ov:grid-cols-2!' : 'ov:grid-cols-6!'}`}>
                          <VariantsContent 
                            variantsToRender={currentPageVariants} 
                            VariantCard={option.id === 'size' ? SizeVariantCard : DefaultVariantCard} 
                            isMobile={false} 
                            onSelect={(selection) => handleSelectionSelect(selection, option.id)}
                            showImage={option.id === 'size' ? true : undefined}
                            showDimensions={option.id === 'size' ? false : undefined}
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="ov:flex ov:items-center ov:justify-center ov:gap-2 ov:px-4 ov:py-3 ov:border-t ov:border-[var(--ov25-border-color)] ov:flex-shrink-0">
                        {/* Previous button */}
                        <button
                          onClick={() => goToPage(option.id, Math.max(0, currentPageNum - 1))}
                          disabled={currentPageNum === 0}
                          className="ov:p-2 ov:text-gray-400 ov:disabled:opacity-30 ov:disabled:cursor-not-allowed ov:hover:text-gray-600 ov:transition-colors"
                        >
                          &lt;
                        </button>
                        
                        {/* Page numbers */}
                        <div className="ov:flex ov:items-center ov:gap-2">
                          {Array.from({ length: Math.min(9, totalPages) }, (_, i) => {
                            const pageNum = i;
                            const isCurrentPage = pageNum === currentPageNum;
                            
                            return (
                              <button
                                key={pageNum}
                                onClick={() => goToPage(option.id, pageNum)}
                                className={`ov:px-3 ov:py-1 ov:text-sm ov:font-medium ov:transition-colors ${
                                  isCurrentPage
                                    ? 'ov:bg-gray-200 ov:text-gray-900'
                                    : 'ov:text-gray-600 ov:hover:text-gray-900'
                                }`}
                              >
                                {pageNum + 1}
                              </button>
                            );
                          })}
                          
                          {/* Ellipsis if there are more pages */}
                          {totalPages > 9 && (
                            <span className="ov:px-2 ov:py-1 ov:text-sm ov:text-gray-400">
                              ...
                            </span>
                          )}
                        </div>
                        
                        {/* Next button */}
                        <button
                          onClick={() => goToPage(option.id, Math.min(totalPages - 1, currentPageNum + 1))}
                          disabled={currentPageNum >= totalPages - 1}
                          className="ov:p-2 ov:text-gray-600 ov:disabled:opacity-30 ov:disabled:cursor-not-allowed ov:hover:text-gray-800 ov:transition-colors"
                        >
                          &gt;
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Filter Content Overlay */}
                  {isFilterOpenForOption && (
                    <div 
                      data-open={isFilterOpenForOption} 
                      className={`ov:flex ov:justify-end ov:flex-wrap ov:overflow-y-auto ov:absolute ov:inset-0 ov:h-full ov:p-2 ov:px-4 ov:bg-[var(--ov25-background-color)] ov:transition-transform ov:duration-500 ov:ease-in-out ${isFilterOpenForOption ? 'ov:translate-y-0' : 'ov:-translate-y-full'}`}
                    >
                      <FilterContent optionId={option.id} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
