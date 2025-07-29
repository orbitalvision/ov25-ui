import React from 'react';
import { useOV25UI } from '../contexts/ov25-ui-context.js';

export const SwatchesContainer: React.FC = () => {
  const { selectedSwatches, swatchRulesData, setIsSwatchBookOpen } = useOV25UI();

  const toggleSwatchBook = () => {
    setIsSwatchBookOpen(true);
  };

  if (!swatchRulesData.enabled) {
    return null;
  }

  return (
    <div id="ov25-selected-swatches-container" onClick={toggleSwatchBook}>
      <span className="ov:text-[12px] ov:font-light ov:uppercase">Selected Swatches</span>
      {selectedSwatches.length > 0 ? (
        <div id="ov25-selected-swatches">
          {selectedSwatches.slice(0, 7).map((swatch) => (
            <div key={`${swatch.manufacturerId}-${swatch.name}-${swatch.option}`} className="ov:flex ov:flex-col ov:h-full ov:items-center ov:gap-2">
              <img src={swatch.thumbnail.thumbnail} alt={swatch.name} className="ov:w-20 ov:h-20 ov:md:w-30 ov:md:h-30 ov:self-center ov:rounded-lg"/>
              <span className="ov:text-[12px] ov:font-light ov:uppercase ov:text-center">{swatch.name}</span>
            </div>
          ))}
          {selectedSwatches.length > 7 && (
            <div className="ov:flex ov:flex-col ov:h-full ov:items-center ov:justify-center ov:gap-2">
              <div className="ov:w-16 ov:h-16 ov:md:w-30 ov:md:h-30 ov:flex ov:items-center ov:justify-center ov:bg-gray-200 ov:rounded-lg">
                <span className="ov:text-[16px] ov:md:text-[24px] ov:font-bold ov:text-gray-500">...</span>
              </div>
              <span className="ov:text-[10px] ov:md:text-[12px] ov:font-light ov:uppercase ov:text-center ov:text-gray-500">
                +{selectedSwatches.length - 7} more
              </span>
            </div>
          )}
        </div>
      ) : (
        <span className="ov:text-[12px] ov:py-2 ov:font-light ov:text-center ov:uppercase">
          No Swatches Selected
        </span>
      )}
    </div>
  );
}; 