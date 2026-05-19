import React from 'react';
import { useDiningUI, type DiningStep } from '../../contexts/dining-ui-context.js';

const STEP_LABELS: Record<DiningStep, string> = {
  style: 'Style',
  table: 'Table',
  chairs: 'Seating',
  review: 'Review',
};

const iconStroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

const iconSvgStyle: React.CSSProperties = { width: '100%', height: '100%', display: 'block' };

const StyleStepIcon: React.FC = () => (
  <svg viewBox="0 0 32 32" aria-hidden="true" style={iconSvgStyle}>
    <circle cx="16" cy="16" r="7" {...iconStroke} />
    <rect x="4.6" y="3.8" width="5.6" height="8" rx="1.6" transform="rotate(-42 7.4 7.8)" {...iconStroke} />
    <rect x="21.8" y="3.8" width="5.6" height="8" rx="1.6" transform="rotate(42 24.6 7.8)" {...iconStroke} />
    <rect x="4.6" y="20.2" width="5.6" height="8" rx="1.6" transform="rotate(42 7.4 24.2)" {...iconStroke} />
    <rect x="21.8" y="20.2" width="5.6" height="8" rx="1.6" transform="rotate(-42 24.6 24.2)" {...iconStroke} />
  </svg>
);

const TableStepIcon: React.FC = () => (
  <svg viewBox="0 0 32 32" aria-hidden="true" style={iconSvgStyle}>
    <path d="M8.2 13.5h15.6l-2.6-4.3H10.8l-2.6 4.3Z" {...iconStroke} />
    <path d="M8.2 13.5h15.6v3.2H8.2v-3.2Z" {...iconStroke} />
    <path d="M10.8 16.7v7.6M13.8 16.7v7.6M18.2 16.7v7.6M21.2 16.7v7.6" {...iconStroke} />
  </svg>
);

const SeatingStepIcon: React.FC = () => (
  <svg viewBox="0 0 32 32" aria-hidden="true" style={iconSvgStyle}>
    <path d="M10.2 5.8c3.7-.9 7.9-.9 11.6 0l-.7 12.1H10.9L10.2 5.8Z" {...iconStroke} />
    <path d="M10.8 9.4h10.4M11.2 13.4h9.6" {...iconStroke} />
    <path d="M9.2 17.9h13.6v3.6H9.2z" {...iconStroke} />
    <path d="M10.7 21.5v5.1M21.3 21.5v5.1" {...iconStroke} />
  </svg>
);

const ReviewStepIcon: React.FC = () => (
  <svg viewBox="0 0 32 32" aria-hidden="true" style={iconSvgStyle}>
    <circle cx="16" cy="16" r="12" {...iconStroke} />
    <path d="m9.8 16.8 4.1 4.1 8.8-9.8" {...iconStroke} />
  </svg>
);

const STEP_ICONS: Record<DiningStep, React.FC> = {
  style: StyleStepIcon,
  table: TableStepIcon,
  chairs: SeatingStepIcon,
  review: ReviewStepIcon,
};

/**
 * Progress stepper for the dining set builder flow.
 * Uses OV25 CSS variables for active/completed/inactive states.
 */
export const DiningStepper: React.FC = () => {
  const { steps, activeStep, setActiveStep, selectedTableItem, sideAssignments, isMobile } = useDiningUI();
  const activeIndex = steps.indexOf(activeStep);

  const isStepComplete = (step: DiningStep): boolean => {
    switch (step) {
      case 'table':
        return selectedTableItem != null;
      case 'chairs':
        return Object.keys(sideAssignments).length > 0;
      case 'style':
        return activeIndex > steps.indexOf('style');
      case 'review':
        return false;
      default:
        return false;
    }
  };

  const canNavigateTo = (step: DiningStep): boolean => {
    const idx = steps.indexOf(step);
    // Can always go back; can only go forward if current/previous step is complete
    if (idx <= activeIndex) return true;
    // Check all prior steps are complete
    for (let i = 0; i < idx; i++) {
      if (!isStepComplete(steps[i])) return false;
    }
    return true;
  };

  return (
    <div
      data-ov25-dining-stepper
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0',
        width: '100%',
        minHeight: isMobile ? 44 : 64,
        borderRadius: 'var(--ov25-dining-stepper-border-radius, 10px)',
        border: '1px solid var(--ov25-border-color, #d9d9d9)',
        backgroundColor: 'var(--ov25-background-color, #fff)',
        overflow: 'hidden',
      }}
    >
      {steps.map((step, index) => {
        const isActive = step === activeStep;
        const isCompleted = isStepComplete(step);
        const clickable = canNavigateTo(step);
        const Icon = STEP_ICONS[step];

        return (
          <button
            key={step}
            data-ov25-dining-step
            data-state={isActive ? 'active' : isCompleted ? 'completed' : 'inactive'}
            aria-current={isActive ? 'step' : undefined}
            onClick={() => clickable && setActiveStep(step)}
            disabled={!clickable}
            style={{
              flex: '1 1 0',
              alignSelf: 'stretch',
              minWidth: 0,
              minHeight: isMobile ? 44 : 64,
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: isMobile ? 2 : 5,
              padding: isMobile ? '6px 8px' : '9px 14px',
              border: 'none',
              borderRight: index < steps.length - 1 ? '1px solid var(--ov25-border-color, #d9d9d9)' : 'none',
              backgroundColor: isActive
                ? 'var(--ov25-cta-color, #008f6b)'
                : 'transparent',
              color: isActive
                ? 'var(--ov25-cta-text-color, #ffffff)'
                : 'var(--ov25-text-color, #2a2a2a)',
              cursor: clickable ? 'pointer' : 'default',
              opacity: clickable ? 1 : 0.5,
              fontFamily: 'var(--ov25-font-family, "IBM Plex Sans", sans-serif)',
              fontSize: isMobile ? '10px' : '12px',
              fontWeight: isActive ? 700 : 500,
              lineHeight: 1.05,
              transition: 'background-color 160ms cubic-bezier(0.23, 1, 0.32, 1), color 160ms ease, opacity 160ms ease',
            }}
          >
            <span
              style={{
                width: isMobile ? 18 : 25,
                height: isMobile ? 18 : 25,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon />
            </span>
            <span
              style={{
                display: 'block',
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {STEP_LABELS[step]}
            </span>
          </button>
        );
      })}
    </div>
  );
};
