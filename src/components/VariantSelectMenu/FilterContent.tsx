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
    if (!activeFilters) return (
        <div className="ov:w-full ov:h-full ov:p-4 ov:pt-16 ov:flex ov:justify-center">
            <h3 className="ov:text-lg ov:text-[var(--ov25-secondary-text-color)]">No filters available</h3>
        </div>
    );

    return (
        <div className="ov:w-full ov:h-full ov:pr-4 ov:overflow-y-auto">
            {Object.entries(activeFilters)
                .sort(([keyA], [keyB]) => {
                    if (keyA === 'Categories') return -1;
                    if (keyB === 'Categories') return 1;
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
                                    className={`
                                        ov:px-4 ov:py-2 ov:rounded-full ov:text-sm
                                        ov:border ov:transition-all
                                        ${option.checked 
                                            ? 'ov:border-green-500 ov:bg-green-50 ov:text-green-700' 
                                            : 'ov:border-[var(--ov25-border-color)] ov:text-[var(--ov25-secondary-text-color)]'
                                        }
                                        ov:hover:bg-gray-50
                                    `}
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
