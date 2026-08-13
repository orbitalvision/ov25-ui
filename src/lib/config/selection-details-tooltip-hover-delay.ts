/**
 * CSS custom property read from a desktop selection-details trigger before
 * scheduling its tooltip. It belongs in `branding.cssString`, for example:
 *
 * :host { --ov25-selection-details-tooltip-hover-delay: 300ms; }
 */
export const SELECTION_DETAILS_TOOLTIP_HOVER_DELAY_CSS_VARIABLE =
  '--ov25-selection-details-tooltip-hover-delay';

export const DEFAULT_SELECTION_DETAILS_TOOLTIP_HOVER_DELAY_MS = 250;
export const MAX_SELECTION_DETAILS_TOOLTIP_HOVER_DELAY_MS = 5_000;

/**
 * Converts the CSS variable's time value to milliseconds. Bare numbers are
 * treated as milliseconds for convenience; `ms` and `s` are both supported.
 * Invalid values retain the default, while valid extreme values are bounded
 * so a typo cannot leave a tooltip pending indefinitely.
 */
export function parseSelectionDetailsTooltipHoverDelay(
  value: string | null | undefined,
): number {
  const match = value?.trim().match(/^([+-]?(?:\d+(?:\.\d+)?|\.\d+))(ms|s)?$/i);
  if (!match) return DEFAULT_SELECTION_DETAILS_TOOLTIP_HOVER_DELAY_MS;

  const numericValue = Number(match[1]);
  if (!Number.isFinite(numericValue)) return DEFAULT_SELECTION_DETAILS_TOOLTIP_HOVER_DELAY_MS;

  const milliseconds = match[2]?.toLowerCase() === 's'
    ? numericValue * 1_000
    : numericValue;
  return Math.min(
    MAX_SELECTION_DETAILS_TOOLTIP_HOVER_DELAY_MS,
    Math.max(0, milliseconds),
  );
}

export function selectionDetailsTooltipHoverDelayFor(element: HTMLElement): number {
  return parseSelectionDetailsTooltipHoverDelay(
    window.getComputedStyle(element).getPropertyValue(
      SELECTION_DETAILS_TOOLTIP_HOVER_DELAY_CSS_VARIABLE,
    ),
  );
}
