import React from 'react';
import { Armchair, ChevronDown, Palette, SlidersHorizontal, X } from 'lucide-react';
import { useDiningUI } from '../../contexts/dining-ui-context.js';
import { DiningStepper } from './DiningStepper.js';
import { DiningTableCard } from './DiningTableCard.js';
import { DiningChairCard } from './DiningChairCard.js';
import { DiningChairCountControl } from './DiningChairCountControl.js';
import { DiningSideToggle } from './DiningSideToggle.js';
import { DiningFinishOptions } from './DiningFinishOptions.js';
import type { DiningCatalogItem } from '../../types/dining-iframe-types.js';

const COMPASS_TO_DISPLAY: Record<string, string> = {
  north: 'Front',
  south: 'Back',
  west: 'Left',
  east: 'Right',
};

function getOptionProductId(option: { id?: unknown }): number | null {
  const id = typeof option.id === 'string' ? option.id : '';
  const lastPart = id.split('-').pop();
  const productId = Number(lastPart);
  return Number.isFinite(productId) ? productId : null;
}

function productHasCustomOptions(
  item: DiningCatalogItem,
  configuratorState: ReturnType<typeof useDiningUI>['configuratorState'],
): boolean {
  return (configuratorState?.options ?? []).some(option => {
    const optionProductId = getOptionProductId(option);
    const belongsToProduct = optionProductId === item.productId || option.name.startsWith(item.name);
    return belongsToProduct && option.groups.some(group => group.selections.length > 0);
  });
}

function getCatalogItemImageSrc(item: DiningCatalogItem): string | undefined {
  return (
    item.cutoutImage ??
    item.imageUrls?.small_image ??
    item.imageUrls?.thumbnail ??
    item.imageUrls?.image ??
    item.imageUrl ??
    item.imageUrls?.hero ??
    item.imageUrls?.original
  );
}

const DiningTableFilterBar: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const itemStyle: React.CSSProperties = {
    flex: compact ? '0 0 auto' : '1 1 0',
    minWidth: compact ? 132 : 0,
    height: 38,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: compact ? '0 12px' : undefined,
    border: 'none',
    borderBottom: compact ? 'none' : '1px solid var(--ov25-border-color, #e0e0e0)',
    backgroundColor: 'transparent',
    color: 'var(--ov25-secondary-text-color, #666)',
    fontSize: 12,
    fontWeight: 500,
    fontFamily: 'var(--ov25-font-family, "IBM Plex Sans", sans-serif)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  };

  return (
    <div
      data-ov25-dining-table-filters
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: compact ? 18 : 0,
        width: compact ? '100%' : undefined,
        maxWidth: '100%',
        margin: compact ? '0' : '-4px -4px 2px',
        borderBottom: compact ? '1px solid var(--ov25-border-color, #e0e0e0)' : undefined,
      }}
    >
      <button type="button" style={itemStyle}>
        <Armchair size={15} strokeWidth={1.7} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>Seats up to</span>
        <ChevronDown size={13} strokeWidth={1.7} />
      </button>
      <button type="button" style={itemStyle}>
        <Palette size={15} strokeWidth={1.7} />
        <span>Finish</span>
        <ChevronDown size={13} strokeWidth={1.7} />
      </button>
      <button type="button" style={itemStyle}>
        <SlidersHorizontal size={15} strokeWidth={1.7} />
        <span>All Filters</span>
      </button>
    </div>
  );
};

const DiningChairFilterBar: React.FC = () => {
  const itemStyle: React.CSSProperties = {
    flex: '1 1 0',
    minWidth: 0,
    height: 38,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    border: 'none',
    borderBottom: '1px solid var(--ov25-border-color, #d9d9d9)',
    backgroundColor: 'transparent',
    color: 'var(--ov25-text-color, #111)',
    fontSize: 12,
    fontWeight: 500,
    fontFamily: 'var(--ov25-font-family, "IBM Plex Sans", sans-serif)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  };

  return (
    <div
      data-ov25-dining-seat-filters
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        margin: '-4px -4px 0',
      }}
    >
      <button type="button" style={itemStyle}>
        <SlidersHorizontal size={15} strokeWidth={1.7} />
        <span>All Filters</span>
        <ChevronDown size={13} strokeWidth={1.7} />
      </button>
      <button type="button" style={itemStyle}>
        <Armchair size={15} strokeWidth={1.7} />
        <span>Recommended</span>
        <ChevronDown size={13} strokeWidth={1.7} />
      </button>
    </div>
  );
};

const DiningBuilderModeTabs: React.FC<{
  builderMode: 'full-range' | 'mix-and-match';
  setBuilderMode: (mode: 'full-range' | 'mix-and-match') => void;
  labels?: Partial<Record<'full-range' | 'mix-and-match', string>>;
  ariaLabel?: string;
  compact?: boolean;
}> = ({ builderMode, setBuilderMode, labels, ariaLabel = 'Dining builder mode', compact = false }) => {
  const tabs = [
    { mode: 'full-range' as const, label: labels?.['full-range'] ?? 'Full Range' },
    { mode: 'mix-and-match' as const, label: labels?.['mix-and-match'] ?? 'Mix and Match' },
  ];

  return (
    <div
      data-ov25-dining-table-mode-tabs
      aria-label={ariaLabel}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10,
        width: compact ? 460 : undefined,
        maxWidth: '100%',
      }}
    >
      {tabs.map(tab => {
        const active = builderMode === tab.mode;
        return (
          <button
            key={tab.mode}
            type="button"
            onClick={() => setBuilderMode(tab.mode)}
            style={{
              minHeight: 38,
              borderRadius: '999px',
              border: `1px solid ${active ? 'var(--ov25-primary-color, #4d6b4b)' : 'var(--ov25-border-color, #d9d9d9)'}`,
              backgroundColor: active ? 'var(--ov25-primary-color, #4d6b4b)' : 'var(--ov25-background-color, #fff)',
              color: active ? 'var(--ov25-primary-text-color, #fff)' : 'var(--ov25-secondary-text-color, #666)',
              fontSize: 12,
              fontWeight: 700,
              fontFamily: 'var(--ov25-font-family, "IBM Plex Sans", sans-serif)',
              cursor: 'pointer',
              transition: 'background-color 150ms ease, border-color 150ms ease, color 150ms ease, transform 120ms ease',
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

const DiningTablePromoBanner: React.FC = () => (
  <div
    data-ov25-dining-table-promo
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      minHeight: 52,
      marginTop: 2,
      padding: '10px 14px',
      backgroundColor: 'var(--ov25-secondary-background-color, #f4f4f3)',
      color: 'var(--ov25-text-color, #111)',
      fontSize: 12,
      lineHeight: 1.35,
      textAlign: 'center',
    }}
  >
    <Armchair size={18} strokeWidth={1.5} />
    <span>
      Get chairs <strong style={{ color: 'var(--ov25-destructive, #d02b2b)' }}>HALF PRICE</strong> when bought with a dining table
    </span>
  </div>
);

interface DiningProductOptionsDrawerProps {
  item: DiningCatalogItem | null;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}

const PRODUCT_OPTIONS_DRAWER_CLOSED_PERCENT = 15;
const PRODUCT_OPTIONS_DRAWER_OPEN_PERCENT = 75;

function clampProductDrawerPercent(percent: number): number {
  return Math.min(
    PRODUCT_OPTIONS_DRAWER_OPEN_PERCENT,
    Math.max(PRODUCT_OPTIONS_DRAWER_CLOSED_PERCENT, percent)
  );
}

const DiningProductOptionsDrawer: React.FC<DiningProductOptionsDrawerProps> = ({
  item,
  expanded,
  onExpandedChange,
}) => {
  const [dragPercent, setDragPercent] = React.useState<number | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const dragRef = React.useRef<{
    startY: number;
    startPercent: number;
    containerHeight: number;
    moved: boolean;
  } | null>(null);
  const latestPercentRef = React.useRef<number | null>(null);
  const suppressClickRef = React.useRef(false);

  React.useEffect(() => {
    setDragPercent(null);
    setIsDragging(false);
    latestPercentRef.current = null;
    dragRef.current = null;
  }, [item?.productId, item?.configId]);

  if (!item) return null;

  const activePercent = dragPercent ?? (
    expanded ? PRODUCT_OPTIONS_DRAWER_OPEN_PERCENT : PRODUCT_OPTIONS_DRAWER_CLOSED_PERCENT
  );

  const setLivePercent = (percent: number) => {
    const nextPercent = clampProductDrawerPercent(percent);
    latestPercentRef.current = nextPercent;
    setDragPercent(nextPercent);
  };

  const onHandlePointerDown = (event: React.PointerEvent<HTMLSpanElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    const sidebar = event.currentTarget.closest('[data-ov25-dining-sidebar]') as HTMLElement | null;
    const containerHeight = sidebar?.getBoundingClientRect().height || window.innerHeight || 1;

    dragRef.current = {
      startY: event.clientY,
      startPercent: activePercent,
      containerHeight,
      moved: false,
    };
    latestPercentRef.current = activePercent;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onHandlePointerMove = (event: React.PointerEvent<HTMLSpanElement>) => {
    const drag = dragRef.current;
    if (!drag) return;

    const deltaY = event.clientY - drag.startY;
    if (Math.abs(deltaY) > 4) drag.moved = true;
    setLivePercent(drag.startPercent - (deltaY / drag.containerHeight) * 100);
  };

  const onHandlePointerEnd = (event: React.PointerEvent<HTMLSpanElement>) => {
    const drag = dragRef.current;
    if (!drag) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const finalPercent = latestPercentRef.current ?? activePercent;
    const midpoint = (PRODUCT_OPTIONS_DRAWER_CLOSED_PERCENT + PRODUCT_OPTIONS_DRAWER_OPEN_PERCENT) / 2;

    suppressClickRef.current = drag.moved;
    dragRef.current = null;
    latestPercentRef.current = null;
    setDragPercent(null);
    setIsDragging(false);
    onExpandedChange(finalPercent >= midpoint);
  };

  return (
    <aside
      data-ov25-dining-seat-options-drawer
      data-ov25-dining-product-options-drawer
      data-expanded={expanded ? 'true' : 'false'}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 74,
        height: `${activePercent}%`,
        zIndex: 8,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderTop: '1px solid var(--ov25-border-color, #d9d9d9)',
        borderRadius: 'var(--ov25-rounded-xl, 14px) var(--ov25-rounded-xl, 14px) 0 0',
        backgroundColor: 'var(--ov25-background-color, #fff)',
        boxShadow: expanded
          ? '0 -18px 50px rgba(0,0,0,0.16)'
          : '0 -10px 28px rgba(0,0,0,0.10)',
        willChange: 'height',
        transition: isDragging
          ? 'box-shadow 180ms ease'
          : 'height 680ms cubic-bezier(0.32, 0.72, 0, 1), box-shadow 220ms ease',
      }}
    >
      <button
        type="button"
        onClick={() => {
          if (suppressClickRef.current) {
            suppressClickRef.current = false;
            return;
          }
          onExpandedChange(!expanded);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          width: '100%',
          minHeight: 44,
          padding: '6px 20px 7px',
          border: 'none',
          borderBottom: '1px solid var(--ov25-border-color, #e5e5e5)',
          backgroundColor: 'var(--ov25-background-color, #fff)',
          color: 'var(--ov25-text-color, #111)',
          cursor: 'pointer',
          fontFamily: 'var(--ov25-font-family, "IBM Plex Sans", sans-serif)',
          textAlign: 'left',
        }}
      >
        <span
          aria-hidden="true"
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
          onPointerUp={onHandlePointerEnd}
          onPointerCancel={onHandlePointerEnd}
          style={{
            position: 'absolute',
            top: 7,
            left: '50%',
            width: 42,
            height: 4,
            borderRadius: 999,
            backgroundColor: 'var(--ov25-border-color, #d9d9d9)',
            cursor: isDragging ? 'grabbing' : 'grab',
            touchAction: 'none',
            transform: 'translateX(-50%)',
          }}
        />
        <span style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'baseline', gap: 8, paddingTop: 7 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--ov25-text-color, #111)' }}>
            Finish
          </span>
          <span
            style={{
              fontSize: 12,
              color: 'var(--ov25-secondary-text-color, #666)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.name}
          </span>
        </span>
      </button>

      <div
        style={{
          flex: 1,
          overflowY: expanded ? 'auto' : 'hidden',
          padding: '8px 20px 22px',
        }}
      >
        <DiningFinishOptions
          product={item}
          title=""
          hideProductName
        />
      </div>
    </aside>
  );
};

interface DiningChairOptionsSheetProps {
  item: DiningCatalogItem | null;
  open: boolean;
  onContinue: () => void;
}

const DiningChairOptionsSheet: React.FC<DiningChairOptionsSheetProps> = ({
  item,
  open,
  onContinue,
}) => {
  const { isMobile } = useDiningUI();

  if (!item) return null;

  const imageSrc = getCatalogItemImageSrc(item);

  return (
    <aside
      data-ov25-dining-chair-options-sheet
      data-open={open ? 'true' : 'false'}
      style={{
        position: isMobile ? 'fixed' : 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: isMobile ? 0 : 'auto',
        width: isMobile ? '100%' : 'min(380px, calc(100% - 48px))',
        height: isMobile ? 'min(100svh, 100dvh)' : undefined,
        maxHeight: isMobile ? 'min(100svh, 100dvh)' : undefined,
        zIndex: isMobile ? 40 : 14,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        backgroundColor: 'var(--ov25-background-color, #fff)',
        borderLeft: isMobile ? undefined : '1px solid var(--ov25-border-color, #d9d9d9)',
        borderRadius: isMobile ? undefined : 'var(--ov25-rounded-xl, 14px) 0 0 var(--ov25-rounded-xl, 14px)',
        boxShadow: '-18px 0 50px rgba(0,0,0,0.16)',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        opacity: open ? 1 : 0.98,
        willChange: 'transform',
        transition: 'transform 360ms cubic-bezier(0.32, 0.72, 0, 1), opacity 220ms cubic-bezier(0.23, 1, 0.32, 1)',
        pointerEvents: open ? 'auto' : 'none',
        fontFamily: 'var(--ov25-font-family, "IBM Plex Sans", sans-serif)',
        color: 'var(--ov25-text-color, #111)',
      }}
    >
      {isMobile && (
        <span
          aria-hidden="true"
          data-ov25-dining-chair-options-sheet-handle
          style={{
            position: 'absolute',
            top: 10,
            left: '50%',
            width: 42,
            height: 4,
            borderRadius: 999,
            backgroundColor: 'var(--ov25-border-color, #d9d9d9)',
            transform: 'translateX(-50%)',
            zIndex: 2,
          }}
        />
      )}
      <div
        data-ov25-dining-chair-options-sheet-header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: isMobile ? '24px 20px 16px' : '16px 20px',
          borderBottom: '1px solid var(--ov25-border-color, #e0e0e0)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 86,
            height: 76,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            backgroundColor: 'var(--ov25-secondary-background-color, #f4f4f3)',
          }}
        >
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={item.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          ) : (
            <Armchair size={24} strokeWidth={1.5} color="var(--ov25-secondary-text-color, #777)" />
          )}
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              textTransform: 'uppercase',
              color: 'var(--ov25-secondary-text-color, #666)',
              letterSpacing: 0,
              marginBottom: 4,
            }}
          >
            Finish
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 800,
              lineHeight: 1.1,
              color: 'var(--ov25-text-color, #111)',
              overflowWrap: 'anywhere',
            }}
          >
            {item.name}
          </div>
        </div>
        <button
          type="button"
          aria-label="Close finish options"
          onClick={onContinue}
          style={{
            width: 34,
            height: 34,
            marginLeft: 'auto',
            flexShrink: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '999px',
            border: '1px solid var(--ov25-border-color, #d9d9d9)',
            backgroundColor: 'var(--ov25-background-color, #fff)',
            color: 'var(--ov25-text-color, #111)',
            cursor: 'pointer',
            transition: 'transform 120ms ease, background-color 150ms ease',
          }}
        >
          <X size={17} strokeWidth={1.8} />
        </button>
      </div>

      <div
        data-ov25-dining-chair-options-sheet-content
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '16px 20px 24px',
        }}
      >
        <DiningFinishOptions
          product={item}
          title=""
          hideProductName
        />
      </div>

      <div
        data-ov25-dining-chair-options-sheet-footer
        style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--ov25-border-color, #e0e0e0)',
          backgroundColor: 'var(--ov25-background-color, #fff)',
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={onContinue}
          style={{
            width: '100%',
            minHeight: 46,
            borderRadius: '999px',
            border: 'none',
            backgroundColor: 'var(--ov25-cta-color, #000)',
            color: 'var(--ov25-cta-text-color, #fff)',
            fontSize: 14,
            fontWeight: 700,
            fontFamily: 'var(--ov25-font-family, "IBM Plex Sans", sans-serif)',
            cursor: 'pointer',
            transition: 'transform 120ms ease, background-color 150ms ease',
          }}
        >
          Continue
        </button>
      </div>
    </aside>
  );
};

/**
 * Right-hand sidebar for the dining configurator.
 * Renders step-specific content: table grid, chair selection, finish, review.
 */
interface DiningSidebarProps {
  hideStepper?: boolean;
}

export const DiningSidebar: React.FC<DiningSidebarProps> = ({ hideStepper = false }) => {
  const {
    activeStep,
    steps,
    builderMode,
    setBuilderMode,
    tables,
    chairs,
    benches,
    selectedTableItem,
    configuratorState,
    sideAssignments,
    uniqueChairSides,
    globalChairCount,
    canAdvance,
    nextStep,
    prevStep,
    hidePricing,
    disableAddToCart,
    commercePriceSnapshot,
    addToBasket,
    isMobile,
  } = useDiningUI();

  const [optionsDrawerItem, setOptionsDrawerItem] = React.useState<DiningCatalogItem | null>(null);
  const [optionsDrawerOpen, setOptionsDrawerOpen] = React.useState(false);
  const optionsDrawerAnimationFrameRef = React.useRef<number | null>(null);
  const optionsDrawerCloseTimeoutRef = React.useRef<number | null>(null);

  const clearOptionsDrawerCloseTimeout = React.useCallback(() => {
    if (optionsDrawerCloseTimeoutRef.current !== null) {
      window.clearTimeout(optionsDrawerCloseTimeoutRef.current);
      optionsDrawerCloseTimeoutRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    if (optionsDrawerAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(optionsDrawerAnimationFrameRef.current);
      optionsDrawerAnimationFrameRef.current = null;
    }
    clearOptionsDrawerCloseTimeout();
    setOptionsDrawerItem(null);
    setOptionsDrawerOpen(false);
  }, [activeStep, clearOptionsDrawerCloseTimeout]);

  React.useEffect(() => () => {
    if (optionsDrawerAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(optionsDrawerAnimationFrameRef.current);
    }
    clearOptionsDrawerCloseTimeout();
  }, [clearOptionsDrawerCloseTimeout]);

  React.useEffect(() => {
    if (optionsDrawerItem && !productHasCustomOptions(optionsDrawerItem, configuratorState)) {
      setOptionsDrawerItem(null);
      setOptionsDrawerOpen(false);
    }
  }, [configuratorState, optionsDrawerItem]);

  const openOptionsDrawerForItem = React.useCallback((item: DiningCatalogItem) => {
    if (optionsDrawerAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(optionsDrawerAnimationFrameRef.current);
      optionsDrawerAnimationFrameRef.current = null;
    }
    clearOptionsDrawerCloseTimeout();

    if (!productHasCustomOptions(item, configuratorState)) {
      setOptionsDrawerItem(null);
      setOptionsDrawerOpen(false);
      return;
    }

    const shouldAnimateFromClosed = optionsDrawerItem === null;

    setOptionsDrawerItem(item);

    if (shouldAnimateFromClosed) {
      setOptionsDrawerOpen(false);
      optionsDrawerAnimationFrameRef.current = window.requestAnimationFrame(() => {
        optionsDrawerAnimationFrameRef.current = window.requestAnimationFrame(() => {
          setOptionsDrawerOpen(true);
          optionsDrawerAnimationFrameRef.current = null;
        });
      });
      return;
    }

    setOptionsDrawerOpen(true);
  }, [clearOptionsDrawerCloseTimeout, configuratorState, optionsDrawerItem]);

  const closeOptionsSurface = React.useCallback(() => {
    if (optionsDrawerAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(optionsDrawerAnimationFrameRef.current);
      optionsDrawerAnimationFrameRef.current = null;
    }

    clearOptionsDrawerCloseTimeout();
    setOptionsDrawerOpen(false);
    optionsDrawerCloseTimeoutRef.current = window.setTimeout(() => {
      setOptionsDrawerItem(null);
      optionsDrawerCloseTimeoutRef.current = null;
    }, 360);
  }, [clearOptionsDrawerCloseTimeout]);

  const handleTableSelect = React.useCallback((item: DiningCatalogItem) => {
    openOptionsDrawerForItem(item);
  }, [openOptionsDrawerForItem]);

  const handleSeatSelect = React.useCallback((item: DiningCatalogItem) => {
    openOptionsDrawerForItem(item);
  }, [openOptionsDrawerForItem]);

  const tableGroups = React.useMemo(() => {
    const customisable = tables.filter(table => productHasCustomOptions(table, configuratorState));
    const fixed = tables.filter(table => !productHasCustomOptions(table, configuratorState));
    return {
      customisable,
      fixed,
      visible: builderMode === 'mix-and-match'
        ? customisable.length > 0 ? customisable : tables
        : fixed.length > 0 ? fixed : tables,
    };
  }, [builderMode, configuratorState, tables]);

  const goBack = React.useCallback(() => {
    prevStep();
  }, [prevStep]);

  const goForward = React.useCallback(() => {
    nextStep();
  }, [nextStep]);

  const showBackButton = steps.indexOf(activeStep) > 0;
  const showTableOptionsDrawer = activeStep === 'table' && optionsDrawerItem !== null;
  const showChairOptionsSheet = activeStep === 'chairs' && optionsDrawerItem !== null;
  const hasProductOptionsDrawer = showTableOptionsDrawer;
  const hasSelectedSeatItem = Object.values(sideAssignments).some(Boolean);
  const isDesktopTableSelectionSheet = !isMobile && activeStep === 'table' && selectedTableItem == null;
  const hasOuterMobileSelectionHandle = isMobile && (
    (activeStep === 'table' && selectedTableItem != null) ||
    (activeStep === 'chairs' && hasSelectedSeatItem)
  );
  const scrollPaddingTop = hasOuterMobileSelectionHandle ? 28 : 16;
  const scrollPaddingBottom = hasProductOptionsDrawer ? 'calc(15% + 180px)' : '16px';
  const scrollPadding = isDesktopTableSelectionSheet
    ? '28px clamp(32px, 6vw, 96px) 32px'
    : `${scrollPaddingTop}px 20px ${scrollPaddingBottom}`;

  return (
    <div
      data-ov25-dining-sidebar
      data-ov25-dining-desktop-table-selection-sheet={isDesktopTableSelectionSheet ? 'true' : 'false'}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--ov25-background-color, #ffffff)',
        fontFamily: 'var(--ov25-font-family, "IBM Plex Sans", sans-serif)',
        overflow: 'hidden',
      }}
    >
      {!hideStepper && (
        <div
          style={{
            padding: '12px 20px 0',
            borderBottom: '1px solid var(--ov25-border-color, #e0e0e0)',
            flexShrink: 0,
          }}
        >
          <DiningStepper />
        </div>
      )}

      {/* Scrollable content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: scrollPadding,
        }}
      >
        {/* Step: Style */}
        {activeStep === 'style' && (
          <div data-ov25-dining-style-step style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: 'var(--ov25-primary-text-color, var(--ov25-text-color, #1a1a1a))',
                  margin: 0,
                }}
              >
                First choose your style
              </h3>
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--ov25-secondary-text-color, #666)',
                  margin: '4px 0 0',
                }}
              >
                Start with a fixed range or build a custom dining set.
              </p>
            </div>

            {[
              {
                mode: 'full-range' as const,
                title: 'Full range',
                body: 'Browse fixed dining sets and compatible tables.',
              },
              {
                mode: 'mix-and-match' as const,
                title: 'Mix and match',
                body: 'Choose each table, seat, and finish independently.',
              },
            ].map(option => {
              const selected = builderMode === option.mode;
              return (
                <button
                  key={option.mode}
                  type="button"
                  data-ov25-dining-style-card
                  data-selected={selected}
                  onClick={() => setBuilderMode(option.mode)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '6px',
                    padding: '16px',
                    borderRadius: 'var(--ov25-rounded-lg, 8px)',
                    border: `1px solid ${selected ? 'var(--ov25-cta-color, #111)' : 'var(--ov25-border-color, #e0e0e0)'}`,
                    backgroundColor: selected
                      ? 'var(--ov25-secondary-background-color, #f6f6f6)'
                      : 'var(--ov25-background-color, #fff)',
                    color: 'var(--ov25-text-color, #111)',
                    cursor: 'pointer',
                    fontFamily: 'var(--ov25-font-family, "IBM Plex Sans", sans-serif)',
                    textAlign: 'left',
                    transition: 'border-color 160ms ease, background-color 160ms ease, transform 120ms ease',
                  }}
                >
                  <span style={{ fontSize: '14px', fontWeight: 700 }}>{option.title}</span>
                  <span style={{ fontSize: '12px', color: 'var(--ov25-secondary-text-color, #666)', lineHeight: 1.4 }}>
                    {option.body}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Step: Table */}
        {activeStep === 'table' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: isDesktopTableSelectionSheet ? '20px' : '14px',
              width: '100%',
              alignItems: isDesktopTableSelectionSheet ? 'flex-start' : undefined,
            }}
          >
            {isDesktopTableSelectionSheet && (
              <h2
                style={{
                  margin: '0 0 2px',
                  color: 'var(--ov25-text-color, #111)',
                  fontSize: 24,
                  lineHeight: 1.15,
                  fontWeight: 800,
                }}
              >
                Get started by selecting a table
              </h2>
            )}
            <DiningTableFilterBar compact={isDesktopTableSelectionSheet} />
            <DiningBuilderModeTabs
              builderMode={builderMode}
              setBuilderMode={setBuilderMode}
              compact={isDesktopTableSelectionSheet}
            />
            <h3
              style={{
                fontSize: '15px',
                fontWeight: 800,
                color: 'var(--ov25-primary-text-color, #1a1a1a)',
                margin: '2px 0 -2px',
              }}
            >
              All dining tables
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isDesktopTableSelectionSheet
                  ? 'repeat(auto-fill, minmax(260px, 300px))'
                  : 'repeat(2, minmax(0, 1fr))',
                gap: isDesktopTableSelectionSheet ? '16px' : '8px',
                alignItems: 'start',
                justifyContent: isDesktopTableSelectionSheet ? 'start' : undefined,
                width: '100%',
              }}
            >
              {tableGroups.visible.map(table => (
                <DiningTableCard
                  key={`${table.configId}-${table.modelId}`}
                  item={table}
                  onSelect={handleTableSelect}
                  minHeight={isDesktopTableSelectionSheet ? 256 : undefined}
                  imageHeight={isDesktopTableSelectionSheet ? 176 : undefined}
                />
              ))}
            </div>
            {tableGroups.visible.length === 0 && (
              <div
                style={{
                  padding: '18px',
                  borderRadius: 'var(--ov25-rounded-lg, 8px)',
                  backgroundColor: 'var(--ov25-secondary-background-color, #f4f4f3)',
                  color: 'var(--ov25-secondary-text-color, #666)',
                  fontSize: 13,
                  lineHeight: 1.45,
                }}
              >
                No tables are available in this category.
              </div>
            )}
            <div
              style={{
                width: isDesktopTableSelectionSheet ? 'min(100%, 760px)' : '100%',
                alignSelf: isDesktopTableSelectionSheet ? 'center' : undefined,
              }}
            >
              <DiningTablePromoBanner />
            </div>
          </div>
        )}

        {/* Step: Chairs */}
        {activeStep === 'chairs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <DiningTablePromoBanner />
            <DiningChairFilterBar />
            <DiningBuilderModeTabs
              builderMode={builderMode}
              setBuilderMode={setBuilderMode}
              labels={{ 'full-range': 'Recommended', 'mix-and-match': 'All' }}
              ariaLabel="Dining seating list mode"
            />

            <div>
              <h3
                style={{
                  fontSize: '15px',
                  fontWeight: 800,
                  color: 'var(--ov25-text-color, #111)',
                  margin: 0,
                }}
              >
                {builderMode === 'full-range' ? 'Recommended seats' : 'All seats'}
              </h3>
              <p
                style={{
                  fontSize: '12px',
                  color: 'var(--ov25-secondary-text-color, #666)',
                  lineHeight: 1.45,
                  margin: '6px 0 0',
                }}
              >
                {builderMode === 'full-range'
                  ? 'We carefully select chairs and benches to ensure they fit perfectly with your chosen table.'
                  : 'Browse every compatible chair and bench available for this dining set.'}
              </p>
            </div>

            {/* Chair count */}
            <DiningChairCountControl />

            {/* Side customisation toggles */}
            <DiningSideToggle />

            {/* Chair grid — all sides or per unique side */}
            {uniqueChairSides.length === 0 ? (
              <div>
                <p
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'var(--ov25-text-color, #111)',
                    margin: '0 0 10px',
                  }}
                >
                  Choose seating for all sides
                </p>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: '8px',
                    alignItems: 'start',
                  }}
                >
                  {[...chairs, ...benches].map(item => {
                    // Check if this item is assigned to any side
                    const isAssigned = Object.values(sideAssignments).some(
                      a => a && a.productId === item.productId
                    );
                    return (
                      <DiningChairCard
                        key={`${item.configId}-${item.modelId}`}
                        item={item}
                        isAssigned={isAssigned}
                        onSelect={handleSeatSelect}
                      />
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Per-side chair selection for unique sides */
              (['north', 'south', 'east', 'west'] as const).map(compassSide => {
                const displaySide = COMPASS_TO_DISPLAY[compassSide];
                const isUnique = uniqueChairSides.includes(
                  compassSide === 'north' ? 'front'
                    : compassSide === 'south' ? 'back'
                    : compassSide === 'west' ? 'left'
                    : 'right'
                );

                // Only show sections for unique sides; the rest are "shared"
                if (!isUnique && uniqueChairSides.length > 0 && uniqueChairSides.length < 4) {
                  return null;
                }

                const assignment = sideAssignments[compassSide];

                return (
                  <div key={compassSide} style={{ marginBottom: '12px' }}>
                    <p
                      style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: 'var(--ov25-secondary-text-color, #888)',
                        margin: '0 0 6px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {displaySide} side
                    </p>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                        gap: '8px',
                        alignItems: 'start',
                      }}
                    >
                      {[...chairs, ...benches].map(item => (
                        <DiningChairCard
                          key={`${compassSide}-${item.configId}-${item.modelId}`}
                        item={item}
                        side={compassSide}
                        isAssigned={assignment?.productId === item.productId}
                        onSelect={handleSeatSelect}
                      />
                    ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Step: Review */}
        {activeStep === 'review' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3
              style={{
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--ov25-primary-text-color, #1a1a1a)',
                margin: 0,
              }}
            >
              Review your set
            </h3>

            {/* Summary */}
            <div
              style={{
                padding: '16px',
                borderRadius: 'var(--ov25-border-radius, 12px)',
                border: '1px solid var(--ov25-border-color, #e0e0e0)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {/* Table */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--ov25-secondary-text-color, #888)' }}>Table</span>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ov25-primary-text-color, #1a1a1a)' }}>
                  {selectedTableItem?.name ?? '—'}
                </span>
              </div>

              {/* Chair count */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--ov25-secondary-text-color, #888)' }}>Chairs</span>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ov25-primary-text-color, #1a1a1a)' }}>
                  {globalChairCount}
                </span>
              </div>

              {/* Side assignments */}
              {Object.entries(sideAssignments).map(([side, assignment]) => {
                if (!assignment) return null;
                const label = COMPASS_TO_DISPLAY[side] ?? side;
                const itemName = [...chairs, ...benches].find(
                  i => i.productId === assignment.productId
                )?.name ?? `${assignment.type}`;
                return (
                  <div
                    key={side}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <span style={{ fontSize: '12px', color: 'var(--ov25-secondary-text-color, #888)' }}>
                      {label}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--ov25-primary-text-color, #1a1a1a)' }}>
                      {itemName}
                    </span>
                  </div>
                );
              })}
            </div>

            {!hidePricing && commercePriceSnapshot?.formattedPrice && (
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--ov25-rounded-lg, 8px)',
                  backgroundColor: 'var(--ov25-secondary-background-color, #f5f5f5)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '13px', color: 'var(--ov25-secondary-text-color, #666)' }}>Total</span>
                <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ov25-configurator-price-text-color, var(--ov25-text-color, #111))' }}>
                  {commercePriceSnapshot.formattedPrice}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {showTableOptionsDrawer && (
        <DiningProductOptionsDrawer
          item={optionsDrawerItem}
          expanded={optionsDrawerOpen}
          onExpandedChange={setOptionsDrawerOpen}
        />
      )}

      {showChairOptionsSheet && (
        <DiningChairOptionsSheet
          item={optionsDrawerItem}
          open={optionsDrawerOpen}
          onContinue={closeOptionsSurface}
        />
      )}

      {/* Footer navigation */}
      {!isDesktopTableSelectionSheet && (
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--ov25-border-color, #e0e0e0)',
            display: 'flex',
            gap: '8px',
            flexShrink: 0,
          }}
        >
        {showBackButton && (
          <button
            onClick={goBack}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '999px',
              border: '1.5px solid var(--ov25-border-color, #ddd)',
              backgroundColor: 'var(--ov25-background-color, #fff)',
              color: 'var(--ov25-text-color, #111)',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'var(--ov25-font-family, "IBM Plex Sans", sans-serif)',
              transition: 'background-color 150ms ease, color 150ms ease, opacity 150ms ease',
            }}
          >
            Back
          </button>
        )}
        {activeStep !== 'review' ? (
          <button
            onClick={goForward}
            disabled={!canAdvance}
            style={{
              flex: 2,
              padding: '12px',
              borderRadius: '999px',
              border: 'none',
              backgroundColor: canAdvance
                ? 'var(--ov25-cta-color, #000)'
                : 'var(--ov25-border-color, #ddd)',
              color: canAdvance
                ? 'var(--ov25-cta-text-color, #fff)'
                : 'var(--ov25-secondary-text-color, #888)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: canAdvance ? 'pointer' : 'not-allowed',
              fontFamily: 'var(--ov25-font-family, "IBM Plex Sans", sans-serif)',
              transition: 'background-color 150ms ease, color 150ms ease, opacity 150ms ease',
            }}
          >
            Continue
          </button>
        ) : (
          <button
            onClick={addToBasket}
            disabled={disableAddToCart}
            style={{
              flex: 2,
              padding: '12px',
              borderRadius: '999px',
              border: 'none',
              backgroundColor: disableAddToCart
                ? 'var(--ov25-border-color, #ddd)'
                : 'var(--ov25-cta-color, #000)',
              color: 'var(--ov25-cta-text-color, #fff)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: disableAddToCart ? 'not-allowed' : 'pointer',
              opacity: disableAddToCart ? 0.6 : 1,
              fontFamily: 'var(--ov25-font-family, "IBM Plex Sans", sans-serif)',
              transition: 'background-color 150ms ease, color 150ms ease, opacity 150ms ease',
            }}
          >
            Add to basket
          </button>
        )}
        </div>
      )}
    </div>
  );
};
