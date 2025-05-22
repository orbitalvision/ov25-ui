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
    } = useOV25UI();

    // Use the custom hook to handle iframe positioning
    useIframePositioning();

    // Any component-specific state remains local
    const [canSeeDimensions, setCanSeeDimensions] = useState(false);
    const isMobile = useMediaQuery(1280);
    const containerRef = useRef<HTMLDivElement>(null);

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

        <div className={cn("orbitalvision:relative orbitalvision:font-[family-name:var(--ov25-font-family)]",)} id="ov-25-configurator-gallery-container">
            <div id="ov25-configurator-background-color" className={cn(
                "orbitalvision:aspect-square orbitalvision:md:aspect-[1/1] orbitalvision:z-[2] orbitalvision:absolute orbitalvision:inset-0 orbitalvision:block!",
                "orbitalvision:rounded-[var(--ov25-configurator-iframe-border-radius)]",
                "orbitalvision:bg-[var(--ov25-configurator-iframe-background-color)]"
            )}></div>
            <div id="ov25-configurator-iframe-container"
                ref={containerRef}
                className={cn(" orbitalvision:relative orbitalvision:aspect-square orbitalvision:md:aspect-[3/2] orbitalvision:2xl:aspect-video orbitalvision:overflow-hidden orbitalvision:z-[3]",
                    "orbitalvision:rounded-[var(--ov25-configurator-iframe-border-radius)]",
                    "orbitalvision:bg-[var(--ov25-configurator-iframe-background-color)]"
                )}>




            </div>
        </div>
        {createPortal(
            <div id="true-ov25-configurator-iframe-container"
                className={cn(" orbitalvision:relative orbitalvision:aspect-square orbitalvision:md:aspect-[3/2] orbitalvision:2xl:aspect-video orbitalvision:overflow-hidden orbitalvision:z-[3]",
                    "orbitalvision:rounded-[var(--ov25-configurator-iframe-border-radius)]",
                    "orbitalvision:bg-[var(--ov25-configurator-iframe-background-color)]"
                )}>
                <iframe
                    ref={iframeRef}
                    id="ov25-configurator-iframe"
                    src={iframeSrc}
                    className={`orbitalvision:w-full orbitalvision:bg-transparent orbitalvision:h-full ${galleryIndex === 0 ? 'orbitalvision:block' : 'orbitalvision:ov25-controls-hidden'}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking; fullscreen"
                />
                {/* Display selected image when galleryIndex > 0 */}
                {galleryIndex > 0 && images[galleryIndex - 1] && (
                    <img
                        id={`ov-25-configurator-product-image-${galleryIndex}`}
                        src={images[galleryIndex - 1]}
                        alt={`Product image ${galleryIndex}`}
                        className="orbitalvision:object-cover orbitalvision:h-full orbitalvision:w-full orbitalvision:absolute orbitalvision:inset-0"
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

