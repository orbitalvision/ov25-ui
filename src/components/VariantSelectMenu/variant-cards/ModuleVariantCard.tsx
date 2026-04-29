import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { CompatibleModule } from '../../../utils/configurator-utils.js';
import { type VariantCardProps } from '../ProductVariants.js';
import { cn } from '../../../lib/utils.js';
import {
  ModuleVariantDetailPanel,
  dimensionStringFromModule,
} from './module-variant-detail-panel.js';
import {
  getModuleProductImageResponsiveAttrs,
  getModuleProductPreviewImageUrls,
} from '../../../utils/module-product-image-srcset.js';
import { Info } from 'lucide-react';
import { Ov25ShadowHost } from '../../Ov25ShadowHost.js';
import { checkoutCommerceCtaButtonClasses } from '../CheckoutButton.js';
import { VariantsCloseButton } from '../VariantsCloseButton.js';
import { useSnap2VariantSheetMainRoot } from '../../Snap2VariantSheetColumn.js';

const DESC_FOOTER_P_CLASS =
  'ov:text-xs ov:leading-snug ov:wrap-break-word ov:text-(--ov25-secondary-text-color) ov:px-1 ov:md:px-0';
/** Matches the real “See more…” control so width/line breaks match the probe. */
const SEE_MORE_SUFFIX_PROBE_CLASS =
  'ov:inline ov:border-0 ov:bg-transparent ov:p-0 ov:text-xs ov:font-medium ov:leading-snug ov:text-(--ov25-text-color) ov:underline ov:underline-offset-2';

/** Small px slack on the 3-line height ceiling for subpixel scrollHeight rounding. */
const MEASURE_HEIGHT_FUDGE_PX = 2;
/** When truncated, leave this many fewer chars so “See more…” is less likely to wrap alone. */
const SEE_MORE_LINE_LEEWAY_CHARS = 5;

const FADE_TAIL_CHARS = 36;
const MAX_DESC_LINES = 3;

const TAIL_FADE_MASK = {
  WebkitMaskImage: 'linear-gradient(90deg, #000 0%, #000 38%, rgba(0,0,0,0.55) 68%, transparent 100%)',
  maskImage: 'linear-gradient(90deg, #000 0%, #000 38%, rgba(0,0,0,0.55) 68%, transparent 100%)',
} as const;

function fillDescriptionMeasureProbe(probe: HTMLElement, charCount: number, fullText: string) {
  probe.replaceChildren();
  probe.append(document.createTextNode(fullText.slice(0, charCount)));
  const span = document.createElement('span');
  span.setAttribute('class', SEE_MORE_SUFFIX_PROBE_CLASS);
  span.textContent = '\u00a0See more...';
  probe.append(span);
}

/** Max characters of `fullText` such that prefix + “See more…” fits in {@link MAX_DESC_LINES} lines (probe already has final width). */
function measureMaxPrefixChars(fullText: string, probe: HTMLElement): number {
  if (fullText.length === 0) return fullText.length;

  fillDescriptionMeasureProbe(probe, 1, fullText);
  const cs = getComputedStyle(probe);
  const lineHeight = Math.max(10, parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.25);
  const maxScroll = lineHeight * MAX_DESC_LINES + MEASURE_HEIGHT_FUDGE_PX;

  fillDescriptionMeasureProbe(probe, fullText.length, fullText);
  if (probe.scrollHeight <= maxScroll) return fullText.length;

  let lo = 0;
  let hi = fullText.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    fillDescriptionMeasureProbe(probe, mid, fullText);
    if (probe.scrollHeight <= maxScroll) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

function applySeeMoreLineLeeway(rawChars: number, fullLength: number): number {
  if (rawChars >= fullLength) return fullLength;
  return Math.max(0, rawChars - SEE_MORE_LINE_LEEWAY_CHARS);
}

function ModuleCardDescriptionFooter({
  description,
  onSeeMore,
}: {
  description: string;
  onSeeMore: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visibleChars, setVisibleChars] = useState(description.length);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const run = () => {
      const w = wrap.offsetWidth;
      if (w < 4) return;
      const probe = document.createElement('div');
      probe.setAttribute('class', DESC_FOOTER_P_CLASS);
      probe.style.cssText = `position:absolute;left:0;top:0;width:${w}px;visibility:hidden;pointer-events:none;white-space:pre-wrap;word-break:break-word;height:auto;overflow:visible;`;
      wrap.appendChild(probe);
      try {
        const raw = measureMaxPrefixChars(description, probe);
        setVisibleChars(applySeeMoreLineLeeway(raw, description.length));
      } finally {
        wrap.removeChild(probe);
      }
    };
    run();
    const ro = new ResizeObserver(run);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [description]);

  const truncated = visibleChars < description.length;
  const n = Math.min(visibleChars, description.length);
  const fadeLen = Math.min(FADE_TAIL_CHARS, n);
  const head = description.slice(0, Math.max(0, n - fadeLen));
  const tail = description.slice(Math.max(0, n - fadeLen), n);

  return (
    <div
      ref={wrapRef}
      className="ov25-module-variant-card__footer ov:relative ov:shrink-0 ov:cursor-pointer ov:px-0 ov:pb-2 ov:pt-1.5"
      data-ov25-module-variant-card-part="footer"
      onClick={(e) => {
        e.stopPropagation();
        onSeeMore();
      }}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <p className={DESC_FOOTER_P_CLASS} data-ov25-module-variant-card-part="description-short-text">
        {truncated ? (
          <>
            {head}
            {fadeLen > 0 ? (
              <span style={TAIL_FADE_MASK} className="ov:text-(--ov25-secondary-text-color)">
                {tail}
              </span>
            ) : null}
          </>
        ) : (
          description
        )}{' '}
        <button
          type="button"
          className="ov:inline ov:cursor-pointer ov:border-0 ov:bg-transparent ov:p-0 ov:text-xs ov:font-medium ov:leading-snug ov:text-(--ov25-text-color) ov:underline ov:underline-offset-2 ov:hover:opacity-80"
          data-ov25-module-variant-card-part="see-more"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSeeMore();
          }}
        >
          See more...
        </button>
      </p>
    </div>
  );
}

export interface ModuleVariantCardProps extends VariantCardProps {
  isLoading?: boolean;
  /** When true, activating the card selects immediately (e.g. initialise menu); no detail sheet. */
  pickOnActivate?: boolean;
  className?: string;
  /** Extra classes on the `ov25-module-variant-card__thumb-dual` node (e.g. padding in InitialiseMenu). */
  thumbDualClassName?: string;
}

export function ModuleVariantCard({
  variant,
  onSelect,
  index: _index,
  isMobile,
  isLoading = false,
  pickOnActivate = false,
  className,
  thumbDualClassName,
}: ModuleVariantCardProps) {
  const module = variant.data as CompatibleModule;
  const variantSheetPortalEl = useSnap2VariantSheetMainRoot();
  const [detailOpen, setDetailOpen] = useState(false);
  const detailTitleId = useId();

  const handleAddFromSheet = () => {
    if (isLoading) return;
    onSelect(variant);
    setDetailOpen(false);
  };

  const previewUrls = useMemo(
    () => getModuleProductPreviewImageUrls(module.product),
    [
      module.product.cutoutImage,
      module.product.heroImage,
      module.product.images,
      module.product.hasImage,
      module.product.imageUrl,
    ]
  );
  const thumbImg = getModuleProductImageResponsiveAttrs(
    module.product.imageUrl,
    module.product.imageUrls,
    isMobile ? '(max-width: 768px) 45vw, 50vw' : '(max-width: 768px) 33vw, min(220px, 22vw)'
  );
  const cutoutUrl = module.product.cutoutImage;
  const dimensionString = useMemo(
    () => dimensionStringFromModule(module.dimensions),
    [module.dimensions]
  );
  const shortLine = (module.product.shortDescription ?? '').trim();
  const longLine = (module.product.longDescription ?? '').trim();
  const footerSource = shortLine || longLine;
  const renderHiddenLong =
    Boolean(longLine && shortLine && longLine !== shortLine);
  const isDualThumbLayout = previewUrls.length >= 2;

  const handleThumbAdd = () => {
    if (isLoading) return;
    onSelect(variant);
  };

  const handleOpenDetailSheet = () => {
    if (isLoading) return;
    setDetailOpen(true);
  };

  /** Thumbnail / dual-thumb taps add the product; on mobile open details via the info control only. */
  const handleMediaActivate = () => {
    handleThumbAdd();
  };

  useEffect(() => {
    if (!detailOpen) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') setDetailOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [detailOpen]);

  const detailPortalTarget =
    typeof document === 'undefined'
      ? null
      : isMobile
        ? document.body
        : (variantSheetPortalEl ?? document.body);

  const detailSheetPortal =
    !pickOnActivate &&
    detailOpen &&
    detailPortalTarget &&
    createPortal(
      <Ov25ShadowHost
        data-ov25-module-variant-detail-sheet-open="true"
        className={cn(
          'ov:inset-0 ov:z-50 ov:pointer-events-auto',
          isMobile || variantSheetPortalEl == null ? 'ov:fixed' : 'ov:absolute'
        )}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={detailTitleId}
          className="ov:relative ov:flex ov:h-full ov:w-full ov:min-h-0 ov:flex-col ov:overflow-hidden ov:bg-(--ov25-background-color)"
          data-ov25-module-variant-detail-sheet="true"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 id={detailTitleId} className="ov:sr-only">
            {module.product.name}
          </h2>
          <div className="ov:flex-1 ov:min-h-0 ov:overflow-y-auto ov:overflow-x-hidden ov:px-4 ov:pb-4 ov:pt-4">
            <ModuleVariantDetailPanel module={module} />
          </div>
          <VariantsCloseButton onClick={() => setDetailOpen(false)} ariaLabel="Close product details" />
          <div className="ov25-module-variant-detail-sheet-footer ov:shrink-0 ov:border-t ov:border-(--ov25-border-color) ov:bg-(--ov25-background-color) ov:px-4 ov:pb-2 ov:md:pb-4 ov:pt-2">
            <button
              type="button"
              data-ov25-module-variant-detail-sheet-add="true"
              disabled={isLoading}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAddFromSheet();
              }}
              className={cn(
                checkoutCommerceCtaButtonClasses,
                'ov:font-medium ov:w-full ov:min-w-0 ov:max-w-full ov:uppercase',
                isLoading && 'ov:opacity-50 ov:cursor-not-allowed'
              )}
            >
              Add Product
            </button>
          </div>
        </div>
      </Ov25ShadowHost>,
      detailPortalTarget
    );

  const handleActivate = () => {
    if (isLoading) return;
    if (pickOnActivate) {
      onSelect(variant);
    }
  };

  return (
    <div
      data-ov25-module-variant-card
      data-selected={variant.isSelected ? 'true' : 'false'}
      data-ov25-module-variant-card-pick={pickOnActivate ? 'true' : undefined}
      role={pickOnActivate ? 'button' : 'group'}
      tabIndex={isLoading ? -1 : 0}
      aria-expanded={pickOnActivate ? undefined : detailOpen}
      aria-label={
        pickOnActivate
          ? `${module.product.name}. Select this product.`
          : isMobile
            ? `${module.product.name}. Tap to add product. Use details button for more information.`
            : `${module.product.name}. Click images to add, description to view details.`
      }
      onKeyDown={(e) => {
        if (isLoading) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (pickOnActivate) {
            handleActivate();
          } else {
            handleMediaActivate();
          }
        }
      }}
      onClick={
        pickOnActivate
          ? (e) => {
              e.preventDefault();
              e.stopPropagation();
              handleActivate();
            }
          : undefined
      }
      className={cn(
        'ov25-module-variant-card ov:relative ov:flex ov:flex-col ov:w-full ov:max-w-full ov:shrink-0 ov:rounded-lg ov:mb-3 ov:px-2 ov:overflow-visible ov:text-left ov:bg-(--ov25-background-color)',
        isLoading
          ? 'ov:opacity-50 ov:cursor-not-allowed ov:pointer-events-none'
          : pickOnActivate
            ? 'ov:cursor-pointer'
            : isMobile
              ? 'ov:cursor-pointer'
              : 'ov:cursor-default',
        className
      )}
    >
      {!pickOnActivate && isMobile ? (
        <button
          type="button"
          className={cn(
            'ov:absolute ov:top-1 ov:right-1 ov:z-20',
            'ov:cursor-pointer ov:w-8 ov:h-8 ov:flex ov:items-center ov:justify-center',
            'ov:transition-all ov:duration-200 ov:hover:opacity-80',
            'ov:border-0 ov:bg-transparent',
            'ov:disabled:opacity-50 ov:disabled:cursor-not-allowed',
          )}
          aria-label={`${module.product.name} — product details`}
          data-ov25-module-variant-card-part="details-trigger"
          disabled={isLoading}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleOpenDetailSheet();
          }}
        >
          <Info
            className="ov:h-5 ov:w-5 ov:text-(--ov25-configurator-view-controls-text-color)"
            aria-hidden
          />
        </button>
      ) : null}
      <p
        className={cn(
          'ov25-module-variant-card__name ov:shrink-0 ov:px-1 ov:md:px-0 ov:pt-1 ov:pb-0.5 ov:text-start ov:text-sm ov:font-medium ov:leading-tight ov:text-(--ov25-text-color) ov:line-clamp-2',
          !pickOnActivate && (isMobile ? 'ov:cursor-pointer ov:pr-9' : 'ov:cursor-pointer')
        )}
        data-ov25-module-variant-card-part="name"
        onClick={
          pickOnActivate
            ? undefined
            : (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isMobile) {
                  handleThumbAdd();
                } else {
                  handleOpenDetailSheet();
                }
              }
        }
      >
        {module.product.name}
      </p>
      {dimensionString ? (
        <span
          className={cn(
            'ov25-module-variant-card__dimensions ov:shrink-0 ov:block ov:w-full ov:px-1 ov:md:px-0 ov:pb-0.5 ov:text-start ov:text-xs ov:leading-tight ov:text-gray-500',
            !pickOnActivate && 'ov:cursor-pointer'
          )}
          data-ov25-module-variant-card-part="dimensions"
          onClick={
            pickOnActivate
              ? undefined
              : (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (isMobile) {
                    handleThumbAdd();
                  } else {
                    handleOpenDetailSheet();
                  }
                }
          }
        >
          {dimensionString}
        </span>
      ) : null}

      <div
        className={cn(
          'ov25-module-variant-card__thumb ov:relative ov:w-full ov:min-h-0 ov:shrink-0',
          isDualThumbLayout
            ? 'ov:overflow-visible'
            : 'ov:flex ov:min-h-[128px] ov:flex-1 ov:items-center ov:justify-center ov:overflow-hidden',
          !pickOnActivate && !isDualThumbLayout && 'ov:cursor-pointer'
        )}
        data-ov25-module-variant-card-part="thumb"
        onClick={
          pickOnActivate || isDualThumbLayout
            ? undefined
            : (e) => {
                e.preventDefault();
                e.stopPropagation();
                handleMediaActivate();
              }
        }
      >
        {previewUrls.length >= 2 ? (
          <div
            className={cn(
              'ov25-module-variant-card__thumb-dual ov:relative ov:flex ov:w-full ov:min-h-0 ov:flex-col ov:min-w-0',
              thumbDualClassName
            )}
            data-ov25-module-variant-card-part="thumb-dual"
          >
            <div
              className={cn(
                'ov25-module-variant-card__thumb-dual-row ov:flex ov:w-full ov:gap-1 ov:px-0 ov:pb-0.5 ov:min-h-[128px]',
                !pickOnActivate && 'ov:cursor-pointer'
              )}
              onClick={
                pickOnActivate
                  ? undefined
                  : (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleMediaActivate();
                    }
              }
            >
              {previewUrls.slice(0, 2).map((img, idx) => (
                <div
                  key={`${img}-${idx}`}
                  className='ov25-module-variant-card__thumb-cell ov:relative ov:min-h-0 ov:min-w-0 ov:flex-1 ov:overflow-hidden ov:rounded-sm ov:bg-transparent'
                  data-ov25-module-variant-card-part="thumb-cell"
                  data-ov25-module-variant-card-thumb-index={idx}
                >
                  <img
                    src={img}
                    alt=""
                    className="ov25-module-variant-card__thumb-img ov:absolute ov:inset-0 ov:h-full ov:w-full ov:object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : module.product.hasImage && thumbImg.src ? (
          <img
            {...thumbImg}
            alt=""
            className="ov25-module-variant-card__thumb-img ov:h-full ov:w-full ov:max-h-full ov:max-w-full ov:object-contain"
          />
        ) : (
          <div
            className="ov25-module-variant-card__thumb-placeholder ov:absolute ov:inset-0 ov:flex ov:items-center ov:justify-center ov:bg-transparent"
            data-ov25-module-variant-card-part="thumb-placeholder"
          >
            <span className="ov:p-2 ov:text-center ov:text-gray-400 ov:text-xs">No Image</span>
          </div>
        )}
      </div>

      {!pickOnActivate && !isMobile && footerSource ? (
        <div
          className="ov25-module-variant-card-descriptions"
          data-ov25-module-variant-card-part="descriptions"
        >
          <div
            className="ov25-module-variant-card-description-short"
            data-ov25-module-variant-card-part="description-short"
          >
            <ModuleCardDescriptionFooter
              key={`${shortLine}\0${longLine}`}
              description={footerSource}
              onSeeMore={() => setDetailOpen(true)}
            />
          </div>
          {renderHiddenLong ? (
            <div
              className="ov25-module-variant-card-description-long ov:hidden ov:pb-2"
              data-ov25-module-variant-card-part="description-long"
              aria-hidden="true"
            >
              <p
                className={DESC_FOOTER_P_CLASS}
                data-ov25-module-variant-card-part="description-long-text"
              >
                {longLine}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {detailSheetPortal}
    </div>
  );
}
