import * as React from 'react'
import { ProductFilters, useOV25UI } from '../../contexts/ov25-ui-context.js';

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
    if (!activeFilters) return null;

    return (
        <div className="ov:w-full ov:h-full ov:pr-4">
            {Object.entries(activeFilters).map(([filterKey, options]) => (
                <div key={filterKey} className="ov:mb-4">
                    <h3 className="ov:text-lg ov:text-[var(--ov25-secondary-text-color)] ov:mb-2">{filterKey}</h3>
                    <div className="ov:grid ov:grid-cols-2 ov:gap-2">
                        {options.map((option) => (
                            <div key={option.value} className="ov:flex ov:items-center ov:gap-2">
                                <input 
                                    type="checkbox" 
                                    value={option.value}
                                    checked={option.checked || false}
                                    onChange={(e) => handleFilterChange(filterKey, option.value, e.target.checked)}
                                />
                                <label className="ov:text-[var(--ov25-secondary-text-color)] ov:truncate">{option.value}</label>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}
