import { useState, useMemo, useEffect, useRef } from "react"
import { useMediaQuery } from "../hooks/use-media-query.js"
import * as React from 'react'
import { getIframeSrc } from '../utils/configurator-utils.js'
import { useOV25UI } from "../contexts/ov25-ui-context.js"
import ConfiguratorViewControls from "./ConfiguratorViewControls.js"
import { useIframePositioning } from "../hooks/useIframePositioning.js"
import { cn } from "../lib/utils.js"
import { createPortal } from "react-dom"
import { IframeContainer } from "./IframeContainer.js"



// Simplified props, most data now comes from context

export function ProductGallery({isStacked}: {isStacked: boolean}) {
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
        galleryIndexToUse,
        images: passedImages,
    } = useOV25UI();


    // Use the custom hook to handle iframe positioning
    useIframePositioning();


    const containerRef = useRef<HTMLDivElement>(null);





    // Position the true iframe container to match the normal container
    useEffect(() => {
        // Only run positioning logic when gallery is stacked
        if (!isStacked) return;
        
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
    }, [isDrawerOrDialogOpen, isStacked]);


    


    return (<>

        <div className={cn("ov:relative ov:font-[family-name:var(--ov25-font-family)]",)} id="ov-25-configurator-gallery-container">
            <div id="ov25-configurator-background-color" className={cn(
                "ov:aspect-square ov:md:aspect-[1/1] ov:z-[2] ov:absolute ov:inset-0 ov:block!",
                "ov:rounded-[var(--ov25-configurator-iframe-border-radius)]",
                "ov:bg-[var(--ov25-configurator-iframe-background-color)]",
            )}></div>
            <div id="ov25-configurator-iframe-container"
                ref={containerRef}
                className={cn(" ov:relative ov:aspect-square ov:md:aspect-[3/2] ov:2xl:aspect-video ov:overflow-hidden ov:z-[3]",
                    "ov:rounded-[var(--ov25-configurator-iframe-border-radius)]",
                    "ov:bg-[var(--ov25-configurator-iframe-background-color)]",
                )}>

                {!isStacked && <IframeContainer isStacked={isStacked} />}

            </div>
            <div id='true-carousel' ></div>
        </div>
        {isStacked && createPortal(
           <IframeContainer isStacked={isStacked} />,
            document.body
        )}

    </>
    )
}

