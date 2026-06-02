import React from 'react';
import Snap2Controls from './Snap2Controls.js';
import { VariantsCloseButton } from './VariantSelectMenu/VariantsCloseButton.js';
import { useOV25UI } from '../contexts/ov25-ui-context.js';
import { cn } from '../lib/utils.js';

const Snap2ViewControls: React.FC = () => {
  const {
    isVariantsOpen,
    isMobile,
    configuratorDisplayModeMobile,
    shareDialogTrigger,
  } = useOV25UI();

  const closeButtonClass =
    configuratorDisplayModeMobile === 'drawer' ? 'ov:top-0! ov:right-0!' : undefined;

  return (
    <>
      <Snap2Controls />
      {isVariantsOpen && isMobile && configuratorDisplayModeMobile !== 'inline' && (
        <div className={cn(
          "ov:absolute ov:w-full ov:pointer-events-none ov:h-full ov:inset-0 ov:z-103",
          "ov:transition-opacity ov:duration-200",
          shareDialogTrigger !== 'none' && "ov:opacity-0"
        )}>
          <VariantsCloseButton className={closeButtonClass} />
        </div>
      )}
    </>
  );
};

export default Snap2ViewControls;
