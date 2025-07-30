import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog.js";
import { Swatch, useOV25UI } from "../../contexts/ov25-ui-context.js";
import { cn } from '../../lib/utils.js';

interface SwatchBookProps {
  isMobile: boolean;
}

export const SwatchBook: React.FC<SwatchBookProps> = ({
  isMobile,
}) => {
  const [zoomedSwatch, setZoomedSwatch] = useState<Swatch | null>(null);
  const { addSwatchesToCartFunction, toggleSwatch, selectedSwatches, swatchRulesData, isSwatchBookOpen, setIsSwatchBookOpen, setSelectedSwatches } = useOV25UI();

  const handleAddSwatchesToCart = () => {
    addSwatchesToCartFunction();
    setSelectedSwatches([]);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsSwatchBookOpen(open);
    if (!open) {
      setZoomedSwatch(null);
    }
  };

  return (
    <Dialog open={isSwatchBookOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent id="ov25-swatchbook" className="ov:flex ov:flex-col ov:p-4 ov:md:p-6 ov:bg-white ov:border-none ov:max-w-[95vw] ov:md:max-w-[700px] ov:h-[90vh] ov:md:h-[800px] ov:m-2 ov:md:m-0" aria-describedby={undefined}>
        {zoomedSwatch ? (
          <>
            <div id="ov25-swatchbook-title" className="ov:flex-shrink-0 ov:mb-4 ov:text-black ov:text-[1.5em] ov:font-normal">
              <DialogTitle>{zoomedSwatch.name}</DialogTitle>
            </div>
            <div id="ov25-swatchbook-zoomed-content" className="ov:flex ov:flex-col ov:items-center ov:w-full ov:gap-4 ov:overflow-y-auto ov:flex-1">
              <div id="ov25-swatchbook-zoomed-image" className="ov:flex ov:justify-center ov:relative ov:w-full ov:h-auto ov:md:w-[80%] ov:md:h-[80%] ov:aspect-square group">
                <img
                  src={isMobile ? zoomedSwatch.thumbnail.miniThumbnails.large : zoomedSwatch.thumbnail.thumbnail}
                  alt={zoomedSwatch.name}
                  className='ov25-swatch-image ov:w-full ov:h-full ov:object-cover ov:border-1 ov:border-black ov:rounded-lg ov:aspect-square'
                />
                <button
                  onClick={() => setZoomedSwatch(null)}
                  className='ov25-swatch-zoom-out-button ov:flex ov:absolute ov:inset-0 ov:items-center ov:justify-center ov:cursor-pointer'
                  title="Zoom out"
                >
                  <div className='ov25-swatch-zoom-out-icon ov:flex ov:items-center ov:justify-center ov:opacity-50 ov:md:opacity-0 ov:transition-opacity ov:w-12 ov:h-12 ov:bg-gray-100 ov:rounded-full'>
                    <ZoomOut className='ov25-swatch-icon ov:text-black'/>
                  </div>
                </button>
              </div>
              <div id="ov25-swatchbook-description" className="ov:text-[--ov25-secondary-text-color] ov:text-sm ov:mt-2 ov:text-center ov:max-w-[28em]">
                <span className='ov25-swatch-option ov:text-gray-600 ov:text-xs ov:italic ov:overflow-hidden ov:line-clamp-1'>{zoomedSwatch.option}</span>
                <span className='ov25-swatchbook-description-text ov:text-black ov:text-sm ov:font-normal ov:mb-2'>{zoomedSwatch.description}</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className='ov25-swatchbook-header ov:flex-shrink-0 ov:mb-4'>
              <div id="ov25-swatchbook-title">
                <DialogTitle className='ov25-swatchbook-title'>Swatch Book</DialogTitle>
              </div>
              <div id="ov25-swatchbook-information" className="ov:color-[--ov25-secondary-text-color] ov:text-sm ov:mt-2">
                <div id="ov25-swatchbook-samples-free" className="ov:flex ov:justify-between ov:items-center">
                  <span>Free samples included:</span>
                  <span className='ov25-swatchbook-info-value ov:text-black ov:font-medium'>{swatchRulesData.freeSwatchLimit}</span>
                </div>
                {swatchRulesData.pricePerSwatch > 0 && swatchRulesData.canExeedFreeLimit && (
                  <div id="ov25-swatchbook-samples-price" className="ov:flex ov:justify-between ov:items-center">
                    <span>Additional samples:</span>
                    <span className='ov25-swatchbook-info-value ov:text-black ov:font-medium'>£{swatchRulesData.pricePerSwatch.toFixed(2)} each</span>
                  </div>
                )}
                <div id="ov25-swatchbook-samples-range" className="ov:flex ov:justify-between ov:items-center">
                  <span>Selection range:</span>
                  <span className={`ov25-swatchbook-info-value ov:text-black ov:font-medium ${selectedSwatches.length < (swatchRulesData.canExeedFreeLimit ? swatchRulesData.minSwatches : swatchRulesData.freeSwatchLimit) ? 'ov:text-red-500' : ''}`}>{(swatchRulesData.canExeedFreeLimit ? swatchRulesData.minSwatches : 0)} - {(swatchRulesData.canExeedFreeLimit ? swatchRulesData.maxSwatches : swatchRulesData.freeSwatchLimit)} swatches</span>
                </div>
              </div>
            </div>
            <div id="ov25-swatchbook-content" className="ov:flex-1 ov:overflow-y-auto ov:overflow-x-hidden">
              {selectedSwatches.length > 0 ? (
                <div id="ov25-swatchbook-swatches-list" className="ov:grid ov:grid-cols-2 ov:sm:grid-cols-3 ov:md:grid-cols-4 ov:gap-2 ov:md:gap-4 ov:w-full ov:p-4">
                  {selectedSwatches.map((swatch) => (
                    <div key={`${swatch.manufacturerId}-${swatch.name}-${swatch.option}`} className='ov25-swatch-item ov:flex ov:flex-col ov:gap-2 ov:items-center ov:text-center ov:w-full ov:h-full ov:md:w-auto ov:md:h-auto'>
                      <div className='ov25-swatch-image-container ov:relative ov:w-[100px] ov:h-[100px] ov:md:w-[120px] ov:md:h-[120px] group'>
                        <img src={swatch.thumbnail.miniThumbnails.medium} alt={swatch.name} className='ov25-swatch-image ov:w-full ov:h-full ov:object-cover ov:border-1 ov:rounded-lg ov:border-black'/>
                        <button
                          onClick={() => toggleSwatch(swatch)}
                          className='ov25-swatch-remove-button ov:flex ov:items-center ov:justify-center ov:absolute ov:top-1 ov:right-1 ov:w-6 ov:h-6 ov:bg-white ov:rounded-full ov:cursor-pointer ov:shadow-md ov:transition-colors ov:z-[10] ov:opacity-40 ov:hover:opacity-80 ov:hover:bg-gray-100'
                          title="Remove swatch"
                        >
                          <X className='ov25-swatch-remove-icon ov:w-4 ov:h-4 ov:text-black'/>
                        </button>
                        <button
                          onClick={() => setZoomedSwatch(swatch)}
                          className='ov25-swatch-zoom-button ov:flex ov:items-center ov:justify-center ov:absolute ov:inset-0 ov:z-0 ov:cursor-pointer'
                          title="Zoom image"
                        >
                          <div className='ov25-swatch-zoom-in-icon ov:flex ov:items-center ov:justify-center ov:w-8 ov:h-8 ov:md:w-10 ov:md:h-10 ov:bg-gray-100 ov:rounded-full ov:opacity-40 ov:md:opacity-0 ov:transition-opacity group-hover:opacity-80'>
                            <ZoomIn className='ov25-swatch-icon ov:w-4 ov:h-4'/>
                          </div>
                        </button>
                      </div>
                      <div className='ov25-swatch-name ov:text-black ov:text-sm ov:font-normal ov:overflow-hidden ov:line-clamp-3 ov:md:line-clamp-2 ov:text-center ov:leading-tight'>{swatch.name}</div>
                      <span className='ov25-swatch-option ov:hidden md:ov:block ov:text-gray-600 ov:text-xs ov:italic ov:overflow-hidden ov:line-clamp-1'>{swatch.option}</span>
                      <span className='ov25-swatch-description ov:hidden md:ov:block ov:text-blacsk ov:text-xs ov:overflow-hidden ov:line-clamp-3'>{swatch.description}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div id="ov25-swatchbook-empty" className="ov:flex ov:flex-col ov:items-center ov:justify-center ov:py-8 ov:px-4">
                  <p className='ov25-swatchbook-empty-title ov:text-black ov:text-lg ov:font-medium ov:mb-2'>No swatches selected</p>
                  <p className='ov25-swatchbook-empty-description ov:text-gray-600 ov:text-sm ov:text-center'>Use the 3D Configurator to view fabrics and select swatch samples</p>
                </div>
              )}
            </div>
            {selectedSwatches.length > 0 && (
              <div id="ov25-swatchbook-controls" className="ov:flex ov:justify-between ov:items-center ov:flex-shrink-0 ov:mt-auto">
                <div>
                  <span>Total cost: </span>
                  <span>£{(swatchRulesData.pricePerSwatch * Math.max(selectedSwatches.length - swatchRulesData.freeSwatchLimit, 0)).toFixed(2)}</span>
                </div>
                <div id="ov25-swatchbook-add-to-cart-button" className="ov:flex ov:gap-2">
                  <button 
                    className={cn('ov25-swatchbook-add-button',
                      'ov:bg-black ov:text-white ov:p-2 ov:rounded-md ov:cursor-pointer ov:transition-all ov:duration-200 ov:ease-in-out',
                      selectedSwatches.length < swatchRulesData.minSwatches && 'ov:bg-gray-300 ov:text-gray-500 ov:cursor-not-allowed')}
                    disabled={selectedSwatches.length < swatchRulesData.minSwatches}
                    onClick={() => handleAddSwatchesToCart()}
                  >
                    Add Swatches to Cart
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}; 