import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { ProductVariants, Variant } from './ProductVariants.js';
import { AccordionVariants } from './AccordionVariants.js';
import { TreeVariants } from './TreeVariants.js';
import { useOV25UI } from "../../contexts/ov25-ui-context.js";
import { closeModuleSelectMenu, selectModule, CompatibleModule } from '../../utils/configurator-utils.js';
import { SizeVariantCard } from "./variant-cards/SizeVariantCard.js";
import { ModuleVariantCard } from "./variant-cards/ModuleVariantCard.js";
import { VariantsHeader } from './VariantsHeader.js';
import { VariantsContent } from './VariantsContent.js';
import { DefaultVariantCard } from './variant-cards/DefaultVariantCard.js';
import { CheckoutButton } from './CheckoutButton.js';
import { getGridColsClass } from './DesktopVariants.js';
import { VariantDisplayStyleOverlay } from '../../types/config-enums.js';
import { FilterControls } from './FilterControls.js';
import { FilterContent } from './FilterContent.js';

export type DrawerSizes = 'closed' | 'small' | 'large';

const capitalizeWords = (str: string) =>
  str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

export interface ProductVariantsWrapperProps {
  isInline?: boolean;
}

export function ProductVariantsWrapper({ isInline = false }: ProductVariantsWrapperProps = {}) {
    const {
        isVariantsOpen,
        setIsVariantsOpen,
        isMobile,
        drawerSize,
        activeOptionId,
        setActiveOptionId,
        handleOptionClick,
        sizeOption,
        handleSelectionSelect,
        currentProductId,
        selectedSelections,
        products,
        compatibleModules,
        isModuleSelectionLoading,
        setIsModuleSelectionLoading,
        configuratorState,
        allOptionsWithoutModules,
        applySearchAndFilters,
        searchQueries,
        availableProductFilters,
        variantDisplayStyleOverlay,
        variantDisplayStyleOverlayMobile,
        variantDisplayStyleMobile,
        hidePricing,
        configuratorDisplayModeMobile,
      } = useOV25UI();

    const hasSnap2Objects = (configuratorState?.snap2Objects?.length ?? 0) > 0;
    const hasNoModulesToShow = !compatibleModules || compatibleModules.length === 0;

    useEffect(() => {
      if (isMobile && !isInline && activeOptionId === 'modules' && hasSnap2Objects && hasNoModulesToShow && allOptionsWithoutModules.length > 0) {
        setActiveOptionId(allOptionsWithoutModules[0].id);
      }
    }, [isMobile, isInline, activeOptionId, hasSnap2Objects, hasNoModulesToShow, allOptionsWithoutModules, setActiveOptionId]);

    const [activeTab, setActiveTab] = useState<string>('size');
    const [useTabsDropdown, setUseTabsDropdown] = useState(false);
    const [listScrollHeight, setListScrollHeight] = useState(0);
    const [isFilterOpen, setIsFilterOpen] = useState<Record<string, boolean>>({});
    const tabsMeasureRef = useRef<HTMLDivElement>(null);
    const listScrollRef = useRef<HTMLDivElement>(null);

    const toggleFilter = useCallback((optionId: string) => {
        setIsFilterOpen(prev => ({ ...prev, [optionId]: !prev[optionId] }));
    }, []);

    const handleCloseVariants = () => {
      if (activeOptionId === 'modules') {
        closeModuleSelectMenu();
      }
      setIsVariantsOpen(false);
    };

    // Wrapper to convert Variant to Selection format for handleSelectionSelect
    const handleVariantSelect = useCallback((variant: Variant) => {
      // Convert Variant to Selection-like object
      const selection = {
        id: variant.id,
        name: variant.name,
        price: variant.price,
        blurHash: variant.blurHash || '',
        groupId: variant.groupId,
        thumbnail: variant.image,
        miniThumbnails: variant.image ? { medium: variant.image } : undefined,
      };
      handleSelectionSelect(selection as any, variant.optionId);
    }, [handleSelectionSelect]);

    // Apply filters and search to all options (memoized to recalculate when filters/search change)
    const filteredOptions = useMemo(() => {
      return allOptionsWithoutModules.map(option => {
        if (option.id === 'size') return option; // Size doesn't need filtering
        return applySearchAndFilters(option, option.id);
      });
    }, [allOptionsWithoutModules, applySearchAndFilters, searchQueries, availableProductFilters]);

    // Memoize size variants to recalculate when selectedSelections changes
    const sizeVariants = useMemo(() => {
      if (!sizeOption?.groups?.[0]?.selections) return [];
      return sizeOption.groups[0].selections.map(selection => ({
        id: selection?.id,
        optionId: 'size', // Required for handleVariantSelect to work
        name: selection?.name,
        price: selection?.price,
        image: selection?.thumbnail || '/placeholder.svg?height=200&width=200',
        blurHash: (selection as any)?.blurHash,
        data: products?.find(p => p?.id === selection?.id),
        isSelected: selection.id === currentProductId || selectedSelections.some(
          sel => sel.optionId === 'size' && sel.selectionId === selection.id
        )
      }));
    }, [sizeOption, currentProductId, selectedSelections, products]);

    // Memoize variants for all other options to recalculate when selectedSelections changes
    const allOptionsVariants = useMemo(() => {
      return filteredOptions
        .map((filteredOption, index) => {
          const option = allOptionsWithoutModules[index];
          if (option.id === 'size') return null; // Size is handled separately
          
          return {
            optionId: option.id,
            optionName: option.name,
            variants: filteredOption.groups
              ?.filter(group => 'name' in group && group.name) // Only include groups with names
              ?.map(group => ({
                groupName: 'name' in group ? group.name : 'Default Group',
                variants: group?.selections?.map(selection => ({
                  id: selection?.id,
                  groupId: group?.id,
                  optionId: option.id,
                  name: selection?.name,
                  price: selection?.price,
                  image: (selection as any)?.miniThumbnails?.medium || '/placeholder.svg?height=200&width=200',
                  blurHash: (selection as any).blurHash,
                  isSelected: selectedSelections.some(
                    sel => sel.optionId === option.id && 
                          sel.groupId === group.id && 
                          sel.selectionId === selection.id
                  ),
                  swatch: (selection as any)?.swatch
                })).sort((a, b) => a.name.localeCompare(b.name))
              })) || []
          };
        })
        .filter((item): item is { optionId: string; optionName: string; variants: any[] } => item !== null);
    }, [filteredOptions, allOptionsWithoutModules, selectedSelections]);

    const showSize = allOptionsWithoutModules.some((o) => o.id === 'size') && sizeVariants.length > 0;

    const listLikeOverlays: VariantDisplayStyleOverlay[] = [
      VariantDisplayStyleOverlay.List,
      VariantDisplayStyleOverlay.Tabs,
      VariantDisplayStyleOverlay.Accordion,
      VariantDisplayStyleOverlay.Tree,
    ];
    const drawerMobileStyle: VariantDisplayStyleOverlay = ['list', 'tabs', 'tree'].includes(variantDisplayStyleMobile)
      ? (variantDisplayStyleMobile as VariantDisplayStyleOverlay)
      : VariantDisplayStyleOverlay.List;
    const effectiveVariantDisplayStyleOverlay = isMobile && !isInline
      ? drawerMobileStyle
      : isMobile
        ? variantDisplayStyleOverlayMobile
        : variantDisplayStyleOverlay;
    const isListLike = listLikeOverlays.includes(effectiveVariantDisplayStyleOverlay);

    const tabIds = useMemo(() => {
      const ids = showSize ? ['size', ...allOptionsVariants.map((o) => o.optionId)] : allOptionsVariants.map((o) => o.optionId);
      return ids;
    }, [showSize, allOptionsVariants]);

    useEffect(() => {
      if (activeOptionId && tabIds.includes(activeOptionId)) {
        setActiveTab(activeOptionId);
      } else if (!tabIds.includes(activeTab)) {
        setActiveTab(tabIds[0] ?? 'size');
      }
    }, [tabIds, activeTab, activeOptionId]);

    useEffect(() => {
      const el = tabsMeasureRef.current;
      const section = el?.parentElement?.parentElement;
      if (!el || !section) return;
      const checkOverflow = () => {
        const { paddingLeft, paddingRight } = getComputedStyle(section);
        const contentWidth = section.clientWidth - (parseFloat(paddingLeft) || 0) - (parseFloat(paddingRight) || 0);
        setUseTabsDropdown(el.scrollWidth > contentWidth - 2);
      };
      checkOverflow();
      const ro = new ResizeObserver(checkOverflow);
      ro.observe(section);
      return () => ro.disconnect();
    }, [tabIds]);

    useEffect(() => {
      const el = listScrollRef.current;
      if (!el) return;
      const updateHeight = () => {
        if (effectiveVariantDisplayStyleOverlay === VariantDisplayStyleOverlay.List) {
          setListScrollHeight(el.clientHeight);
        }
      };
      const ro = new ResizeObserver(updateHeight);
      ro.observe(el);
      updateHeight();
      return () => ro.disconnect();
    }, [effectiveVariantDisplayStyleOverlay]);

    const getTabLabel = (id: string) =>
      id === 'size' ? 'Size' : allOptionsVariants.find((o) => o.optionId === id)?.optionName ?? id;

    const renderSizeSection = (showHeader = true, isMobileListSticky = false) => (
      <div className=" ov:pb-6">
        {showHeader && (
          <h3 className={`ov25-option-header ov:sticky ov:top-0  ov:px-4 ov:z-10 ov:bg-[var(--ov25-background-color)] ov:text-lg ov:pb-4 ov:text-[var(--ov25-secondary-text-color)] ${isMobileListSticky ? 'ov:pt-2' : 'ov:pt-0'}`}>
            {capitalizeWords('Size')}
          </h3>
        )}
        <div className="ov:bg-[var(--ov25-background-color)] ov:pt-4">
          <div className={`ov:grid ${getGridColsClass(2)}`}>
            <VariantsContent
              variantsToRender={sizeVariants}
              VariantCard={SizeVariantCard}
              isMobile={isMobile}
              onSelect={handleVariantSelect}
            />
          </div>
        </div>
      </div>
    );

    const renderFilterBlock = (optionId: string, optionIds?: string[]) => (
        <FilterControls
          isFilterOpen={!!isFilterOpen[optionId]}
          setIsFilterOpen={() => toggleFilter(optionId)}
          isGrouped={false}
          optionId={optionIds ? undefined : optionId}
          optionIds={optionIds}
        />
    );

    const renderOptionSection = ({ optionId, optionName, variants }: { optionId: string; optionName: string; variants: any[] }, showHeader = true, isMobileListSticky = false, showFilter = true) => (
      <div key={optionId} className=" ov:pb-6">
        {showHeader && (
          <h3 className={`ov25-option-header ov:sticky ov:top-0  ov:px-4 ov:z-10 ov:bg-[var(--ov25-background-color)] ov:text-lg ov:pb-2 ov:md:pb-4 ov:text-[var(--ov25-secondary-text-color)] ${isMobileListSticky ? 'ov:pt-2' : 'ov:pt-0'}`}>
            {capitalizeWords(optionName)}
          </h3>
        )}
        {showFilter && renderFilterBlock(optionId)}
        <div className="ov:relative">
          {variants.map((group) =>
            group.variants.length > 0 ? (
              <div key={group.groupName} className="ov:mb-4">
                {variants.length > 1 && (
                  <h4 className={`ov25-group-header ov:sticky ov:z-[9] ov:bg-[var(--ov25-background-color)] ov:px-4 ov:text-sm ov:pt-6 ov:pb-3 ov:text-[var(--ov25-secondary-text-color)] ov:font-medium ${showHeader ? 'ov:top-10' : 'ov:top-0'}`}>
                    {capitalizeWords(group.groupName)}
                  </h4>
                )}
                <div className="ov25-variant-group-content ov:bg-[var(--ov25-background-color)] ov:pt-4">
                  <div className={`ov:grid ${getGridColsClass(4)}`}>
                    <VariantsContent
                      variantsToRender={group.variants}
                      VariantCard={DefaultVariantCard}
                      isMobile={isMobile}
                      onSelect={handleVariantSelect}
                      compactSpacing
                    />
                  </div>
                </div>
              </div>
            ) : null
          )}
          {showFilter && isFilterOpen[optionId] && (
            <FilterContent optionId={optionId} wrapperVariant="sheet" />
          )}
        </div>
      </div>
    );

    const needsBottomMarginForButton = isMobile && !isInline;
    const isMobileList = isMobile && !isInline && effectiveVariantDisplayStyleOverlay === VariantDisplayStyleOverlay.List;

    // When the active option changes, scroll to the active option (list mode only, used for when you have a custom button to open the configurator on an option)
    useEffect(() => {
      if (effectiveVariantDisplayStyleOverlay === VariantDisplayStyleOverlay.List && activeOptionId && listScrollRef.current) {
        const el = listScrollRef.current.querySelector(`[data-ov25-option-id="${activeOptionId}"]`);
        el?.scrollIntoView({ block: 'start', behavior: 'smooth' });
      }
    }, [activeOptionId, effectiveVariantDisplayStyleOverlay]);

    const handleModuleSelect = useCallback((variant: Variant) => {
      if (isModuleSelectionLoading) return;
      const module = variant.data as CompatibleModule;
      const modelPath = module?.model?.modelPath;
      const modelId = module?.model?.modelId;
      if (!modelPath || !modelId) return;
      setIsModuleSelectionLoading(true);
      selectModule(modelPath, modelId);
    }, [isModuleSelectionLoading, setIsModuleSelectionLoading]);

    const listFilterOptionIds = tabIds.filter(id => id !== 'size');
    const listFilterKey = listFilterOptionIds.join(',');

    const hasOptionVariants = (opt: { optionId: string; optionName: string; variants: any[] }) =>
      opt.variants.some((g: { variants: any[] }) => g.variants.length > 0);

    const listOptionsToShow = useMemo(() => {
      const withVariants = allOptionsVariants.filter(hasOptionVariants);
      if (effectiveVariantDisplayStyleOverlay !== VariantDisplayStyleOverlay.List) return withVariants;
      const listOptionIdsWithSelectedFilters = availableProductFilters
        ? listFilterOptionIds.filter((optionId) => {
            const opt = allOptionsVariants.find((o) => o.optionId === optionId);
            if (!opt) return false;
            const optionFilters = availableProductFilters[opt.optionName];
            if (!optionFilters) return false;
            return Object.keys(optionFilters).some((key) =>
              (optionFilters[key]?.some((f: { checked: boolean }) => f.checked) ?? false)
            );
          })
        : [];
      if (listOptionIdsWithSelectedFilters.length === 0) return withVariants;
      return withVariants.filter((opt) => listOptionIdsWithSelectedFilters.includes(opt.optionId));
    }, [allOptionsVariants, effectiveVariantDisplayStyleOverlay, listFilterOptionIds, availableProductFilters]);

    const listFilterBlock = effectiveVariantDisplayStyleOverlay === VariantDisplayStyleOverlay.List && listFilterOptionIds.length > 0 && (
      renderFilterBlock(listFilterKey, listFilterOptionIds)
    );

    if (isMobile && activeOptionId === 'modules') {
      const isLoading = (!compatibleModules || compatibleModules.length === 0) &&
        (!configuratorState?.snap2Objects || configuratorState.snap2Objects.length === 0);

      if (isLoading) {
        return (
          <div className="ov:flex ov:flex-col ov:items-center ov:justify-center ov:py-8 ov:space-y-4">
            <p className="ov:text-sm ov:text-[var(--ov25-secondary-text-color)]">Loading...</p>
          </div>
        );
      }

      return (
        <ProductVariants
          isOpen={isVariantsOpen}
          gridDivide={2}
          onClose={handleCloseVariants}
          title="Modules"
          variants={(compatibleModules || []).map(module => ({
            id: `${module.productId}-${module.model.modelId}`,
            name: module.product.name,
            price: 0,
            image: module.product.hasImage ? module.product.imageUrl : '/placeholder.svg?height=200&width=200',
            blurHash: '',
            data: module,
            isSelected: false
          } as Variant))}
          VariantCard={(props) => (
            <ModuleVariantCard
              {...props}
              isLoading={isModuleSelectionLoading}
            />
          )}
          drawerSize={drawerSize}
          onSelect={handleModuleSelect}
          isMobile={isMobile}
        />
      );
    }

    const renderFilterSheet = (props: { optionId?: string; optionIds?: string[] }) => (
      <FilterContent optionId={props.optionId} optionIds={props.optionIds} wrapperVariant="sheet" />
    );

    const tabsHeaderAndFilter = (
      <>
        <div className="ov25-tabs-header ov:relative ov:shrink-0 ov:flex ov:items-stretch ov:gap-0 ov:px-4 ov:pt-4 ov:pb-0 ov:bg-[var(--ov25-background-color)]">
          <div className="ov:absolute ov:left-4 ov:right-4 ov:top-4 ov:overflow-hidden ov:opacity-0 ov:pointer-events-none ov:invisible" aria-hidden>
            <div ref={tabsMeasureRef} className="ov:inline-flex ov:gap-2 ov:whitespace-nowrap">
              {tabIds.map((id) => (
                <span
                  key={id}
                  className="ov:shrink-0 ov:px-4 ov:py-2.5 ov:text-sm ov:rounded-t-md ov:font-medium ov:border ov:border-b-0 ov:border-transparent ov:box-border"
                  style={{ boxSizing: 'border-box' }}
                >
                  {capitalizeWords(getTabLabel(id))}
                </span>
              ))}
            </div>
          </div>
          {useTabsDropdown ? (
            <div className="ov:relative ov:w-full ov:md:pb-3" data-ov25-tabs data-ov25-tabs-dropdown>
              <div className="ov25-gradient ov:rounded-full ov:p-[3px]">
                <div className="ov:relative ov:rounded-full ov:bg-[var(--ov25-background-color)] ov:flex ov:items-center">
                  <select
                    id="ov25-tabs-dropdown-select"
                    value={activeTab}
                    onChange={(e) => {
                      const id = e.target.value;
                      setActiveTab(id);
                      handleOptionClick(id);
                    }}
                    data-ov25-tab-select
                    className="ov:w-full ov:appearance-none ov:bg-transparent ov:rounded-full ov:px-4 ov:py-2.5 ov:text-sm ov:pr-10 ov:cursor-pointer ov:focus:outline-none ov:focus:ring-0 ov:text-[var(--ov25-text-color)]"
                  >
                    {tabIds.map((id) => (
                      <option key={id} value={id}>
                        {capitalizeWords(getTabLabel(id))}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="ov:absolute ov:right-3 ov:top-1/2 ov:-translate-y-1/2 ov:pointer-events-none ov:text-[var(--ov25-secondary-text-color)] ov:shrink-0" />
                </div>
              </div>
            </div>
          ) : (
            <div className="ov:flex ov:gap-2 ov:overflow-x-auto ov:flex-1 ov:min-w-0 ov:pb-3 ov:justify-center" data-ov25-tabs>
              {tabIds.map((id) => {
                const label = getTabLabel(id);
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setActiveTab(id);
                      handleOptionClick(id);
                    }}
                    data-ov25-tab
                    data-ov25-tab-id={id}
                    data-ov25-tab-active={isActive ? 'true' : undefined}
                    className={`ov25-tabs-button ov:shrink-0 ov:px-4 ov:py-2.5 ov:text-sm ov:rounded-t-md ov:font-medium ov:transition-colors ov:border ov:border-b-0 ov:border-transparent ${
                      isActive
                        ? 'ov:bg-[var(--ov25-text-color)] ov:text-[var(--ov25-background-color)] ov:-[var(--ov25-text-color)] ov:border-[var(--ov25-border-color)] ov:shadow-[0_-1px_0_0_var(--ov25-background-color)]'
                        : 'ov:bg-[var(--ov25-secondary-background-color)] ov:text-[var(--ov25-secondary-text-color)] hover:ov:text-[var(--ov25-text-color)] hover:ov:bg-[var(--ov25-hover-color)] ov:cursor-pointer'
                    }`}
                  >
                    {capitalizeWords(label)}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {activeTab !== 'size' && (
          <div className="ov:shrink-0">
            {renderFilterBlock(activeTab)}
          </div>
        )}
      </>
    );

    const tabsContent = (
      <div className={`ov:flex ov:flex-col ov:min-h-0 ${isInline ? 'ov:flex-1 ov:overflow-hidden' : 'ov:min-h-full'}`} data-ov25-tabs-container>
        {isInline ? (
          <div className="ov:shrink-0 ov:bg-[var(--ov25-background-color)]">
            {tabsHeaderAndFilter}
          </div>
        ) : (
          tabsHeaderAndFilter
        )}
        <div id="ov25-variants-content-wrapper" className={`ov:relative ov:flex-1 ov:min-h-0 ov:flex ov:flex-col ${isInline ? 'ov:overflow-hidden' : ''}`}>
          <div className={`ov:flex-1 ov:min-h-0 ov:pt-0 ${needsBottomMarginForButton ? 'ov:pb-20' : 'ov:pb-2'} ${activeTab !== 'size' && isFilterOpen[activeTab] ? 'ov:overflow-hidden' : 'ov:overflow-y-auto'}`}>
            {activeTab === 'size' && showSize && renderSizeSection(false)}
            {activeTab !== 'size' && allOptionsVariants.map((opt) => (opt.optionId === activeTab ? renderOptionSection(opt, false, false, false) : null))}
          </div>
          {activeTab !== 'size' && isFilterOpen[activeTab] && (
            <FilterContent optionId={activeTab} wrapperVariant="sheet" />
          )}
        </div>
      </div>
    );

    const useTree = effectiveVariantDisplayStyleOverlay === VariantDisplayStyleOverlay.Tree;
    const useAccordion = effectiveVariantDisplayStyleOverlay === VariantDisplayStyleOverlay.Accordion && !isMobile;
    const isTabs = effectiveVariantDisplayStyleOverlay === VariantDisplayStyleOverlay.Tabs;

    // tabs, tree, accordion, list
    const displayContent =
      effectiveVariantDisplayStyleOverlay === VariantDisplayStyleOverlay.Tabs
        ? tabsContent
        : useTree
          ? <TreeVariants mode={isInline ? 'inline' : 'drawer'} />
          : useAccordion
            ? <AccordionVariants mode={isInline ? 'inline' : 'drawer'} />
            : (
                <div>
                  {showSize && (
                    <div data-ov25-option-id="size">
                      {renderSizeSection(true, isMobileList)}
                    </div>
                  )}
                  {listOptionsToShow.map((opt) => (
                    <div key={opt.optionId} data-ov25-option-id={opt.optionId}>
                      {renderOptionSection(opt, true, isMobileList, effectiveVariantDisplayStyleOverlay !== VariantDisplayStyleOverlay.List)}
                    </div>
                  ))}
                </div>
              );

    const isListModeFilterOpen = effectiveVariantDisplayStyleOverlay === VariantDisplayStyleOverlay.List && !!isFilterOpen[listFilterKey];
    const contentScrollClass = (useAccordion || useTree || isTabs) ? 'ov:overflow-hidden' : isListModeFilterOpen ? 'ov:overflow-hidden' : 'ov:overflow-y-auto';
    const contentPaddingClass = (useAccordion || useTree || isTabs)
      ? (needsBottomMarginForButton ? 'ov:pb-16' : '')
      : (needsBottomMarginForButton ? 'ov:pt-0 ov:pb-20' : 'ov:pt-0 ov:pb-2');

    if (isListLike) {
      const isListMode = effectiveVariantDisplayStyleOverlay === VariantDisplayStyleOverlay.List;
      if (isInline) {
        return (
          <div
            data-ov25-list-variants-mode="inline"
            className="ov:flex ov:flex-col ov:flex-1 ov:min-h-0 ov:h-full ov:overflow-hidden ov:bg-[var(--ov25-background-color)]"
          >
            {isListMode && listFilterBlock}
            <div id="ov25-variants-content-wrapper" className="ov:relative ov:flex-1 ov:min-h-0 ov:flex ov:flex-col">
              <div
                ref={listScrollRef}
                data-ov25-list-variants-content
                className={`ov:min-h-0 ov:flex-1 ${(useAccordion || useTree || isTabs) ? 'ov:flex ov:flex-col' : ''} ${contentScrollClass} ${contentPaddingClass}`}
              >
                {displayContent}
              </div>
              {isListMode && isFilterOpen[listFilterKey] && renderFilterSheet({ optionIds: listFilterOptionIds })}
            </div>
            {!hidePricing && (
                <CheckoutButton />
            )}
          </div>
        );
      }

      return (
        <div className="ov:flex ov:flex-col ov:max-h-full ov:h-full ov:bg-[var(--ov25-background-color)]">
          <VariantsHeader />
          {isListMode && listFilterBlock}
          <div id="ov25-variants-content-wrapper" className="ov:relative ov:flex-1 ov:min-h-0 ov:flex ov:flex-col">
            <div ref={listScrollRef} className={`ov:min-h-0 ov:flex-1 ${(useAccordion || useTree || isTabs) ? 'ov:flex ov:flex-col' : ''} ${contentScrollClass} ${contentPaddingClass}`}>
              {displayContent}
            </div>
            {isListMode && isFilterOpen[listFilterKey] && renderFilterSheet({ optionIds: listFilterOptionIds })}
          </div>
          {(!isMobile || configuratorDisplayModeMobile === 'modal') && !hidePricing && (
            <CheckoutButton />
          )}
        </div>
      );
    }

    return (
      <div className="ov:md:flex ov:md:flex-col ov:max-h-full ov:h-full ov:relative">
        {showSize && (
          <div
            className="ov:absolute ov:inset-0"
            style={{ display: activeOptionId === 'size' ? 'block' : 'none' }}
          >
            <ProductVariants
              isOpen={isVariantsOpen}
              gridDivide={2}
              onClose={handleCloseVariants}
              title="Size"
              variants={sizeVariants}
              VariantCard={SizeVariantCard}
              drawerSize={drawerSize}
              onSelect={handleVariantSelect}
              isMobile={isMobile}
            />
          </div>
        )}
        {allOptionsVariants.map(({ optionId, optionName, variants }) => (
          <div
            key={optionId}
            className="ov:absolute ov:inset-0"
            style={{ display: activeOptionId === optionId ? 'block' : 'none' }}
          >
            <ProductVariants
              isOpen={isVariantsOpen}
              basis={isMobile ? 'ov:basis-[33%]' : undefined}
              gridDivide={4}
              onClose={handleCloseVariants}
              title={optionName}
              variants={variants}
              VariantCard={undefined}
              drawerSize={drawerSize}
              onSelect={handleVariantSelect}
              isMobile={isMobile}
            />
          </div>
        ))}
      </div>
    );
  }