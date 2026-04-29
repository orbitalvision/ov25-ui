import * as React from 'react'
import { X } from 'lucide-react';
import { useOV25UI } from '../../contexts/ov25-ui-context.js';
import { cn } from '../../lib/utils.js';

const closeButtonBaseClass =
  'ov:absolute ov:top-5 ov:right-4 ov:z-20 ov:group ov:p-1 max-h-fit aspect-square ov:rounded-full ov:hover:bg-neutral-50 ov:cursor-pointer ov:max-w-fit ov:flex ov:items-center ov:justify-center ov:pointer-events-auto';

interface VariantsCloseButtonProps {
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
}

export const VariantsCloseButton = ({ onClick: onClickProp, ariaLabel = 'Close', className }: VariantsCloseButtonProps) => {
  const {
    setIsVariantsOpen,
    isModalOpen,
    isSnap2Mode,
    shareDialogTrigger,
    setShareDialogTrigger,
    configuratorState,
    configuratorDisplayMode,
  } = useOV25UI();

  const handleClose = () => {
    if (onClickProp) {
      onClickProp();
      return;
    }
    if (isModalOpen) {
      setIsVariantsOpen(false);
      return;
    }
    if (configuratorDisplayMode === 'inline-sheet') {
      setIsVariantsOpen(false);
      return;
    }
    if (isSnap2Mode && shareDialogTrigger === 'none' && (configuratorState?.snap2Objects?.length ?? 0) > 0) {
      setShareDialogTrigger('modal-close');
    } else {
      setIsVariantsOpen(false);
    }
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        handleClose();
      }}
      className={cn('ov25-close-button',closeButtonBaseClass, className)}
      aria-label={ariaLabel}
    >
      <X size={24} className="ov:text-(--ov25-destructive) ov:transition-transform" strokeWidth={2.5} />
    </button>
  );
};
