import React from 'react';
import type { DiningCatalogItem, CompassSide } from '../../types/dining-iframe-types.js';
import { useDiningUI } from '../../contexts/dining-ui-context.js';
import { DiningImageOptionCard } from './DiningImageOptionCard.js';

interface DiningChairCardProps {
  item: DiningCatalogItem;
  /** If provided, assign to this specific side */
  side?: CompassSide;
  /** Whether this chair is currently assigned to the relevant side */
  isAssigned?: boolean;
  onSelect?: (item: DiningCatalogItem) => void;
}

/**
 * Product card for chair/bench selection in the dining configurator.
 */
export const DiningChairCard: React.FC<DiningChairCardProps> = ({
  item,
  side,
  isAssigned = false,
  onSelect,
}) => {
  const { selectSeatProduct, isAnyLoading } = useDiningUI();
  const imageSrc =
    item.cutoutImage ??
    item.imageUrls?.small_image ??
    item.imageUrls?.thumbnail ??
    item.imageUrls?.image ??
    item.imageUrl ??
    item.imageUrls?.hero ??
    item.imageUrls?.original;

  return (
    <div data-ov25-dining-chair-card data-selected={isAssigned ? 'true' : 'false'}>
      <DiningImageOptionCard
        kind="chair"
        title={item.name}
        imageSrc={imageSrc}
        imageAlt={item.name}
        selected={isAssigned}
        disabled={isAnyLoading}
        minHeight={168}
        imageHeight={112}
        onClick={() => {
          if (isAnyLoading) return;
          selectSeatProduct(item, side);
          onSelect?.(item);
        }}
      />
    </div>
  );
};
