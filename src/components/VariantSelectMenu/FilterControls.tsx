import * as React from 'react'
import { Funnel, Search, X } from "lucide-react";
import { useOV25UI } from '../../contexts/ov25-ui-context.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { SwatchIconSvg } from '../../lib/svgs/SwatchIconSvg.js';
import { cn } from '../../lib/utils.js';

interface FilterControlsProps {
    isFilterOpen: boolean;
    setIsFilterOpen: (isOpen: boolean) => void;
    isGrouped: boolean;
    optionId?: string;
    optionIds?: string[];
}

export const FilterControls: React.FC<FilterControlsProps> = ({
    isFilterOpen,
    setIsFilterOpen,
    isGrouped,
    optionId,
    optionIds,
}) => {
    const { searchQueries, setSearchQuery, activeOptionId, availableProductFilters, optionHasVisibleFilters, activeOption, isMobile, setAvailableProductFilters, setIsVariantsOpen, openSwatchBook, swatchRulesData, selectedSwatches, allOptionsWithoutModules, hasSelectionsWithSwatches, swatchBookFlash, setSwatchBookFlash } = useOV25UI();
    const [localSearchQuery, setLocalSearchQuery] = React.useState('');
    const debouncedSearchQuery = useDebounce(localSearchQuery, 1);
    const previousOptionIdRef = React.useRef<string | null>(null);
    const isUserInputRef = React.useRef(false);
    const [isAnimating, setIsAnimating] = React.useState(false);
    const [displayCount, setDisplayCount] = React.useState(selectedSwatches.length);
    const previousSelectedSwatchesRef = React.useRef(selectedSwatches);

    const resolvedOptionIds = optionIds ?? (optionId ? [optionId] : activeOptionId ? [activeOptionId] : []);
    const currentOptionId = resolvedOptionIds[0];
    const resolvedOptionIdsKey = resolvedOptionIds.join(',');

    React.useEffect(() => {
        if (currentOptionId && currentOptionId !== previousOptionIdRef.current) {
            const newQuery = searchQueries[currentOptionId] || '';
            setLocalSearchQuery(newQuery);
            previousOptionIdRef.current = currentOptionId;
            isUserInputRef.current = false;
        }
    }, [currentOptionId, searchQueries]);

    React.useEffect(() => {
        if (resolvedOptionIds.length === 0) return;
        const query = !isUserInputRef.current ? localSearchQuery : debouncedSearchQuery;
        resolvedOptionIds.forEach(id => setSearchQuery(id, query));
    }, [resolvedOptionIdsKey, localSearchQuery, debouncedSearchQuery, setSearchQuery]);

    // Effect for triggering animation when selectedSwatches changes
    React.useEffect(() => {
        if (selectedSwatches.length !== previousSelectedSwatchesRef.current.length) {
            setIsAnimating(true);
            const prevLen = previousSelectedSwatchesRef.current.length;
            setSwatchBookFlash(selectedSwatches.length > prevLen ? 'cta' : 'destructive');

            // First fade out the old number
            const fadeOutTimer = setTimeout(() => {
                setDisplayCount(selectedSwatches.length);
            }, 250);

            const completeTimer = setTimeout(() => {
                setIsAnimating(false);
            }, 500);

            previousSelectedSwatchesRef.current = selectedSwatches;
            return () => {
                clearTimeout(fadeOutTimer);
                clearTimeout(completeTimer);
            };
        }
    }, [selectedSwatches, setSwatchBookFlash]);

    // Clear flash after animation
    React.useEffect(() => {
        if (!swatchBookFlash) return;
        const t = setTimeout(() => setSwatchBookFlash(null), 500);
        return () => clearTimeout(t);
    }, [swatchBookFlash, setSwatchBookFlash]);

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalSearchQuery(e.target.value);
        isUserInputRef.current = true;
    };

    const handleSwatchButtonClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        openSwatchBook();
    };

    const targetOptions = React.useMemo(() =>
        resolvedOptionIds.map(id => allOptionsWithoutModules?.find(opt => opt.id === id)).filter(Boolean) as { id: string; name: string }[],
        [resolvedOptionIds, allOptionsWithoutModules]
    );
    const targetOption = targetOptions[0];

    const handleFilterChange = React.useCallback((filterKey: string, optionValue: string, checked: boolean, optionName: string) => {
        if (!optionName || !availableProductFilters?.[optionName]?.[filterKey]) return;
        setAvailableProductFilters(prev => ({
            ...prev,
            [optionName]: {
                ...prev[optionName],
                [filterKey]: prev[optionName][filterKey].map(opt =>
                    opt.value === optionValue ? { ...opt, checked } : opt
                )
            }
        }));
    }, [availableProductFilters, setAvailableProductFilters]);

    const { shouldShowFilterButton, isFilterDisabled } = React.useMemo(() => {
        let hasFilterCategories = false;
        let hasVisibleFilterContent = false;
        for (const opt of targetOptions) {
            const optionFilters = availableProductFilters?.[opt.name];
            if (!optionFilters || Object.keys(optionFilters).length === 0) continue;
            hasFilterCategories = true;
            if (optionHasVisibleFilters(opt)) {
                hasVisibleFilterContent = true;
            }
        }
        return {
            shouldShowFilterButton: hasFilterCategories,
            isFilterDisabled: hasFilterCategories && !hasVisibleFilterContent,
        };
    }, [targetOptions, availableProductFilters, optionHasVisibleFilters]);

    const selectedFilters = React.useMemo(() => {
        return targetOptions.flatMap(opt =>
            availableProductFilters?.[opt.name]
                ? Object.keys(availableProductFilters[opt.name]).flatMap(filterName =>
                    availableProductFilters[opt.name][filterName]
                        .filter(filter => filter.checked)
                        .map(filter => ({ ...filter, filterCategory: filterName, optionName: opt.name }))
                )
                : []
        ) as { value: string; filterCategory: string; optionName: string }[];
    }, [targetOptions, availableProductFilters]);

    return (
        <div id="ov25-filter-controls-wrapper" className="ov:flex ov:flex-col ov:gap-1.5 ov:px-4 ov:py-2">
            <div id="ov25-filter-controls" className="ov:flex ov:flex-nowrap ov:items-center ov:gap-2 ov:py-1.5">
                {shouldShowFilterButton && (
                    <button 
                        id="ov25-filter-controls-button"
                        className={cn(
                            "ov:flex ov:items-center ov:justify-center ov:p-1.5 ov:rounded-full",
                            isFilterDisabled
                                ? "ov:opacity-50 ov:cursor-not-allowed"
                                : "ov:cursor-pointer ov:hover:bg-neutral-200",
                            isFilterOpen && !isFilterDisabled && "ov:bg-neutral-200"
                        )}
                        onClick={() => !isFilterDisabled && setIsFilterOpen(!isFilterOpen)} 
                        disabled={isFilterDisabled}
                        data-open={isFilterOpen}
                        aria-label="Filters"
                    >
                        <Funnel size={18} className="ov:text-[var(--ov25-secondary-text-color)]/60" />
                    </button>
                )}
                <div id="ov25-filter-controls-search" className="ov:flex ov:flex-1 ov:items-center ov:py-1.5 ov:px-2 ov:rounded-full ov:border ov:border-[var(--ov25-border-color)] ov:hover:bg-[var(--ov25-hover-color)]">
                    <Search size={18} className="ov:shrink-0 ov:text-[var(--ov25-secondary-text-color)]/60"/>
                    <input value={localSearchQuery} onChange={handleSearchInputChange} type="text" placeholder="Search" className="ov:w-full ov:pl-2 ov:text-sm ov:text-[var(--ov25-secondary-text-color)] ov:bg-transparent ov:outline-none ov:placeholder:text-[var(--ov25-secondary-text-color)]/70" />
                    {localSearchQuery && (<X size={18} className="ov:shrink-0 ov:pl-1 ov:cursor-pointer ov:text-[var(--ov25-secondary-text-color)]" onClick={() => setLocalSearchQuery('')} />)}
                </div>
                {swatchRulesData.enabled && hasSelectionsWithSwatches && (
                <button 
                    id="ov25-filter-controls-swatches"
                    type="button"
                    data-ov25-swatch-book-button
                    data-ov25-swatch-flash={swatchBookFlash ?? undefined}
                    className="ov:flex ov:items-center ov:justify-center ov:rounded-full ov:border ov:border-transparent ov:cursor-pointer"
                    onClick={handleSwatchButtonClick}
                    aria-label="Open swatch book"
                >
                    <div className="ov:relative">
                        <SwatchIconSvg
                            fill="white"
                            stroke="var(--ov25-border-color)"
                            size={32}
                            pathClassName={cn(
                                swatchBookFlash === 'destructive' && "ov25-swatch-flash-destructive",
                                swatchBookFlash === 'cta' && "ov25-swatch-flash-cta"
                            )}
                        />
                            {selectedSwatches.length > 0 && (
                            <div 
                                data-ov25-swatch-book-count
                                className={cn(
                                "ov:absolute ov:top-1/2 ov:left-1/2 ov:transform ov:-translate-x-1/2 ov:-translate-y-1/2 ov:text-(--ov25-text-color) ov:font-medium ov:text-xs",
                                isAnimating && swatchBookFlash === 'destructive' && "ov25-swatch-count-flash-destructive",
                                isAnimating && swatchBookFlash === 'cta' && "ov25-swatch-count-flash-cta"
                            )}>
                                {displayCount}
                            </div>
                        )}
                    </div>
                </button>
                )}
            </div>
            {!isFilterOpen && selectedFilters.length > 0 && 
            <div id="ov25-filter-controls-pills" className="ov:flex ov:flex-wrap ov:gap-1.5 ov:md:pb-1.5 ov:max-h-[100px] ov:overflow-y-auto ov:border-gray-200">
                {
                    (() => {
                        if (!targetOption || !availableProductFilters || !availableProductFilters[targetOption.name]) {
                            if (!isGrouped) {
                                return null;
                            }
                            return (
                                <div className="ov25-filter-pill ov:flex ov:flex-row ov:gap-1.5 ov:px-2 ov:py-1 ov:rounded-full ov:border ov:border-[var(--ov25-border-color)] ov:whitespace-nowrap ov:cursor-pointer ov:transition-all ov:text-xs">
                                    All Collections
                                </div>
                            );
                        }

                        if (selectedFilters.length === 0) {
                            return (
                                <div id="ov25-filter-pill-all" className="ov25-filter-pill ov:flex-row ov:hidden ov:gap-1.5 ov:px-2 ov:py-1 ov:rounded-full ov:border ov:border-[var(--ov25-border-color)] ov:whitespace-nowrap ov:cursor-default ov:transition-all ov:text-xs">
                                    All Collections
                                </div>
                            );
                        }

                        return selectedFilters.map((filter, i) => (
                            <div key={`${filter.optionName}-${filter.filterCategory}-${filter.value}-${i}`} className="ov25-filter-pill ov:flex ov:flex-row ov:gap-1.5 ov:px-2 ov:py-1 ov:rounded-full ov:border ov:border-[var(--ov25-border-color)] ov:whitespace-nowrap ov:cursor-pointer ov:transition-all ov:text-xs">
                                <span>
                                    {filter.value}
                                </span>
                                <X 
                                    className="ov25-filter-pill-close ov:p-0.5" 
                                    size={14} 
                                    onClick={() => handleFilterChange(filter.filterCategory, filter.value, false, filter.optionName)} 
                                />
                            </div>
                        ));
                    })()
                }
            </div>}
        </div>
    );
}; 