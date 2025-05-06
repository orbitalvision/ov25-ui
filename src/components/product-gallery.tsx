import { useState, useMemo } from "react"
import { useMediaQuery } from "../hooks/use-media-query.js"
import * as React from 'react'
import { getIframeSrc } from '../utils/configurator-utils.js'
import { useOV25UI } from "../contexts/ov25-ui-context.js"
import ConfiguratorViewControls from "./ConfiguratorViewControls.js"
import { useIframePositioning } from "../hooks/useIframePositioning.js"

// Simplified props, most data now comes from context

export function ProductGallery() {
    // Get all required data from context
    const {
      iframeRef,
      currentProduct,
      galleryIndex,
      error,
      canAnimate,
      animationState,
      productLink,
      apiKey,
    } = useOV25UI();

    // Use the custom hook to handle iframe positioning
    useIframePositioning();

    // Any component-specific state remains local
    const [canSeeDimensions, setCanSeeDimensions] = useState(false);
    const isMobile = useMediaQuery(1280);
    
    // Get the images from the current product
    const images = currentProduct?.metadata?.images?.slice(0, -1) || [];
    
    // Calculate showDimensionsToggle from currentProduct
    const showDimensionsToggle = !!((currentProduct as any)?.dimensionX && 
                                 (currentProduct as any)?.dimensionY && 
                                 (currentProduct as any)?.dimensionZ);
    
    // Use the utility function to get the iframe src
    const iframeSrc = useMemo(() => 
      getIframeSrc(apiKey, productLink), 
    [productLink, apiKey]);

    return (
      <div className="relative z-[10]" id="ov-25-configurator-gallery-container">
        <div id="ov25-configurator-iframe-container" className="rounded-[var(--ov25-configurator-iframe-border-radius)] relative aspect-square md:aspect-[3/2] 2xl:aspect-video overflow-hidden  bg-[var(--ov25-configurator-iframe-background-color)] z-[3]">
          <iframe 
            ref={iframeRef}
            id="ov25-configurator-iframe"
            src={iframeSrc}
            className={`w-full bg-transparent h-full ${galleryIndex === 0 ? 'block' : 'hidden'}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking; fullscreen"
          />
          
          {/* Display selected image when galleryIndex > 0 */}
          {galleryIndex > 0 && images[galleryIndex - 1] && (
            <img
              id={`ov-25-configurator-product-image-${galleryIndex}`}
              src={images[galleryIndex - 1]}
              alt={`Product image ${galleryIndex}`}
              className="object-cover h-full w-full absolute inset-0"
            />
          )}
          
          {galleryIndex === 0 && !error && (
            <ConfiguratorViewControls
              canAnimate={canAnimate}
              animationState={animationState}
              showDimensionsToggle={showDimensionsToggle}
              isMobile={isMobile}
              canSeeDimensions={canSeeDimensions}
              setCanSeeDimensions={setCanSeeDimensions}
            />
          )}
        </div>
      </div>
    )
}

