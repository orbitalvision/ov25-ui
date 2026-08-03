import { useState, useMemo, useRef, useLayoutEffect } from "react"
import * as React from 'react'
import { getIframeSrc } from '../utils/configurator-utils.js'
import { useOV25UI } from "../contexts/ov25-ui-context.js"
import { cn, getProductGalleryImages, resolveImageUrl } from "../lib/utils.js"
import ConfiguratorViewControls from './ConfiguratorViewControls.js'
import Snap2ViewControls from './Snap2ViewControls.js'
import { Ov25ShadowHost } from './Ov25ShadowHost.js'
import { VariantsCloseButton } from './VariantSelectMenu/VariantsCloseButton.js'
import { CONFIGURATOR_IFRAME_BACKGROUND_CSS_VAR } from '../lib/config/iframe-transition-snapshot.js'
import { getResolvedConfiguratorIframeBackgroundColor } from '../utils/configurator-dom-queries.js'

function cssColorToHex(value: string | null | undefined): string | null {
    const raw = value?.trim();
    if (!raw) return null;
    if (raw === 'transparent') return null;

    if (/^#[0-9a-f]{3,8}$/i.test(raw)) {
        if (raw.length === 4) {
            return `#${raw[1]}${raw[1]}${raw[2]}${raw[2]}${raw[3]}${raw[3]}`.toLowerCase();
        }
        return raw.slice(0, 7).toLowerCase();
    }

    if (typeof document === 'undefined' || !document.body) return null;

    const tempDiv = document.createElement('div');
    tempDiv.style.backgroundColor = raw;
    document.body.appendChild(tempDiv);
    const rgb = getComputedStyle(tempDiv).backgroundColor;
    document.body.removeChild(tempDiv);
    if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return null;

    const match = rgb.match(/\d+/g);
    if (match && match.length >= 3) {
        return `#${[match[0], match[1], match[2]].map(x => {
            const h = parseInt(x, 10).toString(16);
            return h.length === 1 ? '0' + h : h;
        }).join('')}`;
    }

    return null;
}

function getIframeBackgroundColorFromCssString(cssString: string | undefined): string | null {
    if (!cssString) return null;
    const escapedVar = CONFIGURATOR_IFRAME_BACKGROUND_CSS_VAR.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = new RegExp(`${escapedVar}\\s*:\\s*([^;}\\n]+)`, 'i').exec(cssString);
    return cssColorToHex(match?.[1]);
}

function getIframeBackgroundColorFromDom(): string | null {
    const resolved = getResolvedConfiguratorIframeBackgroundColor();
    return cssColorToHex(resolved);
}

type ConfiguratorTitleProduct = {
    name?: string | null;
};

type ConfiguratorTitleRange = {
    name?: string | null;
    rangeData?: {
        name?: string | null;
    } | null;
};

type ConfiguratorIframeTitleOptions = {
    productLink?: string | null;
    isSnap2Mode: boolean;
    products?: ConfiguratorTitleProduct[];
    currentProduct?: ConfiguratorTitleProduct | null;
    range?: ConfiguratorTitleRange | null;
};

function getTrimmedName(name: string | null | undefined): string | null {
    const trimmed = name?.trim();
    return trimmed || null;
}

export function getConfiguratorIframeTitle({
    productLink,
    isSnap2Mode,
    products = [],
    currentProduct,
    range,
}: ConfiguratorIframeTitleOptions): string {
    const normalizedPath = (productLink ?? '')
        .trim()
        .replace(/^\/+/, '')
        .split(/[?#]/)[0];

    if (isSnap2Mode) {
        const rangeName = getTrimmedName(range?.name) ?? getTrimmedName(range?.rangeData?.name);
        return rangeName
            ? `Modular 3D configurator for ${rangeName} range.`
            : 'Modular 3D configurator.';
    }

    const isRangeMode = normalizedPath.startsWith('range/') || products.length > 1;
    if (isRangeMode) {
        const rangeName = getTrimmedName(range?.name);
        return rangeName
            ? `3D configurator for ${rangeName} range.`
            : '3D range configurator.';
    }

    const productName =
        getTrimmedName(currentProduct?.name) ??
        (products.length === 1 ? getTrimmedName(products[0]?.name) : null);
    const rangeName = getTrimmedName(range?.name);
    if (rangeName && productName) {
        return `3D configurator for ${rangeName} ${productName}.`;
    }

    return productName
        ? `3D configurator for ${productName}.`
        : '3D product configurator.';
}


export const IframeContainer = () => {
    // Get all required data from context
    const {
        iframeRef,
        products,
        currentProduct,
        range,
        galleryIndex,
        productLink,
        apiKey,
        configurationUuid,
        bedAllowNoneQueryValue,
        diningShowAttachmentPoints,
        galleryIndexToUse,
        images: passedImages,
        isProductGalleryStacked: isStacked,
        isVariantsOpen,
        uniqueId,
        isMobile,
        deferThreeD,
        isDrawerOrDialogOpen,
        configuratorDisplayMode,
        configuratorDisplayModeMobile,
        isSnap2Mode,
        isModalOpen,
        stickyLayoutActive,
        cssString,
        hideGestureHint,
        shareDialogTrigger,
    } = useOV25UI();

    const isModalMode =
        isMobile ? configuratorDisplayModeMobile === 'modal' : configuratorDisplayMode === 'modal';
    const stickyMobileGallery = stickyLayoutActive && isMobile;
    const snap2DesktopInlineSheet =
        isSnap2Mode && !isMobile && configuratorDisplayMode === 'inline-sheet';
    const snap2DesktopModalStackedFill =
        isStacked &&
        isSnap2Mode &&
        !isMobile &&
        ((isModalMode && isModalOpen) || snap2DesktopInlineSheet);
    const snap2MobileDrawerOpen =
        isSnap2Mode &&
        isMobile &&
        isDrawerOrDialogOpen &&
        !isModalMode &&
        configuratorDisplayModeMobile !== 'inline';
    const snap2MobileDialogOpen =
        isSnap2Mode &&
        isMobile &&
        isModalMode &&
        isModalOpen;
    const showNormalMobileDrawerClose =
        !isSnap2Mode &&
        isMobile &&
        isVariantsOpen &&
        configuratorDisplayModeMobile === 'drawer';
    const normalSheetOrDrawerOpen =
        !isSnap2Mode &&
        isDrawerOrDialogOpen &&
        (isMobile
            ? configuratorDisplayModeMobile === 'drawer'
            : configuratorDisplayMode === 'sheet');
    const showViewerControls =
        (galleryIndex === galleryIndexToUse || normalSheetOrDrawerOpen) &&
        !(isSnap2Mode && isMobile && !isModalMode && configuratorDisplayModeMobile !== 'inline');
    const iframeRadiusClass = stickyMobileGallery || snap2MobileDrawerOpen
        ? 'ov:rounded-none'
        : snap2MobileDialogOpen
        ? 'ov:rounded-t-[var(--ov25-configurator-iframe-border-radius)] ov:rounded-b-none'
        : 'ov:rounded-[var(--ov25-configurator-iframe-border-radius)]';

    const controlsContainerRef = useRef<HTMLDivElement>(null);
    const dummyIframeRef = useRef<HTMLIFrameElement>(null);

    useLayoutEffect(() => {
        const el = dummyIframeRef.current;
        if (!el) return;
        el.style.setProperty('display', 'none', 'important');
        el.style.setProperty('height', '0', 'important');
        el.style.setProperty('width', '0', 'important');
        el.style.setProperty('border', '0', 'important');
        el.style.setProperty('margin', '0', 'important');
        el.style.setProperty('padding', '0', 'important');
        el.style.setProperty('position', 'absolute', 'important');
        el.style.setProperty('visibility', 'hidden', 'important');
        el.style.setProperty('pointer-events', 'none', 'important');
    }, []);

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

    const initialHexBgColor = useMemo(
        () => getIframeBackgroundColorFromCssString(cssString) ?? getIframeBackgroundColorFromDom(),
        [cssString],
    );
    const [hexBgColor, setHexBgColor] = useState<string | null>(initialHexBgColor);

    useLayoutEffect(() => {
        const next = getIframeBackgroundColorFromCssString(cssString) ?? getIframeBackgroundColorFromDom();
        setHexBgColor((current) => current === next ? current : next);
    }, [cssString]);

    // Use the utility function to get the iframe src
    const iframeSrc = useMemo(() =>
        getIframeSrc(apiKey, productLink, configurationUuid, hexBgColor, bedAllowNoneQueryValue, diningShowAttachmentPoints, hideGestureHint),
        [productLink, apiKey, configurationUuid, hexBgColor, bedAllowNoneQueryValue, diningShowAttachmentPoints, hideGestureHint]);
    const iframeTitle = getConfiguratorIframeTitle({
        productLink,
        isSnap2Mode,
        products,
        currentProduct,
        range,
    });

    const isStackedStyles = cn(
        snap2DesktopModalStackedFill
            ? "ov:relative ov:h-full ov:min-h-0 ov:w-full ov:max-h-full ov:overflow-hidden ov:z-[3]"
            : "ov:relative ov:aspect-square ov:md:aspect-[3/2] ov:2xl:aspect-video ov:overflow-hidden ov:z-[3]",
        iframeRadiusClass,
        "ov:bg-[var(--ov25-configurator-iframe-background-color)]",
        "ov:transform-gpu ov:backface-hidden",
    )
    const isInlineStyles = cn(
        "ov:absolute ov:size-full ov:inset-0 ov:overflow-hidden ov:z-[3]",
        iframeRadiusClass,
        "ov:bg-[var(--ov25-configurator-iframe-background-color)]",
        "ov:transform-gpu ov:backface-hidden",
    )

    return (
        <div id="true-ov25-configurator-iframe-container"
            data-clarity-mask="true"
            className={cn(isStacked ? isStackedStyles : isInlineStyles)}>
            <iframe
                ref={dummyIframeRef}
                id="ov25-dummy-iframe"
                title="Compatibility frame"
                aria-hidden="true"
                allow="camera; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking; fullscreen"
                hidden
            ></iframe> {/* Used as bait to stop Trustpilot from hijacking our iframe. it looks for first iframe in the DOM */}
            <iframe
                data-fullscreen={isVariantsOpen}
                data-clarity-mask="true"
                ref={iframeRef}
                id={uniqueId ? `ov25-configurator-iframe-${uniqueId}` : "ov25-configurator-iframe"}
                title={iframeTitle}
                src={iframeSrc}
                className={`ov:w-full ov:bg-transparent ov:h-full ${iframeRadiusClass} ov:transform-gpu ov:backface-hidden ${galleryIndex === galleryIndexToUse ? 'ov:block' : 'ov:ov25-controls-hidden'}`}
                allow="camera; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking; fullscreen"

            />
            {/* Display selected image when galleryIndex is not the 3D spin */}
            {(() => {
                const imageIndex = galleryIndex < galleryIndexToUse ? galleryIndex : galleryIndex - 1;
                const img = images[imageIndex];
                const src = img ? resolveImageUrl(img as any, 'main') : null;
                // Sheet/drawer: poster sits in a bad stacking context vs variant UI (esp. deferThreeD); hide until closed.
                // Modal: keep poster — gallery is repositioned into the modal slot with correct stacking.
                const showPoster =
                    galleryIndex !== galleryIndexToUse &&
                    !!src &&
                    (!isDrawerOrDialogOpen || isModalMode);
                return showPoster ? (
                    <img
                        id={`ov-25-configurator-product-image-${galleryIndex}`}
                        src={src}
                        alt={`Product image ${galleryIndex}`}
                        className="ov:object-cover ov:min-h-full ov:min-w-full ov:z-5 ov:absolute ov:inset-0 ov:bg-(--ov25-configurator-iframe-background-color)"
                    />
                ) : null;
            })()}

            {(showViewerControls || showNormalMobileDrawerClose) && (
                <Ov25ShadowHost
                    ref={controlsContainerRef}
                    id={uniqueId ? `true-configurator-view-controls-container-${uniqueId}` : "true-configurator-view-controls-container"}
                    className="ov:absolute ov:inset-0 ov:z-101 ov:w-full ov:h-full ov:pointer-events-none"
                >
                    {showViewerControls && (
                        isSnap2Mode ? <Snap2ViewControls /> : <ConfiguratorViewControls />
                    )}
                    {showNormalMobileDrawerClose && (
                        <div className={cn(
                            "ov:absolute ov:w-full ov:pointer-events-none ov:h-full ov:inset-0 ov:z-101",
                            "ov:transition-opacity ov:duration-200",
                            shareDialogTrigger !== 'none' && "ov:opacity-0",
                        )}>
                            <VariantsCloseButton />
                        </div>
                    )}
                </Ov25ShadowHost>
            )}

            {/* Container for Toaster portal - must be inside fullscreen element */}
            <div id={uniqueId ? `true-toaster-container-${uniqueId}` : "true-toaster-container"} className="ov:absolute ov:inset-0 ov:w-full ov:h-full ov:pointer-events-none ov:z-999"></div>

        </div>
    )
}
