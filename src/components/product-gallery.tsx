import { useState, useMemo, useEffect, useRef } from "react"
import { useMediaQuery } from "../hooks/use-media-query.js"
import * as React from 'react'
import { getIframeSrc } from '../utils/configurator-utils.js'
import { useOV25UI } from "../contexts/ov25-ui-context.js"
import ConfiguratorViewControls from "./ConfiguratorViewControls.js"
import { useIframePositioning } from "../hooks/useIframePositioning.js"
import { cn } from "../lib/utils.js"
import { createPortal } from "react-dom"

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
        isDrawerOrDialogOpen,
        images: passedImages,
    } = useOV25UI();

    // Use the custom hook to handle iframe positioning
    useIframePositioning();

    // Any component-specific state remains local
    const [canSeeDimensions, setCanSeeDimensions] = useState(false);
    const isMobile = useMediaQuery(1280);
    const containerRef = useRef<HTMLDivElement>(null);

    // Get the images from the current product
    const productImages = currentProduct?.metadata?.images?.slice(0, -1) || [];

    const images = [...(passedImages || []), ...productImages]

    // Calculate showDimensionsToggle from currentProduct
    const showDimensionsToggle = !!((currentProduct as any)?.dimensionX &&
        (currentProduct as any)?.dimensionY &&
        (currentProduct as any)?.dimensionZ);

    // Use the utility function to get the iframe src
    const iframeSrc = useMemo(() =>
        getIframeSrc(apiKey, productLink),
        [productLink, apiKey]);

    // Position the true iframe container to match the normal container
    useEffect(() => {
        let frameId: number;
        
        const positionIframeContainer = () => {
            const originalContainer = document.getElementById('ov25-configurator-iframe-container');
            const trueContainer = document.getElementById('true-ov25-configurator-iframe-container');
            
            if (originalContainer && trueContainer && !isDrawerOrDialogOpen) {
                const rect = originalContainer.getBoundingClientRect();
                
                trueContainer.style.position = 'fixed';
                trueContainer.style.top = `${rect.top}px`;
                trueContainer.style.left = `${rect.left}px`;
                trueContainer.style.width = `${rect.width}px`;
                trueContainer.style.height = `${rect.height}px`;
                trueContainer.style.zIndex = '3';
            }
            
            frameId = requestAnimationFrame(positionIframeContainer);
        };
        
        // When drawer closes, wait for transition to complete before positioning
        if (!isDrawerOrDialogOpen) {
            // Wait for transition (500ms) to complete before starting animation frame loop
            const timeoutId = setTimeout(() => {
                // Start the animation frame loop
                frameId = requestAnimationFrame(positionIframeContainer);
            }, 500);
            
            return () => {
                clearTimeout(timeoutId);
                cancelAnimationFrame(frameId);
            };
        }
        
        return () => {
            cancelAnimationFrame(frameId);
        };
    }, [isDrawerOrDialogOpen]);


    return (<>

        <div className={cn("ov:relative ov:font-[family-name:var(--ov25-font-family)]",)} id="ov-25-configurator-gallery-container">
            <div id="ov25-configurator-background-color" className={cn(
                "ov:aspect-square ov:md:aspect-[1/1] ov:z-[2] ov:absolute ov:inset-0 ov:block!",
                "ov:rounded-[var(--ov25-configurator-iframe-border-radius)]",
                "ov:bg-[var(--ov25-configurator-iframe-background-color)]"
            )}></div>
            <div id="ov25-configurator-iframe-container"
                ref={containerRef}
                className={cn(" ov:relative ov:aspect-square ov:md:aspect-[3/2] ov:2xl:aspect-video ov:overflow-hidden ov:z-[3]",
                    "ov:rounded-[var(--ov25-configurator-iframe-border-radius)]",
                    "ov:bg-[var(--ov25-configurator-iframe-background-color)]"
                )}>




            </div>
            <div id='true-carousel' ></div>
        </div>
        {createPortal(
            <div id="true-ov25-configurator-iframe-container"
                className={cn(" ov:relative ov:aspect-square ov:md:aspect-[3/2] ov:2xl:aspect-video ov:overflow-hidden ov:z-[3]",
                    "ov:rounded-[var(--ov25-configurator-iframe-border-radius)]",
                    "ov:bg-[var(--ov25-configurator-iframe-background-color)]"
                )}>
                <iframe
                    ref={iframeRef}
                    id="ov25-configurator-iframe"
                    src={iframeSrc}
                    className={`ov:w-full ov:bg-transparent ov:h-full ${galleryIndex === 0 ? 'ov:block' : 'ov:ov25-controls-hidden'}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking; fullscreen"
                />
                {/* Display selected image when galleryIndex > 0 */}
                {galleryIndex > 0 && images[galleryIndex - 1] && (
                    <img
                        id={`ov-25-configurator-product-image-${galleryIndex} `}
                        src={images[galleryIndex - 1]}
                        alt={`Product image ${galleryIndex}`}
                        className="ov:object-cover ov:min-h-full ov:min-w-full ov:z-[5] ov:absolute ov:inset-0 ov:bg-[var(--ov25-configurator-iframe-background-color)]"
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
            ,
            document.body
        )}

    </>
    )
}

