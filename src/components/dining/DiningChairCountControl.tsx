import React from 'react';
import { Armchair, Minus, Plus } from 'lucide-react';
import { useDiningUI } from '../../contexts/dining-ui-context.js';

const DEFAULT_CHAIR_COUNT_OPTIONS = [2, 4, 6, 8, 10, 12];

function getChairCountOptions(selectedTableItem: ReturnType<typeof useDiningUI>['selectedTableItem']): number[] {
  if (!selectedTableItem) return DEFAULT_CHAIR_COUNT_OPTIONS;

  let minCount: number;
  let maxCount: number;

  if (selectedTableItem.minChairCount !== undefined && selectedTableItem.maxChairCount !== undefined) {
    minCount = selectedTableItem.minChairCount;
    maxCount = selectedTableItem.maxChairCount;
  } else if (selectedTableItem.chairSpaces) {
    const total =
      (selectedTableItem.chairSpaces.north || 0) +
      (selectedTableItem.chairSpaces.south || 0) +
      (selectedTableItem.chairSpaces.east || 0) +
      (selectedTableItem.chairSpaces.west || 0);
    minCount = Math.max(2, total);
    maxCount = Math.max(2, total);
  } else {
    return DEFAULT_CHAIR_COUNT_OPTIONS;
  }

  const options: number[] = [];
  for (let count = minCount; count <= maxCount; count += 2) {
    options.push(count);
  }
  if (maxCount % 2 !== 0 && !options.includes(maxCount)) {
    options.push(maxCount);
  }

  return options.length > 0 ? options.sort((a, b) => a - b) : [minCount, maxCount];
}

/**
 * +/- stepper for global chair count with min/max enforcement
 * based on the selected table's capacity.
 */
export const DiningChairCountControl: React.FC = () => {
  const { globalChairCount, setChairCount, selectedTableItem, isAnyLoading } = useDiningUI();

  const options = getChairCountOptions(selectedTableItem);
  const currentIndex = options.indexOf(globalChairCount);
  const displayIndex = currentIndex === -1
    ? options.reduce((bestIndex, option, index) => {
        const bestDistance = Math.abs(options[bestIndex] - globalChairCount);
        const optionDistance = Math.abs(option - globalChairCount);
        return optionDistance < bestDistance ? index : bestIndex;
      }, 0)
    : currentIndex;
  const min = options[0];
  const max = options[options.length - 1];
  const displayCount = options[displayIndex];
  const nextCount = options[Math.min(displayIndex + 1, options.length - 1)];
  const prevCount = options[Math.max(displayIndex - 1, 0)];

  const canDecrement = displayIndex > 0 && !isAnyLoading;
  const canIncrement = displayIndex < options.length - 1 && !isAnyLoading;

  return (
    <div
      data-ov25-dining-chair-count
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px',
        minHeight: 38,
        padding: '0 0 8px',
        borderBottom: '1px solid var(--ov25-border-color, #d9d9d9)',
        backgroundColor: 'transparent',
        fontFamily: 'var(--ov25-font-family, "IBM Plex Sans", sans-serif)',
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          flex: 1,
          minWidth: 0,
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--ov25-text-color, #111)',
          whiteSpace: 'nowrap',
        }}
      >
        <Armchair size={15} strokeWidth={1.7} />
        <span>Seat count</span>
      </span>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '28px 32px 28px',
          alignItems: 'center',
          height: 30,
          border: '1px solid var(--ov25-border-color, #d9d9d9)',
          backgroundColor: 'var(--ov25-background-color, #fff)',
        }}
      >
        {/* Decrement */}
        <button
          type="button"
          onClick={() => canDecrement && setChairCount(prevCount)}
          disabled={!canDecrement}
          aria-label="Decrease seat count"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            borderRight: '1px solid var(--ov25-border-color, #e5e5e5)',
            backgroundColor: 'transparent',
            cursor: canDecrement ? 'pointer' : 'not-allowed',
            opacity: canDecrement ? 1 : 0.35,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--ov25-text-color, #111)',
            transition: 'opacity 150ms ease, transform 120ms ease',
          }}
        >
          <Minus size={13} strokeWidth={2} />
        </button>

        {/* Value */}
        <span
          style={{
            textAlign: 'center',
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--ov25-text-color, #111)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {displayCount}
        </span>

        {/* Increment */}
        <button
          type="button"
          onClick={() => canIncrement && setChairCount(nextCount)}
          disabled={!canIncrement}
          aria-label="Increase seat count"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            borderLeft: '1px solid var(--ov25-border-color, #e5e5e5)',
            backgroundColor: 'transparent',
            cursor: canIncrement ? 'pointer' : 'not-allowed',
            opacity: canIncrement ? 1 : 0.35,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--ov25-text-color, #111)',
            transition: 'opacity 150ms ease, transform 120ms ease',
          }}
        >
          <Plus size={13} strokeWidth={2} />
        </button>
      </div>

      {/* Range hint */}
      <span
        style={{
          fontSize: '12px',
          fontWeight: 700,
          color: 'var(--ov25-text-color, #111)',
          whiteSpace: 'nowrap',
        }}
      >
        {min}–{max}
      </span>
    </div>
  );
};
