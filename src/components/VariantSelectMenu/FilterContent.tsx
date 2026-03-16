import * as React from 'react'
import { ProductFilters, useOV25UI } from '../../contexts/ov25-ui-context.js';


interface FilterContentProps {
    optionId?: string;
    optionIds?: string[];
}

export const FilterContent: React.FC<FilterContentProps> = ({ optionId, optionIds }) => {
    const { availableProductFilters, setAvailableProductFilters, activeOption, allOptionsWithoutModules } = useOV25UI();

    const targetOptions = React.useMemo(() => {
        const ids = optionIds ?? (optionId ? [optionId] : []);
        return ids.map(id => allOptionsWithoutModules?.find(opt => opt.id === id)).filter(Boolean) as { id: string; name: string; groups?: { name: string }[] }[];
    }, [optionIds, optionId, allOptionsWithoutModules]);

    const fallbackOption = optionId ? allOptionsWithoutModules?.find(opt => opt.id === optionId) : activeOption;
    const optionsToRender = targetOptions.length > 0 ? targetOptions : (fallbackOption ? [fallbackOption] : []);

    const handleFilterChange = React.useCallback((filterKey: string, optionValue: string, checked: boolean, optionName: string) => {
        if (!optionName || !availableProductFilters?.[optionName]?.[filterKey]) return;
        setAvailableProductFilters(prev => ({
            ...prev,
            [optionName]: {
                ...prev[optionName],
                [filterKey]: prev[optionName][filterKey].map(opt =>
                    opt.value === optionValue ? { ...opt, checked } : opt
                )
            }
        }));
    }, [availableProductFilters, setAvailableProductFilters]);

    if (!availableProductFilters || optionsToRender.length === 0) return (
        <div id="ov25-filter-empty" className="ov:w-full ov:max-h-fit ov:p-4 ov:pt-16 ov:flex ov:justify-center">
            <h3 className="ov:text-sm ov:text-[var(--ov25-secondary-text-color)]">No filters available</h3>
        </div>
    );

    return (
        <div id="ov25-filter-content" className="ov:w-full ov:max-h-fit ov:pr-4 ov:pb-40 ov:overflow-y-auto">
            {optionsToRender.map((targetOption) => {
                const activeFilters = availableProductFilters[targetOption.name];
                const doAnyFiltersExist = activeFilters && Object.keys(activeFilters).length > 0 && Object.keys(activeFilters).some(key => activeFilters[key]?.length > 0);
                if (!doAnyFiltersExist) return null;

                return (
                    <div key={targetOption.id} className="ov:mb-6">
                        <h4 className="ov:text-sm ov:font-medium ov:text-[var(--ov25-secondary-text-color)] ov:mb-2 ov:capitalize">{targetOption.name}</h4>
                        {Object.entries(activeFilters)
                            .filter(([filterKey]) => {
                                if (filterKey !== 'Collections') return true;
                                const groupCount = (targetOption as { groups?: unknown[] }).groups?.length ?? 0;
                                return groupCount > 1;
                            })
                            .sort(([keyA], [keyB]) => {
                                if (keyA === 'Collections') return -1;
                                if (keyB === 'Collections') return 1;
                                return keyA.localeCompare(keyB);
                            })
                            .map(([filterKey, options]) => (
                                options.length > 0 && (
                                    <div key={filterKey} className="ov:mb-3">
                                        <h3 className="ov:text-xs ov:font-medium ov:text-[var(--ov25-secondary-text-color)] ov:mb-1.5 ov:uppercase">{filterKey}</h3>
                                        <div className="ov:flex ov:flex-wrap ov:gap-1.5 ov:w-full">
                                            {options.map((option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => handleFilterChange(filterKey, option.value, !option.checked, targetOption.name)}
                                                    className={`ov:px-3 ov:py-1.5 ov:rounded-full ov:text-xs ov:border ov:text-[var(--ov25-secondary-text-color)] ov:transition-all ov:cursor-pointer ov:hover:bg-gray-50 ${option.checked ? 'ov:border-[var(--ov25-highlight-color)] ov:bg-[color-mix(in_srgb,var(--ov25-highlight-color)_20%,transparent)]' : 'ov:border-[var(--ov25-border-color)]'}`}
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
                );
            })}
        </div>
    )
}
