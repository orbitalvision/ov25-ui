import React from 'react';
import { useDiningUI } from '../../contexts/dining-ui-context.js';

/**
 * Iframe container for the dining configurator 3D viewer.
 * Builds the dining-specific iframe URL and renders it.
 */
interface DiningProductGalleryProps {
  style?: React.CSSProperties;
}

export const DiningProductGallery: React.FC<DiningProductGalleryProps> = ({ style }) => {
  const { iframeRef, uniqueId } = useDiningUI();

  return (
    <div
      data-ov25-dining-viewer
      style={{
        position: 'relative',
        display: 'flex',
        flex: '1 1 auto',
        width: '100%',
        height: '100%',
        minHeight: 'inherit',
        overflow: 'hidden',
        borderRadius: 'var(--ov25-configurator-iframe-border-radius, 12px)',
        backgroundColor: 'var(--ov25-configurator-iframe-background-color, #ffffff)',
        ...style,
      }}
    >
      <iframe
        ref={iframeRef}
        id={uniqueId ? `ov25-configurator-iframe-${uniqueId}` : 'ov25-configurator-iframe'}
        style={{
          display: 'block',
          flex: '1 1 auto',
          width: '100%',
          height: '100%',
          minHeight: 'inherit',
          border: 'none',
          backgroundColor: 'transparent',
        }}
        allow="camera; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking; fullscreen"
      />
    </div>
  );
};
