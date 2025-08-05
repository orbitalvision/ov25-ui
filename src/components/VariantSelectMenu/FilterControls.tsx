import * as React from 'react'
import { ListFilter, Search, X, Plus, Minus } from "lucide-react";
import { useOV25UI } from '../../contexts/ov25-ui-context.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { SwatchIcon } from '../ui/SwatchIcon.js';
import { cn } from '../../lib/utils.js';

interface FilterControlsProps {
    isFilterOpen: boolean;
    setIsFilterOpen: (isOpen: boolean) => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
    isFilterOpen,
    setIsFilterOpen,
}) => {
    const { searchQueries, setSearchQuery, activeOptionId, availableProductFilters, activeOption, isMobile, setAvailableProductFilters, setIsVariantsOpen, setIsSwatchBookOpen, swatchRulesData, selectedSwatches } = useOV25UI();
    const [localSearchQuery, setLocalSearchQuery] = React.useState('');
    const debouncedSearchQuery = useDebounce(localSearchQuery, 500);
    const previousOptionIdRef = React.useRef<string | null>(null);
    const isUserInputRef = React.useRef(false);
    const [isAnimating, setIsAnimating] = React.useState(false);
    const [isAdding, setIsAdding] = React.useState(true);
    const previousSelectedSwatchesRef = React.useRef(selectedSwatches);
    
    // Effect for updating local search query when activeOptionId changes
    React.useEffect(() => {
        if (activeOptionId && activeOptionId !== previousOptionIdRef.current) {
            const newQuery = searchQueries[activeOptionId] || '';
            setLocalSearchQuery(newQuery);
            previousOptionIdRef.current = activeOptionId;
            isUserInputRef.current = false;
        }
    }, [activeOptionId, searchQueries]);

    // Effect for syncing local state to global state
    React.useEffect(() => {
        if (activeOptionId) {
            if (!isUserInputRef.current) {
                // Immediate update when activeOptionId changes
                setSearchQuery(activeOptionId, localSearchQuery);
            } else {
                // Debounced update when user types
                setSearchQuery(activeOptionId, debouncedSearchQuery);
            }
        }
    }, [activeOptionId, localSearchQuery, debouncedSearchQuery, setSearchQuery, isUserInputRef]);

    // Effect for triggering animation when selectedSwatches changes
    React.useEffect(() => {
        if (selectedSwatches.length !== previousSelectedSwatchesRef.current.length) {
            const wasAdding = selectedSwatches.length > previousSelectedSwatchesRef.current.length;
            setIsAdding(wasAdding);
            setIsAnimating(true);
            const timer = setTimeout(() => {
                setIsAnimating(false);
            }, 1000); // Animation duration: 1 second
            previousSelectedSwatchesRef.current = selectedSwatches;
            return () => clearTimeout(timer);
        }
    }, [selectedSwatches]);

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalSearchQuery(e.target.value);
        isUserInputRef.current = true;
    };

    const handleSwatchButtonClick = () => {
        setIsVariantsOpen(false);
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

    return (
        <div id="ov25-filter-controls-container" className="ov:flex ov:flex-col ov:gap-2 ov:px-4">
            <div id="ov25-filter-controls" className="ov:flex ov:flex-nowrap ov:items-center ov:gap-2 ov:py-2">
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
                <div id="ov25-filter-controls-search" className="ov:flex ov:flex-1 ov:items-center ov:p-2 ov:rounded-full ov:border ov:border-[var(--ov25-border-color)] ov:hover:bg-[var(--ov25-hover-color)]">
                    <Search size={24} className="ov:min-w-[24px]"/>
                    <input value={localSearchQuery} onChange={handleSearchInputChange} type="text" placeholder="Search" className="ov:w-full ov:pl-2 ov:ml-2 ov:text-[var(--ov25-secondary-text-color)] ov:bg-transparent ov:outline-none" />
                    {localSearchQuery && (<X size={24} className="ov:min-w-[24px] ov:pr-2 ov:cursor-pointer" onClick={() => setLocalSearchQuery('')} />)}
                </div>
                {swatchRulesData.enabled && (
                <button 
                    id="ov25-filter-controls-swatches"
                    className="ov:flex ov:items-center ov:p-2 ov:rounded-full ov:border ov:border-[var(--ov25-border-color)] ov:whitespace-nowrap ov:cursor-pointer"
                    onClick={() => handleSwatchButtonClick()}
                >
                    <div className="ov:relative">
                        <SwatchIcon 
                            fill="white"
                            stroke="#6E6E6E"
                            strokeWidth="0"
                            size={24}
                        />
                        {isAnimating ? (
                            isAdding ? (
                                <Plus size={16} className="ov:absolute ov:top-1/2 ov:left-1/2 ov:transform ov:-translate-x-1/2 ov:-translate-y-1/2 ov:animate-[plusIconAnimation_1s_ease-in-out] ov:text-green-600" />
                            ) : (
                                <Minus size={16} className="ov:absolute ov:top-1/2 ov:left-1/2 ov:transform ov:-translate-x-1/2 ov:-translate-y-1/2 ov:animate-[plusIconAnimation_1s_ease-in-out] ov:text-red-600" />
                            )
                        ) : selectedSwatches.length > 0 && (
                            <div className="ov:absolute ov:top-1/2 ov:left-1/2 ov:transform ov:-translate-x-1/2 ov:-translate-y-1/2 ov:text-black ov:font-bold ov:text-sm">
                                {selectedSwatches.length}
                            </div>
                        )}
                    </div>
                </button>
                )}
            </div>
            {!isFilterOpen && !isMobile && <div id="ov25-filter-controls-pills" className="ov:flex ov:flex-wrap ov:gap-2 ov:pb-2">
                {
                    (() => {
                        if (!activeOption || !availableProductFilters || !availableProductFilters[activeOption.name]) {
                            return (
                                <div className="ov25-filter-pill ov:flex ov:flex-row ov:gap-2 ov:px-2 ov:py-3 ov:rounded-full ov:border ov:border-[var(--ov25-border-color)] ov:whitespace-nowrap ov:cursor-pointer ov:transition-all ov:text-sm">
                                    All Collections
                                </div>
                            );
                        }
                        
                        const selectedFilters = Object.keys(availableProductFilters[activeOption.name])
                            .flatMap(filterName => 
                                availableProductFilters[activeOption.name][filterName]
                                    .filter(filter => filter.checked)
                                    .map(filter => ({
                                        ...filter,
                                        filterCategory: filterName
                                    }))
                            );

                        if (selectedFilters.length === 0) {
                            return (
                                <div id="ov25-filter-pill-all" className="ov25-filter-pill ov:flex-row ov:hidden ov:gap-2 ov:px-2 ov:py-3 ov:rounded-full ov:border ov:border-[var(--ov25-border-color)] ov:whitespace-nowrap ov:cursor-default ov:transition-all ov:text-sm">
                                    All Collections
                                </div>
                            );
                        }

                        return selectedFilters.map(filter => (
                            <div key={filter.value} className="ov25-filter-pill ov:flex ov:flex-row ov:gap-2 ov:px-2 ov:py-3 ov:rounded-full ov:border ov:border-[var(--ov25-border-color)] ov:whitespace-nowrap ov:cursor-pointer ov:transition-all ov:text-sm">
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