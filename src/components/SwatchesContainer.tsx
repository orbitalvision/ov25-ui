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
    <div id="ov25-selected-swatches-container" className="ov:flex ov:flex-col ov:max-w-[560px] ov:gap-2 ov:border ov:border-[--ov25-border-color] ov:rounded-md ov:p-2 ov:cursor-pointer" onClick={toggleSwatchBook}>
      <span className="ov:text-[12px] ov:font-light ov:uppercase">Selected Swatches</span>
      {selectedSwatches.length > 0 ? (
        <div id="ov25-selected-swatches" className="ov:grid ov:grid-cols-3 ov:md:grid-cols-4 ov:gap-1 ov:md:gap-2 ov:w-full ov:px-2 ov:md:px-3 ov:py-2 ov:mt-2 ov:tems-center ov:overflow-hidden">
          {selectedSwatches.slice(0, 7).map((swatch) => (
            <div key={`${swatch.manufacturerId}-${swatch.name}-${swatch.option}`} className="ov:flex ov:flex-col ov:h-full ov:items-center ov:gap-2">
              <img src={swatch.thumbnail.thumbnail} alt={swatch.name} className="ov:w-full ov:h-auto  ov:max-w-20 ov:md:max-w-24 ov:aspect-square ov:object-cover ov:rounded-lg"/>
              <span className="ov:text-[12px] ov:font-light ov:uppercase ov:text-center">{swatch.name}</span>
            </div>
          ))}
          {selectedSwatches.length > 7 && (
            <div className="ov:flex ov:flex-col ov:h-full ov:items-center ov:gap-2">
              <div className="ov:w-full ov:h-auto ov:aspect-square ov:flex ov:max-w-20 ov:md:max-w-24 ov:items-center ov:justify-center ov:bg-gray-200 ov:rounded-lg">
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