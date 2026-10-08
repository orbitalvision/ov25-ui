import type { ConfiguratorSetupPlacementIssue, ConfiguratorSetupPlacementKey, ConfiguratorSetupPlacementStatus, ConfiguratorSetupPlacementValidation } from './live-preview';

const LABELS: Record<ConfiguratorSetupPlacementKey, string> = {
  gallery: 'Configurator container',
  variants: 'Variant controls',
  price: 'Price',
  name: 'Product name',
  swatches: 'Swatches',
  configureButton: 'Configure button',
  headerSelector: 'Header',
  desktopCarouselSelector: 'Desktop gallery',
  mobileCarouselSelector: 'Mobile gallery',
  addToCartFormSelector: 'Add to cart form',
};

const STATUS_LABELS: Record<ConfiguratorSetupPlacementStatus, string> = {
  matched: 'Matched', missing: 'Missing', ambiguous: 'Multiple matches', hidden: 'Hidden',
  unsafe: 'Needs review', invalid: 'Invalid selector', unverified: 'Not verified', 'not-required': 'Not required',
};

const ISSUE_LABELS: Record<ConfiguratorSetupPlacementIssue, string> = {
  'missing-selector': 'No selector is configured for this target.',
  'no-match': 'No element matches this selector.',
  'multiple-matches': 'The configurator uses the first match. Check that it is the intended element.',
  'not-visible': 'The first match is hidden in this viewport.',
  'invalid-selector': 'This is not a valid CSS selector.',
  'outside-product': 'The first match is outside the main product area.',
  'unknown-product-scope': 'The main product area could not be confirmed.',
  'overlapping-targets': 'This target overlaps another configurator target.',
  'unsafe-target': 'Replacing this element could remove other page content.',
  disabled: 'This target is disabled in this draft.',
  'not-configured': 'This optional target is not configured.',
  'viewport-inactive': 'This target is not used in this viewport.',
  'template-mismatch': 'The page uses a different product template from the preview target.',
  'context-unverified': 'The storefront theme or template could not be confirmed.',
};

export function PlacementValidation({ report }: { report: ConfiguratorSetupPlacementValidation }) {
  const checks = report.checks.slice(0, 10);
  const matched = checks.filter((check) => check.status === 'matched').length;
  const warnings = checks.filter((check) => check.status !== 'matched' && check.status !== 'not-required').length;
  const mode = report.viewport.mode === 'mobile' ? 'Mobile' : 'Desktop';
  const summary = warnings ? `${matched} matched, ${warnings} ${warnings === 1 ? 'needs' : 'need'} review` : matched ? `${matched} matched` : 'No active targets';
  return <details className="mt-3 rounded-md border text-xs" data-ov25-placement-validation>
    <summary className="cursor-pointer p-2 font-medium">Page placement · {summary}</summary>
    <div className="max-h-64 space-y-3 overflow-auto border-t p-2">
      <div className="space-y-1 text-muted-foreground">
        <p>{mode} · {report.viewport.width} × {report.viewport.height}</p>
        <p>Theme {report.themeId?.slice(0, 64) ?? 'unknown'} · {report.template?.slice(0, 160) ?? 'Template unknown'}</p>
        <p>Checked this {mode.toLowerCase()} viewport before the configurator opened. Check {mode === 'Mobile' ? 'desktop' : 'mobile'} separately.</p>
      </div>
      <ul className="space-y-3" aria-label="Page placement results">
        {checks.map((check) => <li key={check.key} className="space-y-1">
          <div className="flex justify-between gap-2"><span className="font-medium">{LABELS[check.key]}</span><span className={check.status === 'matched' || check.status === 'not-required' ? 'text-muted-foreground' : 'text-amber-700'}>{STATUS_LABELS[check.status]}</span></div>
          {check.selector && <code className="block break-all text-[11px]">{check.selector.slice(0, 2048)}</code>}
          {check.status !== 'not-required' && <p className="text-muted-foreground">{check.matchCount >= 101 ? '101+' : check.matchCount} {check.matchCount === 1 ? 'match' : 'matches'}</p>}
          {check.issues.slice(0, 14).map((issue) => <p key={issue} className="text-muted-foreground">{ISSUE_LABELS[issue]}</p>)}
        </li>)}
      </ul>
    </div>
  </details>;
}
