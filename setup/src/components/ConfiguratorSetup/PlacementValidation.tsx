import type { ConfiguratorSetupPlacementKey, ConfiguratorSetupPlacementStatus, ConfiguratorSetupPlacementValidation } from './live-preview';

/** How each placement target is named to a merchant. */
const LABELS: Record<ConfiguratorSetupPlacementKey, string> = {
  gallery: 'configurator area',
  variants: 'option controls',
  price: 'price',
  name: 'product name',
  swatches: 'swatches',
  configureButton: 'configure button',
  headerSelector: 'header',
  desktopCarouselSelector: 'desktop image gallery',
  mobileCarouselSelector: 'mobile image gallery',
  addToCartFormSelector: 'add to basket form',
};

/**
 * Only definite problems are shown. Borderline results (several matches, outside the product area, unconfirmed
 * context) are often fine on real themes, and the technical report confused merchants.
 */
const PROBLEMS: Partial<Record<ConfiguratorSetupPlacementStatus, (label: string, screen: string) => string>> = {
  missing: (label) => `OV25 couldn’t find the ${label} on your product page.`,
  invalid: (label) => `The ${label} placement isn’t a valid setting.`,
  hidden: (label, screen) => `OV25 found where the ${label} should go, but that part of your page is hidden on ${screen}.`,
};

/** Theme targets owned by the host's Global settings; the rest are Settings › Storefront selectors. */
const GLOBAL_TARGETS = new Set<ConfiguratorSetupPlacementKey>(['headerSelector', 'desktopCarouselSelector', 'mobileCarouselSelector', 'addToCartFormSelector']);

/** Plain warnings for placements that are definitely broken on the checked page; nothing when all is well. */
export function PlacementValidation({ report }: { report: ConfiguratorSetupPlacementValidation }) {
  const screen = report.viewport.mode === 'mobile' ? 'mobile' : 'desktop';
  const problems = report.checks.slice(0, 10).flatMap((check) => {
    const describe = PROBLEMS[check.status];
    return describe ? [{ key: check.key, text: describe(LABELS[check.key], screen) }] : [];
  });
  if (!problems.length) return null;
  const places = [
    problems.some((problem) => !GLOBAL_TARGETS.has(problem.key)) && 'Settings › Storefront selectors',
    problems.some((problem) => GLOBAL_TARGETS.has(problem.key)) && 'the Global tab',
  ].filter(Boolean).join(' and ');
  return <div role="status" className="mt-2 space-y-1 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs leading-relaxed text-amber-900" data-ov25-placement-validation>
    {problems.map((problem) => <p key={problem.key}>{problem.text}</p>)}
    <p>Check {places}.</p>
  </div>;
}
