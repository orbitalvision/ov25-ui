import React from 'react';
import { Maximize2, Ruler, ScanLine, Sparkles } from 'lucide-react';
import { useDiningUI } from '../../contexts/dining-ui-context.js';
import { OVOrBrandLogo } from '../OVOrBrandLogo.js';
import { DiningProductGallery } from './DiningProductGallery.js';
import { DiningReviewPage } from './DiningReviewPage.js';
import { DiningSidebar } from './DiningSidebar.js';
import { DiningStyleLanding } from './DiningStyleLanding.js';
import { DiningStepper } from './DiningStepper.js';

const iconButtonStyle: React.CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 'var(--ov25-configurator-view-controls-border-radius, 999px)',
  border: '1px solid var(--ov25-configurator-view-controls-border-color, var(--ov25-border-color, #ddd))',
  backgroundColor: 'var(--ov25-overlay-button-color, var(--ov25-background-color, #fff))',
  color: 'var(--ov25-configurator-view-controls-text-color, var(--ov25-text-color, #111))',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
  transition: 'transform 120ms ease, background-color 150ms ease',
};

const mobileReviewViewerStartPercent = 72;
const mobileReviewViewerEndPercent = 48;

export const DiningFullPageShell: React.FC = () => {
  const {
    isMobile,
    logoURL,
    mobileLogoURL,
    hideLogo,
    hidePricing,
    hideAr,
    isReady,
    commercePriceSnapshot,
    activeStep,
    selectedTableItem,
    sideAssignments,
    globalChairCount,
    viewInRoom,
    toggleDimensions,
    enlargeViewer,
  } = useDiningUI();

  const [isMobileSelectionSheetExpanded, setIsMobileSelectionSheetExpanded] = React.useState(false);
  const [mobileSelectionSheetDragPercent, setMobileSelectionSheetDragPercent] = React.useState<number | null>(null);
  const [mobileReviewScrollProgress, setMobileReviewScrollProgress] = React.useState(0);
  const [mobileReviewShrinkDistance, setMobileReviewShrinkDistance] = React.useState(0);
  const mainRef = React.useRef<HTMLElement | null>(null);
  const mobileSelectionSheetDragRef = React.useRef<{
    pointerId: number;
    startY: number;
    startPercent: number;
    mainHeight: number;
    didDrag: boolean;
  } | null>(null);
  const suppressMobileSelectionSheetClickRef = React.useRef(false);
  const hasSelectedSeatItem = Object.values(sideAssignments).some(Boolean);
  const logo = isMobile ? mobileLogoURL ?? logoURL : logoURL;
  const summary = selectedTableItem
    ? `${globalChairCount || selectedTableItem.minChairCount || ''} seats`
    : activeStep === 'style'
      ? 'Choose your style'
      : 'Build your dining set';
  const isMobileTableSelectionEmpty = isMobile && activeStep === 'table' && selectedTableItem == null;
  const isMobileChairSelectionEmpty = isMobile && activeStep === 'chairs' && !hasSelectedSeatItem;
  const isDesktopTableSelectionEmpty = !isMobile && activeStep === 'table' && selectedTableItem == null;
  const canToggleMobileSelectionSheet =
    isMobile &&
    (activeStep === 'table' || activeStep === 'chairs') &&
    !isMobileTableSelectionEmpty &&
    !isMobileChairSelectionEmpty;
  const shouldShowCompactMobileSelectionDrawer = canToggleMobileSelectionSheet && !isMobileSelectionSheetExpanded;
  const shouldShowExpandedMobileSelectionDrawer = canToggleMobileSelectionSheet && isMobileSelectionSheetExpanded;
  const shouldShowFullMobileSelectionSheet = isMobileTableSelectionEmpty || isMobileChairSelectionEmpty;
  const shouldShowMobileSelectionSheet = shouldShowFullMobileSelectionSheet || shouldShowExpandedMobileSelectionDrawer;
  const shouldShowMobileSelectionDrawer =
    shouldShowCompactMobileSelectionDrawer || shouldShowExpandedMobileSelectionDrawer;
  const compactMobileSelectionDrawerPercent = 32;
  const expandedMobileSelectionDrawerPercent = 78;
  const snapMobileSelectionDrawerPercent =
    (compactMobileSelectionDrawerPercent + expandedMobileSelectionDrawerPercent) / 2;
  const mobileSelectionDrawerPercent = mobileSelectionSheetDragPercent;
  const mobileSelectionViewerPercent =
    mobileSelectionDrawerPercent == null ? null : 100 - mobileSelectionDrawerPercent;
  const mobileSelectionGridRows =
    mobileSelectionDrawerPercent == null
      ? null
      : `${mobileSelectionViewerPercent}fr ${mobileSelectionDrawerPercent}fr`;
  const mobileReviewViewerDeltaPercent = mobileReviewViewerStartPercent - mobileReviewViewerEndPercent;
  const mobileReviewViewerPercent = mobileReviewViewerStartPercent - mobileReviewScrollProgress * mobileReviewViewerDeltaPercent;
  const mobileReviewSummaryHoldOffset = mobileReviewScrollProgress * mobileReviewShrinkDistance;
  const isMobileReview = isMobile && activeStep === 'review';
  const handleMobileReviewMainScroll = React.useCallback((event: React.UIEvent<HTMLElement>) => {
    if (!isMobileReview) {
      return;
    }

    const shrinkDistance =
      event.currentTarget.clientHeight * (mobileReviewViewerDeltaPercent / 100);

    setMobileReviewShrinkDistance(previous =>
      Math.abs(previous - shrinkDistance) > 1 ? shrinkDistance : previous,
    );

    const progress = shrinkDistance > 0
      ? Math.min(1, Math.max(0, event.currentTarget.scrollTop / shrinkDistance))
      : 0;
    setMobileReviewScrollProgress(progress);
  }, [isMobileReview, mobileReviewViewerDeltaPercent]);

  const handleMobileSelectionSheetPointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (!canToggleMobileSelectionSheet || !mainRef.current) {
        return;
      }

      const mainHeight = mainRef.current.getBoundingClientRect().height;
      if (mainHeight <= 0) {
        return;
      }

      const startPercent = isMobileSelectionSheetExpanded
        ? expandedMobileSelectionDrawerPercent
        : compactMobileSelectionDrawerPercent;

      suppressMobileSelectionSheetClickRef.current = false;
      mobileSelectionSheetDragRef.current = {
        pointerId: event.pointerId,
        startY: event.clientY,
        startPercent,
        mainHeight,
        didDrag: false,
      };
      setMobileSelectionSheetDragPercent(startPercent);
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [canToggleMobileSelectionSheet, isMobileSelectionSheetExpanded],
  );

  const handleMobileSelectionSheetPointerMove = React.useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = mobileSelectionSheetDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    const dragDistance = drag.startY - event.clientY;
    if (Math.abs(dragDistance) > 4) {
      drag.didDrag = true;
    }

    const nextPercent = Math.min(
      expandedMobileSelectionDrawerPercent,
      Math.max(compactMobileSelectionDrawerPercent, drag.startPercent + (dragDistance / drag.mainHeight) * 100),
    );
    setMobileSelectionSheetDragPercent(nextPercent);
  }, []);

  const finishMobileSelectionSheetDrag = React.useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = mobileSelectionSheetDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    const dragDistance = drag.startY - event.clientY;
    const currentPercent = Math.min(
      expandedMobileSelectionDrawerPercent,
      Math.max(compactMobileSelectionDrawerPercent, drag.startPercent + (dragDistance / drag.mainHeight) * 100),
    );
    const shouldExpand =
      Math.abs(dragDistance) > 12
        ? dragDistance < 0
          ? false
          : dragDistance > 0
            ? true
            : currentPercent >= snapMobileSelectionDrawerPercent
        : currentPercent >= snapMobileSelectionDrawerPercent;

    suppressMobileSelectionSheetClickRef.current = drag.didDrag;
    mobileSelectionSheetDragRef.current = null;
    setMobileSelectionSheetDragPercent(null);
    setIsMobileSelectionSheetExpanded(shouldExpand);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  const cancelMobileSelectionSheetDrag = React.useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = mobileSelectionSheetDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    mobileSelectionSheetDragRef.current = null;
    setMobileSelectionSheetDragPercent(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  React.useEffect(() => {
    setIsMobileSelectionSheetExpanded(false);
    setMobileSelectionSheetDragPercent(null);
    setMobileReviewScrollProgress(0);
    mobileSelectionSheetDragRef.current = null;
  }, [activeStep, isMobile]);

  React.useEffect(() => {
    if (!isMobileReview || !mainRef.current) {
      setMobileReviewShrinkDistance(0);
      return;
    }

    const main = mainRef.current;
    main.scrollTop = 0;
    setMobileReviewShrinkDistance(main.clientHeight * (mobileReviewViewerDeltaPercent / 100));
  }, [isMobileReview, mobileReviewViewerDeltaPercent]);

  return (
    <div
      data-ov25-dining-full-page-shell
      data-ov25-dining-mobile={isMobile ? 'true' : 'false'}
      style={{
        position: 'relative',
        width: '100%',
        height: 'min(100svh, 100dvh)',
        maxHeight: 'min(100svh, 100dvh)',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: isReady ? 'var(--ov25-secondary-background-color, #f6f6f6)' : '#ffffff',
        color: 'var(--ov25-text-color, #111)',
        fontFamily: 'var(--ov25-font-family, "IBM Plex Sans", sans-serif)',
      }}
    >
      <style>
        {`
          @keyframes ov25-dining-loader-pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.58; transform: scale(0.95); }
          }
        `}
      </style>
      <header
        data-ov25-dining-full-page-header
        style={{
          // Keep mounted and visible so the configurator iframe can initialise
          // and send its bootstrap messages (catalog/scene/configurator state).
          // `isReady` depends on those messages, so gating visibility on it would
          // deadlock — the loading overlay below already hides the content until ready.
          visibility: 'visible',
          pointerEvents: isReady ? 'auto' : 'none',
          minHeight: isMobile ? 142 : 92,
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr auto' : 'minmax(220px, 1fr) minmax(360px, 560px) minmax(180px, 1fr)',
          gridTemplateRows: isMobile ? 'auto auto' : '1fr',
          alignItems: 'center',
          gap: isMobile ? 12 : 20,
          padding: isMobile ? '18px 16px 12px' : '16px 28px',
          borderBottom: '1px solid var(--ov25-border-color, #e5e5e5)',
          backgroundColor: 'var(--ov25-background-color, #fff)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            minWidth: 0,
            gridColumn: isMobile ? '1 / 2' : undefined,
            gridRow: isMobile ? '1 / 2' : undefined,
          }}
        >
          {!hideLogo && (
            <OVOrBrandLogo
              imageUrl={logo}
              className="ov:h-10 ov:max-w-28"
            />
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ov25-configurator-title-text-color, var(--ov25-text-color, #111))' }}>
              Dining Set Builder
            </div>
            <div style={{ fontSize: 12, color: 'var(--ov25-secondary-text-color, #666)', marginTop: 2 }}>
              {summary}
            </div>
          </div>
        </div>

        <div style={{ gridColumn: isMobile ? '1 / -1' : undefined, gridRow: isMobile ? '2 / 3' : undefined, minWidth: 0 }}>
          <DiningStepper />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gridColumn: isMobile ? '2 / 3' : undefined,
            gridRow: isMobile ? '1 / 2' : undefined,
          }}
        >
          {!hidePricing && commercePriceSnapshot?.formattedPrice && (
            <div
              data-ov25-dining-header-price
              style={{
                fontSize: isMobile ? 22 : 24,
                fontWeight: 800,
                color: 'var(--ov25-configurator-price-text-color, var(--ov25-text-color, #111))',
                fontVariantNumeric: 'tabular-nums',
                whiteSpace: 'nowrap',
              }}
            >
              {commercePriceSnapshot.formattedPrice}
            </div>
          )}
        </div>
      </header>

      <main
        ref={mainRef}
        onScroll={isMobileReview ? handleMobileReviewMainScroll : undefined}
        data-ov25-dining-full-page-main
        data-ov25-dining-mobile-selection-sheet={shouldShowMobileSelectionSheet ? 'true' : 'false'}
        data-ov25-dining-mobile-selection-drawer={shouldShowMobileSelectionDrawer ? 'true' : 'false'}
        data-ov25-dining-mobile-selection-drawer-expanded={shouldShowExpandedMobileSelectionDrawer ? 'true' : 'false'}
        data-ov25-dining-mobile-table-selection-sheet={isMobileTableSelectionEmpty ? 'true' : 'false'}
        data-ov25-dining-mobile-chair-selection-sheet={isMobileChairSelectionEmpty ? 'true' : 'false'}
        data-ov25-dining-desktop-table-selection-sheet={isDesktopTableSelectionEmpty ? 'true' : 'false'}
        style={{
          position: 'relative',
          // Keep mounted and visible so the configurator iframe can initialise
          // and send its bootstrap messages (catalog/scene/configurator state).
          // `isReady` depends on those messages, so gating visibility on it would
          // deadlock — the loading overlay below already hides the content until ready.
          visibility: 'visible',
          pointerEvents: isReady ? 'auto' : 'none',
          flex: 1,
          minHeight: 0,
          display: isMobileReview ? 'block' : 'grid',
          gridTemplateColumns: isMobileReview
            ? undefined
            : isMobile
            ? '1fr'
            : isDesktopTableSelectionEmpty
              ? '1fr'
              : 'minmax(0, 1fr) minmax(340px, 420px)',
          gridTemplateRows: isMobileReview
            ? undefined
            : isMobile
            ? activeStep === 'review'
              ? `${mobileReviewViewerPercent}fr ${100 - mobileReviewViewerPercent}fr`
              : mobileSelectionGridRows ?? (shouldShowFullMobileSelectionSheet
              ? '0fr 1fr'
              : shouldShowExpandedMobileSelectionDrawer
                ? '22fr 78fr'
              : shouldShowCompactMobileSelectionDrawer
                ? '68fr 32fr'
                : '55fr 45fr')
            : '1fr',
          overflow: isMobileReview ? 'auto' : 'hidden',
          overscrollBehavior: isMobileReview ? 'contain' : undefined,
          WebkitOverflowScrolling: isMobileReview ? 'touch' : undefined,
          transition: isMobile && activeStep !== 'review' && mobileSelectionSheetDragPercent == null
            ? 'grid-template-rows 520ms cubic-bezier(0.32, 0.72, 0, 1)'
            : undefined,
        }}
      >
        <section
          data-ov25-dining-viewer-panel
          style={{
            display: isDesktopTableSelectionEmpty ? 'none' : undefined,
            position: isMobileReview ? 'sticky' : 'relative',
            top: isMobileReview ? 0 : undefined,
            zIndex: isMobileReview ? 12 : undefined,
            height: isMobileReview ? `${mobileReviewViewerPercent}%` : undefined,
            minHeight: 0,
            opacity: activeStep === 'style' || shouldShowFullMobileSelectionSheet ? 0 : 1,
            pointerEvents: activeStep === 'style' || shouldShowFullMobileSelectionSheet ? 'none' : 'auto',
            backgroundColor: 'var(--ov25-configurator-iframe-background-color, #fff)',
            borderRight: isMobile ? undefined : '1px solid var(--ov25-border-color, #e5e5e5)',
            overflow: 'hidden',
            transition: isMobile ? 'opacity 240ms cubic-bezier(0.23, 1, 0.32, 1)' : undefined,
          }}
        >
          <DiningProductGallery style={{ borderRadius: 0 }} />

          {isMobileReview && !hideAr && (
            <div
              data-ov25-dining-review-view-room-action
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 18,
                zIndex: 5,
                display: 'flex',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <button
                type="button"
                onClick={viewInRoom}
                style={{
                  minHeight: 44,
                  minWidth: isMobile ? 188 : 208,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '0 16px',
                  borderRadius: 'var(--ov25-rounded-md, 6px)',
                  border: '1px solid var(--ov25-text-color, #111)',
                  backgroundColor: 'rgba(255,255,255,0.94)',
                  color: 'var(--ov25-text-color, #111)',
                  fontSize: 14,
                  fontWeight: 650,
                  lineHeight: 1,
                  cursor: 'pointer',
                  fontFamily: 'var(--ov25-font-family, "IBM Plex Sans", sans-serif)',
                  pointerEvents: 'auto',
                  boxShadow: '0 10px 28px rgba(0,0,0,0.08)',
                }}
              >
                <Sparkles size={18} strokeWidth={1.8} />
                <span style={{ whiteSpace: 'nowrap' }}>
                  View in your room
                </span>
              </button>
            </div>
          )}

          <div
            data-ov25-dining-viewer-controls
            style={{
              position: 'absolute',
              right: isMobile ? 12 : 24,
              bottom: isMobile ? 18 : 28,
              zIndex: 4,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {!hideAr && (
              <button type="button" aria-label="View in room" onClick={viewInRoom} style={iconButtonStyle}>
                <ScanLine size={17} strokeWidth={1.8} />
              </button>
            )}
            <button type="button" aria-label="Toggle dimensions" onClick={toggleDimensions} style={iconButtonStyle}>
              <Ruler size={17} strokeWidth={1.8} />
            </button>
            <button type="button" aria-label="Enlarge viewer" onClick={enlargeViewer} style={iconButtonStyle}>
              <Maximize2 size={17} strokeWidth={1.8} />
            </button>
          </div>
        </section>

        <aside
          data-ov25-dining-full-page-panel
          data-ov25-dining-mobile-selection-drawer={shouldShowMobileSelectionDrawer ? 'true' : 'false'}
          data-ov25-dining-mobile-selection-drawer-expanded={shouldShowExpandedMobileSelectionDrawer ? 'true' : 'false'}
          style={{
            display: isMobileReview ? 'none' : undefined,
            position: 'relative',
            minHeight: 0,
            overflow: 'hidden',
            opacity: activeStep === 'style' || activeStep === 'review' ? 0 : 1,
            pointerEvents: activeStep === 'style' || activeStep === 'review' ? 'none' : 'auto',
            backgroundColor: shouldShowMobileSelectionDrawer ? 'transparent' : 'var(--ov25-background-color, #fff)',
            borderTop: isMobile && !shouldShowFullMobileSelectionSheet ? '1px solid var(--ov25-border-color, #e5e5e5)' : undefined,
            borderRadius: shouldShowMobileSelectionDrawer
              ? 'var(--ov25-rounded-xl, 14px) var(--ov25-rounded-xl, 14px) 0 0'
              : undefined,
            boxShadow: shouldShowMobileSelectionDrawer
              ? '0 -14px 34px rgba(0,0,0,0.08)'
              : undefined,
          }}
        >
          {canToggleMobileSelectionSheet && (
            <button
              type="button"
              aria-label={shouldShowMobileSelectionSheet ? 'Collapse selection drawer' : 'Expand selection drawer'}
              aria-expanded={shouldShowExpandedMobileSelectionDrawer}
              data-ov25-dining-mobile-selection-handle
              onClick={() => {
                if (suppressMobileSelectionSheetClickRef.current) {
                  suppressMobileSelectionSheetClickRef.current = false;
                  return;
                }
                setIsMobileSelectionSheetExpanded(expanded => !expanded);
              }}
              onPointerDown={handleMobileSelectionSheetPointerDown}
              onPointerMove={handleMobileSelectionSheetPointerMove}
              onPointerUp={finishMobileSelectionSheetDrag}
              onPointerCancel={cancelMobileSelectionSheetDrag}
              style={{
                position: 'absolute',
                top: shouldShowMobileSelectionDrawer ? 7 : -1,
                left: '50%',
                zIndex: 10,
                width: 76,
                height: 22,
                padding: 0,
                border: 'none',
                backgroundColor: 'transparent',
                transform: 'translateX(-50%)',
                cursor: mobileSelectionSheetDragPercent == null ? 'grab' : 'grabbing',
                touchAction: 'none',
                userSelect: 'none',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  display: 'block',
                  width: 42,
                  height: 4,
                  margin: '9px auto',
                  borderRadius: 999,
                  backgroundColor: 'var(--ov25-border-color, #d9d9d9)',
                }}
              />
            </button>
          )}
          <DiningSidebar hideStepper />
        </aside>

        {activeStep === 'style' && (
          <div
            data-ov25-dining-style-page-layer
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 6,
              backgroundColor: 'var(--ov25-background-color, #fff)',
            }}
          >
            <DiningStyleLanding />
          </div>
        )}
        {activeStep === 'review' && (
          <DiningReviewPage
            mobileInline={isMobile}
            mobileInlineOffset={isMobileReview ? mobileReviewSummaryHoldOffset : 0}
          />
        )}
      </main>

      {!isReady && (
        <div
          data-ov25-dining-loading-overlay
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'wait',
            backgroundColor: '#ffffff',
          }}
        >
          {!hideLogo && (
            <div
              style={{
                width: isMobile ? 260 : 380,
                height: isMobile ? 170 : 240,
                transformOrigin: 'center',
                animation: 'ov25-dining-loader-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <OVOrBrandLogo
                imageUrl={logo}
                className="ov:h-full ov:max-w-full"
                style={{
                  width: isMobile ? '16rem' : '24rem',
                  height: isMobile ? '7.5rem' : '11rem',
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
