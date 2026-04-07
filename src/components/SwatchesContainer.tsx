import React from 'react';
import { useOV25UI } from '../contexts/ov25-ui-context.js';
import { SwatchImage } from './SwatchImage.js';

export const SwatchesContainer: React.FC = () => {
  const { selectedSwatches, swatchRulesData, setIsSwatchBookOpen, hasSelectionsWithSwatches } = useOV25UI();

  const toggleSwatchBook = () => {
    setIsSwatchBookOpen(true);
  };

  if (!swatchRulesData.enabled || !hasSelectionsWithSwatches) {
    return null;
  }

  return (
    <div id="ov25-selected-swatches-container" className="ov:flex ov:flex-row ov:items-center ov:max-w-[300px] ov:bg-(--ov25-background-color) ov:mt-2 ov:gap-2 ov:border ov:border-(--ov25-border-color) ov:rounded-full ov:py-2 ov:px-4 ov:cursor-pointer" onClick={toggleSwatchBook}>
      {(selectedSwatches.length > 0 && selectedSwatches[0].thumbnail && selectedSwatches[0].thumbnail.miniThumbnails) ? (
        <SwatchImage
          src={selectedSwatches[0].thumbnail.miniThumbnails.small}
          alt={selectedSwatches[0].name}
          className="ov:w-10 ov:h-10 ov:max-w-20 ov:md:max-w-24 ov:aspect-square"
        />
      ) : (
        <div className="ov:w-10 ov:h-10 ov:max-w-20 ov:md:max-w-24 ov:aspect-square ov:border ov:border-(--ov25-border-color) ov:rounded-lg"/>
      )}
      <div className="ov:flex ov:flex-col">
        {swatchRulesData.canExeedFreeLimit ? (
          <>
            <span className="ov:text-(--ov25-text-color) ov:text-[12px] ov:font-light">
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