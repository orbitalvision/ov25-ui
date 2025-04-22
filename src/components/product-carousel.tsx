import { Button } from "./ui/button"
import {ChevronRight} from 'lucide-react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "./ui/carousel"
import * as React from 'react'

interface ProductCarouselProps {
  imgs: string[]
  currentIndex: number
  onIndexChange: (index: number) => void
}

export function ProductCarousel({ imgs = [], currentIndex, onIndexChange }: ProductCarouselProps) {
  // Ensure imgs is always an array
  const images = Array.isArray(imgs) ? imgs : [];
  
  return (
    <div className="w-full relative">
      <div className="absolute bottom-4 pt-16 left-0 right-0 flex items-center justify-between px-2 z-[2] pointer-events-none h-full">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-none pointer-events-auto"
          onClick={() => {
            const newIndex = currentIndex === 0 ? images.length : currentIndex - 1;
            onIndexChange(newIndex);
          }}
        >
          <ChevronRight className="h-12 xl:h-16 rotate-180" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-none pointer-events-auto"
          onClick={() => {
            const newIndex = currentIndex === images.length ? 0 : currentIndex + 1;
            onIndexChange(newIndex);
          }}
        >
          <ChevronRight className="h-12 xl:h-16" />
        </Button>
      </div>
      <div className="mt-4 text-center text-sm text-muted-foreground">
        {currentIndex + 1}/{images.length + 1}
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
                onClick={() => onIndexChange(0)}
                className={`relative aspect-[3/2] w-full flex justify-center items-center overflow-hidden rounded-none bg-muted ${
                  currentIndex === 0 ? "" : ""
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
            {images.map((img, index) => (
              <CarouselItem key={index} className="pl-2 basis-1/3 xl:basis-[20%]">
                <button
                  onClick={() => onIndexChange(index + 1)}
                  className={`relative aspect-[3/2] w-full overflow-hidden rounded-none bg-muted ${
                    currentIndex === index + 1 ? "" : ""
                  }`}
                >
                  <img
                    src={img || "/placeholder.svg"}
                    alt={`Product thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
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