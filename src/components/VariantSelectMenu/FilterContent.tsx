import * as React from 'react'
import { ProductFilters, useOV25UI } from '../../contexts/ov25-ui-context.js';
import './FilterContent.css';

export const FilterContent: React.FC = () => {
    const { availableProductFilters, setAvailableProductFilters, activeOption } = useOV25UI();

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

    if (!availableProductFilters || !activeOption?.name) return null;

    const activeFilters = availableProductFilters[activeOption.name];
    if (!activeFilters) return (
        <div id="ov25-filter-empty">
            <h3>No filters available</h3>
        </div>
    );

    return (
        <div id="ov25-filter-content">
            {Object.entries(activeFilters)
                .sort(([keyA], [keyB]) => {
                    if (keyA === 'Categories') return -1;
                    if (keyB === 'Categories') return 1;
                    return keyA.localeCompare(keyB);
                })
                .map(([filterKey, options]) => (
                options.length > 0 && (
                    <div key={filterKey} className="filter-group">
                        <h3 className="filter-group-title">{filterKey}</h3>
                        <div className="filter-options">
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleFilterChange(filterKey, option.value, !option.checked)}
                                    className="filter-option"
                                    data-checked={option.checked}
                                >
                                    {option.value}
                                </button>
                            ))}
                        </div>
                    </div>
                )
            ))}
        </div>
    )
}
