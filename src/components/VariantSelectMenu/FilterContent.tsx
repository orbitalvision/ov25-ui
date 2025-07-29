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

    if (!availableProductFilters || !activeOption?.name) return (
        <div id="ov25-filter-empty" className="ov:w-full ov:h-full ov:p-4 ov:pt-16 ov:flex ov:justify-center">
            <h3 className="ov:text-lg ov:text-[var(--ov25-secondary-text-color)]">No filters available</h3>
        </div>
    );

    const activeFilters = availableProductFilters[activeOption.name];
    const doAnyFiltersExist = activeFilters && Object.keys(activeFilters).length > 0 && Object.keys(activeFilters).some(key => activeFilters[key]?.length > 0)
    if (!doAnyFiltersExist) return (
        <div id="ov25-filter-empty" className="ov:w-full ov:h-full ov:p-4 ov:pt-16 ov:flex ov:justify-center">
            <h3 className="ov:text-lg ov:text-[var(--ov25-secondary-text-color)]">No filters available</h3>
        </div>
    );

    return (
        <div id="ov25-filter-content" className="ov:w-full ov:h-full ov:pr-4 ov:pb-40 ov:overflow-y-auto">
            {Object.entries(activeFilters)
                .sort(([keyA], [keyB]) => {
                    if (keyA === 'Collections') return -1;
                    if (keyB === 'Collections') return 1;
                    return keyA.localeCompare(keyB);
                })
                .map(([filterKey, options]) => (
                options.length > 0 && (
                    <div key={filterKey} className="ov:mb-4">
                        <h3 className="ov:text-lg ov:text-[var(--ov25-secondary-text-color)] ov:mb-2">{filterKey}</h3>
                        <div className="ov:flex ov:flex-wrap ov:gap-2 ov:w-full">
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleFilterChange(filterKey, option.value, !option.checked)}
                                    className="ov:px-4 ov:py-2 ov:rounded-full ov:text-sm ov:border ov:border-[var(--ov25-border-color)] ov:text-[var(--ov25-secondary-text-color)] ov:transition-all ov:cursor-pointer hover:ov:bg-gray-50 data-[checked=true]:ov:border-[var(--ov25-highlight-color)] data-[checked=true]:ov:bg-[color-mix(in_srgb,var(--ov25-highlight-color)_20%,transparent)]"
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
