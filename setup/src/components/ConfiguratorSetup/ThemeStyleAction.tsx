import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Check, Palette } from 'lucide-react';
import { Spinner } from '../ui/spinner';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { PreviewLayoutType, TypeSettings } from './types';
import { DEFAULT_TYPE_SETTINGS } from './types';
import type { StorefrontIntegrationConfig } from './storefront-integration';
import { getAvailableSelectorDiscoveryTargets, getSelectorDiscoveryCurrentValue, isSelectorDiscoveryLayoutKey, type SelectorDiscoveryProposal } from './selector-discovery';
import type { ConfiguratorSetupCompatibility } from './compatibility';
import { THEME_SELECTORS_FEATURE } from './theme-selector-overrides';
import { compatibleThemeStyleProposal, ensureOverlayThemeContrast, validateThemeStyleProposal, type ConfiguratorSetupThemeStyling, type ThemeStyleProposal } from './theme-style';
import './theme-style-step.css';

/**
 * Match my site. The suggested styling is applied straight to the unsaved draft (no palette
 * review); the site preview is where the result is checked, and `onUndo` reverts it.
 * Guided hosts pass `actions`/`themeAction` and get the three-step layout.
 *
 * Guided setup matches automatically: with `autoMatch` the match runs by itself once the theme details are ready
 * (the host sets it each time the store arrives at the step, and `onAutoMatchEnd` tells it the match finished), and
 * there's no Match my site item, only a note if matching failed. An automatic match can't open a preview tab
 * (browsers only allow that from a click), so the host fills one only if an earlier click prepared it.
 *
 * `previewFirst` (guided, until the store has opened the preview): the three steps stay visible as a roadmap, but only
 * the preview buttons are shown; the other actions are hidden (kept mounted, as hosts portal into their containers).
 */
export function ThemeStyleAction({ config, layout, settings, integration, compatibility, matchedLabel, onApply, onContinue, onBack, actions, themeAction, previewProduct, onUndo, onMatchStart, onMatchEnd, storefrontTools, inlineStorefrontTools, onActionsContainer, onFinalCheckContainer, autoMatch, onAutoMatchEnd, previewFirst }: {
  autoMatch?: boolean;
  previewFirst?: boolean;
  onAutoMatchEnd?: () => void;
  storefrontTools?: ReactNode;
  inlineStorefrontTools?: boolean;
  onActionsContainer?: (element: HTMLDivElement | null) => void;
  onFinalCheckContainer?: (element: HTMLDivElement | null) => void;
  config: ConfiguratorSetupThemeStyling;
  layout: PreviewLayoutType;
  settings: TypeSettings;
  integration?: StorefrontIntegrationConfig;
  compatibility?: ConfiguratorSetupCompatibility;
  matchedLabel?: string;
  /** `themePlacement`: placement suggestions for a non-live theme, applied as that theme's overrides. */
  onApply: (proposal: ThemeStyleProposal, options?: { themePlacement?: { themeId: string; placement: SelectorDiscoveryProposal } }) => void;
  onContinue: () => void;
  onBack?: () => void;
  /** Guided: Advanced setup (and the save controls) for the last step. */
  actions?: ReactNode;
  /** Guided: the site preview button. */
  themeAction?: ReactNode;
  /** Host control naming the product the preview opens on, with a way to change it (preview only). */
  previewProduct?: ReactNode;
  onUndo?: () => void;
  /** Called synchronously from the Match my site click, e.g. to open the preview tab before popup blockers apply. */
  onMatchStart?: () => void;
  /** `applied` is false when the match failed, was cancelled or had nothing to apply; `automatic` when it ran by itself. */
  onMatchEnd?: (applied: boolean, automatic: boolean) => void;
}) {
  const id = useId();
  const guided = !!actions;
  const [pending, setPending] = useState(false);
  const [automatic, setAutomatic] = useState(false);
  const [error, setError] = useState<string>();
  const requestRef = useRef<AbortController | undefined>(undefined);
  const draftKey = JSON.stringify(settings);
  const compatibilityKey = JSON.stringify(compatibility);
  const placementKey = JSON.stringify({ policy: config.placement, integration: integration && { ...integration, onChange: undefined } });
  useEffect(() => {
    requestRef.current?.abort();
    requestRef.current = undefined;
    setPending(false);
    setError(undefined);
    return () => requestRef.current?.abort();
  }, [draftKey, compatibilityKey, placementKey, config.contextKey, layout]);

  const request = async (auto = false) => {
    if (requestRef.current || config.disabled) return;
    const controller = new AbortController();
    requestRef.current = controller;
    setPending(true);
    setAutomatic(auto);
    setError(undefined);
    // Only a click can open the preview tab.
    if (!auto) onMatchStart?.();
    let applied = false;
    try {
      const result = await config.onRequest({ activeLayout: layout, signal: controller.signal });
      if (controller.signal.aborted) return;
      const next = ensureOverlayThemeContrast(compatibleThemeStyleProposal(validateThemeStyleProposal(result), compatibility), settings.style);
      if (!Object.keys(next.style).length && !next.fonts?.length) {
        setError('Your theme’s styling couldn’t be matched with your installed configurator. You can choose colours in Advanced setup.');
        return;
      }
      let placementToInclude: SelectorDiscoveryProposal | undefined;
      if (next.placement && config.placement?.savedSettings === 'none') {
        const targets = getAvailableSelectorDiscoveryTargets(next.placement, settings, integration).filter((target) => {
          // Our enabled app blocks have stable mount contracts, but remain medium confidence
          // until rendered; on a new setup include their deterministic suggestions in the draft.
          const knownBlocks: Record<string, [string, string]> = {
            variants: ['#ov25-configurator-controls-container', 'controls'], price: ['#ov25-configurator-price-container', 'price'],
            name: ['#ov25-configurator-name-container', 'name'], swatches: ['#ov25-swatches-container', 'swatches'],
          };
          const block = knownBlocks[target.key];
          const knownBlock = block && block[0] === target.selector &&
            target.reason.startsWith(`Enabled ov25_configurator_${block[1]} declaration uses the known OV25 block selector.`);
          if (target.confidence !== 'high' && !knownBlock) return false;
          const current = getSelectorDiscoveryCurrentValue(target.key, settings, integration);
          // A server-confirmed new installation may still have a manually edited local draft.
          // Only seed untouched defaults/empty fields; preserve those draft edits too.
          const defaults = DEFAULT_TYPE_SETTINGS[layout].selectors;
          return isSelectorDiscoveryLayoutKey(target.key)
            ? current === defaults[target.key].selector
            : current === '' && config.placement?.untouchedIntegrationKeys?.includes(target.key);
        });
        if (targets.length) placementToInclude = { ...next.placement, targets };
      }
      // A theme that isn't live can take every layout placement suggestion as its own override:
      // the live storefront keeps the default selectors, and Preview site checks the result.
      // Unknown builds (e.g. a password-protected storefront the server can't read) still get the
      // override: plugins without the feature ignore `themeSelectors`, so it's harmless. Only a
      // recognised build that lacks the feature keeps the old behaviour.
      const themeId = config.themeSelection?.value;
      const themeOption = config.themeSelection?.options.find(option => option.value === themeId);
      const themeTargets = themeId && themeOption?.live === false && next.placement
        && (!compatibility || compatibility.supportedFeatures.includes(THEME_SELECTORS_FEATURE))
        ? next.placement.targets.filter(target => isSelectorDiscoveryLayoutKey(target.key)) : [];
      if (themeId && themeTargets.length) {
        onApply({ ...next, placement: undefined }, { themePlacement: { themeId, placement: { ...next.placement!, targets: themeTargets } } });
      } else onApply({ ...next, placement: placementToInclude });
      applied = true;
    } catch (reason) {
      if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'The theme could not be read. Please try again.');
    } finally {
      if (!controller.signal.aborted) {
        requestRef.current = undefined;
        setPending(false);
        // An interrupted automatic match (aborted by a draft change) runs again; a finished one is done.
        if (auto) { autoDone.current = true; onAutoMatchEnd?.(); }
      }
      onMatchEnd?.(applied, auto);
    }
  };

  const leave = (next: () => void) => {
    requestRef.current?.abort();
    requestRef.current = undefined;
    setPending(false);
    next();
  };

  const themeName = config.themeSelection?.options.find((option) => option.value === config.themeSelection?.value)?.label.replace(/\s*\(Live\)$/, '');
  const matched = !!matchedLabel && !pending;
  // The stored label also names the template file the match read ("Savor — templates/product.json"); show only the theme.
  const matchedName = matchedLabel?.split(' — ')[0];
  const autoDone = useRef(false);
  useEffect(() => { if (!autoMatch) autoDone.current = false; }, [autoMatch]);
  useEffect(() => {
    if (!guided || !autoMatch || autoDone.current || config.disabled || pending || requestRef.current || config.contextKey.endsWith(':unverified')) return;
    void request(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- `request` reads the current props when it runs
  // `pending` too: a run interrupted by a draft change (its request aborted) starts again.
  }, [guided, autoMatch, config.disabled, config.contextKey, pending]);
  const matchStatus = pending
    ? <p className="ov25-theme-flow-note" role="status">Finding colours, button styles and fonts…{guided && !automatic && ' Your preview will open in a new tab.'}</p>
    : matched
      ? <p className="ov25-theme-flow-note" role="status">Matched to {matchedName}.{onUndo && <> <button type="button" className="ov25-theme-step-undo" onClick={onUndo}>Undo</button></>}</p>
      : <p className="ov25-theme-flow-note">We’ll read your theme’s colours, buttons and fonts, and style the configurator to fit.</p>;

  // The host's conversation owns the guided page; matching still uses the same lifecycle above.
  if (guided && inlineStorefrontTools && storefrontTools) return <section className="ov25-theme-step is-chat-page" aria-label="Automatic setup">
    {error && !pending && <div className="ov25-theme-step-auto-note">
      <p role="alert" className="ov25-theme-step-error">{error}</p>
      <Button variant="outline" size="sm" disabled={config.disabled} onClick={() => void request()}><Palette className="h-4 w-4" />Try matching again</Button>
    </div>}
    {storefrontTools}
  </section>;

  return <section className={`ov25-theme-step ${guided ? 'is-guided' : ''}`} aria-label="Match my site">
    {/* Guided: matching is automatic, so it only speaks up when it couldn't match. */}
    {guided && error && !pending && <div className="ov25-theme-step-auto-note">
      <p role="alert" className="ov25-theme-step-error">{error}</p>
      <Button variant="outline" size="sm" disabled={config.disabled} onClick={() => void request()}><Palette className="h-4 w-4" />Try matching again</Button>
    </div>}
    <ol className="ov25-theme-flow">
      {!guided && <li className="ov25-theme-flow-step" data-state={matched ? 'done' : 'current'}>
        <span className="ov25-theme-flow-num" aria-hidden="true">{matched ? <Check size={15} /> : 1}</span>
        <div className="ov25-theme-flow-body">
          <h3>Match your site</h3>
          {matchStatus}
          {config.message && <p className="ov25-theme-flow-note" role="status">{config.message}</p>}
          {error && <p role="alert" className="ov25-theme-step-error">{error}</p>}
        </div>
        <div className="ov25-theme-flow-actions">
          {/* Guided setup already chose the theme in its first step. */}
          {config.themeSelection && !guided && <div className="ov25-theme-step-theme">
            <label htmlFor={`${id}-theme`}>Theme</label>
            {/* Same Radix select as the Choose theme step. */}
            <Select value={config.themeSelection.value || undefined} onValueChange={(value) => config.themeSelection?.onChange(value)}>
              <SelectTrigger id={`${id}-theme`} className="ov25-theme-step-theme-trigger h-11 rounded-md bg-background"><SelectValue placeholder="Choose a theme" /></SelectTrigger>
              <SelectContent>
                {config.themeSelection.options.map((theme) => <SelectItem key={theme.value} value={theme.value}>{theme.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>}
          <Button size="lg" className="ov25-theme-step-match" variant={matched ? 'outline' : 'default'} disabled={pending || config.disabled || (!!config.themeSelection && !config.themeSelection.value)} onClick={() => void request()}>
            {pending ? <Spinner aria-hidden size={16} /> : <Palette className="h-4 w-4" />}
            {pending ? 'Reading theme…' : matched ? 'Match again' : 'Match my site'}
          </Button>
        </div>
      </li>}

      {guided && <li className="ov25-theme-flow-step" data-state="current">
        <span className="ov25-theme-flow-num" aria-hidden="true">1</span>
        <div className="ov25-theme-flow-body">
          <h3>Check your product page</h3>
          <p className="ov25-theme-flow-note">{previewFirst
            ? 'Your configurator is styled to match your site. Open the preview to see it on your product page before you change or save anything.'
            : 'Preview site opens your product page, styled to match your site, in a new tab. Not quite right? Ask for changes. Save when you’re happy.'}</p>
          {previewProduct && <div className="ov25-theme-flow-preview-product">{previewProduct}</div>}
        </div>
        <div className="ov25-theme-flow-actions">
          {themeAction}
          {onActionsContainer && <div ref={onActionsContainer} hidden={previewFirst} />}
        </div>
      </li>}

      {guided && <li className="ov25-theme-flow-step" data-state={previewFirst ? 'locked' : 'todo'}>
        <span className="ov25-theme-flow-num" aria-hidden="true">2</span>
        <div className="ov25-theme-flow-body">
          <h3>Fine-tune it yourself <span className="ov25-theme-flow-optional">Optional</span></h3>
          <p className="ov25-theme-flow-note">{previewFirst ? 'After you’ve opened the preview.' : 'Change any setting by hand.'}</p>
        </div>
        <div className="ov25-theme-flow-actions" hidden={previewFirst}>{actions}</div>
      </li>}
      {guided && storefrontTools && onFinalCheckContainer && <li className="ov25-theme-flow-step" data-state={previewFirst ? 'locked' : 'todo'}>
        <span className="ov25-theme-flow-num" aria-hidden="true">3</span>
        <div className="ov25-theme-flow-body">
          <h3>Final check</h3>
          <p className="ov25-theme-flow-note">Check that your configurator, product details, cart and checkout work on desktop and mobile. No order will be placed.</p>
        </div>
        <div className="ov25-theme-flow-actions" ref={onFinalCheckContainer} hidden={previewFirst} />
      </li>}
    </ol>

    {!guided && <footer className="ov25-theme-step-footer">
      {onBack && <Button variant="ghost" onClick={() => leave(onBack)}><ArrowLeft className="h-4 w-4" />Change preset</Button>}
      <Button variant={matchedLabel ? 'default' : 'outline'} size="lg" onClick={() => leave(onContinue)}>
        {matchedLabel ? 'Continue to preview' : 'Skip for now'}<ArrowRight className="h-4 w-4" />
      </Button>
    </footer>}
    {guided && storefrontTools}
  </section>;
}
