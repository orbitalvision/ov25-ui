import * as React from 'react'
import { Button } from "./ui/button.js"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "./ui/carousel.js"
import { useOV25UI } from "../contexts/ov25-ui-context.js"
import { useMediaQuery } from "../hooks/use-media-query.js"

export function ProductCarousel() {
  // Get all required data from context
  const {
    currentProduct,
    galleryIndex,
    setGalleryIndex,
    error
  } = useOV25UI();
  
  // Get local data
  const isMobile = useMediaQuery(1280);
  
  // Get the images from the current product
  const images = currentProduct?.metadata?.images?.slice(0, -1) || [];
  
  // If any of these conditions are true, don't render the carousel
  if (images.length === 0 || isMobile || error) {
    return null;
  }
  
  return (
    <div className="orbitalvision:w-full orbitalvision:relative ">
      <div className="orbitalvision:absolute orbitalvision:bottom-4 orbitalvision:pt-16 orbitalvision:left-0 orbitalvision:right-0 orbitalvision:flex orbitalvision:items-center orbitalvision:justify-between orbitalvision:px-2 orbitalvision:z-[2] orbitalvision:pointer-events-none orbitalvision:h-full">
        <Button
          variant="ghost"
          size="icon"
          className="orbitalvision:rounded-none orbitalvision:pointer-events-auto"
          onClick={() => {
            const newIndex = galleryIndex === 0 ? images.length : galleryIndex - 1;
            setGalleryIndex(newIndex);
          }}
        >
          <ChevronLeft size={28} className="orbitalvision:h-12 orbitalvision:stroke-1 orbitalvision:stroke-muted-foreground orbitalvision:self-center" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="orbitalvision:rounded-none orbitalvision:pointer-events-auto"
          onClick={() => {
            const newIndex = galleryIndex === images.length ? 0 : galleryIndex + 1;
            setGalleryIndex(newIndex);
          }}
        >
          <ChevronRight size={28} className="orbitalvision:h-12 orbitalvision:stroke-1 orbitalvision:stroke-muted-foreground orbitalvision:self-center" />
        </Button>
      </div>
      <div className="orbitalvision:mt-4 orbitalvision:text-center orbitalvision:text-sm orbitalvision:text-muted-foreground">
        {galleryIndex + 1}/{images.length + 1}
      </div>
      <div className="orbitalvision:mt-4 orbitalvision:relative orbitalvision:px-12 orbitalvision:w-full orbitalvision:flex orbitalvision:items-center orbitalvision:justify-center">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="orbitalvision:w-full orbitalvision:xl:w-[700px]"
        >
          <CarouselContent className="orbitalvision:-ml-2">
            <CarouselItem className="orbitalvision:pl-2 orbitalvision:basis-1/3 orbitalvision:xl:basis-[20%]">
              <button
                onClick={() => setGalleryIndex(0)}
                className={`orbitalvision:relative orbitalvision:aspect-[3/2] orbitalvision:w-full orbitalvision:flex orbitalvision:justify-center orbitalvision:items-center orbitalvision:overflow-hidden orbitalvision:rounded-none orbitalvision:bg-muted ${
                  galleryIndex === 0 ? "" : ""
                }`}
              >
                <img
                  src="/360.svg"
                  alt="360 View"
                  className="orbitalvision:w-12 orbitalvision:text-gray-400"
                  style={{ filter: 'invert(1)' }}
                />
              </button>
            </CarouselItem>
            {images.map((img: any, index: any) => (
              <CarouselItem key={index} className="orbitalvision:pl-2 orbitalvision:basis-1/3 orbitalvision:xl:basis-[20%]">
                <button
                  onClick={() => setGalleryIndex(index + 1)}
                  className={`orbitalvision:relative orbitalvision:aspect-[3/2] orbitalvision:w-full orbitalvision:overflow-hidden orbitalvision:rounded-none orbitalvision:bg-muted ${
                    galleryIndex === index + 1 ? "" : ""
                  }`}
                >
                  <img
                    src={img || "/placeholder.svg"}
                    alt={`Product thumbnail ${index + 1}`}
                    className="orbitalvision:object-cover orbitalvision:w-full orbitalvision:h-full orbitalvision:absolute orbitalvision:inset-0"
                  />
                </button>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  )
} 