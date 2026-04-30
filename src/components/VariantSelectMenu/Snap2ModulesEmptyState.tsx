import React from 'react';
import { AttachmentPointAnimation } from './variant-cards/AttachmentPointAnimation.js';

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
      <p className="ov:text-sm ov:text-(--ov25-secondary-text-color)">Tap a product to replace it, or tap a white circle with a plus to add another product.</p>
      <AttachmentPointAnimation className="ov:my-3" />

    </div>
  );
}
