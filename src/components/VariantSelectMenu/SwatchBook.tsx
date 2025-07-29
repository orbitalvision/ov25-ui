import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog.js";
import { Swatch, useOV25UI } from "../../contexts/ov25-ui-context.js";

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

  return (
    <Dialog open={isSwatchBookOpen} onOpenChange={setIsSwatchBookOpen}>
      <DialogContent id="ov25-swatchbook" aria-describedby={undefined}>
        {zoomedSwatch ? (
          <>
            <div id="ov25-swatchbook-title">
              <DialogTitle>{zoomedSwatch.name}</DialogTitle>
            </div>
            <div id="ov25-swatchbook-zoomed-content">
              <div id="ov25-swatchbook-zoomed-image">
                <img
                  src={isMobile ? zoomedSwatch.thumbnail.miniThumbnails.large : zoomedSwatch.thumbnail.thumbnail}
                  alt={zoomedSwatch.name}
                  className='ov25-swatch-image'
                />
                <button
                  onClick={() => setZoomedSwatch(null)}
                  className='ov25-swatch-zoom-out-button'
                  title="Zoom out"
                >
                  <div className='ov25-swatch-zoom-out-icon'>
                    <ZoomOut className='ov25-swatch-icon' />
                  </div>
                </button>
              </div>
              <div id="ov25-swatchbook-description">
                <p className='ov25-swatchbook-description-text'>{zoomedSwatch.description}</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className='ov25-swatchbook-header'>
              <div id="ov25-swatchbook-title">
                <DialogTitle className='ov25-swatchbook-title'>Selected Swatches</DialogTitle>
              </div>
              <div id="ov25-swatchbook-information">
                <div id="ov25-swatchbook-samples-free">
                  <span>Free samples included:</span>
                  <span className='ov25-swatchbook-info-value'>{swatchRulesData.freeSwatchLimit}</span>
                </div>
                {swatchRulesData.pricePerSwatch > 0 && (
                  <div id="ov25-swatchbook-samples-price">
                    <span>Additional samples:</span>
                    <span className='ov25-swatchbook-info-value'>£{swatchRulesData.pricePerSwatch.toFixed(2)} each</span>
                  </div>
                )}
                <div id="ov25-swatchbook-samples-range">
                  <span>Selection range:</span>
                  <span className='ov25-swatchbook-info-value'>{swatchRulesData.minSwatches} - {swatchRulesData.maxSwatches} swatches</span>
                </div>
              </div>
            </div>
            <div id="ov25-swatchbook-content">
              {selectedSwatches.length > 0 ? (
                <div id="ov25-swatchbook-swatches-list">
                  {selectedSwatches.map((swatch) => (
                    <div key={`${swatch.manufacturerId}-${swatch.name}-${swatch.option}`} className='ov25-swatch-item'>
                      <div className='ov25-swatch-image-container'>
                        <img src={swatch.thumbnail.miniThumbnails.medium} alt={swatch.name} className='ov25-swatch-image'/>
                        <button
                          onClick={() => toggleSwatch(swatch)}
                          className='ov25-swatch-remove-button'
                          title="Remove swatch"
                        >
                          <X className='ov25-swatch-remove-icon'/>
                        </button>
                        <button
                          onClick={() => setZoomedSwatch(swatch)}
                          className='ov25-swatch-zoom-button'
                          title="Zoom image"
                        >
                          <div className='ov25-swatch-zoom-in-icon'>
                            <ZoomIn className='ov25-swatch-icon'/>
                          </div>
                        </button>
                      </div>
                      <span className='ov25-swatch-name'>{swatch.name}</span>
                      <span className='ov25-swatch-description'>{swatch.description}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div id="ov25-swatchbook-empty">
                  <p className='ov25-swatchbook-empty-title'>No swatches selected</p>
                  <p className='ov25-swatchbook-empty-description'>Use the 3D Configurator to view fabrics and select swatch samples</p>
                </div>
              )}
            </div>
            {selectedSwatches.length > 0 && (
              <div id="ov25-swatchbook-controls">
                <div>
                  <span>Total cost: </span>
                  <span>£{(swatchRulesData.pricePerSwatch * Math.max(selectedSwatches.length - swatchRulesData.freeSwatchLimit, 0)).toFixed(2)}</span>
                </div>
                <div id="ov25-swatchbook-add-to-cart-button">
                  <button 
                    className='ov25-swatchbook-add-button'
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