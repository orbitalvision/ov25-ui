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
    <div id="ov25-selected-swatches-container" className="ov:flex ov:flex-row ov:items-center ov:max-w-[300px] ov:gap-2 ov:border ov:border-[var(--ov25-border-color)] ov:rounded-md ov:p-2 ov:cursor-pointer" onClick={toggleSwatchBook}>
      {selectedSwatches.length > 0 ? (
        <img src={selectedSwatches[0].thumbnail.miniThumbnails.small} alt={selectedSwatches[0].name} className="ov:w-10 ov:h-auto ov:max-w-20 ov:md:max-w-24 ov:aspect-square ov:object-cover ov:rounded-lg"/>
      ) : (
        <div className="ov:w-10 ov:h-10 ov:max-w-20 ov:md:max-w-24 ov:aspect-square ov:bg-white ov:border ov:border-gray-200 ov:rounded-lg"/>
      )}
      <div className="ov:flex ov:flex-col">
        {swatchRulesData.canExeedFreeLimit ? (
          <>
            <span className="ov:text-[12px] ov:font-light">
              {swatchRulesData.maxSwatches === swatchRulesData.freeSwatchLimit 
                ? `+ Order ${swatchRulesData.maxSwatches} Free Swatches`
                : `+ Order up to ${swatchRulesData.maxSwatches} Swatches`
              }
            </span>
            {swatchRulesData.freeSwatchLimit > 0 && swatchRulesData.maxSwatches !== swatchRulesData.freeSwatchLimit && <span className="ov:text-[12px] ov:font-light ov:italic">First {swatchRulesData.freeSwatchLimit} are free</span>}
          </>
        ) : (
          <span className="ov:text-[12px] ov:font-light">+ Order up to {swatchRulesData.freeSwatchLimit} Free Swatches</span>
        )}
      </div>
    </div>
  );
}; 