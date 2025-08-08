import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../../lib/utils.js';
import { SwatchIcon } from '../../ui/SwatchIcon.js';

export const SwatchIconOverlay = ({ isSelected, onClick }: { isSelected: boolean; onClick: (e: React.MouseEvent) => void }) => {
  return (
    <div 
      id="ov25-variant-swatch-icon-container"
      className="ov:absolute ov:inset-0 ov:flex ov:items-center ov:justify-center ov:cursor-pointer ov:transition-all ov:bg-black/50 ov:rounded-full" 
      onClick={onClick} 
      title="Order a swatch sample"
      data-selected={isSelected}
    >
      <div className="ov:flex ov:items-center ov:justify-center ov:relative ov:w-10 ov:h-10 ov:p-0.5">
        <SwatchIcon 
          fill="white"
          stroke="#6E6E6E"
          strokeWidth="0"
          size={30}
          className="ov:absolute ov:inset-0 ov:m-auto"
        />
        <X className={cn(
          'ov:w-4 ov:h-4 ov:relative ov:transition-transform ov:duration-300 ov:ease-in-out ov:text-[#79ae3c]',
          isSelected ? 'ov:rotate-0' : 'ov:rotate-45',
          isSelected ? 'ov:text-red-500' : 'ov:text-[#79ae3c]'
        )} />
      </div>
    </div>
  );
};


