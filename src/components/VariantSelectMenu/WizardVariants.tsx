import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useOV25UI } from '../../contexts/ov25-ui-context.js';
import { VariantsContent } from './VariantsContent.js';
import { NoResults } from './NoResults.js';
import { DefaultVariantCard } from './variant-cards/DefaultVariantCard.js';
import { SizeVariantCard } from './variant-cards/SizeVariantCard.js';
import { VariantThumb } from './variant-cards/VariantThumb.js';
import { FilterControls } from './FilterControls.js';
import { FilterContent } from './FilterContent.js';
import { Button } from '../ui/button.js';
import { CheckoutButton } from './CheckoutButton.js';

const BATCH_SIZE = 12;
const SIZE_BATCH_SIZE = 4;
const DROPDOWN_STEP_THRESHOLD = 6;

export type WizardVariantsMode = 'inline' | 'drawer';

export interface WizardVariantsProps {
  mode: WizardVariantsMode;
}

export const WizardVariants: React.FC<WizardVariantsProps> = ({ mode }) => {
  const {
    allOptionsWithoutModules,
    selectedSelections,
    handleSelectionSelect,
    getSelectedValue,
    range,
    products,
    currentProductId,
    applySearchAndFilters,
    buyNowFunction,
    addToBasketFunction,
    activeOptionId,
    setActiveOptionId,
  } = useOV25UI();

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const idx = allOptionsWithoutModules.findIndex(o => o.id === activeOptionId);
    if (idx >= 0) setCurrentStep(idx);
  }, [activeOptionId, allOptionsWithoutModules]);
  const [visibleCount, setVisibleCount] = useState<{ [optionId: string]: number }>({});
  const [isFilterOpen, setIsFilterOpen] = useState<{ [optionId: string]: boolean }>({});
  const [previousFilteredCounts, setPreviousFilteredCounts] = useState<{ [optionId: string]: number }>({});
  const [availableHeight, setAvailableHeight] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const sentinelRefs = useRef<{ [optionId: string]: HTMLDivElement | null }>({});

  const totalSteps = allOptionsWithoutModules.length + 1;
  const isReviewStep = currentStep === totalSteps - 1;
  const currentOption = isReviewStep ? null : allOptionsWithoutModules[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  const getBatchSize = (optionId: string) => optionId === 'size' ? SIZE_BATCH_SIZE : BATCH_SIZE;

  const loadMore = useCallback((optionId: string) => {
    setVisibleCount(prev => ({
      ...prev,
      [optionId]: (prev[optionId] || getBatchSize(optionId)) + getBatchSize(optionId)
    }));
  }, []);

  const goNext = () => {
    const nextStep = Math.min(currentStep + 1, totalSteps - 1);
    setCurrentStep(nextStep);
    setActiveOptionId(nextStep < allOptionsWithoutModules.length ? allOptionsWithoutModules[nextStep].id : null);
  };
  const goBack = () => {
    const prevStep = Math.max(currentStep - 1, 0);
    setCurrentStep(prevStep);
    setActiveOptionId(allOptionsWithoutModules[prevStep]?.id ?? null);
  };

  const toggleFilter = (optionId: string) => {
    setIsFilterOpen(prev => ({
      ...prev,
      [optionId]: !prev[optionId]
    }));
  };

  useEffect(() => {
    allOptionsWithoutModules.forEach(option => {
      const filteredOption = option.id === 'size' ? option : applySearchAndFilters(option, option.id);
      const currentFilteredCount = filteredOption.groups?.flatMap(group => group.selections || []).length || 0;
      const previousCount = previousFilteredCounts[option.id] || 0;

      if (currentFilteredCount !== previousCount) {
        setVisibleCount(prev => ({
          ...prev,
          [option.id]: getBatchSize(option.id)
        }));
        setPreviousFilteredCounts(prev => ({
          ...prev,
          [option.id]: currentFilteredCount
        }));
      }
    });
  }, [allOptionsWithoutModules, applySearchAndFilters, previousFilteredCounts]);

  useEffect(() => {
    setCurrentStep(s => Math.min(s, Math.max(0, totalSteps - 1)));
  }, [totalSteps]);

  useEffect(() => {
    if (mode !== 'drawer' || !rootRef.current) return;
    const el = rootRef.current;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setAvailableHeight(entry.contentRect.height);
    });
    ro.observe(el);
    setAvailableHeight(el.getBoundingClientRect().height);
    return () => ro.disconnect();
  }, [mode]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    Object.entries(sentinelRefs.current).forEach(([optionId, el]) => {
      if (!el) return;
      const root = el.closest('.ov-wizard-variants-scroll');
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) loadMore(optionId);
        },
        { root: root || null, rootMargin: '80px', threshold: 0 }
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach(o => o.disconnect());
  }, [loadMore, currentStep, visibleCount]);

  if (allOptionsWithoutModules.length === 0) return null;

  const filteredOption = !isReviewStep && currentOption
    ? (currentOption.id === 'size' ? currentOption : applySearchAndFilters(currentOption, currentOption.id))
    : null;
  const allVariants = filteredOption?.groups?.flatMap((group: any) =>
    group.selections?.map((selection: any) => ({
      id: selection.id,
      groupId: group.id,
      optionId: currentOption!.id,
      name: selection.name,
      price: selection.price,
      image: currentOption!.id === 'size'
        ? (selection.thumbnail || '/placeholder.svg?height=200&width=200')
        : (selection.miniThumbnails?.medium || '/placeholder.svg?height=200&width=200'),
      blurHash: selection.blurHash,
      data: currentOption!.id === 'size' ? products?.find(p => p?.id === selection?.id) : selection.data,
      isSelected: currentOption!.id === 'size'
        ? selection.id === currentProductId || selectedSelections.some(
            sel => sel.optionId === currentOption!.id && sel.selectionId === selection.id
          )
        : selectedSelections.some(
            sel => sel.optionId === currentOption!.id &&
              sel.groupId === group.id &&
              sel.selectionId === selection.id
          ),
      swatch: selection.swatch
    })) || []
  ).sort((a: any, b: any) => a.name.localeCompare(b.name)) ?? [];

  const count = currentOption ? (visibleCount[currentOption.id] ?? getBatchSize(currentOption.id)) : 0;
  const visibleVariants = allVariants.slice(0, count);
  const hasMore = count < allVariants.length;
  const isFilterOpenForOption = currentOption ? (isFilterOpen[currentOption.id] || false) : false;

  const useDropdown = totalSteps > DROPDOWN_STEP_THRESHOLD;
  const hasAddToBasket = typeof addToBasketFunction === 'function';
  const hasBuyNow = typeof buyNowFunction === 'function';
  const hasCheckoutActions = hasAddToBasket || hasBuyNow;
  const reviewStepLabel = hasCheckoutActions ? 'Review' : 'Overview';
  const getStepLabel = (idx: number) =>
    idx === totalSteps - 1 ? reviewStepLabel : allOptionsWithoutModules[idx]?.name ?? '';
  const currentStepLabel = getStepLabel(currentStep);
  const prevStepLabel = !isFirstStep ? getStepLabel(currentStep - 1) : null;
  const nextStepLabel = !isLastStep ? getStepLabel(currentStep + 1) : null;
  const stepContentClasses = mode === 'inline'
    ? 'ov:flex ov:flex-col  ov:bg-[var(--ov25-background-color)]'
    : 'ov:flex ov:flex-col ov:bg-[var(--ov25-background-color)]';

  const stepIndicatorBlock = (
    <div className="ov:flex ov:flex-col ov:gap-2 ov:px-4 ov:py-3">
      {useDropdown ? (
        <div className="ov:relative">
          <select
            value={currentStep}
            onChange={(e) => {
              const step = Number(e.target.value);
              setCurrentStep(step);
              setActiveOptionId(step < allOptionsWithoutModules.length ? allOptionsWithoutModules[step].id : null);
            }}
            className="ov:w-full ov:appearance-none ov:bg-transparent ov:border ov:border-[var(--ov25-border-color)] ov:rounded-md ov:px-3 ov:py-2 ov:text-sm ov:pr-8 ov:cursor-pointer ov:focus:outline-none ov:focus:ring-1 ov:focus:ring-[var(--ov25-primary-color)]"
          >
            {allOptionsWithoutModules.map((option, idx) => (
              <option key={option.id} value={idx}>{idx + 1}. {option.name}</option>
            ))}
            <option value={totalSteps - 1}>{totalSteps}. {reviewStepLabel}</option>
          </select>
          <ChevronDown size={16} className="ov:absolute ov:right-2 ov:top-1/2 ov:-translate-y-1/2 ov:pointer-events-none ov:text-[var(--ov25-secondary-text-color)]" />
        </div>
      ) : (
        <div className="ov:grid ov:grid-cols-[1fr_auto_1fr] ov:items-center ov:gap-4 ov:min-h-[48px]">
          <div className="ov:flex ov:justify-start">
            {prevStepLabel && (
              <button
                onClick={goBack}
                className="ov:flex ov:items-center ov:gap-1 ov:text-sm ov:text-[var(--ov25-secondary-text-color)] ov:opacity-70 ov:hover:opacity-100 ov:transition-opacity ov:cursor-pointer"
              >
                <ChevronLeft size={14} />
                {prevStepLabel}
              </button>
            )}
          </div>
          <div className="ov:flex ov:flex-col ov:items-center ov:justify-center ">
            <p className=" ov:text-[var(--ov25-secondary-text-color)] ov:font-light ov:text-sm">
              Step {currentStep + 1} of {totalSteps}
            </p>
            <p className="ov:text-base ov:font-semibold ov:text-[var(--ov25-primary-color)]">
              {currentStepLabel}
            </p>
          </div>
          <div className="ov:flex ov:justify-end">
            {nextStepLabel && (
              <button
                onClick={goNext}
                className="ov:flex ov:items-center ov:gap-1 ov:text-sm ov:text-[var(--ov25-secondary-text-color)] ov:opacity-70 ov:hover:opacity-100 ov:transition-opacity ov:cursor-pointer"
              >
                {nextStepLabel}
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const filterBlock = !isReviewStep && currentOption && currentOption.id !== 'size' && (
    <div className="ov:shrink-0 ov:h-[var(--ov25-wizard-variants-filter-height)] ov:flex ov:items-center">
      <div className="ov:w-full ov:p-1">
        <FilterControls
          isFilterOpen={isFilterOpenForOption}
          setIsFilterOpen={() => toggleFilter(currentOption!.id)}
          isGrouped={false}
          optionId={currentOption!.id}
        />
      </div>
    </div>
  );

  const buttonsBlock = totalSteps > 1 && (
    <div className="ov:shrink-0 ov:flex ov:items-center ov:justify-between ov:gap-3 ov:px-4 ov:py-3">
      <button
        onClick={goBack}
        disabled={isFirstStep}
        className="ov:flex ov:items-center ov:gap-1 ov:px-3 ov:py-2 ov:text-sm ov:text-[var(--ov25-secondary-text-color)] ov:disabled:opacity-30 ov:disabled:cursor-not-allowed ov:hover:bg-[var(--ov25-hover-color)] ov:rounded ov:transition-colors"
      >
        <ChevronLeft size={18} />
        Back
      </button>
      {isReviewStep && hasCheckoutActions ? (
        <div className="ov:flex-1 ov:min-w-0">
          <CheckoutButton />
        </div>
      ) : !isReviewStep ? (
        <Button
          onClick={goNext}
          variant="configure"
          className="ov:flex-1 ov:flex ov:items-center ov:justify-center  ov:gap-1 ov:uppercase ov:disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight size={18} />
        </Button>
      ) : null}
    </div>
  );

  const stepContentOnly = (
    <>
      {isReviewStep ? (
        <div
          data-ov25-wizard-variants-step-content
          className={stepContentClasses}
        >
          <div
              data-ov25-wizard-variants-content
              className="ov:flex ov:flex-col ov:min-h-0 ov:p-4 ov:overflow-y-auto"
            >
            <dl className="ov:space-y-3 ov:text-sm ov:flex-1">
              {allOptionsWithoutModules.map((option, idx) => {
                let value = '';
                let imageUrl = '';
                if (option.id === 'size') {
                  const sizeGroup = option.groups?.[0];
                  const sizeSelection = sizeGroup?.selections?.find((s: any) => s.id === currentProductId);
                  value = (range?.name ? range.name + ' ' : '') + (sizeSelection?.name || getSelectedValue(option));
                  imageUrl = sizeSelection?.thumbnail || '';
                } else {
                  const sel = selectedSelections.find(s => s.optionId === option.id);
                  const group = option.groups?.find((g: any) => g.id === sel?.groupId);
                  const selection = group?.selections?.find((s: any) => s.id === sel?.selectionId);
                  value = selection?.name || getSelectedValue(option);
                  imageUrl = (selection as any)?.miniThumbnails?.medium || selection?.thumbnail || '';
                }
                return (
                  <div key={option.id} className="ov:flex ov:items-center ov:gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentStep(idx);
                        setActiveOptionId(allOptionsWithoutModules[idx]?.id ?? null);
                      }}
                      className="ov:flex ov:items-center ov:gap-3 ov:w-full ov:text-left ov:cursor-pointer ov:hover:bg-[var(--ov25-hover-color)] ov:rounded-md ov:p-2 ov:-m-2 ov:transition-colors"
                    >
                      <div className="ov:shrink-0">
                        <VariantThumb imageUrl={imageUrl} size="lg" />
                      </div>
                      <div className="ov:flex ov:flex-1 ov:min-w-0 ov:justify-between ov:gap-4">
                        <dt className="ov:text-[var(--ov25-secondary-text-color)] ov:capitalize ov:shrink-0">{option.name}</dt>
                        <dd className="ov:text-[var(--ov25-secondary-text-color)] ov:font-normal ov:text-right ov:truncate">{value || '—'}</dd>
                      </div>
                    </button>
                  </div>
                );
              })}
            </dl>
            </div>
          </div>
        ) : (
        <div data-ov25-wizard-variants-step-content className={stepContentClasses}>
          <div data-ov25-wizard-variants-content className="ov:relative ov:w-full ov:flex ov:flex-col ov:flex-1 ov:min-h-0">
            <div className="ov:relative ov:w-full ov:h-full ov:flex ov:flex-col">
              {filteredOption && allVariants.length === 0 && (
                <div className="ov:flex ov:items-center ov:justify-center ov:h-full ov:p-4">
                  <NoResults />
                </div>
              )}
              {filteredOption && allVariants.length > 0 && (
                <div className="ov-wizard-variants-scroll ov:overflow-y-auto ov:h-full ov:p-4">
                  <div className={`ov:grid ov:content-start ov:gap-2 ${currentOption!.id === 'size' ? 'ov:grid-cols-2!' : 'ov:grid-cols-4!'}`}>
                    <VariantsContent
                      variantsToRender={visibleVariants}
                      VariantCard={currentOption!.id === 'size' ? SizeVariantCard : DefaultVariantCard}
                      isMobile={false}
                      onSelect={(selection) => handleSelectionSelect(selection, currentOption!.id)}
                      showImage={currentOption!.id === 'size' ? true : undefined}
                      showDimensions={currentOption!.id === 'size' ? false : undefined}
                    />
                  </div>
                  {hasMore && (
                    <div
                      ref={(el) => { sentinelRefs.current[currentOption!.id] = el; }}
                      className="ov:h-4 ov:shrink-0"
                      aria-hidden
                    />
                  )}
                </div>
              )}
            </div>

            {isFilterOpenForOption && currentOption && (
              <div
                data-open={isFilterOpenForOption}
                className="ov:flex ov:justify-end ov:flex-wrap ov:overflow-y-auto ov:absolute ov:inset-0 ov:h-full ov:p-2 ov:px-4 ov:bg-[var(--ov25-background-color)] ov:transition-transform ov:duration-500 ov:ease-in-out ov:translate-y-0"
              >
                <FilterContent optionId={currentOption.id} />
              </div>
            )}
          </div>
        </div>
        )}
    </>
  );

  const wizardContent = (
    <div
      ref={rootRef}
      data-ov25-wizard-variants-mode={mode}
      className="ov:w-full ov:flex-1 ov:min-h-0 ov:flex ov:flex-col ov:bg-[var(--ov25-background-color)] ov:overflow-hidden"
      style={mode === 'drawer' && availableHeight != null ? { '--ov25-wizard-variants-available-height': `${availableHeight}px` } as React.CSSProperties : undefined}
    >
      {stepIndicatorBlock}
      {mode !== 'inline' && filterBlock}
      <div className="ov:flex-1 ov:min-h-0 ov:flex ov:flex-col">
        {stepContentOnly}
        {mode !== 'inline' && buttonsBlock}
      </div>
    </div>
  );

  if (mode === 'inline') {
    return (
      <div
        data-ov25-list-variants-mode="inline"
        className="ov:flex ov:flex-col ov:flex-1 ov:min-h-0 ov:h-full ov:overflow-hidden ov:bg-[var(--ov25-background-color)]"
      >
        <div className="ov:shrink-0">
          {stepIndicatorBlock}
          {filterBlock}
        </div>
        <div
          data-ov25-list-variants-content
          className="ov:flex-1 ov:min-h-0 ov:overflow-y-auto ov:pt-0 ov:pb-2"
        >
          {stepContentOnly}
        </div>
        {buttonsBlock}
      </div>
    );
  }

  return wizardContent;
};
