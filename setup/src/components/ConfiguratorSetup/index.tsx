import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ExternalLink, Loader2, Palette, SlidersHorizontal } from 'lucide-react';
import { useConfiguratorSetup } from './useConfiguratorSetup';
import type { ConfiguratorSetupOverrides, ConfiguratorSetupPayload } from './useConfiguratorSetup';
import { ConfigPanel, ProductTypeSelector, SetupSaveControls } from './ConfigPanel';
import { PreviewArea } from './PreviewArea';
import { PresetPicker } from './PresetPicker';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import type { StorefrontIntegrationConfig } from './storefront-integration';
import type { ConfiguratorSetupLivePreviewConfig } from './live-preview';
import { describeUnsupportedFeatures, unsupportedSetupFeatures, type ConfiguratorSetupCompatibility } from './compatibility';
import { applySetupPreset, getDefaultPresetId, getPresetSettings, getSetupPresets, presentationFingerprint, type SetupPresetId } from './presets';
import { buildConfiguratorSetupPayload, buildSerializableConfig } from './serialize-config';
import type { ConfiguratorSetupFormState, PreviewLayoutType } from './types';
import { ThemeStyleAction } from './ThemeStyleAction';
import { isThemeStyleVariable, type ConfiguratorSetupThemeStyling } from './theme-style';
import { getAvailableSelectorDiscoveryTargets, isSelectorDiscoveryLayoutKey } from './selector-discovery';
import { PlacementValidation } from './PlacementValidation';

export interface ConfiguratorSetupProps {
  apiKey?: ConfiguratorSetupOverrides['apiKey'];
  productLink?: ConfiguratorSetupOverrides['productLink'];
  /** Optional gallery images for each host-selected preview product. */
  previewImages?: ConfiguratorSetupOverrides['previewImages'];
  previewBaseUrl?: string;
  /** Use the local demo when running locally; previewBaseUrl takes precedence. */
  useLocalPreview?: boolean;
  initialConfig?: ConfiguratorSetupPayload;
  /** Optional stable store/product identity to isolate locally autosaved drafts. */
  draftKey?: string;
  onSave?: (payload: ConfiguratorSetupPayload) => void;
  hidePreview?: boolean;
  hideSaveButton?: boolean;
  storefrontIntegration?: StorefrontIntegrationConfig;
  livePreview?: ConfiguratorSetupLivePreviewConfig;
  /** Host-owned store and preview-product controls, rendered outside the iframe. */
  previewToolbar?: ReactNode;
  /** Reports the hydrated product type so hosts can select its matching preview product. */
  onPreviewLayoutChange?: (layout: PreviewLayoutType) => void;
  compatibility?: ConfiguratorSetupCompatibility;
  /** Optional host-owned theme analysis; suggestions only change the local draft on approval. */
  themeStyling?: ConfiguratorSetupThemeStyling;
  className?: string;
}

export type { ConfiguratorSetupPayload, StorefrontIntegrationConfig, ConfiguratorSetupLivePreviewConfig, ConfiguratorSetupCompatibility };

export function LivePreviewAction({ config, state }: { config: ConfiguratorSetupLivePreviewConfig; state: ConfiguratorSetupFormState }) {
  const [pending, setPending] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string>();
  const [submitted, setSubmitted] = useState<{ fingerprint: string; contextKey?: string; previousRunId?: string }>();
  const pendingRef = useRef(false);
  const mountedRef = useRef(true);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);
  const checking = retrying || config.availability === 'checking';
  const unavailable = config.availability !== undefined && config.availability !== 'supported';
  const payload = useMemo(() => buildConfiguratorSetupPayload(state), [state]);
  const fingerprint = useMemo(() => JSON.stringify([state.layout, payload]), [state.layout, payload]);
  const report = config.placementValidation;
  const sameDraft = submitted?.fingerprint === fingerprint && submitted?.contextKey === config.contextKey;
  const currentReport = !pending && sameDraft && report?.activeLayout === state.layout && report.validationRunId !== submitted?.previousRunId ? report : undefined;
  const request = async () => {
    if (pendingRef.current || config.disabled || checking || unavailable) return;
    pendingRef.current = true;
    setPending(true);
    setError(undefined);
    setSubmitted({ fingerprint, contextKey: config.contextKey, previousRunId: report?.validationRunId });
    try {
      // Call synchronously from the click so hosts can open a window before awaiting I/O.
      await config.onRequest({ payload, activeLayout: state.layout });
    } catch (reason) {
      if (mountedRef.current) setError(reason instanceof Error ? reason.message : 'The site preview could not be opened. Try again.');
    } finally {
      pendingRef.current = false;
      if (mountedRef.current) setPending(false);
    }
  };
  const retry = async () => {
    if (pendingRef.current || checking || !config.onRetry) return;
    pendingRef.current = true;
    setRetrying(true);
    setError(undefined);
    try {
      await config.onRetry();
    } catch (reason) {
      if (mountedRef.current) setError(reason instanceof Error ? reason.message : 'The site preview check failed. Try again.');
    } finally {
      pendingRef.current = false;
      if (mountedRef.current) setRetrying(false);
    }
  };
  return <div className="shrink-0 border-t pt-3" data-ov25-setup-live-preview>
    <Button type="button" variant="outline" className="w-full" disabled={pending || config.disabled || checking || unavailable} onClick={request}>
      {pending || checking ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" /> : <ExternalLink className="h-4 w-4" />}
      {checking ? 'Checking site preview…' : pending ? 'Opening site preview…' : config.label ?? (config.status === 'ready' ? 'Update site preview' : 'Open site preview')}
    </Button>
    {(error || config.message) && <p role={error || config.status === 'error' ? 'alert' : 'status'} className={`mt-2 text-xs leading-relaxed ${error || config.status === 'error' ? 'text-destructive' : 'text-muted-foreground'}`}>{error || config.message}</p>}
    {currentReport ? <PlacementValidation report={currentReport} /> : !pending && (report || config.status === 'ready') && <p className="mt-2 text-xs leading-relaxed text-muted-foreground" data-ov25-placement-not-checked>
      Page placement: Not checked. {submitted && !sameDraft ? 'Update the site preview to check your changed draft.' : report ? 'Update the site preview to check this draft.' : 'This preview did not report placement checks.'}
    </p>}
    {config.onRetry && <Button type="button" variant="ghost" className="mt-1 w-full" disabled={pending || checking} onClick={retry}>Retry check</Button>}
  </div>;
}

export default function ConfiguratorSetup(props: ConfiguratorSetupProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  // Host rerenders (including preview status updates) must not recreate the iframe configuration.
  const overrides = useMemo(() => ({ apiKey: props.apiKey, productLink: props.productLink, previewImages: props.previewImages, initialConfig: props.initialConfig, draftKey: props.draftKey }), [props.apiKey, props.productLink, props.previewImages, props.initialConfig, props.draftKey]);
  const setup = useConfiguratorSetup(overrides);
  const { formState, currentSettings, updateSettings, updateNested, getExportJson } = setup;
  const reportedPreviewLayout = useRef<{ hydrationKey: string; layout: PreviewLayoutType } | undefined>(undefined);
  useEffect(() => {
    if (!setup.hasHydrated || !props.onPreviewLayoutChange) return;
    const previous = reportedPreviewLayout.current;
    if (previous?.hydrationKey === setup.hydrationKey && previous.layout === formState.layout) return;
    reportedPreviewLayout.current = { hydrationKey: setup.hydrationKey, layout: formState.layout };
    props.onPreviewLayoutChange(formState.layout);
  }, [setup.hasHydrated, setup.hydrationKey, formState.layout, props.onPreviewLayoutChange]);
  const progress = formState.setupProgress?.[formState.layout];
  const [screen, setScreen] = useState<'picker' | 'theme' | 'summary' | 'editor' | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<SetupPresetId>(() => getDefaultPresetId(formState.layout));
  const [confirmReplacement, setConfirmReplacement] = useState(false);
  const defaultScreen = !progress?.configured ? 'picker' : props.themeStyling && progress.themeStep === 'pending' ? 'theme' : 'summary';
  const activeScreen = screen === 'theme' && !props.themeStyling ? 'summary' : screen ?? defaultScreen;
  const onboarding = activeScreen === 'picker' || activeScreen === 'theme';

  useEffect(() => {
    if (!setup.hasHydrated || !onboarding) return;
    const heading = rootRef.current?.querySelector<HTMLElement>('.ov25-setup-onboarding h2');
    heading?.setAttribute('tabindex', '-1');
    heading?.focus();
  }, [activeScreen, setup.hasHydrated, formState.layout, onboarding]);

  useEffect(() => { setScreen(null); setSelectedPreset(getDefaultPresetId(formState.layout)); setConfirmReplacement(false); }, [setup.hydrationKey, formState.layout]);
  const setLayout = (layout: PreviewLayoutType) => {
    if (layout === formState.layout) return;
    setScreen(null);
    setSelectedPreset(getDefaultPresetId(layout));
    setConfirmReplacement(false);
    setup.setLayout(layout);
  };

  const candidateSettings = useMemo(() => applySetupPreset(formState.layout, selectedPreset, progress?.configured ? currentSettings : undefined, !!progress?.themeStyle), [formState.layout, selectedPreset, progress?.configured, progress?.themeStyle, currentSettings]);
  const serializableConfig = useMemo(() => buildSerializableConfig(formState.layout, currentSettings, overrides), [formState.layout, currentSettings, overrides]);
  const existing = setup.initialSettings?.[formState.layout];
  const candidateUnavailable = describeUnsupportedFeatures(unsupportedSetupFeatures(candidateSettings, props.compatibility, existing));
  const saveUnavailable = describeUnsupportedFeatures([...new Set((Object.keys(formState.typeSettings) as PreviewLayoutType[]).flatMap((layout) => formState.setupProgress?.[layout]?.configured ? unsupportedSetupFeatures(formState.typeSettings[layout], props.compatibility, setup.initialSettings?.[layout]) : []))]);
  const preset = getSetupPresets(formState.layout).find((entry) => entry.id === progress?.presetId);
  const customised = !!progress?.presentationFingerprint && progress.presentationFingerprint !== presentationFingerprint(currentSettings);
  const keepsThemeStyle = !!progress?.themeStyle || Object.keys(currentSettings.style).some(isThemeStyleVariable);

  const apply = () => {
    if (candidateUnavailable) return;
    setup.applyPreset(selectedPreset, !!props.themeStyling);
    setConfirmReplacement(false);
    setScreen(props.themeStyling ? 'theme' : 'summary');
  };
  const choose = () => {
    const originalPresentation = progress?.presentationFingerprint ?? presentationFingerprint(getPresetSettings(formState.layout, 'classic'));
    if (progress?.configured && presentationFingerprint(candidateSettings) !== presentationFingerprint(currentSettings) &&
      (presentationFingerprint(currentSettings) !== originalPresentation || !progress.presetId)) {
      setConfirmReplacement(true);
    } else apply();
  };
  const changePreset = () => { setSelectedPreset(progress?.presetId ?? getDefaultPresetId(formState.layout)); setScreen('picker'); };
  const continueToPreview = () => { setup.completeThemeStep(); setScreen('summary'); };

  return <div ref={rootRef} className={`ov25-setup ${props.className ?? 'h-screen'}`}>
    {setup.hasHydrated && !onboarding && props.previewToolbar && <div className="shrink-0 border-b bg-white p-3" data-ov25-setup-preview-toolbar>{props.previewToolbar}</div>}
    {!setup.hasHydrated ? <p role="status" className="p-5 text-sm text-muted-foreground">Loading your setup…</p> : onboarding ? <main className="ov25-setup-onboarding" data-ov25-setup-step={activeScreen}>
      <header className="ov25-setup-onboarding-header">
        <ol className="ov25-setup-steps" aria-label="Setup progress">
          <li aria-current={activeScreen === 'picker' ? 'step' : undefined}><span>1</span>Choose a preset</li>
          {props.themeStyling && <li aria-current={activeScreen === 'theme' ? 'step' : undefined}><span>2</span>Match my site</li>}
          <li><span>{props.themeStyling ? '3' : '2'}</span>Preview & edit</li>
        </ol>
        <ProductTypeSelector layout={formState.layout} onChange={setLayout} compact />
      </header>
      {activeScreen === 'picker' ? <PresetPicker layout={formState.layout} selected={selectedPreset} onSelect={setSelectedPreset} onApply={choose} onCancel={progress?.configured ? () => setScreen(defaultScreen === 'theme' ? 'theme' : 'summary') : undefined} unavailable={candidateUnavailable} /> : props.themeStyling && <div className="ov25-setup-theme-content">
        <ThemeStyleAction
          key={`${setup.hydrationKey}:${formState.layout}:${props.themeStyling.contextKey}`}
          config={props.themeStyling} layout={formState.layout} settings={currentSettings} integration={props.storefrontIntegration} compatibility={props.compatibility}
          matchedLabel={progress?.themeStyle?.label} onBack={changePreset} onContinue={continueToPreview}
          onApply={(proposal) => {
            // Global placement values stay in the host's unsaved integration draft.
            const integration = props.storefrontIntegration;
            if (proposal.placement && integration?.status === 'ready') {
              for (const target of getAvailableSelectorDiscoveryTargets(proposal.placement, currentSettings, integration)) {
                if (!isSelectorDiscoveryLayoutKey(target.key)) integration.onChange(target.key, target.selector);
              }
            }
            setup.applyThemeStyle(formState.layout, proposal);
            setScreen('summary');
          }} />
      </div>}
    </main> : <div className={`ov25-setup-layout ${props.hidePreview ? 'ov25-setup-no-preview' : ''}`}>
      {!props.hidePreview && <main className="ov25-setup-preview"><PreviewArea serializableConfig={serializableConfig} previewBaseUrl={props.previewBaseUrl} useLocalPreview={props.useLocalPreview} /></main>}
      <aside className="ov25-setup-sidebar">
        <ProductTypeSelector layout={formState.layout} onChange={setLayout} />
        {activeScreen === 'editor' ? <>
          <div className="flex shrink-0 items-center justify-between py-2">
            <Button variant="ghost" size="sm" onClick={() => setScreen('summary')}><ArrowLeft className="h-3.5 w-3.5" />Summary</Button>
            <Button variant="ghost" size="sm" onClick={changePreset}>Change preset</Button>
          </div>
          <ConfigPanel formState={formState} currentSettings={currentSettings} setLayout={setLayout} updateSettings={updateSettings} updateNested={updateNested} getExportJson={getExportJson} onSave={props.onSave} hideSaveButton={props.hideSaveButton} storefrontIntegration={props.storefrontIntegration} hideProductType saveDisabled={!!saveUnavailable} />
          {saveUnavailable && <p role="alert" className="py-2 text-xs text-destructive">{saveUnavailable}</p>}
        </> : <>
          <div className="min-h-0 flex-1 overflow-auto py-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Your configurator</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">{preset?.name ?? 'Current configuration'}{customised ? <span className="ml-2 text-xs font-normal text-muted-foreground">Customised</span> : null}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{preset?.description ?? 'Your saved settings are ready to review.'}</p>
            <dl className="mt-6 space-y-4 rounded-xl border bg-muted/20 p-4 text-sm">
              {[
                ['Desktop', currentSettings.configurator.displayModeDesktop], ['Mobile', currentSettings.configurator.displayModeMobile],
                ['Options', currentSettings.configurator.variantDisplayDesktop], ['Gallery', currentSettings.carousel.desktop],
              ].map(([label, value]) => <div key={label} className="flex justify-between gap-3"><dt className="text-muted-foreground">{label}</dt><dd className="font-medium capitalize">{value.replaceAll('-', ' ')}</dd></div>)}
            </dl>
            <Button variant="outline" className="mt-6 w-full" onClick={() => setScreen('editor')}><SlidersHorizontal className="h-4 w-4" />Edit settings</Button>
            <Button variant="ghost" className="mt-2 w-full" onClick={changePreset}>Change preset</Button>
            {props.themeStyling && <>
              <Button variant="ghost" className="mt-2 w-full" onClick={() => setScreen('theme')}><Palette className="h-4 w-4" />Match my site</Button>
              {progress?.themeStyle && <p className="mt-1 text-center text-xs text-muted-foreground">Palette matched: {progress.themeStyle.label}</p>}
            </>}
            {saveUnavailable && <p role="alert" className="mt-4 text-sm text-destructive">{saveUnavailable}</p>}
          </div>
          <SetupSaveControls formState={formState} getExportJson={getExportJson} onSave={props.onSave} hideSaveButton={props.hideSaveButton} saveDisabled={!!saveUnavailable} />
        </>}
        {props.livePreview && <LivePreviewAction key={`${setup.hydrationKey}:${formState.layout}`} config={{ ...props.livePreview, disabled: props.livePreview.disabled || !!saveUnavailable }} state={formState} />}
      </aside>
    </div>}
    <Dialog open={confirmReplacement} onOpenChange={setConfirmReplacement}>
      <DialogContent><DialogHeader><DialogTitle>Replace customised settings?</DialogTitle><DialogDescription>This preset will replace your layout, gallery, {keepsThemeStyle ? 'element styles' : 'styling'} and custom CSS for this product type. Your selectors, logos, text replacements and product rules will be kept.{keepsThemeStyle ? ' Your colours, fonts and button styling will also be kept.' : ''}</DialogDescription></DialogHeader>
        <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setConfirmReplacement(false)}>Keep current settings</Button><Button onClick={apply}>Replace settings</Button></div>
      </DialogContent>
    </Dialog>
  </div>;
}
