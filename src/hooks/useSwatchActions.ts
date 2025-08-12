import React from 'react';
import { toast } from 'sonner';
import { useOV25UI } from '../contexts/ov25-ui-context.js';

export function useSwatchActions() {
  const { swatchRulesData, toggleSwatch, isSwatchSelected, selectedSwatches, setIsVariantsOpen, setIsSwatchBookOpen } = useOV25UI();

  const shouldShowSwatch = (isSelected: boolean, swatch: any): boolean => {
    return Boolean(isSelected && swatchRulesData.enabled && swatch);
  };

  const isSwatchSelectedFor = (swatch: any): boolean => {
    return Boolean(swatch && isSwatchSelected(swatch));
  };

  const getSwatchClickHandler = (isSelected: boolean, swatch: any) => (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!swatch) {
      return;
    }

    const reachedLimit =
      selectedSwatches.length >=
      (swatchRulesData.canExeedFreeLimit ? swatchRulesData.maxSwatches : swatchRulesData.freeSwatchLimit);

    if (reachedLimit && !isSwatchSelected(swatch)) {
      toast.error('You have reached the maximum number of swatches');
      return;
    }

    if (isSwatchSelected(swatch)) {
      toast.success('Swatch removed', {
        action: {
          label: 'Open Swatchbook',
          onClick: () => {
            setIsVariantsOpen(false);
            setIsSwatchBookOpen(true);
          }
        },
        duration: 5000,
      });
    } else {
      toast.success('Swatch added', {
        action: {
          label: 'Open Swatchbook',
          onClick: () => {
            setIsVariantsOpen(false);
            setIsSwatchBookOpen(true);
          }
        },
        duration: 5000,
      });
    }
    toggleSwatch(swatch);
  };

  return {
    shouldShowSwatch,
    isSwatchSelectedFor,
    getSwatchClickHandler,
  };
}

