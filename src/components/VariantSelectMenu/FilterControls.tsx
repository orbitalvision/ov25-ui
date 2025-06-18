import * as React from 'react'
import './FilterControls.css';
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
    const { searchQueries, setSearchQuery, activeOptionId } = useOV25UI();
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

    return (
        <div id="ov25-filter-controls">
            <button id="ov25-filter-controls-button" onClick={() => setIsFilterOpen(!isFilterOpen)} data-open={isFilterOpen} >
                <ListFilter size={24} />
                <span>Filters</span>
            </button>
            {
                !isFilterOpen && (
                    <div id="ov25-filter-controls-search">
                        <Search size={24} />
                        <input value={localSearchQuery} onChange={handleSearchInputChange} type="text" placeholder="Search" />
                        {localSearchQuery && (<X size={24} onClick={() => setLocalSearchQuery('')} />)}
                    </div>
                )
            }
        </div>
    );
}; 