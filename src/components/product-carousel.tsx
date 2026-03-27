import * as React from 'react'
import { useOV25UI } from "../contexts/ov25-ui-context.js"
import { CarouselDisplayMode } from "../types/config-enums.js"
import { cn } from "../lib/utils.js"
import { getProductGalleryImages, getCutoutIndex, resolveImageUrl } from "../lib/utils.js"

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
  if (effectiveCarouselLayout === CarouselDisplayMode.None) return null;
  const useStackedLayout = effectiveCarouselLayout === 'stacked';
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const dragRef = React.useRef({ isDragging: false, startX: 0, startScrollLeft: 0, didDrag: false });

  const handleWheel = React.useCallback((e: React.WheelEvent) => {
    const el = scrollRef.current;
    if (!el || useStackedLayout) return;
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
  }, [useStackedLayout]);

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
    if (useStackedLayout) return;
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current.isDragging || !scrollRef.current) return;
      dragRef.current.didDrag = true;
      scrollRef.current.scrollLeft = dragRef.current.startScrollLeft + dragRef.current.startX - e.clientX;
    };
    const onUp = () => { dragRef.current.isDragging = false; };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [useStackedLayout]);

  React.useEffect(() => {
    if (!galleryCarouselFullscreenImage) return;
    const onKey = (e: KeyboardEvent) =>
      e.key === 'Escape' && setGalleryCarouselFullscreenImage(null);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [galleryCarouselFullscreenImage, setGalleryCarouselFullscreenImage]);

  React.useEffect(() => {
    if (!galleryCarouselFullscreenImage) return;

    const body = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      width: document.body.style.width,
      top: document.body.style.top,
    };
    const htmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${window.scrollY}px`;
    document.documentElement.style.overflow = 'hidden';

    return () => {
      const scrollY = document.body.style.top;
      document.body.style.overflow = body.overflow;
      document.body.style.position = body.position;
      document.body.style.width = body.width;
      document.body.style.top = body.top;
      document.documentElement.style.overflow = htmlOverflow;
      window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
    };
  }, [galleryCarouselFullscreenImage]);

  const hasCutout = !!(currentProduct?.metadata as any)?.cutoutImage
  const cutoutFirst = hasCutout && (isMobile || !deferThreeD)
  const productImages = getProductGalleryImages(currentProduct?.metadata, { cutoutFirst })
  const maxImages = isMobile ? carouselMaxImagesMobile : carouselMaxImagesDesktop
  const allImages = [...(passedImages || []), ...productImages]
  const images = maxImages != null && maxImages > 0 ? allImages.slice(0, maxImages) : allImages
  const cutoutIndex = getCutoutIndex(currentProduct?.metadata, { cutoutFirst })

  const carouselItems = React.useMemo(() => {
    if (useStackedLayout) return images
    if (cutoutIndex >= 0) return images
    const items: (typeof images[0] | { is3D: boolean })[] = [...images]
    items.splice(galleryIndexToUse, 0, { is3D: true })
    return items
  }, [images, galleryIndexToUse, useStackedLayout, cutoutIndex])

  if (images.length === 0 || error) return null;

  const renderCarouselThumbnail = (item: { is3D?: boolean } | typeof images[0], index: number) => {

    const is3DSlot = item && typeof item === 'object' && 'is3D' in item && item.is3D
    const isCutout = cutoutIndex >= 0 && index === cutoutIndex
    if (is3DSlot) {
      const isSelected = galleryIndex === galleryIndexToUse
      return (
        <button
          key={index}
          onClick={() => setGalleryIndex(galleryIndexToUse)}
          className={cn(
            "ov:cursor-pointer ov:relative ov:pl-1 ov:aspect-square ov:w-full ov:flex ov:justify-center ov:items-center ov:overflow-hidden ov:rounded-[var(--ov25-configurator-iframe-border-radius)] ov:bg-white ov:ring-2",
            isSelected ? "ov:ring-[var(--ov25-primary-color)]" : "ov:ring-[var(--ov25-configurator-view-controls-border-color)]"
          )}
        >
          <span className="ov25-360-label ov:py-0.5 ov:rounded-full ov:bg-transparent ov:text-neutral-500  ov:text-xs ov:font-[250]  ">
            360°
          </span>
        </button>
      )
    }
    const galleryIndexForSlot = isCutout ? galleryIndexToUse : (cutoutIndex === 0 ? index + 1 : index)
    const isSelected = galleryIndex === galleryIndexForSlot
    return (
      <button
        key={index}
        onClick={() => setGalleryIndex(isCutout ? galleryIndexToUse : (cutoutIndex === 0 ? index + 1 : index))}
        className={cn(
          "ov25-gallery-image-button ov:relative ov:aspect-square ov:w-full ov:overflow-hidden ov:rounded-[var(--ov25-configurator-iframe-border-radius)] ov:bg-muted ov:cursor-pointer",
          isSelected && "ov:ring-2 ov:ring-[var(--ov25-primary-color)]"
        )}
      >
          <div className="ov:w-full ov:h-full ov:absolute ov:inset-0 ov:bg-black"></div>
        <img
          src={resolveImageUrl(item as any, 'carousel') || "/placeholder.svg"}
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

  const renderStackedThumbnail = (item: typeof images[0], index: number) => {
    const src = resolveImageUrl(item as any, 'stacked') || "/placeholder.svg"
    const fullscreenSrc = resolveImageUrl(item as any, 'fullscreen') || src
    return (
      <button
        key={index}
        onClick={() => setGalleryCarouselFullscreenImage(fullscreenSrc)}
        className="ov25-gallery-image-button ov:relative ov:aspect-[3/2] ov:w-full ov:overflow-hidden ov:rounded-[var(--ov25-configurator-iframe-border-radius)] ov:bg-muted ov:cursor-pointer"
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
          <div ref={scrollRef} onWheel={handleWheel} onMouseDown={handleMouseDown} onClickCapture={handleClickCapture} className="ov25-thumbnail-scroll ov:overflow-x-auto ov:overflow-y-hidden ov:w-full ov:scroll-smooth ov:[container-type:inline-size] ov:p-1 ov:cursor-grab ov:select-none">
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
          <div className="ov:grid ov:grid-cols-2 ov:gap-[var(--ov25-gallery-gap)] ov:w-full">
            {images.map((item, index) => renderStackedThumbnail(item, index))}
          </div>
        )}
      </div>
      {galleryCarouselFullscreenImage && (
        <div
          className="ov:fixed ov:inset-0 ov:z-[2147483647] ov:bg-black/90 ov:flex ov:items-center ov:justify-center ov:cursor-pointer"
          onClick={() => setGalleryCarouselFullscreenImage(null)}
        >
          <img
            src={galleryCarouselFullscreenImage}
            alt="Fullscreen"
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            className="ov:max-w-full ov:max-h-full ov:object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
} 