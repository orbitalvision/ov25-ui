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
        carouselSibling,
        showCarousel,
        arPreviewLink,
        setArPreviewLink,
        isVariantsOpen,
        uniqueId,
        configuratorDisplayMode,
        configuratorDisplayModeMobile,
        isMobile,
    } = useOV25UI();

    const isModalMode = isMobile ? configuratorDisplayModeMobile === 'modal' : configuratorDisplayMode === 'modal';
    const modalStackBoost = isDrawerOrDialogOpen && isModalMode;

    // Use the custom hook to handle iframe positioning
    useIframePositioning();

    // Lift gallery host above modal backdrop (ConfiguratorModal uses z-2147483646). Stacked layout skips
    // .ov25-configurator-gallery on the outer host — true-iframe is portaled to body; modal path there sets z in useIframePositioning.
    useEffect(() => {
        if (isProductGalleryStacked) return;

        if (isDrawerOrDialogOpen) {
            const container = document.querySelector('.ov25-configurator-gallery') as HTMLElement;
            if (!container) return;
            const originalZIndex = container.style.zIndex;
            const originalPointerEvents = container.style.pointerEvents;

            if (isModalMode) {
                container.style.zIndex = '2147483647';
                container.style.pointerEvents = 'auto';
            } else {
                container.style.zIndex = '2147483644';
            }

            return () => {
                container.style.zIndex = originalZIndex || '';
                container.style.pointerEvents = originalPointerEvents || '';
            };
        }
    }, [isProductGalleryStacked, isDrawerOrDialogOpen, isModalMode]);


    const containerRef = useRef<HTMLDivElement>(null);


    


    // Position the true iframe container to match the normal container
    useEffect(() => {
        // Only run positioning logic when gallery is stacked
       if(!isProductGalleryStacked) return;
        
        let frameId: number;
        
        const positionIframeContainer = () => {
            const originalContainer = document.getElementById(uniqueId ? `ov25-configurator-iframe-container-${uniqueId}` : 'ov25-configurator-iframe-container');
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
            "ov:relative ov:flex ov:flex-col ov:gap-[var(--ov25-gallery-gap)] ov:font-[family-name:var(--ov25-font-family)] ov:h-auto ov:max-h-full",
            modalStackBoost ? "ov:z-[2147483647]" : "ov:z-[2] ov:isolate",
            isPreloading && "ov:hidden"
        )} id="ov-25-configurator-gallery-container">
            <div id="ov25-configurator-background-color" className={cn(
                "ov:h-full ov:max-h-[90vh] ov:w-full ov:z-[2] ov:absolute ov:inset-0",
                modalStackBoost ? "ov:hidden!" : "ov:block!",
                "ov:rounded-[var(--ov25-configurator-iframe-border-radius)]",
                "ov:bg-[var(--ov25-configurator-iframe-background-color)]",
            )}></div>
            <div id={uniqueId ? `ov25-configurator-iframe-container-${uniqueId}` : "ov25-configurator-iframe-container"}
                data-fullscreen={isVariantsOpen}
                data-stacked={isProductGalleryStacked}
                data-clarity-mask="true"
                ref={containerRef}
                className={cn(
                    "ov:h-full ov:w-full ov:relative ov:overflow-hidden ov:z-[3]",
                    "ov:rounded-[var(--ov25-configurator-iframe-border-radius)]",
                    "ov:bg-[var(--ov25-configurator-iframe-background-color)]",
                )}>

                {!isProductGalleryStacked && <IframeContainer />}

            </div>
            {showCarousel && !carouselSibling && !modalStackBoost && (
              <div id="true-carousel" className="ov:shrink-0">
                <span />
              </div>
            )}
        </div>
        {isProductGalleryStacked && createPortal(
           <IframeContainer  />,
            document.body
        )}
        <ArPreviewQRCodeDialog arPreviewLink={arPreviewLink} setArPreviewLink={setArPreviewLink} />

    </>
    )
}

/**
 * Renders ProductGallery in a stable off-screen wrapper so the iframe loads once and stays alive.
 * useIframePositioning handles repositioning the iframe into the visible area (sheet, modal, etc.)
 * when the configurator opens.
 */
export function DeferredGalleryContainer() {
    const { isDrawerOrDialogOpen, configuratorDisplayMode, configuratorDisplayModeMobile, isMobile } = useOV25UI();
    const isModalMode = isMobile ? configuratorDisplayModeMobile === 'modal' : configuratorDisplayMode === 'modal';
    // Preload stays behind the page (z-index -1). When sheet/drawer opens, lift above the page.
    // Modal backdrop is z-2147483646 — deferred host must be higher so the iframe sits above the dimmer.
    const openZ = isDrawerOrDialogOpen ? (isModalMode ? 2147483647 : 2147483644) : -1;
    return (
        <div
            className="ov25-configurator-gallery ov:font-[family-name:var(--ov25-font-family)]"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: openZ,
                visibility: 'hidden',
            }}
        >
            <ProductGallery />
        </div>
    );
}
