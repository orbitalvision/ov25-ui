import * as React from 'react'
import { ProductFilters, useOV25UI } from '../../contexts/ov25-ui-context.js';


interface FilterContentProps {
    optionId?: string; // Optional optionId for inline variant content
}

export const FilterContent: React.FC<FilterContentProps> = ({ optionId }) => {
    const { availableProductFilters, setAvailableProductFilters, activeOption, allOptionsWithoutModules } = useOV25UI();

    // Use provided optionId or fall back to activeOption
    const targetOption = optionId ? 
        allOptionsWithoutModules?.find(opt => opt.id === optionId) : 
        activeOption;

    const handleFilterChange = React.useCallback((filterKey: string, optionValue: string, checked: boolean) => {
        if (!targetOption?.name || !availableProductFilters?.[targetOption.name]?.[filterKey]) return;

        setAvailableProductFilters(prev => ({
            ...prev,
            [targetOption.name]: {
                ...prev[targetOption.name],
                [filterKey]: prev[targetOption.name][filterKey].map(opt => 
                    opt.value === optionValue ? { ...opt, checked } : opt
                )
            }
        }));
    }, [targetOption, availableProductFilters, setAvailableProductFilters]);

    if (!availableProductFilters || !targetOption?.name) return (
        <div id="ov25-filter-empty" className="ov:w-full ov:h-full ov:p-4 ov:pt-16 ov:flex ov:justify-center">
            <h3 className="ov:text-lg ov:text-[var(--ov25-secondary-text-color)]">No filters available</h3>
        </div>
    );

    const activeFilters = availableProductFilters[targetOption.name];
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
                                    className={`ov:px-4 ov:py-2 ov:rounded-full ov:text-sm ov:border ov:text-[var(--ov25-secondary-text-color)] ov:transition-all ov:cursor-pointer ov:hover:bg-gray-50 ${option.checked ? 'ov:border-[var(--ov25-highlight-color)] ov:bg-[color-mix(in_srgb,var(--ov25-highlight-color)_20%,transparent)]' : 'ov:border-[var(--ov25-border-color)]'}`}
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
