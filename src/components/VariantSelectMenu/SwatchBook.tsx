import React, { useEffect, useState } from 'react';
import { Plus, X, ZoomIn } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog.js";
import { Swatch, useOV25UI } from "../../contexts/ov25-ui-context.js";
import { cn } from '../../lib/utils.js';

interface SwatchBookProps {
  isMobile: boolean;
}

export const SwatchBook: React.FC<SwatchBookProps> = ({
  isMobile,
}) => {
  const { addSwatchesToCart, toggleSwatch, selectedSwatches, swatchRulesData, isSwatchBookOpen, setIsSwatchBookOpen, isVariantsOpen, openConfigurator } = useOV25UI();

  const calculateEmptySquares = () => {
    const selectedCount = selectedSwatches.length;
    const remainingSlots = maxSwatches - selectedCount;
    
    if (remainingSlots <= 0) return [];
    
    return Array.from({ length: remainingSlots }, (_, index) => ({
      id: `empty-${index}`,
      isLast: index === remainingSlots - 1
    }));
  };
  
  const [zoomedSwatch, setZoomedSwatch] = useState<Swatch | null>(null);
  const [maxSwatches, setMaxSwatches] = useState<number>(0);
  const emptySquares = calculateEmptySquares();

  useEffect(() => {
    setMaxSwatches(swatchRulesData.canExeedFreeLimit ? swatchRulesData.maxSwatches : swatchRulesData.freeSwatchLimit);
  }, [swatchRulesData]);

  useEffect(() => {
    if (selectedSwatches.length > 0) {
      setZoomedSwatch(selectedSwatches[selectedSwatches.length - 1]);
    } else {
      setZoomedSwatch(null);
    }
  }, [selectedSwatches, isSwatchBookOpen]);

  const handleAddSwatchesToCart = () => {
    addSwatchesToCart();
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsSwatchBookOpen(open);
    if (!open) {
      setZoomedSwatch(null);
    }
  };

  const handleOpen3DConfigurator = () => {
    openConfigurator();
    setZoomedSwatch(null);
  };

  return (
    <Dialog open={isSwatchBookOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent id="ov25-swatchbook" className="ov:flex ov:flex-col ov:p-2 ov:md:p-6 ov:bg-white ov:border-none ov:max-w-[95vw] ov:md:max-w-[700px] ov:h-[90vh] ov:max-h-[90vh] ov:md:h-[800px] ov:mx-auto ov:my-2 ov:md:m-0 ov:overflow-hidden" aria-describedby={undefined}>
        
        {!isVariantsOpen && <div className='ov:absolute ov:top-[10%] ov:left-full ov:-translate-x-full'>
        </div>}
        <div className="ov:flex ov:flex-col ov:min-h-0 ov:h-full">
          <div className='ov:flex ov:flex-row ov:justify-between ov:w-full'>
            <div id="ov25-swatchbook-title" className="ov:shrink-0 ov:text-black ov:text-[1.5em] ov:font-normal">
              <DialogTitle>Swatch Book</DialogTitle>
            </div>    
          </div>     
          {/* Featured/zoomed swatch section */}
          {zoomedSwatch && zoomedSwatch.thumbnail && zoomedSwatch.thumbnail.miniThumbnails && (
            <div id="ov25-swatchbook-featured" className="ov:shrink-0">
              <div className="ov:flex ov:flex-col ov:items-center ov:gap-4">
                <div className="ov25-selected-swatch-image-container ov:relative ov:w-[200px] ov:h-[200px] ov:md:w-[250px] ov:md:h-[250px] group">
                  <img
                    src={zoomedSwatch.thumbnail.miniThumbnails.large}
                    alt={zoomedSwatch.name}
                    className='ov25-swatch-image ov:w-full ov:h-full ov:object-cover ov:rounded-lg ov:aspect-square'
                  />
                </div>
                <div className="ov:text-center">
                  <div className="ov:flex ov:items-center ov:justify-center ov:gap-2 ov:mb-2">
                    <h3 className="ov25-selected-swatch-name ov:text-base ov:md:text-lg ov:font-medium ov:text-black">{zoomedSwatch.name}</h3>
                    <p className="ov25-selected-swatch-option ov:text-gray-600 ov:text-xs ov:italic">- {zoomedSwatch.option}</p>
                    <p className="ov25-selected-swatch-sku ov:text-gray-600 ov:text-xs ov:italic">- {zoomedSwatch.sku}</p>
                  </div>
                  <p className="ov25-selected-swatch-description ov:text-black ov:text-sm ov:font-normal ov:leading-6 ov:line-clamp-5 ov:md:line-clamp-3 ov:md:min-h-18">{zoomedSwatch.description}</p>
                </div>
              </div>
            </div>
          )}
          
          <div 
            id="ov25-swatchbook-content" 
            className="ov:flex-1 ov:overflow-y-hidden ov:overflow-x-hidden ov:min-h-0 ov:focus:outline-none"
            tabIndex={0}
            onWheel={(e) => e.currentTarget.scrollTop += e.deltaY}
          >
            {selectedSwatches.length === 0 && (
              <div id="ov25-swatchbook-empty" className={cn(`ov:flex ov:flex-col ov:items-center ov:py-8 ov:px-4`, maxSwatches <= 4 ? 'ov:justify-center' : 'ov:justify-start')}>
                <p className='ov25-swatchbook-empty-title ov:text-black ov:text-lg ov:font-medium ov:mb-2'>No swatches selected</p>
                <p className='ov25-swatchbook-empty-description ov:text-gray-600 text-sm text-center'>Use the <span onClick={handleOpen3DConfigurator} className="ov:underline ov:cursor-pointer">3D Configurator</span> to view fabrics and select swatch samples</p>
              </div>  
            )}
            <div id="ov25-swatchbook-swatches-list" className={cn(`ov:overflow-y-auto ov:flex ov:flex-wrap ov:gap-2 ov:md:gap-2 ov:w-full ov:px-4 ov:py-2`, maxSwatches <= 4 ? 'ov:justify-center' : 'ov:justify-start')}>
              {selectedSwatches.map((swatch) => (
                <div key={`${swatch.manufacturerId}-${swatch.name}-${swatch.option}`} className='ov25-swatch-item ov:flex ov:flex-col ov:gap-2 ov:items-center ov:text-center ov:w-[calc(50%-4px)] ov:sm:w-[calc(33.333%-5.33px)] ov:md:w-[calc(25%-6px)] ov:min-h-[85px]'>
                  <div className='ov25-swatch-image-container ov:relative ov:w-[85px] ov:h-[85px] ov:md:w-[105px] ov:md:h-[105px]'>
                    <img src={swatch.thumbnail && swatch.thumbnail.miniThumbnails ? swatch.thumbnail.miniThumbnails.medium : '/placeholder.svg?height=200&width=200'} alt={swatch.name} className='ov25-swatch-image ov:w-full ov:h-full ov:object-cover ov:rounded-lg'/>
                    <button
                      onClick={() => toggleSwatch(swatch)}
                      className='ov25-swatch-remove-button ov:flex ov:items-center ov:justify-center ov:absolute ov:top-1 ov:right-1 ov:w-6 ov:h-6 ov:bg-white ov:rounded-full ov:cursor-pointer ov:shadow-md ov:transition-colors ov:z-10 ov:opacity-40 ov:hover:opacity-80 ov:hover:bg-gray-100'
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
                </div>
              ))}
              {emptySquares.map((emptySquare, i) => (
                i === 0 ? (
                  <div key={emptySquare.id} className='ov25-swatch-item ov:flex ov:flex-col ov:gap-2 ov:items-center ov:text-center ov:w-[calc(50%-4px)] ov:sm:w-[calc(33.333%-5.33px)] ov:md:w-[calc(25%-6px)] ov:min-h-[85px]'>
                    <div className='ov25-swatch-image-container ov:relative ov:w-[80px] ov:h-[80px] ov:md:w-[105px] ov:md:h-[105px] ov:border-2 ov:border-dashed ov:border-gray-300 ov:rounded-lg ov:flex ov:items-center ov:justify-center ov:bg-gray-50'>
                      <div onClick={handleOpen3DConfigurator} className='ov25-empty-swatch-square ov:w-[90%] ov:h-[90%] ov:flex ov:flex-col ov:items-center ov:justify-center ov:gap-2 ov:cursor-pointer'>
                        <Plus className='ov:w-full ov:h-full ov:text-gray-300 ov:stroke-[0.5px]'/>
                      </div>
                    </div>
                  </div>
                ) : (
                <div key={emptySquare.id} className='ov25-swatch-item ov:flex ov:flex-col ov:gap-2 ov:items-center ov:text-center ov:w-[calc(50%-4px)] ov:sm:w-[calc(33.333%-5.33px)] ov:md:w-[calc(25%-6px)] ov:min-h-[85px]'>
                  <div className='ov25-swatch-image-container ov:relative ov:w-[80px] ov:h-[80px] ov:md:w-[105px] ov:md:h-[105px] ov:border-2 ov:border-dashed ov:border-gray-300 ov:rounded-lg ov:flex ov:items-center ov:justify-center ov:bg-gray-50'>
                  </div>
                </div>
              )))}
            </div>
          </div>
          <div id="ov25-swatchbook-controls" className="ov:flex ov:justify-between ov:items-center ov:shrink-0">
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
                Order Samples
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 