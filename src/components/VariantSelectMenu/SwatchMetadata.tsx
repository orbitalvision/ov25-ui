import React from 'react';
import type {
  Swatch,
  SwatchParameter,
} from '../../contexts/ov25-ui-context.js';

export type SwatchMetadataRow = {
  id: string;
  label: string;
  value: string;
};

type GetString = (
  key: string,
  vars?: Record<string, string | number | null | undefined>,
  fallback?: string,
) => string;

function nonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
}

/**
 * Only fields configured by the retailer are shown from metadata. The material
 * rows are deliberately limited to Range and Supplier; the remaining material
 * data is used internally for assets/search rather than customer copy.
 */
export function getSwatchMetadataRows(
  swatch: Swatch | null | undefined,
  parameters: SwatchParameter[] | null | undefined,
  getString: GetString,
): SwatchMetadataRow[] {
  if (!swatch) return [];

  const rows: SwatchMetadataRow[] = [];
  const range = nonEmptyString(swatch.material?.range);
  const supplier = nonEmptyString(swatch.material?.supplier);

  if (range) {
    rows.push({
      id: 'material-range',
      label: getString('swatchMetadataRange', undefined, 'Range'),
      value: range,
    });
  }
  if (supplier) {
    rows.push({
      id: 'material-supplier',
      label: getString('swatchMetadataSupplier', undefined, 'Supplier'),
      value: supplier,
    });
  }

  for (const parameter of parameters ?? []) {
    const id = nonEmptyString(parameter.id);
    const label = nonEmptyString(parameter.label);
    const value = id ? nonEmptyString(swatch.metadata?.[id]) : null;
    if (!id || !label || !value) continue;
    rows.push({ id: `parameter-${id}`, label, value });
  }

  return rows;
}

interface SwatchMetadataProps {
  swatch: Swatch | null | undefined;
  parameters: SwatchParameter[] | null | undefined;
  getString: GetString;
  /** e.g. `ov25-selection-details` or `ov25-selected-swatch`. */
  classPrefix: string;
  className?: string;
}

export function SwatchMetadata({
  swatch,
  parameters,
  getString,
  classPrefix,
  className,
}: SwatchMetadataProps) {
  const rows = getSwatchMetadataRows(swatch, parameters, getString);
  if (rows.length === 0) return null;

  return (
    <dl className={`${classPrefix}-metadata ${className ?? ''}`.trim()}>
      {rows.map((row) => (
        <div
          key={row.id}
          className={`${classPrefix}-metadata-row ${classPrefix}-metadata-row-${row.id}`}
        >
          <dt className={`${classPrefix}-metadata-label`}>{row.label}</dt>
          <dd className={`${classPrefix}-metadata-value`}>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
