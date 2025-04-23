import * as React from 'react'
import { Button } from "./ui/button"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "./ui/carousel"
import { useOV25UI } from "../contexts/ov25-ui-context"
import { useMediaQuery } from "../hooks/use-media-query"

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
    <div className="w-full relative">
      <div className="absolute bottom-4 pt-16 left-0 right-0 flex items-center justify-between px-2 z-[2] pointer-events-none h-full">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-none  pointer-events-auto"
          onClick={() => {
            const newIndex = galleryIndex === 0 ? images.length : galleryIndex - 1;
            setGalleryIndex(newIndex);
          }}
        >
          <ChevronLeft size={28} className=" h-12 stroke-1  stroke-muted-foreground self-center" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-none pointer-events-auto"
          onClick={() => {
            const newIndex = galleryIndex === images.length ? 0 : galleryIndex + 1;
            setGalleryIndex(newIndex);
          }}
        >
          <ChevronRight size={28} className=" h-12 stroke-1  stroke-muted-foreground self-center" />
        </Button>
      </div>
      <div className="mt-4 text-center text-sm text-muted-foreground">
        {galleryIndex + 1}/{images.length + 1}
      </div>
      <div className="mt-4 relative px-12 w-full flex items-center justify-center">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full xl:w-[700px]"
        >
          <CarouselContent className="-ml-2">
            <CarouselItem className="pl-2 basis-1/3 xl:basis-[20%]">
              <button
                onClick={() => setGalleryIndex(0)}
                className={`relative aspect-[3/2] w-full flex justify-center items-center overflow-hidden rounded-none bg-muted ${
                  galleryIndex === 0 ? "" : ""
                }`}
              >
                <img
                  src="/360.svg"
                  alt="360 View"
                  className="w-12 text-gray-400"
                  style={{ filter: 'invert(1)' }}
                />
              </button>
            </CarouselItem>
            {images.map((img: any, index: any) => (
              <CarouselItem key={index} className="pl-2 basis-1/3 xl:basis-[20%]">
                <button
                  onClick={() => setGalleryIndex(index + 1)}
                  className={`relative aspect-[3/2] w-full overflow-hidden rounded-none bg-muted ${
                    galleryIndex === index + 1 ? "" : ""
                  }`}
                >
                  <img
                    src={img || "/placeholder.svg"}
                    alt={`Product thumbnail ${index + 1}`}
                    className="object-cover w-full h-full absolute inset-0"
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