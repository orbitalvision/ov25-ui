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
    const { searchQuery, setSearchQuery } = useOV25UI();
    const [localSearchQuery, setLocalSearchQuery] = React.useState(searchQuery);
    const debouncedSearchQuery = useDebounce(localSearchQuery, 500);

    React.useEffect(() => {
        setSearchQuery(debouncedSearchQuery);
    }, [debouncedSearchQuery, setSearchQuery]);

    return (
        <div id="ov25-filter-controls" className="ov:flex ov:flex-nowrap ov:px-4 ov:py-2 ov:items-center ov:gap-2">
            <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`${isFilterOpen ? 'ov:border-neutral-900 ov:text-neutral-900' : ''} ov:flex ov:items-center ov:p-2 ov:rounded-full ov:border ov:border-[var(--ov25-border-color)] ov:text-[var(--ov25-secondary-text-color)] ov:hover:bg-accent ov:whitespace-nowrap`}
            >
            <ListFilter size={24} />
            <span className="ov:px-4 ov:text-[var(--ov25-secondary-text-color)]">Filters</span>
            </button>
            {
            !isFilterOpen && (
                <div className="ov:flex ov:items-center ov:p-2 ov:rounded-full ov:border ov:border-[var(--ov25-border-color)] ov:hover:bg-accent ov:flex-1">
                    <Search size={24} className="ov:min-w-[24px]" />
                    <input 
                        value={localSearchQuery}
                        onChange={(e) => setLocalSearchQuery(e.target.value)}
                        type="text"
                        placeholder="Search"
                        className="ov:pl-2 ov:ml-2 ov:text-[var(--ov25-secondary-text-color)] ov:w-full ov:bg-transparent ov:outline-none"
                    />
                    {
                        localSearchQuery && (
                            <X size={24} onClick={() => setLocalSearchQuery('')} className="ov:pr-2 ov:cursor-pointer ov:min-w-[24px]" />
                        )
                    }
                </div>
            )
            }
        </div>
  );
}; 