import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../lib/utils.js';
import { useOV25UI } from '../contexts/ov25-ui-context.js';

interface ConfiguratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const ConfiguratorModal: React.FC<ConfiguratorModalProps> = ({ isOpen, onClose, children }) => {
  const { shareDialogTrigger } = useOV25UI();
  const isShareDialogOpen = shareDialogTrigger !== 'none';
  
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return createPortal(
    <div
      className={cn(
        'ov:fixed ov:inset-0 ov:z-[99999999999999] ov:bg-black/50 ov:flex ov:items-center ov:justify-center',
        'ov:p-4'
      )}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div
        className={cn(
          'ov:relative ov:bg-white ov:rounded-lg ov:shadow-xl',
          'ov:w-[90vw] ov:h-[90vh] ov:max-w-[1980px] ov:max-h-none',
          'ov:overflow-hidden'
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={cn(
            'ov:absolute ov:top-4 ov:right-4 ov:z-10',
            'ov:w-8 ov:h-8 ov:rounded-full ov:bg-white/80 ov:shadow-md',
            'ov:flex ov:items-center ov:justify-center',
            'ov:text-gray-600 ov:hover:text-gray-800',
            'ov:transition-all ov:duration-200 ov:cursor-pointer',
            isShareDialogOpen && 'ov:opacity-0 ov:pointer-events-none'
          )}
          aria-label="Close modal"
        >
          <X className="ov:h-6 ov:w-6" />
        </button>

        {/* Modal content */}
        <div className="ov:w-full ov:h-full p-4 ov:overflow-hidden ov:flex ov:flex-col">
          <div className="ov:flex-1 ov:min-h-0">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
