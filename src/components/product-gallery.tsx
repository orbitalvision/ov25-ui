import {  useEffect, useRef } from "react"
import * as React from 'react'
import { useOV25UI } from "../contexts/ov25-ui-context.js"
import { useIframePositioning } from "../hooks/useIframePositioning.js"
import { cn } from "../lib/utils.js"
import { createPortal } from "react-dom"
import { IframeContainer } from "./IframeContainer.js"
import { ArPreviewQRCodeDialog } from "./ar-preview-qr-code-dialog.js"



// Simplified props, most data now comes from context
interface ProductGalleryProps {
  isInModal?: boolean;
  isPreloading?: boolean;
}

export function ProductGallery({ isInModal = false, isPreloading = false }: ProductGalleryProps = {}) {
    // Get all required data from context
    const {
        isDrawerOrDialogOpen,
        galleryIndexToUse,
        images: passedImages,
        isProductGalleryStacked,
        arPreviewLink,
        setArPreviewLink,
        isVariantsOpen
    } = useOV25UI();

    // Use the custom hook to handle iframe positioning
    useIframePositioning();

    // Handle z-index for non-stacked gallery when drawer opens
    useEffect(() => {
        if (isProductGalleryStacked) return;
        
        if (isDrawerOrDialogOpen) {
            const container = document.querySelector('.ov25-configurator-gallery') as HTMLElement;
            const originalZIndex = container?.style.zIndex;
            const originalPosition = container?.style.position;
            if (container) {
                container.style.zIndex = '9999999999999';
            }
            
            return () => {
                if (container) {
                    container.style.zIndex = originalZIndex || '';
                    container.style.position = originalPosition || '';
                }
            };
        }
    }, [isProductGalleryStacked, isDrawerOrDialogOpen]);


    const containerRef = useRef<HTMLDivElement>(null);


    


    // Position the true iframe container to match the normal container
    useEffect(() => {
        // Only run positioning logic when gallery is stacked
       if(!isProductGalleryStacked) return;
        
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
    }, [isDrawerOrDialogOpen, isProductGalleryStacked]);


    


    return (<>

        <div className={cn(
            "ov:relative ov:font-[family-name:var(--ov25-font-family)]", 
            isInModal && "ov:h-full",
            isPreloading && "ov:hidden"
        )} id="ov-25-configurator-gallery-container">
            <div id="ov25-configurator-background-color" className={cn(
                isInModal ? "ov:h-full" : "ov:aspect-square ov:md:aspect-[1/1]",
                "ov:z-[2] ov:absolute ov:inset-0 ov:block!",
                "ov:rounded-[var(--ov25-configurator-iframe-border-radius)]",
                "ov:bg-[var(--ov25-configurator-iframe-background-color)]",
            )}></div>
            <div id="ov25-configurator-iframe-container"
                data-fullscreen={isVariantsOpen}
                ref={containerRef}
                className={cn(
                    "ov:relative ov:overflow-hidden ov:z-[3]",
                    isInModal ? "ov:h-full ov:w-full" : "ov:aspect-square ov:md:aspect-[3/2] ov:2xl:aspect-video",
                    "ov:rounded-[var(--ov25-configurator-iframe-border-radius)]",
                    "ov:bg-[var(--ov25-configurator-iframe-background-color)]",
                )}>

                {!isProductGalleryStacked && <IframeContainer />}

            </div>
            <div id='true-carousel' ></div>
        </div>
        {isProductGalleryStacked && createPortal(
           <IframeContainer  />,
            document.body
        )}
        <ArPreviewQRCodeDialog arPreviewLink={arPreviewLink} setArPreviewLink={setArPreviewLink} />

    </>
    )
}

