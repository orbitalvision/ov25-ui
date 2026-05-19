import React from 'react';
import type { DiningCatalogItem } from '../../types/dining-iframe-types.js';
import { useDiningUI } from '../../contexts/dining-ui-context.js';
import { DiningImageOptionCard } from './DiningImageOptionCard.js';

interface DiningTableCardProps {
  item: DiningCatalogItem;
  onSelect?: (item: DiningCatalogItem) => void;
  minHeight?: number;
  imageHeight?: number;
}

/**
 * Product card for table selection in the dining configurator.
 * Shows table image with the reference-style title tab and selected badge.
 */
export const DiningTableCard: React.FC<DiningTableCardProps> = ({
  item,
  onSelect,
  minHeight = 168,
  imageHeight = 112,
}) => {
  const { selectTable, selectedTableItem, isAnyLoading } = useDiningUI();
  const isSelected = selectedTableItem?.configId === item.configId;

  const imageSrc =
    item.cutoutImage ??
    item.imageUrls?.image ??
    item.imageUrls?.small_image ??
    item.imageUrl;

  return (
    <div data-ov25-dining-table-card data-selected={isSelected ? 'true' : 'false'}>
      <DiningImageOptionCard
        kind="table"
        title={item.name}
        imageSrc={imageSrc}
        imageAlt={item.name}
        selected={isSelected}
        disabled={isAnyLoading}
        minHeight={minHeight}
        imageHeight={imageHeight}
        onClick={() => {
          if (isAnyLoading) return;
          selectTable(item);
          onSelect?.(item);
        }}
      />
    </div>
  );
};
