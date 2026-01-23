import * as React from 'react'
import { ListFilter, Search, X } from "lucide-react";
import { useOV25UI } from '../../contexts/ov25-ui-context.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { SwatchIcon } from '../ui/SwatchIcon.js';
import { cn } from '../../lib/utils.js';

interface FilterControlsProps {
    isFilterOpen: boolean;
    setIsFilterOpen: (isOpen: boolean) => void;
    isGrouped: boolean;
    optionId?: string; // Optional optionId for inline variant content
}

export const FilterControls: React.FC<FilterControlsProps> = ({
    isFilterOpen,
    setIsFilterOpen,
    isGrouped,
    optionId,
}) => {
    const { searchQueries, setSearchQuery, activeOptionId, availableProductFilters, activeOption, isMobile, setAvailableProductFilters, setIsVariantsOpen, setIsSwatchBookOpen, swatchRulesData, selectedSwatches, allOptionsWithoutModules, hasSelectionsWithSwatches } = useOV25UI();
    const [localSearchQuery, setLocalSearchQuery] = React.useState('');
    const debouncedSearchQuery = useDebounce(localSearchQuery, 500);
    const previousOptionIdRef = React.useRef<string | null>(null);
    const isUserInputRef = React.useRef(false);
    const [isAnimating, setIsAnimating] = React.useState(false);
    const [displayCount, setDisplayCount] = React.useState(selectedSwatches.length);
    const previousSelectedSwatchesRef = React.useRef(selectedSwatches);
    
    // Use provided optionId or fall back to activeOptionId
    const currentOptionId = optionId || activeOptionId;
    
    // Effect for updating local search query when currentOptionId changes
    React.useEffect(() => {
        if (currentOptionId && currentOptionId !== previousOptionIdRef.current) {
            const newQuery = searchQueries[currentOptionId] || '';
            setLocalSearchQuery(newQuery);
            previousOptionIdRef.current = currentOptionId;
            isUserInputRef.current = false;
        }
    }, [currentOptionId, searchQueries]);

    // Effect for syncing local state to global state
    React.useEffect(() => {
        if (currentOptionId) {
            if (!isUserInputRef.current) {
                // Immediate update when currentOptionId changes
                setSearchQuery(currentOptionId, localSearchQuery);
            } else {
                // Debounced update when user types
                setSearchQuery(currentOptionId, debouncedSearchQuery);
            }
        }
    }, [currentOptionId, localSearchQuery, debouncedSearchQuery, setSearchQuery, isUserInputRef]);

    // Effect for triggering animation when selectedSwatches changes
    React.useEffect(() => {
        if (selectedSwatches.length !== previousSelectedSwatchesRef.current.length) {
            setIsAnimating(true);
            
            // First fade out the old number
            const fadeOutTimer = setTimeout(() => {
                setDisplayCount(selectedSwatches.length);
            }, 250); // Half the animation duration
            
            // Then complete the animation
            const completeTimer = setTimeout(() => {
                setIsAnimating(false);
            }, 500); // Full animation duration
            
            previousSelectedSwatchesRef.current = selectedSwatches;
            return () => {
                clearTimeout(fadeOutTimer);
                clearTimeout(completeTimer);
            };
        }
    }, [selectedSwatches]);

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalSearchQuery(e.target.value);
        isUserInputRef.current = true;
    };

    const handleSwatchButtonClick = () => {
        setIsSwatchBookOpen(true);
    };

    const handleFilterChange = React.useCallback((filterKey: string, optionValue: string, checked: boolean) => {
        if (!activeOption?.name || !availableProductFilters?.[activeOption.name]?.[filterKey]) return;
        setAvailableProductFilters(prev => ({
            ...prev,
            [activeOption.name]: {
                ...prev[activeOption.name],
                [filterKey]: prev[activeOption.name][filterKey].map(opt => 
                    opt.value === optionValue ? { ...opt, checked } : opt
                )
            }
        }));
    }, [activeOption, availableProductFilters, setAvailableProductFilters]);

    const shouldShowFilterButton = React.useMemo(() => {
        // For inline variant content, we need to find the option by currentOptionId
        const targetOption = currentOptionId === activeOptionId ? activeOption : 
            allOptionsWithoutModules?.find(opt => opt.id === currentOptionId);
        
        if (!targetOption?.name) return false;
        const optionFilters = availableProductFilters?.[targetOption.name];
        if (!optionFilters) return false;
        return Object.keys(optionFilters).some((key) => optionFilters[key]?.length > 0);
    }, [currentOptionId, activeOptionId, activeOption, allOptionsWithoutModules, availableProductFilters]);

    const targetOption = currentOptionId === activeOptionId ? activeOption : 
        allOptionsWithoutModules?.find(opt => opt.id === currentOptionId);
    
    const selectedFilters = availableProductFilters && targetOption?.name && availableProductFilters[targetOption.name] ? Object.keys(availableProductFilters[targetOption.name])
    .flatMap(filterName => 
        availableProductFilters[targetOption.name][filterName]
            .filter(filter => filter.checked)
            .map(filter => ({
                ...filter,
                filterCategory: filterName
            }))
    ) : [];

    return (
        <div id="ov25-filter-controls-container" className="ov:flex ov:flex-col ov:gap-2 ov:px-4">
            <div id="ov25-filter-controls" className="ov:flex ov:flex-nowrap ov:items-center ov:gap-2 ov:py-2">
                {shouldShowFilterButton && (
                    <button 
                        id="ov25-filter-controls-button"
                        className={cn(
                            "ov:flex ov:items-center ov:p-2 ov:rounded-full ov:border ov:border-[var(--ov25-border-color)] ov:whitespace-nowrap ov:hover:bg-[var(--ov25-hover-color)]",
                            isFilterOpen ? "ov:bg-gray-50" : ""
                        )}
                        onClick={() => setIsFilterOpen(!isFilterOpen)} 
                        data-open={isFilterOpen}
                    >
                        <ListFilter size={24} />
                        <span className="ov:px-4 ov:color-[var(--ov25-secondary-text-color)]">Filters</span>
                    </button>
                )}
                <div id="ov25-filter-controls-search" className="ov:flex ov:flex-1 ov:items-center ov:p-2 ov:rounded-full ov:border ov:border-[var(--ov25-border-color)] ov:hover:bg-[var(--ov25-hover-color)]">
                    <Search size={24} className="ov:min-w-[24px]"/>
                    <input value={localSearchQuery} onChange={handleSearchInputChange} type="text" placeholder="Search" className="ov:w-full ov:pl-2 ov:ml-2 ov:text-[var(--ov25-secondary-text-color)] ov:bg-transparent ov:outline-none" />
                    {localSearchQuery && (<X size={24} className="ov:min-w-[24px] ov:pr-2 ov:cursor-pointer" onClick={() => setLocalSearchQuery('')} />)}
                </div>
                {swatchRulesData.enabled && hasSelectionsWithSwatches && (
                <button 
                    id="ov25-filter-controls-swatches"
                    className="ov:flex ov:items-center ov:p-2 ov:rounded-full ov:border ov:border-transparent ov:whitespace-nowrap ov:cursor-pointer ov:bg-black/30"
                    onClick={() => handleSwatchButtonClick()}
                >
                    <div className="ov:relative">
                        <SwatchIcon 
                            fill="white"
                            stroke="#6E6E6E"
                            strokeWidth="0"
                            size={24}
                        />
                        {selectedSwatches.length > 0 && (
                            <div className={cn(
                                "ov:absolute ov:top-1/2 ov:left-1/2 ov:transform ov:-translate-x-1/2 ov:-translate-y-1/2 ov:text-black ov:font-base ov:text-sm ov:transition-opacity ov:duration-250",
                                isAnimating && "ov:opacity-20"
                            )}>
                                {displayCount}
                            </div>
                        )}
                    </div>
                </button>
                )}
            </div>
            {!isFilterOpen && !isMobile && selectedFilters.length > 0 && 
            <div id="ov25-filter-controls-pills" className="ov:flex ov:flex-wrap ov:gap-2 ov:pb-2 ov:max-h-[200px] ov:overflow-y-auto ov:border-b ov:border-gray-200">
                {
                    (() => {
                        if (!activeOption || !availableProductFilters || !availableProductFilters[activeOption.name]) {
                            if (!isGrouped) {
                                return null;
                            }
                            return (
                                <div className="ov25-filter-pill ov:flex ov:flex-row ov:gap-2 ov:px-2 ov:py-2 ov:rounded-full ov:border ov:border-[var(--ov25-border-color)] ov:whitespace-nowrap ov:cursor-pointer ov:transition-all ov:text-sm">
                                    All Collections
                                </div>
                            );
                        }

                        if (selectedFilters.length === 0) {
                            return (
                                <div id="ov25-filter-pill-all" className="ov25-filter-pill ov:flex-row ov:hidden ov:gap-2 ov:px-2 ov:py-2 ov:rounded-full ov:border ov:border-[var(--ov25-border-color)] ov:whitespace-nowrap ov:cursor-default ov:transition-all ov:text-sm">
                                    All Collections
                                </div>
                            );
                        }

                        return selectedFilters.map(filter => (
                            <div key={filter.value} className="ov25-filter-pill ov:flex ov:flex-row ov:gap-2 ov:px-2 ov:py-2 ov:rounded-full ov:border ov:border-[var(--ov25-border-color)] ov:whitespace-nowrap ov:cursor-pointer ov:transition-all ov:text-sm">
                                <span>
                                    {filter.value}
                                </span>
                                <X 
                                    className="ov25-filter-pill-close ov:p-1 ov:mt-[1px]" 
                                    size={20} 
                                    onClick={() => handleFilterChange(filter.filterCategory, filter.value, false)} 
                                />
                            </div>
                        ));
                    })()
                }
            </div>}
        </div>
    );
}; 