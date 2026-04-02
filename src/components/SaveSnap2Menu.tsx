import React from 'react';
import { Share } from 'lucide-react';
import { toast } from 'sonner';
import { useOV25UI } from '../contexts/ov25-ui-context.js';
import { cn } from '../utils/cn.js';
import { requestSnap2Save } from '../utils/configurator-utils.js';

export const SaveSnap2Menu: React.FC = () => {
  const { setShareDialogTrigger, skipNextShareClickRef } = useOV25UI();

  const handleSave = async () => {
    if (skipNextShareClickRef.current) {
      skipNextShareClickRef.current = false;
      return;
    }
    setShareDialogTrigger('save-button');
    try {
      requestSnap2Save();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save configuration');
      setShareDialogTrigger('none');
    }
  };

  return (
    <button
      onClick={handleSave}
      className={cn(
        'ov:cursor-pointer ov:w-8 ov:h-8 ov:flex ov:items-center ov:justify-center',
        'ov:shadow-sm ov:rounded-full ov:bg-[var(--ov25-overlay-button-color)]',
        'ov:transition-all ov:duration-200 ov:hover:opacity-80'
      )}
    >
      <Share className="ov:w-[16px] ov:h-[16px]" color="var(--ov25-configurator-view-controls-text-color)" />
    </button>
  );
};

export default SaveSnap2Menu;
