import { useId, useState } from 'react';
import { Button } from '../ui/button';
import type { TypeSettings } from './types';
import type { StorefrontIntegrationConfig } from './storefront-integration';
import { getAvailableSelectorDiscoveryTargets, getSelectorDiscoveryCurrentValue, SELECTOR_DISCOVERY_TARGETS, type ConfiguratorSetupSelectorDiscovery, type SelectorDiscoveryKey, type SelectorDiscoveryProposal } from './selector-discovery';
import './selector-discovery.css';

export interface SelectorPlacementReviewProps {
  proposal: SelectorDiscoveryProposal;
  settings: TypeSettings;
  integration?: StorefrontIntegrationConfig;
  savedSettings: ConfiguratorSetupSelectorDiscovery['savedSettings'];
  scopeLabel?: string;
  /** Choices staged by the parent, including automatic high-confidence choices on a fresh setup. */
  includedTargets?: readonly SelectorDiscoveryKey[];
  onApply: (proposal: SelectorDiscoveryProposal) => void;
}

/** Suggestions remain optional and tucked away beside the main theme palette. */
export function SelectorPlacementReview(props: SelectorPlacementReviewProps) {
  // A new analysis resets choices without overwriting user choices when the host rerenders.
  return <PlacementReviewContent key={JSON.stringify(props.proposal)} {...props} />;
}

function PlacementReviewContent({ proposal, settings, integration, savedSettings, scopeLabel, includedTargets, onApply }: SelectorPlacementReviewProps) {
  const id = useId();
  const [selected, setSelected] = useState<Set<SelectorDiscoveryKey>>(() => new Set(includedTargets ?? proposal.targets.filter((target) => target.confidence === 'high').map((target) => target.key)));
  const [locallyIncluded, setLocallyIncluded] = useState<readonly SelectorDiscoveryKey[]>([]);
  const targets = getAvailableSelectorDiscoveryTargets(proposal, settings, integration);
  if (!targets.length) return null;
  const selectedTargets = targets.filter((target) => selected.has(target.key));
  const included = new Set(includedTargets ?? locallyIncluded);
  const selectionChanged = targets.some((target) => selected.has(target.key) !== included.has(target.key));
  const includedCount = targets.filter((target) => included.has(target.key)).length;
  const apply = () => {
    if (!selectionChanged) return;
    onApply({ ...proposal, targets: selectedTargets });
    setLocallyIncluded(selectedTargets.map((target) => target.key));
  };
  return <details className="ov25-selector-review">
    <summary><span>Page placements</span><span>{targets.length} suggestion{targets.length === 1 ? '' : 's'} to review</span></summary>
    <div className="ov25-selector-review-content">
      <p>Choose where your configurator connects to the product page. Included placements update your draft when you apply the palette.</p>
      <p className="ov25-selector-review-provenance">{proposal.method === 'source' ? 'Source-only analysis · Not AI generated.' : 'AI suggestions from your local theme.'} These selectors have not been validated on your rendered site.</p>
      {savedSettings !== 'none' && <p className="ov25-selector-review-warning" role="note">Existing placements may be used by other product pages, layouts or older themes. Storefront settings can apply globally{scopeLabel ? ` (${scopeLabel})` : ''}. Review every change before applying. Your live site changes only when you save.</p>}
      {proposal.warnings.length > 0 && <details className="ov25-selector-review-source"><summary>Source notes</summary><ul className="ov25-selector-review-warnings">{proposal.warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul></details>}
      <ul className="ov25-selector-review-targets" aria-label="Suggested page placements">
        {targets.map((target) => {
          const definition = SELECTOR_DISCOVERY_TARGETS[target.key];
          const current = getSelectorDiscoveryCurrentValue(target.key, settings, integration);
          return <li key={target.key}>
            <label className="ov25-selector-review-choice" htmlFor={`${id}-${target.key}`}>
              <input type="checkbox" id={`${id}-${target.key}`} checked={selected.has(target.key)} onChange={(event) => {
                const checked = event.currentTarget.checked;
                setSelected((previous) => { const next = new Set(previous); if (checked) next.add(target.key); else next.delete(target.key); return next; });
              }} />
              <span><strong>{definition.label}</strong><span>{definition.role}</span></span>
              <span className={`ov25-selector-confidence ov25-selector-confidence-${target.confidence}`}>{target.confidence} confidence</span>
            </label>
            <p className="ov25-selector-review-reason">{target.reason}</p>
            <details className="ov25-selector-review-technical"><summary>Selector details</summary>
              <dl><div><dt>Current</dt><dd><code>{current || 'Not set'}</code></dd></div><div><dt>Suggested</dt><dd><code>{target.selector}</code></dd></div></dl>
              <p>Found in {target.sourceFiles.join(', ')}</p>
            </details>
          </li>;
        })}
      </ul>
      <div className="ov25-selector-review-actions"><Button variant="outline" disabled={!selectionChanged} onClick={apply}>{selectedTargets.length ? `Include selected placements (${selectedTargets.length})` : 'Remove included placements'}</Button><span role={includedCount ? 'status' : undefined}>{includedCount ? `${includedCount} placement${includedCount === 1 ? '' : 's'} included. ` : ''}Included when you apply the palette. No settings have been saved.</span></div>
    </div>
  </details>;
}
