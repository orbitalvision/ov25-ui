import React from 'react';
import { Armchair, ImageIcon, Palette, Table2 } from 'lucide-react';

type DiningImageOptionKind = 'table' | 'chair' | 'finish';

interface DiningImageOptionCardProps {
  kind: DiningImageOptionKind;
  title: string;
  imageSrc?: string | null;
  imageAlt?: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  imageFit?: 'contain' | 'cover';
  minHeight?: number;
  imageHeight?: number;
  selectedLabel?: string;
  titleIcon?: React.ReactNode;
}

export const DiningImageOptionCard: React.FC<DiningImageOptionCardProps> = ({
  kind,
  title,
  imageSrc,
  imageAlt,
  selected = false,
  disabled = false,
  onClick,
  imageFit = 'contain',
  minHeight = 168,
  imageHeight = 112,
  selectedLabel = 'Selected',
  titleIcon,
}) => {
  const shouldBleedImage = kind === 'finish' && Boolean(imageSrc);
  const PlaceholderIcon =
    kind === 'table' ? Table2
      : kind === 'chair' ? Armchair
        : kind === 'finish' ? Palette
          : ImageIcon;

  return (
    <button
      type="button"
      data-ov25-dining-image-card
      data-ov25-dining-image-card-kind={kind}
      data-selected={selected ? 'true' : 'false'}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'block',
        width: '100%',
        padding: 0,
        border: 'none',
        backgroundColor: 'transparent',
        color: 'var(--ov25-text-color, #111)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled && !selected ? 0.6 : 1,
        textAlign: 'center',
        fontFamily: 'var(--ov25-font-family, "IBM Plex Sans", sans-serif)',
        transition: 'opacity 150ms ease, transform 120ms ease',
      }}
    >
      <span
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight,
          padding: '34px 12px 18px',
          border: '1px solid var(--ov25-dining-card-border-color, var(--ov25-border-color, #e2e2e2))',
          borderRadius: '2px',
          backgroundColor: 'var(--ov25-dining-card-background-color, var(--ov25-secondary-background-color, #f4f4f3))',
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: -1,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            minWidth: 92,
            maxWidth: 'calc(100% - 28px)',
            minHeight: 28,
            padding: '7px 14px 8px',
            borderRadius: '0 0 var(--ov25-rounded-md, 6px) var(--ov25-rounded-md, 6px)',
            backgroundColor: 'var(--ov25-background-color, #fff)',
            color: 'var(--ov25-text-color, #111)',
            fontSize: '12px',
            fontWeight: 800,
            lineHeight: 1,
            textTransform: 'uppercase',
            letterSpacing: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            zIndex: 2,
          }}
        >
          {titleIcon && <span style={{ display: 'inline-flex', flexShrink: 0 }}>{titleIcon}</span>}
          <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {title}
          </span>
        </span>

        <span
          style={{
            position: shouldBleedImage ? 'absolute' : 'relative',
            inset: shouldBleedImage ? 0 : undefined,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: shouldBleedImage ? '100%' : imageHeight,
            marginTop: shouldBleedImage ? 0 : 2,
            zIndex: shouldBleedImage ? 0 : 1,
          }}
        >
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={imageAlt ?? title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: shouldBleedImage ? 'cover' : imageFit,
              }}
            />
          ) : (
            <span
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                color: 'var(--ov25-dining-muted-text-color, #707070)',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              <PlaceholderIcon size={24} strokeWidth={1.4} />
              <span>Image coming soon</span>
            </span>
          )}
        </span>

        {selected && (
          <span
            style={{
              position: 'absolute',
              left: '50%',
              bottom: 0,
              transform: 'translateX(-50%)',
              minHeight: 25,
              padding: '7px 14px',
              borderRadius: 'var(--ov25-rounded-sm, 4px) var(--ov25-rounded-sm, 4px) 0 0',
              backgroundColor: 'var(--ov25-cta-color, #008f6b)',
              color: 'var(--ov25-cta-text-color, #fff)',
              fontSize: '12px',
              fontWeight: 700,
              lineHeight: 1,
              whiteSpace: 'nowrap',
              zIndex: 2,
            }}
          >
            {selectedLabel}
          </span>
        )}
      </span>
    </button>
  );
};
