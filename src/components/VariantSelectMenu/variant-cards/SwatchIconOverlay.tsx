import React from 'react';
import { Plus } from 'lucide-react';
import { cn } from '../../../lib/utils.js';
import { SwatchIconSvg } from '../../../lib/svgs/SwatchIconSvg.js';

export const SwatchIconOverlay = ({ isSelected, isVariantSelected, onClick }: { isSelected: boolean; isVariantSelected: boolean; onClick: (e: React.MouseEvent) => void }) => {
  return (
    <div
      id="ov25-variant-swatch-icon-container"
      className={cn(
        "ov:absolute ov:inset-0 ov:z-8 ov:flex ov:justify-center ov:items-center ov:overflow-visible",
        !isVariantSelected && "ov:pointer-events-none"
      )}
      onClick={onClick}
      title="Order a swatch sample"
      data-selected={isSelected}
    >
      <SwatchIconSvg
        size={32}
        pathClassName={cn(
          'ov:transition-colors shadow-md',
          isSelected ? 'ov:fill-[var(--ov25-cta-color-light)]' : 'ov:fill-neutral-50'
        )}
        className={cn("ov:w-8 ov:h-8 ov:transition-opacity", isVariantSelected && "ov:cursor-pointer")}
      />
      <div className="ov:absolute ov:inset-0 ov:flex ov:items-center ov:justify-center ov:pointer-events-none">
        <Plus className={cn("ov:w-3 ov:h-3 ov:text-neutral-900 ov:rotate-0 ov:transition-transform ov:ease-in-out ov:shrink-0", isSelected && 'ov:rotate-90 ov:text-white')} strokeWidth={2.5} />
      </div>
    </div>
  );
};


