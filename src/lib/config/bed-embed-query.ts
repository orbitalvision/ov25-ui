/** Matches OV25 `BED_ALLOW_NONE_QUERY_PARAM` (`bedAllowNone`). */
export const BED_IFRAME_ALLOW_NONE_QUERY_KEY = 'bedAllowNone';

export type BedAllowNonePartsInput = {
  headboard: boolean;
  base: boolean;
  mattress: boolean;
};

/**
 * OV25 allow-list: comma-separated parts that may use “None”. Omitted param = all may use None.
 * @returns `undefined` when all three allow none (no query needed).
 */
export function serializeBedAllowNoneQueryValue(parts: BedAllowNonePartsInput): string | undefined {
  if (parts.headboard && parts.base && parts.mattress) {
    return undefined;
  }
  const allowed: string[] = [];
  if (parts.headboard) allowed.push('headboard');
  if (parts.base) allowed.push('base');
  if (parts.mattress) allowed.push('mattress');
  if (allowed.length === 0) {
    return 'none';
  }
  return allowed.join(',');
}
