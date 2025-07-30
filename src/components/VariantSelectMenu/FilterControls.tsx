import * as React from 'react'

import { ListFilter, Search, X } from "lucide-react";
import { useOV25UI } from '../../contexts/ov25-ui-context.js';
import { useDebounce } from '../../hooks/useDebounce.js';

interface FilterControlsProps {
    isFilterOpen: boolean;
    setIsFilterOpen: (isOpen: boolean) => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
    isFilterOpen,
    setIsFilterOpen,
}) => {
    const { searchQueries, setSearchQuery, activeOptionId, availableProductFilters, activeOption, isMobile, setAvailableProductFilters } = useOV25UI();
    const [localSearchQuery, setLocalSearchQuery] = React.useState('');
    const debouncedSearchQuery = useDebounce(localSearchQuery, 500);
    const previousOptionIdRef = React.useRef<string | null>(null);
    const isUserInputRef = React.useRef(false);
    
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

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalSearchQuery(e.target.value);
        isUserInputRef.current = true;
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
            <div id="ov25-filter-controls" className="ov:flex ov:flex-nowrap ov:py-2 ov:items-center ov:gap-2">
                <button id="ov25-filter-controls-button" onClick={() => setIsFilterOpen(!isFilterOpen)} data-open={isFilterOpen} className="ov:flex ov:items-center ov:p-2 ov:rounded-full ov:border ov:border-[var(--ov25-border-color)] ov:text-[var(--ov25-secondary-text-color)] ov:whitespace-nowrap ov:hover:bg-[var(--ov25-accent-color)] data-[open=true]:ov:border-[var(--ov25-neutral-900)] data-[open=true]:ov:text-[var(--ov25-neutral-900)]" >
                    <ListFilter size={24} />
                    <span className="ov:px-4 ov:text-[var(--ov25-secondary-text-color)]">Filters</span>
                </button>
                {
                    (
                        <div id="ov25-filter-controls-search" className="ov:flex ov:items-center ov:p-2 ov:rounded-full ov:border ov:border-[var(--ov25-border-color)] ov:flex-1 ov:hover:bg-[var(--ov25-accent-color)]">
                            <Search size={24} className="ov:min-w-6" />
                            <input value={localSearchQuery} onChange={handleSearchInputChange} type="text" placeholder="Search" className="ov:pl-2 ov:ml-2 ov:text-[var(--ov25-secondary-text-color)] ov:w-full ov:bg-transparent ov:outline-none" />
                            {localSearchQuery && (<X size={24} onClick={() => setLocalSearchQuery('')} className="ov:pr-2 ov:cursor-pointer" />)}
                        </div>
                    )
                }
            </div>
            {!isFilterOpen && !isMobile && <div id="ov25-filter-controls-pills" className="ov:flex ov:flex-wrap ov:gap-2 ov:pb-2">
                {
                    (() => {
                        if (!activeOption || !availableProductFilters || !availableProductFilters[activeOption.name]) {
                            return (
                                <div className="ov:flex ov:flex-row ov:gap-2 ov:px-4 ov:py-2 ov:rounded-full ov:text-sm ov:border ov:border-[var(--ov25-border-color)] ov:text-[var(--ov25-secondary-text-color)] ov:transition-all ov:cursor-pointer ov:whitespace-nowrap">
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
                                <div id="ov25-filter-pill-all" className="ov:flex ov:flex-row ov:gap-2 ov:px-4 ov:py-2 ov:rounded-full ov:text-sm ov:border ov:border-[var(--ov25-border-color)] ov:text-[var(--ov25-secondary-text-color)] ov:transition-all ov:cursor-default ov:whitespace-nowrap ov:hidden">
                                    All Collections
                                </div>
                            );
                        }

                        return selectedFilters.map(filter => (
                            <div key={filter.value} className="ov:flex ov:flex-row ov:gap-2 ov:px-4 ov:py-2 ov:rounded-full ov:text-sm ov:border ov:border-[var(--ov25-border-color)] ov:text-[var(--ov25-secondary-text-color)] ov:transition-all ov:cursor-pointer ov:whitespace-nowrap">
                                <span>
                                    {filter.value}
                                </span>
                                <X 
                                    className="ov:p-1 ov:mt-0.5" 
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