import { RefObject, useState, useMemo } from "react"
import { Ruler as DimensionsIcon } from 'lucide-react'
import { ExpandIcon, Rotate3D } from "lucide-react"
import { Box as ArIcon } from 'lucide-react'
import { useIsMobile} from '../hooks//use-is-mobile'
import { ProductCarousel } from "./product-carousel"
import { useMediaQuery } from "../hooks/use-media-query"
import * as React from 'react'

interface ProductGalleryProps {
  iframeRef: RefObject<HTMLIFrameElement | null>    
  images: string[]
  currentIndex: number
  onIndexChange: (index: number) => void
  productId: number | null
  rangeId: number | null
  error: Error | null
  canAnimate: boolean
  showDimensionsToggle?: boolean
  animationState: 'unavailable' | 'open' | 'close' | 'loop' | 'stop'
}

export function ProductGallery({ iframeRef, images, currentIndex, onIndexChange, productId, rangeId, error, canAnimate, showDimensionsToggle = true, animationState }: ProductGalleryProps) {
    const [canSeeDimensions, setCanSeeDimensions] = useState(false);

    const isMobile = useMediaQuery(1280)
    const sendMessageToIframe = (type: string, payload: any) => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type,
          payload: JSON.stringify(payload)
        }, '*')
      }
    }

    const toggleDimensions = () => {
      sendMessageToIframe('VIEW_DIMENSIONS', {dimensions: !canSeeDimensions});
      setCanSeeDimensions(prev => !prev);
    }

    const toggleAnimation = () => {
        sendMessageToIframe('TOGGLE_ANIMATION', {});
    }

    const toggleVR = () => {
      sendMessageToIframe('ENTER_VR', {});
    }

    const toggleAR = () => {
      sendMessageToIframe('ENTER_AR', {});
    }

    const toggleFullscreen = () => {
      const container = iframeRef.current?.parentElement;
      if (container) {
        if (!document.fullscreenElement) {
          container.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
          });
        } else {
          document.exitFullscreen();
        }
      }
    }

    const getAnimationButtonText = () => {
      if (!canAnimate) return '';
      if (animationState === 'open' || animationState === 'loop') return 'Close';
      return 'Open';
    }

    // Memoize the iframe src to prevent unnecessary reloads
    const iframeSrc = useMemo(() => {
      const baseUrl = 'https://configurator.orbital.vision';
      
      const idPart = rangeId !== null 
        ? `range/${rangeId}` 
        : productId !== null 
          ? `${productId}` 
          : '/range/20';
      
      return `${baseUrl}/15-5f9c5d4197f8b45ee615ac2476e8354a160f384f01c72cd7f2638f41e164c21d/${idPart}`;
    }, [productId, rangeId]);

    return (
      <div className="relative z-[3]     ">
        <div className="relative aspect-square md:aspect-[3/2] 2xl:aspect-video  overflow-hidden rounded-none bg-[#E5E5E5] z-[3]">
          <iframe 
            ref={iframeRef}
            src={iframeSrc}
            className={`w-full bg-transparent h-full ${currentIndex === 0 ? 'block' : 'hidden'}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking; fullscreen"
            style={{ backgroundColor: '#E5E5E5' }}
          />
          
          {currentIndex > 0 && !error && (
            <img
              src={images[currentIndex - 1]}
              alt="Product image"
              fill
              className="object-cover"
              priority
            />
          )}
          {currentIndex === 0 && !error && (<>
            <div className="absolute w-full pointer-events-none h-full inset-0 gap-2 p-4 flex justify-end items-end z-[9990]">
              {canAnimate && (
                <button className="rounded-full pointer-events-auto flex gap-2 p-2 bg-white md:px-4 border border-[#e5e5e5] items-center justify-center" onClick={toggleAnimation}>
                    <Rotate3D strokeWidth={1} className="w-5 h-5  text-[#282828]" />
                    {!isMobile && (
                    <p className="text-sm text-[#282828] font-light">{getAnimationButtonText()}</p>
                    )}
                </button>
              )}
              {showDimensionsToggle && (
                <button className="rounded-full pointer-events-auto flex gap-2 p-2 bg-white md:px-4 border border-[#e5e5e5] items-center justify-center" onClick={toggleDimensions}>
                  <DimensionsIcon className="w-5 h-5 text-[#282828]" />
                  {!isMobile && (
                    <p className="text-sm text-[#282828] font-light">Dimensions</p>
                  )}
                </button>
              )}
              <button className="rounded-full pointer-events-auto flex gap-2 bg-white p-2 md:px-4 border border-[#e5e5e5] items-center justify-center" onClick={toggleAR}>
                <ArIcon className="w-5 h-5 text-[#282828]" />
                {!isMobile && (
                  <p className="text-sm text-[#282828] font-light">View in your room</p>
                )}
              </button>
            </div>
            <div className="absolute hidden md:flex w-full pointer-events-none h-full inset-0 p-4 justify-end items-start z-[9990]">
                <button className="rounded-full aspect-square p-2 pointer-events-auto flex gap-2 bg-white border border-[#e5e5e5] items-center justify-center" onClick={toggleFullscreen}>
                  <ExpandIcon strokeWidth={1} className="w-4 h-4 text-[#282828]" />
                </button>
              </div>
           
     
          </>)}
        </div>
        {images && images.length > 0 && !isMobile && !error && (
          <ProductCarousel
            images={images}
            currentIndex={currentIndex}
            onIndexChange={onIndexChange}
          />
        )}
      </div>
    )
}

