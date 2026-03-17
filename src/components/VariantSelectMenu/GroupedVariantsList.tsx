import React from 'react';
import { Variant, VariantCardProps } from './ProductVariants.js';
import { VariantsContent } from './VariantsContent.js';

const capitalizeWords = (str: string) =>
  str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

/** Sticky group header class shared by Tree, Wizard, and list views. */
export const STICKY_GROUP_HEADER_CLASS =
  'ov25-group-header ov:sticky ov:z-[9] ov:bg-[var(--ov25-background-color)] ov:px-4 ov:text-sm ov:pt-4 ov:pb-3 ov:text-[var(--ov25-secondary-text-color)] ov:font-medium';

export interface GroupedVariantsListGroup {
  groupName: string;
  variants: Variant[];
}

export interface GroupedVariantsListProps {
  groups: GroupedVariantsListGroup[];
  gridColsClass: string;
  VariantCard: React.ComponentType<VariantCardProps>;
  isMobile: boolean;
  onSelect: (variant: Variant) => void;
  showGroupHeaders?: boolean;
  /** Sticky header top offset, e.g. 'ov:top-0' or 'ov:top-10' when there is a sticky tabs bar above */
  stickyTopClass?: string;
  showImage?: boolean;
  showDimensions?: boolean;
  compactSpacing?: boolean;
}

export const GroupedVariantsList: React.FC<GroupedVariantsListProps> = ({
  groups,
  gridColsClass,
  VariantCard,
  isMobile,
  onSelect,
  showGroupHeaders = groups.length > 1,
  stickyTopClass = 'ov:top-0',
  showImage,
  showDimensions,
  compactSpacing,
}) => {
  return (
    <>
      {groups.map((group) =>
        group.variants.length > 0 ? (
          <div key={group.groupName} className="ov25-variant-group-content ov:mb-0 last:ov:mb-0">
            {showGroupHeaders && (
              <h4 className={`${STICKY_GROUP_HEADER_CLASS} ${stickyTopClass}`}>
                {capitalizeWords(group.groupName)}
              </h4>
            )}
            <div className={`ov:grid ${gridColsClass}`}>
              <VariantsContent
                variantsToRender={group.variants}
                VariantCard={VariantCard}
                isMobile={isMobile}
                onSelect={onSelect}
                showImage={showImage}
                showDimensions={showDimensions}
                compactSpacing={compactSpacing}
              />
            </div>
          </div>
        ) : null
      )}
    </>
  );
};
