import React from 'react';
import { useDiningUI } from '../../contexts/dining-ui-context.js';
import type { DiningCatalogItem } from '../../types/dining-iframe-types.js';
import { DiningImageOptionCard } from './DiningImageOptionCard.js';

function getOptionProductId(option: { id?: unknown }): number | null {
  const id = typeof option.id === 'string' ? option.id : '';
  const lastPart = id.split('-').pop();
  const productId = Number(lastPart);
  return Number.isFinite(productId) ? productId : null;
}

function stripProductNamePrefix(optionName: string, productName: string): string {
  const trimmedOptionName = optionName.trim();
  const trimmedProductName = productName.trim();
  if (!trimmedProductName) return trimmedOptionName;

  const optionLower = trimmedOptionName.toLowerCase();
  const productLower = trimmedProductName.toLowerCase();

  const label = optionLower.startsWith(productLower)
    ? trimmedOptionName.slice(trimmedProductName.length)
    : trimmedOptionName;

  return label
    .replace(/^[-–—:/\s]+/, '')
    .replace(/\s+/g, ' ')
    .trim() || trimmedOptionName;
}

function shouldShowGroupName(groupName: string, optionTitle: string, groupCount: number): boolean {
  const normalizedGroup = groupName.trim().toLowerCase();
  const normalizedOption = optionTitle.trim().toLowerCase();

  if (!normalizedGroup || normalizedGroup === 'default' || normalizedGroup === normalizedOption) {
    return false;
  }

  return groupCount > 1 || normalizedGroup !== 'options';
}

function getSelectionImageSrc(selection: {
  thumbnail?: string;
  miniThumbnails?: { small: string; medium: string; large: string };
  swatch?: {
    thumbnail?: {
      thumbnail?: string;
      miniThumbnails?: {
        large?: string;
        medium?: string;
        small?: string;
      };
    };
  };
}): string | undefined {
  return (
    selection.thumbnail ??
    selection.miniThumbnails?.large ??
    selection.miniThumbnails?.medium ??
    selection.miniThumbnails?.small ??
    selection.swatch?.thumbnail?.miniThumbnails?.large ??
    selection.swatch?.thumbnail?.miniThumbnails?.medium ??
    selection.swatch?.thumbnail?.miniThumbnails?.small ??
    selection.swatch?.thumbnail?.thumbnail
  );
}

interface DiningFinishOptionsProps {
  product: DiningCatalogItem;
  title?: string;
  emptyContent?: React.ReactNode;
  hideHeaderWhenEmpty?: boolean;
  hideProductName?: boolean;
}

export const DiningFinishOptions: React.FC<DiningFinishOptionsProps> = ({
  product,
  title = 'Customisation options',
  emptyContent,
  hideHeaderWhenEmpty = false,
  hideProductName = false,
}) => {
  const { configuratorState, handleSelectionSelect } = useDiningUI();
  const options = React.useMemo(
    () => (configuratorState?.options ?? []).filter(option => {
      const optionProductId = getOptionProductId(option);
      return optionProductId === product.productId || option.name.startsWith(product.name);
    }),
    [configuratorState?.options, product.name, product.productId]
  );

  return (
    <div
      data-ov25-dining-finish-options
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {title && (!hideHeaderWhenEmpty || options.length > 0) && (
      <div>
        <h4
          style={{
            fontSize: '14px',
            fontWeight: 700,
            color: 'var(--ov25-text-color, #111)',
            margin: 0,
          }}
        >
          {title}
        </h4>
        {!hideProductName && (
          <p
            style={{
              fontSize: '12px',
              color: 'var(--ov25-secondary-text-color, #777)',
              margin: '3px 0 0',
            }}
          >
            {product.name}
          </p>
        )}
      </div>
      )}

      {options.length === 0 ? emptyContent ?? (
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--ov25-rounded-lg, 8px)',
              border: '1px solid var(--ov25-border-color, #e0e0e0)',
              backgroundColor: 'var(--ov25-secondary-background-color, #f7f7f7)',
              color: 'var(--ov25-secondary-text-color, #777)',
              fontSize: '12px',
              lineHeight: 1.45,
            }}
          >
            No customisation options are available for this item.
          </div>
        ) : options.map(option => (
        <div key={option.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 800,
              color: 'var(--ov25-text-color, #111)',
            }}
          >
            {stripProductNamePrefix(option.name, product.name)}
          </span>
          {option.groups.map(group => {
            const optionTitle = stripProductNamePrefix(option.name, product.name);
            const showGroupName = shouldShowGroupName(group.name, optionTitle, option.groups.length);

            return (
              <div
                key={group.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                {showGroupName && (
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: 'var(--ov25-secondary-text-color, #666)',
                    }}
                  >
                    {group.name}
                  </span>
                )}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: '10px',
                  }}
                >
                  {group.selections.map(selection => {
                    const isSelected = configuratorState?.selectedSelections?.some(selected =>
                      selected.optionId === option.id &&
                      selected.groupId === group.id &&
                      selected.selectionId === selection.id
                    );

                    return (
                      <div
                        key={selection.id}
                        data-ov25-dining-finish-selection
                        data-selected={isSelected ? 'true' : 'false'}
                      >
                        <DiningImageOptionCard
                          kind="finish"
                          title={selection.name}
                          imageSrc={getSelectionImageSrc(selection)}
                          imageAlt={selection.name}
                          imageFit="cover"
                          selected={Boolean(isSelected)}
                          minHeight={156}
                          imageHeight={98}
                          onClick={() => handleSelectionSelect({ ...selection, groupId: group.id }, option.id)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
