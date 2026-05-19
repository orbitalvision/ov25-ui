import React from 'react';
import {
  Armchair,
  ChevronRight,
  Download,
  PoundSterling,
  Share2,
  Sparkles,
  Truck,
} from 'lucide-react';
import { useDiningUI, type DiningStep } from '../../contexts/dining-ui-context.js';
import type { ConfiguratorState } from '../../contexts/ov25-ui-context.js';
import type { DiningCatalogItem } from '../../types/dining-iframe-types.js';

const editCardStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 78,
  display: 'grid',
  gridTemplateColumns: '42px minmax(0, 1fr) 22px',
  alignItems: 'center',
  gap: 12,
  padding: '14px 14px',
  borderRadius: 'var(--ov25-rounded-md, 6px)',
  border: '1px solid var(--ov25-border-color, #d4d4d4)',
  backgroundColor: 'var(--ov25-background-color, #fff)',
  color: 'var(--ov25-text-color, #111)',
  cursor: 'pointer',
  fontFamily: 'var(--ov25-font-family, "IBM Plex Sans", sans-serif)',
  textAlign: 'left',
};

const secondaryButtonStyle: React.CSSProperties = {
  minHeight: 52,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  borderRadius: 'var(--ov25-rounded-md, 6px)',
  border: '1px solid var(--ov25-text-color, #111)',
  backgroundColor: 'var(--ov25-background-color, #fff)',
  color: 'var(--ov25-text-color, #111)',
  fontSize: 14,
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: 'var(--ov25-font-family, "IBM Plex Sans", sans-serif)',
};

function getItemImage(item: DiningCatalogItem | null | undefined): string | null {
  if (!item) return null;
  return item.cutoutImage ?? item.imageUrls?.image ?? item.imageUrls?.small_image ?? item.imageUrl ?? null;
}

function getOptionProductId(option: { id?: unknown }): number | null {
  const id = typeof option.id === 'string' ? option.id : '';
  const lastPart = id.split('-').pop();
  const productId = Number(lastPart);
  return Number.isFinite(productId) ? productId : null;
}

function stripProductNamePrefix(optionName: string, productName: string): string {
  const trimmedOptionName = optionName.trim();
  const trimmedProductName = productName.trim();
  if (!trimmedProductName) return trimmedOptionName;

  const optionLower = trimmedOptionName.toLowerCase();
  const productLower = trimmedProductName.toLowerCase();
  const label = optionLower.startsWith(productLower)
    ? trimmedOptionName.slice(trimmedProductName.length)
    : trimmedOptionName;

  return label
    .replace(/^[-–—:/\s]+/, '')
    .replace(/\s+/g, ' ')
    .trim() || trimmedOptionName;
}

function getSelectedOptionLabels(
  item: DiningCatalogItem | null | undefined,
  configuratorState: ConfiguratorState | undefined,
): string[] {
  if (!item || !configuratorState) return [];

  return configuratorState.options.flatMap(option => {
    const optionProductId = getOptionProductId(option);
    const belongsToProduct = optionProductId === item.productId || option.name.startsWith(item.name);
    if (!belongsToProduct) return [];

    const optionLabel = stripProductNamePrefix(option.name, item.name);

    return option.groups.flatMap(group =>
      group.selections.flatMap(selection => {
        const isSelected = configuratorState.selectedSelections.some(selected =>
          selected.optionId === option.id &&
          selected.groupId === group.id &&
          selected.selectionId === selection.id
        );

        if (!isSelected) return [];

        const selectionName = selection.name.trim();
        if (!selectionName) return [];

        return optionLabel && optionLabel.toLowerCase() !== selectionName.toLowerCase()
          ? [`${optionLabel}: ${selectionName}`]
          : [selectionName];
      })
    );
  });
}

interface DiningReviewPageProps {
  mobileInline?: boolean;
  mobileInlineOffset?: number;
}

export const DiningReviewPage: React.FC<DiningReviewPageProps> = ({
  mobileInline = false,
  mobileInlineOffset = 0,
}) => {
  const {
    builderMode,
    selectedTableItem,
    globalChairCount,
    chairs,
    benches,
    sideAssignments,
    diningCommercePayload,
    commercePriceSnapshot,
    hidePricing,
    hideAr,
    disableAddToCart,
    addToBasket,
    setActiveStep,
    viewInRoom,
    isMobile,
    configuratorState,
  } = useDiningUI();

  const allSeats = React.useMemo(() => [...chairs, ...benches], [benches, chairs]);
  const selectedSeatLines = React.useMemo(() => {
    const grouped = new Map<string, { item: DiningCatalogItem | null; name: string; quantity: number }>();

    diningCommercePayload.chairs.forEach(line => {
      const key = `${line.productId}-${line.configId}`;
      const item = allSeats.find(candidate =>
        candidate.productId === line.productId && candidate.configId === line.configId
      ) ?? null;
      const current = grouped.get(key);
      grouped.set(key, {
        item,
        name: item?.name ?? line.name,
        quantity: (current?.quantity ?? 0) + line.count,
      });
    });

    if (grouped.size === 0 && Object.keys(sideAssignments).length > 0) {
      Object.values(sideAssignments).forEach(assignment => {
        if (!assignment) return;
        const key = `${assignment.productId}-${assignment.configId}`;
        const item = allSeats.find(candidate =>
          candidate.productId === assignment.productId && candidate.configId === assignment.configId
        ) ?? null;
        const current = grouped.get(key);
        grouped.set(key, {
          item,
          name: item?.name ?? assignment.type,
          quantity: (current?.quantity ?? 0) + 1,
        });
      });
    }

    return Array.from(grouped.values());
  }, [allSeats, diningCommercePayload.chairs, sideAssignments]);

  const formattedPrice = commercePriceSnapshot?.formattedPrice;
  const formattedSubtotal = commercePriceSnapshot?.formattedSubtotal;
  const formattedSaving = commercePriceSnapshot?.discount?.formattedAmount;

  const goTo = React.useCallback((step: DiningStep) => {
    setActiveStep(step);
  }, [setActiveStep]);

  const handleSave = React.useCallback(async () => {
    try {
      window.localStorage?.setItem('ov25-dining-saved-url', window.location.href);
      await navigator.clipboard?.writeText(window.location.href);
    } catch {
      // Saving is best-effort when the merchant has not supplied a callback.
    }
  }, []);

  const handleShare = React.useCallback(async () => {
    const shareData = {
      title: 'Dining set configuration',
      text: 'Take a look at this dining set configuration.',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard?.writeText(window.location.href);
    } catch {
      // User cancellation or clipboard denial can be safely ignored.
    }
  }, []);

  return (
    <div
      data-ov25-dining-review-page
      style={{
        position: mobileInline ? 'relative' : 'absolute',
        inset: mobileInline ? undefined : 0,
        zIndex: mobileInline ? 1 : 7,
        marginTop: mobileInline ? mobileInlineOffset : undefined,
        display: mobileInline || isMobile ? 'block' : 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) minmax(360px, 430px)',
        gridTemplateRows: isMobile ? undefined : '1fr',
        overflow: mobileInline ? 'visible' : isMobile ? 'auto' : 'hidden',
        backgroundColor: 'transparent',
        fontFamily: 'var(--ov25-font-family, "IBM Plex Sans", sans-serif)',
        pointerEvents: mobileInline || isMobile ? 'auto' : 'none',
        overscrollBehavior: !mobileInline && isMobile ? 'contain' : undefined,
        WebkitOverflowScrolling: !mobileInline && isMobile ? 'touch' : undefined,
      }}
    >
      {!mobileInline && (
        <section
          data-ov25-dining-review-preview
          style={{
            position: 'relative',
            minHeight: isMobile ? 360 : 0,
            overflow: 'hidden',
            padding: isMobile ? '0 0 86px' : '42px 38px 48px',
            borderRight: isMobile ? undefined : '1px solid var(--ov25-border-color, #e5e5e5)',
            pointerEvents: 'none',
          }}
        >
          {!isMobile && (
            <div
              style={{
                textAlign: 'center',
                maxWidth: 940,
                margin: '0 auto',
              }}
            >
              <h1
                style={{
                  margin: 0,
                  color: 'var(--ov25-text-color, #111)',
                  fontSize: 36,
                  lineHeight: 1.08,
                  fontWeight: 800,
                  letterSpacing: 0,
                }}
              >
                Your complete dining set
              </h1>
              <p
                style={{
                  margin: '10px 0 0',
                  color: 'var(--ov25-secondary-text-color, #666)',
                  fontSize: 17,
                }}
              >
                From our range of dining products
              </p>
            </div>
          )}

          {!hideAr && (
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: isMobile ? 24 : 28, display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={viewInRoom}
                style={{
                  ...secondaryButtonStyle,
                  minHeight: 44,
                  minWidth: isMobile ? 188 : 208,
                  gap: 8,
                  padding: '0 16px',
                  backgroundColor: 'rgba(255,255,255,0.94)',
                  fontSize: 14,
                  fontWeight: 650,
                  lineHeight: 1,
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
        </section>
      )}

      <aside
        data-ov25-dining-review-panel
        style={{
          minHeight: mobileInline || isMobile ? undefined : 0,
          overflow: mobileInline || isMobile ? 'visible' : 'auto',
          padding: isMobile ? '18px 18px max(22px, env(safe-area-inset-bottom))' : '42px 30px',
          backgroundColor: 'var(--ov25-background-color, #fff)',
          borderTop: isMobile ? '1px solid var(--ov25-border-color, #e5e5e5)' : undefined,
          boxShadow: isMobile ? '0 -12px 32px rgba(0,0,0,0.05)' : undefined,
          overscrollBehavior: 'contain',
          pointerEvents: 'auto',
          WebkitOverflowScrolling: !mobileInline && isMobile ? 'touch' : undefined,
        }}
      >
        <h2
          style={{
            margin: 0,
            color: 'var(--ov25-text-color, #111)',
            fontSize: isMobile ? 24 : 27,
            lineHeight: 1.25,
            fontWeight: 800,
            textTransform: 'uppercase',
          }}
        >
          {selectedTableItem?.name ?? 'Dining set'}
        </h2>
        <p style={{ margin: '4px 0 0', color: 'var(--ov25-text-color, #111)', fontSize: isMobile ? 22 : 26, lineHeight: 1.2, fontWeight: 650 }}>
          {globalChairCount > 0 ? `${globalChairCount} dining chairs` : builderMode === 'mix-and-match' ? 'Mix and match dining set' : 'Full range dining set'}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20, fontSize: 13, fontWeight: 700 }}>
          <span>Excellent</span>
          <span style={{ display: 'inline-flex', gap: 2 }}>
            {Array.from({ length: 5 }).map((_, index) => (
              <span key={index} style={{ width: 17, height: 17, backgroundColor: index < 4 ? '#00b67a' : '#d7d7d7', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>★</span>
            ))}
          </span>
          <span style={{ fontWeight: 600 }}>Trustpilot</span>
        </div>

        {!hidePricing && formattedPrice && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 22, flexWrap: 'wrap' }}>
            <strong
              data-ov25-dining-review-price
              style={{
                color: 'var(--ov25-configurator-price-text-color, #c9323a)',
                fontSize: isMobile ? 34 : 38,
                lineHeight: 1,
                fontWeight: 800,
              }}
            >
              {formattedPrice}
            </strong>
            {formattedSaving && (
              <span style={{ color: 'var(--ov25-text-color, #111)', fontSize: 16, fontWeight: 800 }}>
                SAVE {formattedSaving}
              </span>
            )}
            {formattedSubtotal && formattedSubtotal !== formattedPrice && (
              <span style={{ color: 'var(--ov25-secondary-text-color, #666)', fontSize: 13, textDecoration: 'line-through' }}>
                {formattedSubtotal}
              </span>
            )}
          </div>
        )}

        <div style={{ display: 'grid', gap: 14, marginTop: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '44px minmax(0, 1fr)', gap: 14, alignItems: 'center' }}>
            <span style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid currentColor', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <PoundSterling size={18} strokeWidth={1.7} />
            </span>
            <span style={{ color: 'var(--ov25-secondary-text-color, #666)', fontSize: 14, lineHeight: 1.35 }}>
              Finance options available. <u>More information</u>
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '44px minmax(0, 1fr)', gap: 14, alignItems: 'center' }}>
            <Truck size={35} strokeWidth={1.4} color="var(--ov25-secondary-text-color, #517a9a)" />
            <span style={{ color: 'var(--ov25-secondary-text-color, #666)', fontSize: 14, lineHeight: 1.35 }}>
              Delivery options available. <u>View delivery details</u>
            </span>
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 17, fontWeight: 800, color: 'var(--ov25-text-color, #111)' }}>
            Your dining set
          </h3>
          <div style={{ display: 'grid', gap: 10 }}>
            {selectedTableItem && (
              <ReviewLine
                label="Table"
                name={selectedTableItem.name}
                quantity={1}
                imageSrc={getItemImage(selectedTableItem)}
                finishDetails={getSelectedOptionLabels(selectedTableItem, configuratorState)}
              />
            )}
            {selectedSeatLines.map(line => (
              <ReviewLine
                key={`${line.name}-${line.quantity}`}
                label={line.item?.type === 'bench' ? 'Bench' : 'Chair'}
                name={line.name}
                quantity={line.quantity}
                imageSrc={getItemImage(line.item)}
                finishDetails={getSelectedOptionLabels(line.item, configuratorState)}
              />
            ))}
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 17, fontWeight: 800, color: 'var(--ov25-text-color, #111)' }}>
            Do you need to edit your dining set?
          </h3>
          <div style={{ display: 'grid', gap: 9 }}>
            <ReviewEditCard title="Change style" body="Fixed designs, traditional ranges or custom mix and match" onClick={() => goTo('style')} />
            <ReviewEditCard title="Change table" body="Wide range of fixed and extending dining tables" onClick={() => goTo('table')} />
            <ReviewEditCard title="Change seats" body="Wide range of chairs and benches" onClick={() => goTo('chairs')} />
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginTop: 16,
            padding: '16px 18px',
            borderRadius: 'var(--ov25-rounded-md, 6px)',
            backgroundColor: 'var(--ov25-secondary-background-color, #f2f2f2)',
            fontSize: 13,
            lineHeight: 1.35,
          }}
        >
          <Armchair size={24} strokeWidth={1.5} />
          <span>Get chairs <strong style={{ color: 'var(--ov25-destructive, #c9323a)' }}>HALF PRICE</strong> when bought with a dining table</span>
        </div>

        <button
          type="button"
          onClick={addToBasket}
          disabled={disableAddToCart}
          style={{
            width: '100%',
            minHeight: 58,
            marginTop: 18,
            border: 'none',
            borderRadius: 'var(--ov25-rounded-md, 6px)',
            backgroundColor: disableAddToCart ? 'var(--ov25-border-color, #ddd)' : 'var(--ov25-cta-color, #008f6b)',
            color: 'var(--ov25-cta-text-color, #fff)',
            fontSize: 17,
            fontWeight: 700,
            cursor: disableAddToCart ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--ov25-font-family, "IBM Plex Sans", sans-serif)',
          }}
        >
          Add to basket
        </button>

        <p style={{ margin: '18px 0 16px', color: 'var(--ov25-secondary-text-color, #666)', fontSize: 13, textAlign: 'center' }}>
          Need furniture advice? <u>Speak to our experts</u>
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <button type="button" onClick={handleSave} style={secondaryButtonStyle}>
            <Download size={20} strokeWidth={1.6} />
            Save
          </button>
          <button type="button" onClick={handleShare} style={secondaryButtonStyle}>
            <Share2 size={20} strokeWidth={1.6} />
            Share
          </button>
        </div>
      </aside>
    </div>
  );
};

const ReviewLine: React.FC<{
  label: string;
  name: string;
  quantity: number;
  imageSrc?: string | null;
  finishDetails?: string[];
}> = ({ label, name, quantity, imageSrc, finishDetails = [] }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '48px minmax(0, 1fr) auto',
      gap: 10,
      alignItems: 'center',
      padding: '10px 12px',
      border: '1px solid var(--ov25-border-color, #e0e0e0)',
      borderRadius: 'var(--ov25-rounded-md, 6px)',
      backgroundColor: 'var(--ov25-background-color, #fff)',
    }}
  >
    <span style={{ width: 48, height: 42, backgroundColor: 'var(--ov25-secondary-background-color, #f4f4f3)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {imageSrc ? <img src={imageSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : null}
    </span>
    <span style={{ minWidth: 0 }}>
      <span style={{ display: 'block', color: 'var(--ov25-secondary-text-color, #666)', fontSize: 11, textTransform: 'uppercase', fontWeight: 700 }}>{label}</span>
      <span style={{ display: 'block', color: 'var(--ov25-text-color, #111)', fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
      {finishDetails.length > 0 && (
        <span
          style={{
            display: 'block',
            marginTop: 2,
            color: 'var(--ov25-secondary-text-color, #666)',
            fontSize: 11,
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          Finish: {finishDetails.join(' · ')}
        </span>
      )}
    </span>
    <span style={{ color: 'var(--ov25-secondary-text-color, #666)', fontSize: 13, fontWeight: 700 }}>x{quantity}</span>
  </div>
);

const ReviewEditCard: React.FC<{
  title: string;
  body: string;
  onClick: () => void;
}> = ({ title, body, onClick }) => (
  <button type="button" onClick={onClick} style={editCardStyle}>
    <Sparkles size={28} strokeWidth={1.6} />
    <span style={{ minWidth: 0 }}>
      <span style={{ display: 'block', fontSize: 15, fontWeight: 700, color: 'var(--ov25-text-color, #111)' }}>{title}</span>
      <span style={{ display: 'block', marginTop: 2, fontSize: 12, lineHeight: 1.35, color: 'var(--ov25-secondary-text-color, #666)' }}>{body}</span>
    </span>
    <ChevronRight size={22} strokeWidth={1.7} />
  </button>
);
