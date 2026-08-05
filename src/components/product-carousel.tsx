import * as React from 'react'
import { useOV25UI } from "../contexts/ov25-ui-context.js"
import { CarouselDisplayMode } from "../types/config-enums.js"
import { cn } from "../lib/utils.js"
import { getProductGalleryImages, getCutoutIndex, resolveImageUrl } from "../lib/utils.js"

function isThreeDPlaceholder(item: unknown): item is { is3D: true } {
  return typeof item === 'object' && item !== null && 'is3D' in item && (item as { is3D: boolean }).is3D === true
}

const DRAG_THRESHOLD_PX = 5

type PopoverDivProps = React.ComponentPropsWithoutRef<'div'> & {
  popover?: 'auto' | 'manual'
}

const PopoverDiv = React.forwardRef<HTMLDivElement, PopoverDivProps>((props, ref) => (
  <div ref={ref} {...props} />
))
PopoverDiv.displayName = 'PopoverDiv'

export function ProductCarousel() {
  const {
    currentProduct,
    galleryIndex,
    setGalleryIndex,
    error,
    images: passedImages,
    galleryIndexToUse,
    carouselLayout,
    carouselLayoutMobile,
    carouselMaxImagesDesktop,
    carouselMaxImagesMobile,
    isMobile,
    deferThreeD,
    galleryCarouselFullscreenImage,
    setGalleryCarouselFullscreenImage,
  } = useOV25UI();

  const effectiveCarouselLayout = isMobile ? carouselLayoutMobile : carouselLayout;
  const carouselDisabled = effectiveCarouselLayout === CarouselDisplayMode.None;
  const useStackedLayout = effectiveCarouselLayout === 'stacked';
  const fullscreenScrollYRef = React.useRef(0);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const fullscreenOverlayRef = React.useRef<HTMLDivElement>(null);
  const [fullscreenPopoverFailed, setFullscreenPopoverFailed] = React.useState(false);
  const dragRef = React.useRef({ isDragging: false, startX: 0, startScrollLeft: 0, didDrag: false });
  const fullscreenPopoverSupported =
    typeof HTMLElement !== 'undefined' &&
    typeof HTMLElement.prototype.showPopover === 'function' &&
    typeof HTMLElement.prototype.hidePopover === 'function';
  const useFullscreenPopover =
    !carouselDisabled &&
    galleryCarouselFullscreenImage != null &&
    fullscreenPopoverSupported &&
    !fullscreenPopoverFailed;

  React.useEffect(() => {
    const el = scrollRef.current;
    if (carouselDisabled || !el || useStackedLayout) return;

    const handleWheel = (e: WheelEvent) => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      const canScrollLeft = scrollLeft > 0;
      const canScrollRight = scrollLeft < scrollWidth - clientWidth - 1;
      if (!canScrollLeft && !canScrollRight) return;

      const scrollingDown = e.deltaY > 0;
      const scrollingUp = e.deltaY < 0;
      if ((scrollingDown && canScrollRight) || (scrollingUp && canScrollLeft)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [carouselDisabled, useStackedLayout]);

  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    if (useStackedLayout || !scrollRef.current) return;
    dragRef.current = { isDragging: true, startX: e.clientX, startScrollLeft: scrollRef.current.scrollLeft, didDrag: false };
  }, [useStackedLayout]);

  const handleClickCapture = React.useCallback((e: React.MouseEvent) => {
    if (dragRef.current.didDrag) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  React.useEffect(() => {
    if (carouselDisabled || useStackedLayout) return;
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current.isDragging || !scrollRef.current) return;
      const deltaX = dragRef.current.startX - e.clientX;
      if (!dragRef.current.didDrag && Math.abs(deltaX) <= DRAG_THRESHOLD_PX) return;
      dragRef.current.didDrag = true;
      scrollRef.current.scrollLeft = dragRef.current.startScrollLeft + deltaX;
    };
    const onUp = () => { dragRef.current.isDragging = false; };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      dragRef.current.isDragging = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [carouselDisabled, useStackedLayout]);

  React.useEffect(() => {
    if (carouselDisabled || !galleryCarouselFullscreenImage) return;
    const onKey = (e: KeyboardEvent) =>
      e.key === 'Escape' && setGalleryCarouselFullscreenImage(null);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [carouselDisabled, galleryCarouselFullscreenImage, setGalleryCarouselFullscreenImage]);

  React.useLayoutEffect(() => {
    if (carouselDisabled || !galleryCarouselFullscreenImage) return;

    const y =
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;
    fullscreenScrollYRef.current = y;

    const body = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      width: document.body.style.width,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
    };
    const htmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.top = `-${y}px`;
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = body.overflow;
      document.body.style.position = body.position;
      document.body.style.width = body.width;
      document.body.style.top = body.top;
      document.body.style.left = body.left;
      document.body.style.right = body.right;
      document.documentElement.style.overflow = htmlOverflow;
      window.scrollTo(0, fullscreenScrollYRef.current);
    };
  }, [carouselDisabled, galleryCarouselFullscreenImage]);

  React.useLayoutEffect(() => {
    if (!useFullscreenPopover) return;
    const overlay = fullscreenOverlayRef.current;
    if (!overlay) return;

    try {
      overlay.showPopover();
    } catch {
      setFullscreenPopoverFailed(true);
      return;
    }

    return () => {
      try {
        overlay.hidePopover();
      } catch {
        // The overlay may already be closed while React is unmounting it.
      }
    };
  }, [useFullscreenPopover, galleryCarouselFullscreenImage]);

  if (carouselDisabled) return null;

  const hasCutout = !!(currentProduct?.metadata as any)?.cutoutImage
  const cutoutFirst = hasCutout && (isMobile || !deferThreeD)
  const productImages = getProductGalleryImages(currentProduct?.metadata, { cutoutFirst })
  const maxImages = isMobile ? carouselMaxImagesMobile : carouselMaxImagesDesktop
  const allImages = [...(passedImages || []), ...productImages]
  const images = maxImages != null && maxImages > 0 ? allImages.slice(0, maxImages) : allImages
  const cutoutIndexInProductGallery = getCutoutIndex(currentProduct?.metadata, { cutoutFirst })
  const passedLen = (passedImages || []).length
  const cutoutIndexCombined =
    cutoutIndexInProductGallery >= 0 ? passedLen + cutoutIndexInProductGallery : -1
  const useCutoutOnlyStrip =
    !deferThreeD && cutoutIndexCombined >= 0 && cutoutIndexCombined < images.length

  let carouselItems: (typeof images[0] | { is3D: boolean })[]
  if (useCutoutOnlyStrip) {
    carouselItems = images
  } else {
    carouselItems = [...images]
    carouselItems.splice(galleryIndexToUse, 0, { is3D: true })
  }

  if (images.length === 0 || error) return null;

  const renderCarouselThumbnail = (item: { is3D?: boolean } | typeof images[0], index: number) => {

    const is3DSlot = isThreeDPlaceholder(item)
    const isCutout = useCutoutOnlyStrip && index === cutoutIndexCombined
    if (is3DSlot) {
      const isSelected = galleryIndex === galleryIndexToUse
      return (
        <button
          key={index}
          onClick={() => setGalleryIndex(galleryIndexToUse)}
          data-selected={isSelected ? "true" : "false"}
          className={cn(
            "ov:cursor-pointer ov:relative ov:pl-1 ov:aspect-square ov:w-full ov:flex ov:justify-center ov:items-center ov:overflow-hidden ov:rounded-(--ov25-configurator-iframe-border-radius) ov:bg-white ov:ring-2",
            isSelected ? "ov:ring-(--ov25-primary-color)" : "ov:ring-(--ov25-configurator-view-controls-border-color)"
          )}
        >
          <span className="ov25-360-label ov:py-0.5 ov:rounded-full ov:bg-transparent ov:text-neutral-500  ov:text-xs ov:font-[250]  ">
            360°
          </span>
        </button>
      )
    }
    const galleryIndexForSlot = isCutout ? galleryIndexToUse : (cutoutIndexCombined === 0 ? index + 1 : index)
    const isSelected = galleryIndex === galleryIndexForSlot
    const src = resolveImageUrl(item as any, 'carousel')
    if (!src) {
      return (
        <div
          key={index}
          className="ov25-gallery-image-empty-slot ov:relative ov:aspect-square ov:w-full ov:overflow-hidden ov:rounded-(--ov25-configurator-iframe-border-radius) ov:bg-muted"
          data-ov25-gallery-image-empty-slot="true"
          data-ov25-gallery-item-index={index}
          aria-hidden="true"
        />
      )
    }
    return (
      <button
        key={index}
        onClick={() => setGalleryIndex(isCutout ? galleryIndexToUse : (cutoutIndexCombined === 0 ? index + 1 : index))}
        data-selected={isSelected ? "true" : "false"}
        className={cn(
          "ov25-gallery-image-button ov:relative ov:aspect-square ov:w-full ov:overflow-hidden ov:rounded-(--ov25-configurator-iframe-border-radius) ov:bg-muted ov:cursor-pointer",
          isSelected && "ov:ring-2 ov:ring-(--ov25-primary-color)"
        )}
      >
          {/* <div className="ov:w-full ov:h-full ov:absolute ov:inset-0 ov:bg-black"></div> */}
        <img
          src={src}
          alt={`Product thumbnail ${index}`}
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          className="ov:object-cover ov:w-full ov:h-full ov:absolute ov:inset-0"
        />
      
        {isCutout && (
          <span className="ov:absolute ov:pl-1 ov:inset-0 ov:flex ov:items-center ov:justify-center ov:pointer-events-none">
            <span className="ov25-360-label ov:px-1.5 ov:py-0.5 ov:pt-1 ov:rounded-md ov:backdrop-blur-xs ov:max-h-fit ov:text-white ov:text-xs ov:font-[250] ov:shadow-xs ov:[text-shadow:0_1px_2px_rgba(0,0,0,0.1)] ">
              360°
            </span>
          </span>
        )}
      </button>
    )
  }

  const renderStackedThumbnail = (item: typeof images[0] | { is3D?: boolean }, index: number) => {
    const is3DSlot = isThreeDPlaceholder(item)
    if (is3DSlot) {
      if (!deferThreeD) {
        return null
      }
      const isSelected = galleryIndex === galleryIndexToUse
      return (
        <button
          key={index}
          type="button"
          onClick={() => setGalleryIndex(galleryIndexToUse)}
          className={cn(
            'ov:cursor-pointer ov:relative ov:aspect-3/2 ov:w-full ov:flex ov:justify-center ov:items-center ov:overflow-hidden ov:rounded-(--ov25-configurator-iframe-border-radius) ov:bg-white ov:ring-2',
            isSelected ? 'ov:ring-(--ov25-primary-color)' : 'ov:ring-(--ov25-configurator-view-controls-border-color)'
          )}
        >
          <span className="ov25-360-label ov:py-0.5 ov:rounded-full ov:bg-transparent ov:text-neutral-500 ov:text-xs ov:font-[250]">
            360°
          </span>
        </button>
      )
    }
    const src = resolveImageUrl(item as any, 'stacked')
    const fullscreenSrc = resolveImageUrl(item as any, 'fullscreen') || src
    if (!src) {
      return (
        <div
          key={index}
          className="ov25-gallery-image-empty-slot ov:relative ov:aspect-3/2 ov:w-full ov:overflow-hidden ov:rounded-(--ov25-configurator-iframe-border-radius) ov:bg-muted"
          data-ov25-gallery-image-empty-slot="true"
          data-ov25-gallery-item-index={index}
          aria-hidden="true"
        />
      )
    }
    return (
      <button
        key={index}
        type="button"
        onClick={() => setGalleryCarouselFullscreenImage(fullscreenSrc)}
        className="ov25-gallery-image-button ov:relative ov:aspect-3/2 ov:w-full ov:overflow-hidden ov:rounded-(--ov25-configurator-iframe-border-radius) ov:bg-muted ov:cursor-pointer"
      >
        <img
          src={src}
          alt={`Product image ${index}`}
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          className="ov:object-cover ov:w-full ov:h-full ov:absolute ov:inset-0"
        />
      </button>
    )
  }

  return (
    <div id="ov25-product-carousel" className="ov:w-full ov:relative">
      <div id="ov25-product-carousel-controls" className={`ov:relative ov:w-full `}>
        {!useStackedLayout && (
          <div ref={scrollRef} onMouseDown={handleMouseDown} onClickCapture={handleClickCapture} className="ov25-thumbnail-scroll ov:overflow-x-auto ov:overflow-y-hidden ov:w-full ov:scroll-smooth ov:@container ov:p-1 ov:cursor-grab ov:select-none">
            <div className="ov:flex ov:flex-nowrap ov:gap-2">
              {carouselItems.map((item: any, index: number) => (
                <div key={index} className="ov:flex-1 ov:min-w-[calc((100cqw-2.5rem)/6)] ov:md:min-w-[calc((100cqw-2.5rem)/8)] ov:lg:min-w-[calc((100cqw-2.5rem)/12)]">
                  {renderCarouselThumbnail(item, index)}
                </div>
              ))}
            </div>
          </div>
        )}
        {useStackedLayout && (
          <div className="ov:grid ov:grid-cols-2 ov:gap-(--ov25-gallery-gap) ov:w-full">
            {carouselItems.map((item, index) => renderStackedThumbnail(item, index))}
          </div>
        )}
      </div>
      {galleryCarouselFullscreenImage && (
        <PopoverDiv
          ref={fullscreenOverlayRef}
          popover={useFullscreenPopover ? 'manual' : undefined}
          className="ov:fixed ov:inset-0 ov:z-2147483647 ov:bg-black/90 ov:flex ov:items-center ov:justify-center ov:cursor-pointer"
          style={{
            boxSizing: 'border-box',
            width: '100%',
            height: '100%',
            maxWidth: 'none',
            maxHeight: 'none',
            margin: 0,
            border: 0,
            padding: 0,
            background: 'rgba(0, 0, 0, 0.9)',
          }}
          onClick={() => setGalleryCarouselFullscreenImage(null)}
        >
          <img
            src={galleryCarouselFullscreenImage}
            alt="Fullscreen"
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            className="ov:max-w-full ov:max-h-full ov:object-contain ov:pointer-events-none"
            onClick={(e) => e.stopPropagation()}
          />
        </PopoverDiv>
      )}
    </div>
  )
}
