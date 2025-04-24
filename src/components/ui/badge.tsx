import * as React from "react"
import { CSSProperties } from "react"
import { cn } from "../../utils/cn.js"

// Define variant types
export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

function Badge({ className, variant = 'default', style, ...props }: BadgeProps) {
  // Base styles for all badges
  const baseStyles: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: '0.375rem',
    borderWidth: '1px',
    borderStyle: 'solid',
    paddingLeft: '0.625rem',
    paddingRight: '0.625rem',
    paddingTop: '0.125rem',
    paddingBottom: '0.125rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    transition: 'color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease',
    ...style
  };

  // Variant-specific styles
  const variantStyles: Record<BadgeVariant, CSSProperties> = {
    default: {
      borderColor: 'transparent',
      backgroundColor: 'var(--primary, #000)',
      color: 'var(--primary-foreground, #fff)',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
    },
    secondary: {
      borderColor: 'transparent',
      backgroundColor: 'var(--secondary, #f1f5f9)',
      color: 'var(--secondary-foreground, #0f172a)'
    },
    destructive: {
      borderColor: 'transparent',
      backgroundColor: 'var(--destructive, #ef4444)',
      color: 'var(--destructive-foreground, #fff)',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
    },
    outline: {
      borderColor: 'currentColor',
      color: 'var(--foreground, #0f172a)'
    }
  };

  // Combine base and variant styles
  const combinedStyles = {
    ...baseStyles,
    ...variantStyles[variant]
  };

  // Add CSS for hover and focus states
  React.useEffect(() => {
    const styleId = 'badge-hover-focus-styles';
    if (!document.getElementById(styleId)) {
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = `
        .badge-component:focus {
          outline: none;
          box-shadow: 0 0 0 2px var(--background, #fff), 0 0 0 4px var(--ring, #2563eb);
        }
        .badge-default:hover {
          background-color: color-mix(in srgb, var(--primary, #000) 80%, transparent);
        }
        .badge-secondary:hover {
          background-color: color-mix(in srgb, var(--secondary, #f1f5f9) 80%, transparent);
        }
        .badge-destructive:hover {
          background-color: color-mix(in srgb, var(--destructive, #ef4444) 80%, transparent);
        }
      `;
      document.head.appendChild(styleElement);
    }
    
    return () => {
      if (document.getElementById(styleId) && document.querySelectorAll('.badge-component').length === 0) {
        document.getElementById(styleId)?.remove();
      }
    };
  }, []);

  const badgeClass = `badge-component badge-${variant}`;

  return (
    <div 
      className={cn(badgeClass, className)} 
      style={combinedStyles} 
      {...props} 
    />
  )
}

export { Badge }
