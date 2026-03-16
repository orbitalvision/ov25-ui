import React from 'react';
import { toast } from 'sonner';
import { useOV25UI } from '../contexts/ov25-ui-context.js';

export function useSwatchActions() {
  const { swatchRulesData, toggleSwatch, isSwatchSelected, selectedSwatches, setIsSwatchBookOpen, setSwatchBookFlash } = useOV25UI();

  const shouldShowSwatch = (isSelected: boolean, swatch: any): boolean => {
    return Boolean(isSelected && swatchRulesData.enabled && swatch);
  };

  const shouldShowSwatchOverlay = (isSelected: boolean, swatch: any): boolean => {
    if (!swatchRulesData.enabled || !swatch) return false;
    return isSwatchSelected(swatch) || isSelected;
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
      setSwatchBookFlash?.('destructive');
      toast.error('You have reached the maximum number of swatches', {
        action: {
          label: 'Manage swatches',
          onClick: () => setIsSwatchBookOpen(true),
        },
        duration: 6000,
      });
      return;
    }

    if (isSwatchSelected(swatch)) {
      toast.success('Swatch removed', {
        action: {
          label: 'Open Swatchbook',
          onClick: () => {
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
    shouldShowSwatchOverlay,
    isSwatchSelectedFor,
    getSwatchClickHandler,
  };
}

