import * as React from 'react'
import { useOV25UI } from '../../contexts/ov25-ui-context.js';
import { VariantDisplayStyleOverlay } from '../../types/config-enums.js';

const wrapperBaseClass = 'ov25-filter-content-wrapper ov:flex ov:justify-end ov:z-10 ov:flex-wrap ov:overflow-y-auto ov:absolute ov:inset-0 ov:p-2 ov:px-4 ov:bg-[var(--ov25-background-color)]';

export type FilterContentWrapperVariant = 'desktop' | 'mobile' | 'sheet' | 'accordion' | 'inline';

interface FilterContentProps {
    optionId?: string;
    optionIds?: string[];
    /** Wrapper layout/transition: desktop (slide from left), mobile (slide from bottom), sheet (overlay, no transition), accordion (no overlay), inline (e.g. wizard, always visible) */
    wrapperVariant?: FilterContentWrapperVariant;
    /** For desktop/mobile: whether the filter sheet is open (drives transition) */
    isOpen?: boolean;
}

export const FilterContent: React.FC<FilterContentProps> = ({ optionId, optionIds, wrapperVariant = 'sheet', isOpen = true }) => {
    const { availableProductFilters, setAvailableProductFilters, activeOption, allOptions, isMobile, variantDisplayStyleOverlay } = useOV25UI();

    const targetOptions = React.useMemo(() => {
        const ids = optionIds ?? (optionId ? [optionId] : []);
        return ids.map(id => allOptions?.find(opt => opt.id === id)).filter(Boolean) as { id: string; name: string; groups?: { name: string }[] }[];
    }, [optionIds, optionId, allOptions]);

    const fallbackOption = optionId ? allOptions?.find(opt => opt.id === optionId) : activeOption;
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

    const innerContent = !availableProductFilters || optionsToRender.length === 0 ? (
        <div id="ov25-filter-empty" className="ov:w-full ov:max-h-fit ov:p-4 ov:pt-16 ov:flex ov:justify-center">
            <h3 className="ov:text-sm ov:text-(--ov25-secondary-text-color)">No filters available</h3>
        </div>
    ) : (
        <div id="ov25-filter-content" className="ov:w-full ov:max-h-fit ov:pr-4 ov:pb-40 ov:overflow-y-auto">
            {optionsToRender.map((targetOption) => {
                const activeFilters = availableProductFilters[targetOption.name];
                const doAnyFiltersExist = activeFilters && Object.keys(activeFilters).length > 0 && Object.keys(activeFilters).some(key => activeFilters[key]?.length > 0);
                if (!doAnyFiltersExist) return null;

                return (
                    <div key={targetOption.id} className="ov:mb-6">
                        {isMobile || variantDisplayStyleOverlay === VariantDisplayStyleOverlay.List ? <h4 className="ov25-filter-option-header ov:text-sm ov:font-medium ov:text-[var(--ov25-secondary-text-color)] ov:mb-2 ov:capitalize">{targetOption.name}</h4> : null}
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
                                        <h3 className="ov25-filter-group-header ov:text-xs ov:font-medium ov:text-(--ov25-secondary-text-color) ov:mb-1.5 ov:uppercase">{filterKey}</h3>
                                        <div className="ov:flex ov:flex-wrap ov:gap-1.5 ov:w-full">
                                            {options.map((option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => handleFilterChange(filterKey, option.value, !option.checked, targetOption.name)}
                                                    className={`ov25-filter-pill ov:px-3 ov:py-1.5 ov:rounded-full ov:text-xs ov:border ov:text-(--ov25-secondary-text-color) ov:transition-all ov:cursor-pointer ov:hover:bg-gray-50 ${option.checked ? 'ov:border-[var(--ov25-highlight-color,#26E8FE)] ov:bg-[color-mix(in_srgb,var(--ov25-highlight-color,#26E8FE)_20%,transparent)]' : 'ov:border-[var(--ov25-border-color)]'}`}
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
    );

    const wrapperClass = React.useMemo(() => {
        const transition = 'ov:transition-transform ov:duration-500 ov:ease-in-out';
        switch (wrapperVariant) {
            case 'desktop':
                return `${wrapperBaseClass} ov25-filter-sheet-overlay ov:z-8 ov:h-full ${transition} ${isOpen ? 'ov:translate-y-0' : 'ov:-translate-y-full'}`;
            case 'mobile':
                return `${wrapperBaseClass} ${transition} ${isOpen ? 'ov:translate-y-0' : 'ov:translate-y-full'}`;
            case 'sheet':
                return `${wrapperBaseClass} ov25-filter-sheet-overlay ov:z-20`;
            case 'accordion':
                return `${wrapperBaseClass} ov:z-20`;
            case 'inline':
            default:
                return `${wrapperBaseClass} ov:z-8 ov:h-full ov:translate-y-0`;
        }
    }, [wrapperVariant, isOpen]);

    const wrapperId = wrapperVariant === 'desktop' ? 'ov25-filter-content-wrapper-desktop' : wrapperVariant === 'mobile' ? 'ov25-filter-content-wrapper-mobile' : undefined;
    const wrapperDataOpen = (wrapperVariant === 'desktop' || wrapperVariant === 'mobile') ? isOpen : undefined;

    return (
        <div
            id={wrapperId}
            data-open={wrapperDataOpen}
            className={wrapperClass}
        >
            {innerContent}
        </div>
    );
}
