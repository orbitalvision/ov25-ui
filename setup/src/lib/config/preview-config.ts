export type LayoutType = 'standard' | 'snap2' | 'bedConfigurator';
export type PreviewLayoutType = LayoutType;

export const PREVIEW_PRODUCT_LINKS: Record<LayoutType, string> = {
  standard: '58',
  snap2: 'snap2/292',
  bedConfigurator: 'bed-configurator/2',
};

export const DEFAULT_PREVIEW_API_KEY =
  '15-5f9c5d4197f8b45ee615ac2476e8354a160f384f01c72cd7f2638f41e164c21d';

export const SNAP2_PREVIEW_STARTING_CONFIG_UUID =
  'e7c2e5a0-1234-5678-9abc-def012345678';
