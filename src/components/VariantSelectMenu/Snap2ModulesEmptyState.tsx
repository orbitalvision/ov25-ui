import React from 'react';
import { Plus } from 'lucide-react';

type Snap2ModulesEmptyStateProps = {
  id?: string;
  stateAttr?: string;
  className?: string;
};

export function Snap2ModulesEmptyState({
  id,
  stateAttr,
  className,
}: Snap2ModulesEmptyStateProps) {
  return (
    <div
      id={id}
      data-ov25-snap2-modules-state={stateAttr}
      className={`ov:flex ov:flex-col ov:items-center ov:justify-center ov:py-8 ov:px-4 ov:text-center ${className ?? ''}`}
    >
      <p className="ov:text-sm ov:text-(--ov25-secondary-text-color)">Select where to attach a product</p>
      <div
        className="ov:md:w-[80px] ov:md:h-[80px] ov:w-[40px] ov:h-[40px] ov:bg-white ov:text-black shadow-inner-intense ov:rounded-full ov:shadow-md ov:flex ov:items-center ov:justify-center ov:my-3"
        aria-hidden="true"
      >
        <Plus className="ov:md:w-10 ov:md:h-10 ov:w-5 ov:h-5" />
      </div>
      <p className="ov:text-sm ov:text-(--ov25-secondary-text-color)">or select a product to replace</p>
    </div>
  );
}
