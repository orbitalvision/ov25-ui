import React from 'react';
import type { DisplaySide } from '../../types/dining-iframe-types.js';
import { useDiningUI } from '../../contexts/dining-ui-context.js';

const SIDES: DisplaySide[] = ['front', 'back', 'left', 'right'];
const SIDE_LABELS: Record<DisplaySide, string> = {
  front: 'Front',
  back: 'Back',
  left: 'Left',
  right: 'Right',
};

/**
 * Toggle pills for marking individual sides as "unique" — letting
 * the user assign a different chair/bench to each side independently.
 */
export const DiningSideToggle: React.FC = () => {
  const { uniqueChairSides, toggleUniqueSide, isAnyLoading } = useDiningUI();

  return (
    <div
      data-ov25-dining-side-toggle
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        fontFamily: 'var(--ov25-font-family, "IBM Plex Sans", sans-serif)',
      }}
    >
      <span
        style={{
          fontSize: '13px',
          fontWeight: 800,
          color: 'var(--ov25-text-color, #111)',
          textTransform: 'uppercase',
          letterSpacing: 0,
        }}
      >
        Customise per side
      </span>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: '8px',
        }}
      >
        {SIDES.map(side => {
          const isActive = uniqueChairSides.includes(side);
          return (
            <button
              key={side}
              type="button"
              onClick={() => !isAnyLoading && toggleUniqueSide(side)}
              disabled={isAnyLoading}
              style={{
                minWidth: 0,
                minHeight: 34,
                padding: '7px 10px',
                borderRadius: '999px',
                border: `1px solid ${isActive ? 'var(--ov25-primary-color, #4d6b4b)' : 'var(--ov25-border-color, #d9d9d9)'}`,
                backgroundColor: isActive
                  ? 'var(--ov25-primary-color, #4d6b4b)'
                  : 'var(--ov25-background-color, #fff)',
                color: isActive
                  ? 'var(--ov25-primary-text-color, #fff)'
                  : 'var(--ov25-text-color, #111)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: isAnyLoading ? 'not-allowed' : 'pointer',
                transition: 'background-color 150ms ease, color 150ms ease, border-color 150ms ease, transform 120ms ease',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
              }}
            >
              {SIDE_LABELS[side]}
            </button>
          );
        })}
      </div>
    </div>
  );
};
