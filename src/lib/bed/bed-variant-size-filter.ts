import type { BedPartSizeFilterFlags } from '../../types/inject-config.js';

export type BedConfiguratorPartKind = 'headboard' | 'base' | 'mattress';

/**
 * Merged bed menu options use names like `Headboard Range`, `Base …`, `Mattress …`
 * (see OV25 `bedPartLabel` + option name).
 */
export function inferBedPartFromOptionName(optionName: string): BedConfiguratorPartKind | null {
  const t = optionName.trim();
  if (/^headboard\b/i.test(t)) return 'headboard';
  if (/^mattress\b/i.test(t)) return 'mattress';
  if (/^base\b/i.test(t)) return 'base';
  return null;
}

function normalizeBedSizeLabel(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Aligns with OV25 `bedSizesMatch` for iframe `metadata.bedSize` vs `CURRENT_BED_SIZE`. */
export function bedSizesMatchDisplay(a: string, b: string): boolean {
  return normalizeBedSizeLabel(a) === normalizeBedSizeLabel(b);
}

function bedSizeFromSelectionMeta(selection: {
  name?: string | null;
  metadata?: { bedSize?: string } | null;
}): string | undefined {
  const v = selection?.metadata?.bedSize?.trim();
  return v || undefined;
}

/**
 * When filtering is on for this bed part and a current size is known, drop selections whose
 * `metadata.bedSize` does not match. Selections without bed size, and synthetic “None”, stay visible.
 */
export function selectionVisibleForBedSizeFilter(args: {
  selection: { name?: string | null; metadata?: { bedSize?: string } | null };
  optionDisplayName: string;
  currentBedSize: string | null;
  flags: BedPartSizeFilterFlags;
}): boolean {
  const part = inferBedPartFromOptionName(args.optionDisplayName);
  if (!part) return true;
  if (!args.flags[part]) return true;
  if (!args.currentBedSize) return true;

  const n = args.selection.name?.trim().toLowerCase();
  if (n === 'none') return true;

  const selBed = bedSizeFromSelectionMeta(args.selection);
  if (!selBed) return true;
  if (selBed.trim().toLowerCase() === 'none') return true;

  return bedSizesMatchDisplay(selBed, args.currentBedSize);
}
