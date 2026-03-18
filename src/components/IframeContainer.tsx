import { useState, useMemo, useRef, useEffect } from "react"
import * as React from 'react'
import { createPortal } from 'react-dom'
import { getIframeSrc } from '../utils/configurator-utils.js'
import { useOV25UI } from "../contexts/ov25-ui-context.js"
import { cn, getProductGalleryImages, resolveImageUrl } from "../lib/utils.js"
import { getSharedStylesheet, createCSSVariablesStylesheet } from '../utils/shadow-styles.js'
import ConfiguratorViewControls from './ConfiguratorViewControls.js'


export const IframeContainer = () => {
    // Get all required data from context
    const {
        iframeRef,
        currentProduct,
        galleryIndex,
        productLink,
        apiKey,
        configurationUuid,
        galleryIndexToUse,
        images: passedImages,
        isProductGalleryStacked: isStacked,
        isVariantsOpen,
        uniqueId,
        isMobile,
        deferThreeD,
        cssString,
    } = useOV25UI();

    const controlsContainerRef = useRef<HTMLDivElement>(null);
    const [controlsShadowRoot, setControlsShadowRoot] = useState<ShadowRoot | null>(null);

    useEffect(() => {
        const el = controlsContainerRef.current;
        if (!el || el.shadowRoot) return;
        const shadowRoot = el.attachShadow({ mode: 'open' });
        const stylesheets: CSSStyleSheet[] = [getSharedStylesheet()];
        if (cssString) {
            stylesheets.push(createCSSVariablesStylesheet(cssString));
        }
        shadowRoot.adoptedStyleSheets = stylesheets;
        setControlsShadowRoot(shadowRoot);
    }, [cssString]);

    const hasCutout = !!(currentProduct?.metadata as any)?.cutoutImage
    const cutoutFirst = hasCutout && (isMobile || !deferThreeD)
    const productImages = getProductGalleryImages(currentProduct?.metadata, { cutoutFirst })
    const images = [...(passedImages || []), ...productImages]

    // Any component-specific state remains local
    const [canSeeDimensions, setCanSeeDimensions] = useState(false);


    // Calculate showDimensionsToggle from currentProduct
    const showDimensionsToggle = !!((currentProduct as any)?.dimensionX &&
        (currentProduct as any)?.dimensionY &&
        (currentProduct as any)?.dimensionZ);

    // Get background color from CSS variable and ensure it's hex
    const hexBgColor = useMemo(() => {
        const root = document.documentElement;
        const cssValue = getComputedStyle(root).getPropertyValue('--ov25-configurator-iframe-background-color').trim();

        if (!cssValue) return null;

        // If already hex format, return it
        if (cssValue.startsWith('#')) {
            return cssValue;
        }

        // Convert to hex using computed style
        const tempDiv = document.createElement('div');
        tempDiv.style.backgroundColor = cssValue;
        document.body.appendChild(tempDiv);
        const rgb = getComputedStyle(tempDiv).backgroundColor;
        document.body.removeChild(tempDiv);

        const match = rgb.match(/\d+/g);
        if (match && match.length >= 3) {
            return `#${[match[0], match[1], match[2]].map(x => {
                const h = parseInt(x).toString(16);
                return h.length === 1 ? '0' + h : h;
            }).join('')}`;
        }

        return null;
    }, []);

    // Use the utility function to get the iframe src
    const iframeSrc = useMemo(() =>
        getIframeSrc(apiKey, productLink, configurationUuid, hexBgColor),
        [productLink, apiKey, configurationUuid, hexBgColor]);

    const isStackedStyles = cn(
        "ov:relative ov:aspect-square ov:md:aspect-[3/2] ov:2xl:aspect-video ov:overflow-hidden ov:z-[3]",
        "ov:rounded-[var(--ov25-configurator-iframe-border-radius)]",
        "ov:bg-[var(--ov25-configurator-iframe-background-color)]"
    )
    const isInlineStyles = cn(
        "ov:absolute ov:size-full ov:inset-0 ov:overflow-hidden ov:z-[3]",
        "ov:rounded-[var(--ov25-configurator-iframe-border-radius)]",
        "ov:bg-[var(--ov25-configurator-iframe-background-color)]"
    )

    return (
        <div id="true-ov25-configurator-iframe-container"
            data-clarity-mask="true"
            className={cn(isStacked ? isStackedStyles : isInlineStyles)}>
            <iframe id="ov25-dummy-iframe" allow="camera; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking; fullscreen" style={{ display: 'none !important', height: '0 !important', width: '0 !important' }}></iframe> {/* Used as bait to stop Trustpilot from hijacking our iframe. it looks for first iframe in the DOM */}
            <iframe
                data-fullscreen={isVariantsOpen}
                data-clarity-mask="true"
                ref={iframeRef}
                id={uniqueId ? `ov25-configurator-iframe-${uniqueId}` : "ov25-configurator-iframe"}
                src={iframeSrc}
                className={`ov:w-full ov:bg-transparent ov:h-full ov:rounded-[var(--ov25-configurator-iframe-border-radius)] ${galleryIndex === galleryIndexToUse ? 'ov:block' : 'ov:ov25-controls-hidden'}`}
                allow="camera; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking; fullscreen"

            />
            {/* Display selected image when galleryIndex is not the 3D spin */}
            {(() => {
                const imageIndex = galleryIndex < galleryIndexToUse ? galleryIndex : galleryIndex - 1;
                const img = images[imageIndex];
                const src = img ? resolveImageUrl(img as any, 'main') : null;
                return galleryIndex !== galleryIndexToUse && src ? (
                    <img
                        id={`ov-25-configurator-product-image-${galleryIndex}`}
                        src={src}
                        alt={`Product image ${galleryIndex}`}
                        className="ov:object-cover ov:min-h-full ov:min-w-full ov:z-[5] ov:absolute ov:inset-0 ov:bg-[var(--ov25-configurator-iframe-background-color)]"
                    />
                ) : null;
            })()}

            {/* Container for ConfiguratorViewControls - we attach shadow here and portal controls into it */}
            <div
                ref={controlsContainerRef}
                id={uniqueId ? `true-configurator-view-controls-container-${uniqueId}` : "true-configurator-view-controls-container"}
                className="ov:absolute ov:inset-0 ov:w-full ov:h-full ov:pointer-events-none"
            />
            {controlsShadowRoot && createPortal(<ConfiguratorViewControls />, controlsShadowRoot)}

            {/* Container for Toaster portal - must be inside fullscreen element */}
            <div id={uniqueId ? `true-toaster-container-${uniqueId}` : "true-toaster-container"} className="ov:absolute ov:inset-0 ov:w-full ov:h-full ov:pointer-events-none ov:z-999"></div>

        </div>
    )
}
