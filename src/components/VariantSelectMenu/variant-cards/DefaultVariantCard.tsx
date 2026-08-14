import * as React from 'react';
import { Variant } from '../ProductVariants.js';
import { SwatchIconOverlay } from './SwatchIconOverlay.js';
import { VariantThumb } from './VariantThumb.js';
import { useSwatchActions } from '../../../hooks/useSwatchActions.js';
import { useOV25UI, type Selection } from '../../../contexts/ov25-ui-context.js';
import { selectionDetailsTooltipHoverDelayFor } from '../../../lib/config/selection-details-tooltip-hover-delay.js';

interface VariantCardProps {
  variant: Variant;
  onSelect: (variant: Variant) => void;
  index: number;
  isMobile?: boolean;
  isGrouped?: boolean;
  compactSpacing?: boolean;
}

export const DefaultVariantCard = React.memo(({
  variant,
  onSelect,
  isMobile,
  isGrouped = false,
  compactSpacing = false,
}: VariantCardProps) => {
  const {
    getString,
    selectionDetailsDisplayMode,
    selectionDetailsState,
    swatchRulesData,
    openSelectionDetails,
    commitSelectionDetailsPreload,
    closeSelectionDetails,
    cancelSelectionDetailsClose,
  } = useOV25UI();
  const { shouldShowSwatchOverlay, isSwatchSelectedFor, getSwatchClickHandler } = useSwatchActions();
  const isSwatchInBook = isSwatchSelectedFor(variant.swatch);
  const detailsEnabled = selectionDetailsDisplayMode !== 'none';
  const isTooltip = selectionDetailsDisplayMode === 'tooltip';
  const swatchEligible = Boolean(swatchRulesData.enabled && variant.swatch);
  const swatchVisible = (!detailsEnabled || isTooltip) && shouldShowSwatchOverlay(!!variant.isSelected, variant.swatch);
  const handleSwatchClick = getSwatchClickHandler(!!variant.isSelected, variant.swatch);
  const isSwatchSelected = isSwatchSelectedFor(variant.swatch);
  const isDesktopTooltip = isTooltip && !isMobile;
  const isOpen = Boolean(
    selectionDetailsState &&
    selectionDetailsState.item.id === variant.id &&
    selectionDetailsState.item.optionId === variant.optionId &&
    selectionDetailsState.item.groupId === variant.groupId
  );

  const spacingClass = compactSpacing ? 'ov:mb-4 ov:pb-1' : (isGrouped && isMobile ? '' : 'ov:my-4 ov:pb-1');
  const title = variant.name + (variant.bedSize ? ` · ${variant.bedSize}` : '');

  const sourceSelection: Selection = variant.selection ?? {
    id: variant.id,
    name: variant.name,
    sku: variant.sku,
    price: variant.price,
    blurHash: variant.blurHash || '',
    groupId: variant.groupId,
    thumbnail: variant.image,
    swatch: variant.swatch,
  };
  const hoverTimerRef = React.useRef<number | null>(null);
  const tooltipHoverActiveRef = React.useRef(false);
  const tooltipReopenBlockedUntilPointerOutRef = React.useRef(false);
  const pointerPressedRef = React.useRef(false);

  const cancelTooltipHover = React.useCallback(() => {
    if (hoverTimerRef.current != null) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  }, []);

  const openDetails = React.useCallback((
    trigger: HTMLElement,
    options: { pinned?: boolean; instant?: boolean } = {},
  ) => {
    openSelectionDetails({
      item: {
        id: variant.id,
        optionId: variant.optionId,
        groupId: variant.groupId,
        name: variant.name,
        image: variant.image,
        isSelected: variant.isSelected,
        selection: sourceSelection,
        swatch: variant.swatch ?? sourceSelection.swatch,
      },
      trigger,
      onApply: () => onSelect(variant),
      ...options,
    });
  }, [onSelect, openSelectionDetails, sourceSelection, variant]);

  const applyTooltipSelection = React.useCallback(() => {
    // Applying can rerender the selected card underneath a stationary pointer.
    // Ignore the synthetic re-entry from that replacement until the pointer
    // genuinely leaves, otherwise the tooltip immediately opens again.
    tooltipReopenBlockedUntilPointerOutRef.current = tooltipHoverActiveRef.current;
    tooltipHoverActiveRef.current = false;
    cancelTooltipHover();
    // A hover preview that has already sent a preload is now the selection
    // being applied, so retain its work rather than cancelling it on close.
    if (isOpen && selectionDetailsState?.requestId != null) {
      commitSelectionDetailsPreload(selectionDetailsState.requestId);
    }
    closeSelectionDetails(false);
    onSelect(variant);
  }, [
    cancelTooltipHover,
    closeSelectionDetails,
    commitSelectionDetailsPreload,
    isOpen,
    onSelect,
    selectionDetailsState?.requestId,
    variant,
  ]);

  const handleCardClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!detailsEnabled) return;
    if (isTooltip) {
      applyTooltipSelection();
      return;
    }
    openDetails(event.currentTarget, { pinned: true });
  };

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!detailsEnabled || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    if (isTooltip) {
      applyTooltipSelection();
      return;
    }
    openDetails(event.currentTarget, { pinned: true, instant: true });
  };

  const handleTooltipPointerOver = (event: React.PointerEvent<HTMLDivElement>) => {
    if (
      !isDesktopTooltip ||
      (event.relatedTarget instanceof Node && !event.relatedTarget.isConnected) ||
      (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) ||
      tooltipReopenBlockedUntilPointerOutRef.current
    ) {
      return;
    }
    tooltipHoverActiveRef.current = true;

    if (isOpen) {
      cancelSelectionDetailsClose();
      return;
    }

    cancelTooltipHover();
    const trigger = event.currentTarget;
    hoverTimerRef.current = window.setTimeout(() => {
      hoverTimerRef.current = null;
      if (!tooltipHoverActiveRef.current || !trigger.isConnected) return;
      openDetails(trigger, { pinned: false });
    }, selectionDetailsTooltipHoverDelayFor(trigger));
  };

  const handleTooltipPointerOut = (event: React.PointerEvent<HTMLDivElement>) => {
    if (
      event.relatedTarget instanceof Node &&
      event.currentTarget.contains(event.relatedTarget)
    ) {
      return;
    }
    tooltipReopenBlockedUntilPointerOutRef.current = false;
    tooltipHoverActiveRef.current = false;
    pointerPressedRef.current = false;
    cancelTooltipHover();
    if (isDesktopTooltip) closeSelectionDetails(false);
  };

  const handleTooltipFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    if (
      !isDesktopTooltip ||
      pointerPressedRef.current ||
      event.currentTarget.dataset.ov25SelectionDetailsRestoringFocus === 'true'
    ) {
      return;
    }
    cancelTooltipHover();
    if (isOpen) {
      cancelSelectionDetailsClose();
      return;
    }
    openDetails(event.currentTarget, { pinned: false, instant: true });
  };

  const handleTooltipBlur = () => {
    pointerPressedRef.current = false;
    cancelTooltipHover();
    if (isDesktopTooltip) closeSelectionDetails(false);
  };

  React.useEffect(() => () => {
    tooltipReopenBlockedUntilPointerOutRef.current = false;
    tooltipHoverActiveRef.current = false;
    cancelTooltipHover();
  }, [cancelTooltipHover]);

  return (
    <div
      className={`ov25-default-variant-card ov:flex ov:flex-col ov:items-center ov:pt-1 ${spacingClass} ov:transition-transform ${detailsEnabled ? 'ov:cursor-pointer ov:focus-visible:outline-2 ov:focus-visible:outline-offset-2' : ''}`}
      key={variant.id + variant.groupId + variant.optionId}
      data-selected={variant.isSelected}
      data-swatch-selected={isSwatchSelected}
      data-swatch-eligible={swatchEligible}
      data-selection-details-enabled={detailsEnabled}
      data-display-mode={selectionDetailsDisplayMode}
      title={title}
      role={detailsEnabled ? 'button' : undefined}
      tabIndex={detailsEnabled ? 0 : undefined}
      aria-label={detailsEnabled ? title : undefined}
      aria-haspopup={detailsEnabled && !isTooltip ? 'dialog' : undefined}
      aria-expanded={detailsEnabled ? isOpen : undefined}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      onPointerDown={() => {
        pointerPressedRef.current = true;
      }}
      onPointerUp={() => {
        pointerPressedRef.current = false;
      }}
      onPointerCancel={() => {
        pointerPressedRef.current = false;
      }}
      onPointerOver={handleTooltipPointerOver}
      onPointerOut={handleTooltipPointerOut}
      onFocus={handleTooltipFocus}
      onBlur={handleTooltipBlur}
    >
      <VariantThumb
        imageUrl={variant.image}
        name={variant.name}
        alt={detailsEnabled ? '' : undefined}
        size={isGrouped && isMobile ? 'md' : 'lg'}
        selected={variant.isSelected}
        onClick={detailsEnabled ? undefined : () => onSelect(variant)}
        asImageContainer
        overlay={swatchVisible && variant.swatch ? (
          <SwatchIconOverlay
            isSelected={isSwatchInBook}
            isVariantSelected={!!variant.isSelected}
            onClick={handleSwatchClick}
          />
        ) : undefined}
      />
      <div
        onClick={detailsEnabled ? undefined : () => onSelect(variant)}
        className={`ov:max-w-full ${detailsEnabled ? '' : 'ov:cursor-pointer'}`}
      >
        <span className={`ov25-variant-name ov:text-xs ov:text-center ov:text-(--ov25-text-color) ov:line-clamp-3 ${isGrouped && isMobile ? '' : 'ov:pt-2'}`}>
          {getString('variantName', { VARIANT_NAME: variant.name }, variant.name)}
        </span>
      </div>
    </div>
  );
});

DefaultVariantCard.displayName = 'DefaultVariantCard';
