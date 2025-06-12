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
    const { searchQuery, setSearchQuery } = useOV25UI();
    const [localSearchQuery, setLocalSearchQuery] = React.useState(searchQuery);
    const debouncedSearchQuery = useDebounce(localSearchQuery, 500);

    React.useEffect(() => {
        setSearchQuery(debouncedSearchQuery);
    }, [debouncedSearchQuery, setSearchQuery]);

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
                        <input value={localSearchQuery} onChange={(e) => setLocalSearchQuery(e.target.value)} type="text" placeholder="Search" />
                        {localSearchQuery && (<X size={24} onClick={() => setLocalSearchQuery('')} />)}
                    </div>
                )
            }
        </div>
    );
}; 