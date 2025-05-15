import React, { useEffect } from 'react';
import { ProductVariants } from "./product-variants.js";
import { TwoStageDrawer } from ".././ui/two-stage-drawer.js";
import { useOV25UI } from "../../contexts/ov25-ui-context.js";
import { ProductOptionsGroup } from "./product-options.js";
import { MobilePriceOverlay } from "../mobile-price-overlay.js";
import { SizeVariantCard } from "./variant-cards/SizeVariantCard.js";
import { LegsVariantCard } from "./variant-cards/LegsVariantCard.js";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet.js";
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

// Types
export type DrawerSizes = 'closed' | 'small' | 'large';

// Simplified props - most data now comes from context
export const VariantSelectMenu: React.FC = () => {
  // Get all required data from context
  const {
    isVariantsOpen,
    setIsVariantsOpen,
    setIsDrawerOrDialogOpen,
    isMobile,
    drawerSize,
    setDrawerSize,
    activeOptionId,
    activeOption,
    sizeOption,
    handleSelectionSelect,
    handleNextOption,
    handlePreviousOption,
    currentProductId,
    selectedSelections,
    products,
    allOptions,
    handleOptionClick,
    range,
    getSelectedValue
  } = useOV25UI();

  
  // Effect to resize the parent container when variants are opened
  useEffect(() => {
    const resizeVariantsContainer = () => {
      const container = document.querySelector('.ov25-configurator-variants');
      if (container && isVariantsOpen) {
        // Set a minimum height when open to accommodate content
        container.setAttribute('style', 'height: auto !important; ');
      } else if (container && !isVariantsOpen) {
        // Reset to original height when closed
        container.setAttribute('style', '');
      }
    };
    
    resizeVariantsContainer();
  }, [isVariantsOpen, activeOptionId]);

  return (
    <div id="ov-25-configurator-variant-menu-container" className="relative font-[family-name:var(--ov25-font-family)]">
      {/* Mobile Price Overlay (uses React Portal to position over iframe) */}
      {(() => {
        const Overlay = MobilePriceOverlay as any;
        return <Overlay />;
      })()}
      
      {/* Product Options section with unified border */}
      <ProductOptionsGroup
        allOptions={allOptions}
        handleOptionClick={handleOptionClick}
        range={range}
        getSelectedValue={getSelectedValue}
      />
      
      {/* Variants Section (mobile and desktop handled differently) */}
      {/* Use different layouts/styles for mobile vs desktop */}
      {isMobile ? (
        (() => {
          return (
            <TwoStageDrawer
              isOpen={isVariantsOpen}
              onOpenChange={setIsVariantsOpen}
              onStateChange={(value: any) => setDrawerSize(value === 0 ? 'closed' : value === 1 ? 'small' : 'large')}
              className="z-[10]"
            >
              <VariantContentMobile />
            </TwoStageDrawer>
          );
        })()
      ) : (
        <VariantContentDesktop />
      )}
    </div>
  );
  
  // Content component for desktop view
  function VariantContentDesktop() {
    useEffect(() => {
      
      // Update body styles when drawer is opened/closed
      if (isVariantsOpen) {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.top = `-${window.scrollY}px`;
        setIsDrawerOrDialogOpen(true);
      } else {
        const scrollY = document.body.style.top;
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
        setIsDrawerOrDialogOpen(false);
      }
    }, [isVariantsOpen]);

    // Cleanup function to reset body styles when component unmounts
    useEffect(() => {
      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        setIsDrawerOrDialogOpen(false);
      };
    }, []);

    return (
      <Sheet 
        open={isVariantsOpen} 
        onOpenChange={setIsVariantsOpen}
        modal={false}
      >
        <SheetContent aria-describedby="">
          <SheetHeader>
            <VisuallyHidden>
              <SheetTitle>Select {activeOption?.name || 'Option'}</SheetTitle>
            </VisuallyHidden>
          </SheetHeader>
            {renderVariantContent()}
        </SheetContent>
      </Sheet>
    );
  }
  
  // Content component for mobile view (inside the drawer)
  function VariantContentMobile() {
    const containerClassName = "w-full h-full absolute top-0 left-0";
    
    return (
      <div className={containerClassName}>
        {renderVariantContent()}
      </div>
    );
  }
  
  // Shared function to render the variant content
  function renderVariantContent() {
    if (activeOptionId === 'size') {
      return (
        <ProductVariants
          isOpen={isVariantsOpen}
          gridDivide={2}
          onClose={() => setIsVariantsOpen(false)}
          title="Size"
          variants={sizeOption.groups[0].selections.map(selection => ({
            id: selection?.id,
            name: selection?.name,
            price: selection?.price,
            image: selection?.thumbnail || '/placeholder.svg?height=200&width=200',
            blurHash: (selection as any)?.blurHash,
            data: products?.find(p => p?.id === selection?.id),
            isSelected: selection.id === currentProductId || selectedSelections.some(
              sel => sel.optionId === 'size' && sel.selectionId === selection.id
            )
          }))}
          VariantCard={SizeVariantCard}
          drawerSize={drawerSize}
          onSelect={handleSelectionSelect}
          onNext={handleNextOption}
          onPrevious={handlePreviousOption}
          isMobile={isMobile}
        />
      );
    } else if (typeof activeOptionId === 'number') {
      // Check if the option name includes "leg" (case insensitive)
      const isLegOption = activeOption?.name?.toLowerCase().includes('leg');
      
      // Handle all non-size options the same way, but use LegsVariantCard when appropriate
      return (
        <ProductVariants
          isOpen={isVariantsOpen}
          basis={isMobile ? 'basis-[33%]' : undefined}
          gridDivide={isLegOption ? 2 : (isMobile ? 4 : 4)}
          onClose={() => setIsVariantsOpen(false)}
          title={`${activeOption?.name || ''}`}
          variants={activeOption?.groups?.map(group => ({
            groupName: group?.name,
            variants: group?.selections?.map(selection => ({
              id: selection?.id,
              groupId: group?.id,
              optionId: activeOption?.id,
              name: selection?.name,
              price: selection?.price,
              image: (isLegOption ? selection?.miniThumbnails?.large : selection?.miniThumbnails?.medium) || '/placeholder.svg?height=200&width=200',
              blurHash: (selection as any).blurHash,
              isSelected: selectedSelections.some(
                sel => sel.optionId === activeOption.id && 
                      sel.groupId === group.id && 
                      sel.selectionId === selection.id
              )
            })).sort((a, b) => a.name.localeCompare(b.name))
          })) || []}
          VariantCard={isLegOption ? LegsVariantCard : undefined}
          drawerSize={drawerSize}
          onSelect={handleSelectionSelect}
          onNext={handleNextOption}
          onPrevious={handlePreviousOption}
          isMobile={isMobile}
        />
      );
    }
    
    return null;
  }
};

export default VariantSelectMenu; 