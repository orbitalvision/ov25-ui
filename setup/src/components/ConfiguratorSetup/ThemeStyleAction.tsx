import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { ArrowLeft, ArrowRight, Check, Loader2, Palette } from 'lucide-react';
import { Button } from '../ui/button';
import type { PreviewLayoutType, TypeSettings } from './types';
import { DEFAULT_TYPE_SETTINGS } from './types';
import type { StorefrontIntegrationConfig } from './storefront-integration';
import { SelectorPlacementReview } from './SelectorPlacementReview';
import { getAvailableSelectorDiscoveryTargets, getSelectorDiscoveryCurrentValue, isSelectorDiscoveryLayoutKey, type SelectorDiscoveryProposal } from './selector-discovery';
import type { ConfiguratorSetupCompatibility } from './compatibility';
import { ThemePalettePreview } from './ThemePalettePreview';
import { compatibleThemeStyleProposal, validateThemeStyleProposal, type ConfiguratorSetupThemeStyling, type ThemeStyleProposal } from './theme-style';
import './theme-style-step.css';

export function ThemeStyleAction({ config, layout, settings, integration, compatibility, matchedLabel, onApply, onContinue, onBack }: {
  config: ConfiguratorSetupThemeStyling;
  layout: PreviewLayoutType;
  settings: TypeSettings;
  integration?: StorefrontIntegrationConfig;
  compatibility?: ConfiguratorSetupCompatibility;
  matchedLabel?: string;
  onApply: (proposal: ThemeStyleProposal) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  const id = useId();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [proposal, setProposal] = useState<ThemeStyleProposal>();
  const [includedPlacement, setIncludedPlacement] = useState<SelectorDiscoveryProposal>();
  const requestRef = useRef<AbortController | undefined>(undefined);
  const draftKey = JSON.stringify(settings);
  const compatibilityKey = JSON.stringify(compatibility);
  const placementKey = JSON.stringify({ policy: config.placement, integration: integration && { ...integration, onChange: undefined } });
  useEffect(() => {
    requestRef.current?.abort();
    requestRef.current = undefined;
    setPending(false);
    setError(undefined);
    setProposal(undefined);
    setIncludedPlacement(undefined);
    return () => requestRef.current?.abort();
  }, [draftKey, compatibilityKey, placementKey, config.contextKey, layout]);

  const request = async () => {
    if (requestRef.current || config.disabled) return;
    const controller = new AbortController();
    requestRef.current = controller;
    setPending(true);
    setError(undefined);
    try {
      const result = await config.onRequest({ activeLayout: layout, signal: controller.signal });
      if (controller.signal.aborted) return;
      const next = compatibleThemeStyleProposal(validateThemeStyleProposal(result), compatibility);
      if (settings.branding.cssString.trim() || Object.keys(settings.elementStyles).length) {
        next.warnings.push('Existing custom CSS or element styles may override this palette in your configurator. Review the product preview after applying.');
      }
      if (next.placement && config.placement?.savedSettings === 'none') {
        const targets = getAvailableSelectorDiscoveryTargets(next.placement, settings, integration).filter((target) => {
          if (target.confidence !== 'high') return false;
          const current = getSelectorDiscoveryCurrentValue(target.key, settings, integration);
          // A server-confirmed new installation may still have a manually edited local draft.
          // Only seed untouched defaults/empty fields; preserve those draft edits too.
          const defaults = DEFAULT_TYPE_SETTINGS[layout].selectors;
          return isSelectorDiscoveryLayoutKey(target.key)
            ? current === defaults[target.key].selector
            : current === '' && config.placement?.untouchedIntegrationKeys?.includes(target.key);
        });
        if (targets.length) setIncludedPlacement({ ...next.placement, targets });
      }
      setProposal(next);
    } catch (reason) {
      if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'The theme could not be read. Please try again.');
    } finally {
      if (!controller.signal.aborted) {
        requestRef.current = undefined;
        setPending(false);
      }
    }
  };

  const leave = (next: () => void) => {
    requestRef.current?.abort();
    requestRef.current = undefined;
    setPending(false);
    next();
  };
  const value = (key: string, fallback: string) => settings.style[key] || fallback;
  const background = value('--ov25-background-color', '#ffffff');
  const text = value('--ov25-text-color', '#000000');
  const action = value('--ov25-cta-color', '#22c55e');
  const highlight = value('--ov25-highlight-color', '#00fbff');
  const currentVariables = {
    '--ov25-theme-step-background': background,
    '--ov25-theme-step-surface': value('--ov25-secondary-background-color', '#f6f6f6'),
    '--ov25-theme-step-text': text,
    '--ov25-theme-step-muted': value('--ov25-secondary-text-color', text),
    '--ov25-theme-step-border': value('--ov25-border-color', '#e5e5e5'),
    '--ov25-theme-step-action': action,
    '--ov25-theme-step-action-text': value('--ov25-cta-text-color', '#ffffff'),
    '--ov25-theme-step-action-radius': value('--ov25-cta-border-radius', '9999px'),
    '--ov25-theme-step-secondary': value('--ov25-primary-color', '#ffffff'),
    '--ov25-theme-step-secondary-text': value('--ov25-button-text-color', text),
    '--ov25-theme-step-secondary-radius': value('--ov25-button-border-radius', '0px'),
  } as CSSProperties;
  const colours = [
    { label: 'Background', colour: background },
    { label: 'Text', colour: text },
    { label: 'Action', colour: action },
    { label: 'Accent', colour: highlight },
  ];

  return <section className="ov25-theme-step" aria-labelledby={`${id}-title`}>
    <header className="ov25-theme-step-header" hidden={!!proposal}>
      <p className="ov25-theme-step-eyebrow">Make it feel like your store</p>
      <h2 id={`${id}-title`}>Match my site</h2>
      <p>Bring your store’s colours, button styles and fonts into your configurator. Review the palette before applying it.</p>
    </header>

    {proposal ? <div className="ov25-theme-step-review">
      <ThemePalettePreview proposal={proposal} currentStyle={settings.style} currentFonts={settings.branding.fonts} onCancel={() => { setProposal(undefined); setIncludedPlacement(undefined); }}
        unavailableMessage={!Object.keys(proposal.style).length && !proposal.fonts?.length ? 'This palette has no styling changes supported by your installed configurator.' : undefined}
        onApply={() => { onApply({ ...proposal, placement: includedPlacement }); setProposal(undefined); setIncludedPlacement(undefined); }} />
      {proposal.placement && config.placement && <SelectorPlacementReview
        proposal={proposal.placement} settings={settings} integration={integration}
        savedSettings={config.placement.savedSettings} scopeLabel={config.placement.scopeLabel}
        includedTargets={includedPlacement?.targets.map((target) => target.key) ?? []}
        onApply={setIncludedPlacement} />}
    </div> : <div className="ov25-theme-step-intro">
      <div className="ov25-theme-step-explanation">
        <span className="ov25-theme-step-icon" aria-hidden="true"><Palette size={24} /></span>
        <h3>A palette that feels at home</h3>
        <p>We’ll read {config.sourceLabel ? <strong>{config.sourceLabel}</strong> : 'your theme'} and suggest styling that fits your site.</p>
        <dl className="ov25-theme-step-details">
          <div><dt>Colours</dt><dd>Backgrounds, text and accents from your palette.</dd></div>
          <div><dt>Buttons</dt><dd>Coordinated actions, borders and hover states.</dd></div>
          <div><dt>Typography</dt><dd>Fonts and weights to bring it all together.</dd></div>
        </dl>
        <Button size="lg" className="ov25-theme-step-match" disabled={pending || config.disabled} onClick={request}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" /> : <Palette className="h-4 w-4" />}
          {pending ? 'Reading theme…' : 'Match my site'}
        </Button>
        <p className="ov25-theme-step-status" role={pending || matchedLabel ? 'status' : undefined}>
          {pending ? 'Finding colours, button styles and fonts. You’ll review them before applying.' : matchedLabel ? <><Check size={15} aria-hidden="true" /> Palette matched: {matchedLabel}.</> : 'Prefer to choose your own? You can edit every style later.'}
        </p>
        {error && <p role="alert" className="ov25-theme-step-error">{error}</p>}
      </div>

      <div className="ov25-theme-step-current">
        <p className="ov25-theme-step-current-label">Your current palette</p>
        <div className="ov25-theme-step-specimen" style={currentVariables} aria-hidden="true">
          <div className="ov25-theme-step-type-sample"><span>Aa.</span><span>A familiar feel.<br />Your finishing touch.</span></div>
          <div className="ov25-theme-step-button-samples"><span>Add to basket<ArrowRight size={16} /></span><span>Explore finishes</span></div>
        </div>
        <ul className="ov25-theme-step-swatches" aria-label="Current colours">
          {colours.map(({ label, colour }) => <li key={label}>
            <span style={{ backgroundColor: colour }} aria-hidden="true" />
            <span>{label}</span>
            <span>{colour.toUpperCase()}</span>
          </li>)}
        </ul>
        <p className="ov25-theme-step-current-note">These colours stay in place until you apply a suggested palette.</p>
      </div>
    </div>}

    <footer className="ov25-theme-step-footer">
      <Button variant="ghost" onClick={() => leave(onBack)}><ArrowLeft className="h-4 w-4" />Change preset</Button>
      <Button variant={matchedLabel ? 'default' : 'outline'} size="lg" onClick={() => leave(onContinue)}>
        {matchedLabel ? 'Continue to preview' : 'Skip for now'}<ArrowRight className="h-4 w-4" />
      </Button>
    </footer>
  </section>;
}
