import { Check } from 'lucide-react';
import * as React from 'react'
import { CSSProperties } from 'react';

interface VariantCardProps {
    variant: any;
    onSelect: (variant: any) => void;
    index: number;
    isMobile?: boolean;
  }
  
export const DefaultVariantCard = React.memo(({ variant, onSelect, index, isMobile }: VariantCardProps) => {
    // Generate a stable image src that will be used for both rendering and as a key
    const imgSrc = variant.image || '/placeholder.svg';
    
    // Button styles
    const buttonStyle: CSSProperties = {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem',
      width: '100%',
      padding: '0.5rem',
      textAlign: 'left'
    };

    // Image container styles
    const imageContainerStyle: CSSProperties = {
      position: 'relative',
      aspectRatio: '65/47',
      width: '100%',
      paddingTop: '0.5rem',
      overflow: 'hidden',
      borderRadius: 0,
      backgroundColor: 'transparent'
    };

    // Image styles
    const imageStyle: CSSProperties = {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    };

    // Selected overlay styles
    const selectedOverlayStyle: CSSProperties = {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    };

    // Check container styles
    const checkContainerStyle: CSSProperties = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    };

    // Check circle styles
    const checkCircleStyle: CSSProperties = {
      width: '1.5rem',
      height: '1.5rem',
      borderRadius: '50%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    };

    // Check icon styles
    const checkIconStyle: CSSProperties = {
      width: '1rem',
      height: '1rem',
      color: 'white'
    };

    // Title container styles
    const titleContainerStyle: CSSProperties = {
      paddingLeft: '0.5rem',
      paddingRight: '0.5rem'
    };

    // Title text styles
    const titleStyle: CSSProperties = {
      fontWeight: 350,
      fontSize: '12px'
    };

    // Add hover effect with a style tag
    React.useEffect(() => {
      const styleId = 'variant-card-hover-styles';
      if (!document.getElementById(styleId)) {
        const styleElement = document.createElement('style');
        styleElement.id = styleId;
        styleElement.textContent = `
          .variant-card-hover:hover {
            background-color: var(--accent, rgba(0, 0, 0, 0.05));
          }
        `;
        document.head.appendChild(styleElement);
      }
      
      return () => {
        if (document.getElementById(styleId) && document.querySelectorAll('.variant-card-hover').length === 0) {
          document.getElementById(styleId)?.remove();
        }
      };
    }, []);
    
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onSelect(variant);
        }}
        style={buttonStyle}
        className="variant-card-hover"
      >
          <div style={imageContainerStyle}>
              <img 
                key={imgSrc}
                src={imgSrc} 
                style={imageStyle}
                alt={variant.name}
              />
  
              {variant.isSelected && (
                <div style={selectedOverlayStyle}>
                  <div style={checkContainerStyle}>
                    <div style={checkCircleStyle}>
                      <Check style={checkIconStyle}/>
                    </div>
                  </div>
                </div>
              )}
          </div>
  
          <div style={titleContainerStyle}>
              <h4 style={titleStyle}>{variant.name}</h4>
          </div>
      </button>
    )
  },
  // Custom comparison function to determine when to re-render
  (prevProps, nextProps) => {
    // Only re-render if these properties changed
    return (
      prevProps.variant.id === nextProps.variant.id &&
      prevProps.variant.isSelected === nextProps.variant.isSelected &&
      prevProps.index === nextProps.index &&
      prevProps.isMobile === nextProps.isMobile
    );
  });
  