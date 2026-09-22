/**
 * Auto cutouts — live angle thumbnails in the product gallery.
 *
 * With the feature on, the iframe URL carries `cutoutAngles`/`cutoutSize`, and the configurator
 * posts a complete `CUTOUT_THUMBNAILS` set (transferred `ImageBitmap`s, no JSON payload) every
 * time the shopper's configuration settles. We convert each bitmap to an object URL and prepend
 * the resulting tiles to the gallery, so the carousel always shows the build in front of the
 * shopper rather than catalogue photography.
 *
 * The angles and their order are fixed on purpose: this mirrors the Darlings of Chelsea gallery
 * (material shot first, then front-left, front, left-side, rear), which is the reference
 * implementation the feature was modelled on. Integrators get a toggle, not a dial.
 */

/** Absolute yaw degrees. 0 faces the front, negative walks left, 180 is the back. */
export const AUTO_CUTOUT_ANGLES = [-45, 0, -90, 180] as const;

export type AutoCutoutAngle = (typeof AUTO_CUTOUT_ANGLES)[number];

/** Square px per render. The configurator clamps to 150–550. */
export const AUTO_CUTOUT_SIZE = 320;

export const AUTO_CUTOUT_ANGLES_QUERY_KEY = 'cutoutAngles';
export const AUTO_CUTOUT_SIZE_QUERY_KEY = 'cutoutSize';

export const AUTO_CUTOUT_THUMBNAILS_MESSAGE = 'CUTOUT_THUMBNAILS';

/**
 * Swings the live viewer to a captured angle. `yawDeg: null` hands control back: free orbit is
 * restored and the camera returns to wherever the shopper had left it.
 */
export const AUTO_CUTOUT_SELECT_ANGLE_MESSAGE = 'SELECT_CUTOUT_ANGLE';

export interface AutoCutoutThumbnail {
  /** Object URL — the caller owns it and must revoke it when replacing the set. */
  imageUrl: string;
  yaw: AutoCutoutAngle;
}

export function isAutoCutoutAngle(value: unknown): value is AutoCutoutAngle {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    (AUTO_CUTOUT_ANGLES as readonly number[]).includes(value)
  );
}

/**
 * Copy an `ImageBitmap` into an object URL and close it. The bitmaps are transferred to this
 * page, so leaving them open leaks GPU-backed memory with every option the shopper tries.
 */
export async function imageBitmapToObjectUrl(bitmap: ImageBitmap): Promise<string | null> {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext('2d');
    if (!context) return null;
    context.drawImage(bitmap, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/png'),
    );
    return blob ? URL.createObjectURL(blob) : null;
  } catch (error) {
    console.warn('[ov25-ui] could not prepare auto cutout thumbnail', error);
    return null;
  } finally {
    try {
      bitmap.close();
    } catch {
      // Already closed, or closing is unsupported — nothing to release.
    }
  }
}

interface MaterialSelectionState {
  options?: Array<{
    id: string;
    name: string;
    groups: Array<{ id: string; selections: Array<{ id: string; thumbnail?: string | null }> }>;
  }>;
  selectedSelections?: Array<{ optionId: string; groupId?: string; selectionId: string }>;
}

/**
 * The shopper's current material, used for the gallery's material shot. Matches the first
 * fabric/material-named option, which is the same rule the reference gallery uses — products
 * without one simply get no material tile.
 */
export function materialThumbnailFromConfiguratorState(
  state: MaterialSelectionState | null | undefined,
): string | null {
  const options = state?.options;
  const selectedSelections = state?.selectedSelections;
  if (!Array.isArray(options) || !Array.isArray(selectedSelections)) return null;

  const materialOption = options.find((option) => /fabric|material/i.test(option?.name ?? ''));
  if (!materialOption) return null;

  const selected = selectedSelections.find(
    (selection) => String(selection.optionId) === String(materialOption.id),
  );
  if (!selected) return null;

  const groups = Array.isArray(materialOption.groups) ? materialOption.groups : [];
  const group =
    groups.find((candidate) => String(candidate.id) === String(selected.groupId)) ?? null;
  const searchIn = group ? [group] : groups;
  for (const candidate of searchIn) {
    const match = (candidate.selections || []).find(
      (selection) => String(selection.id) === String(selected.selectionId),
    );
    if (match?.thumbnail) return match.thumbnail;
  }
  return null;
}

/**
 * Lets a gallery tile be recognised as a cutout and resolved back to the angle it was rendered at.
 */
export function autoCutoutAngleByImageUrl(
  cutouts: readonly AutoCutoutThumbnail[],
): Map<string, AutoCutoutAngle> {
  return new Map(cutouts.map(({ imageUrl, yaw }) => [imageUrl, yaw]));
}

/**
 * The gallery tiles contributed by auto cutouts, in the reference gallery's order: the material
 * shot first, then the cutouts at {@link AUTO_CUTOUT_ANGLES}. Cutouts are only included once the
 * complete set has arrived, so the strip never shows a half-rendered product.
 */
export function composeAutoCutoutGalleryImages(options: {
  enabled: boolean;
  materialThumbnail: string | null;
  cutouts: readonly AutoCutoutThumbnail[];
}): string[] {
  if (!options.enabled) return [];
  const ordered = AUTO_CUTOUT_ANGLES.map(
    (yaw) => options.cutouts.find((cutout) => cutout.yaw === yaw)?.imageUrl ?? null,
  );
  const complete = ordered.every((url): url is string => url !== null);
  return [
    ...(options.materialThumbnail ? [options.materialThumbnail] : []),
    ...(complete ? (ordered as string[]) : []),
  ];
}
