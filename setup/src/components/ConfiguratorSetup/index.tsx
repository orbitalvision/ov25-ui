import { mergeSerializableIntoTypeSettings } from './initial-config-from-payload';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { effectiveSelectors, pruneThemeSelectorsInPayload, setThemeSelectorOverride, THEME_SELECTORS_FEATURE, type SelectorOverrideTheme } from './theme-selector-overrides';
import { ArrowLeft, Check, Copy, ExternalLink, Palette, SlidersHorizontal, Smartphone, X } from 'lucide-react';
import { Spinner } from '../ui/spinner';
import { useConfiguratorSetup } from './useConfiguratorSetup';
import type { ConfiguratorSetupOverrides, ConfiguratorSetupPayload } from './useConfiguratorSetup';
import { ConfigPanel, ProductTypeSelector, SetupSaveControls } from './ConfigPanel';
import { PreviewArea } from './PreviewArea';
import { PresetPicker } from './PresetPicker';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import type { StorefrontIntegrationConfig } from './storefront-integration';
import type { ConfiguratorSetupLivePreviewConfig, ConfiguratorSetupLivePreviewRequest, ConfiguratorSetupMobilePreviewConfig } from './live-preview';
import { describeUnsupportedFeatures, unsupportedSetupFeatures, type ConfiguratorSetupCompatibility } from './compatibility';
import { applySetupPreset, getDefaultPresetId, getPresetSettings, getSetupPresets, presentationFingerprint, type SetupPresetId } from './presets';
import { buildConfiguratorSetupPayload, buildSerializableConfig } from './serialize-config';
import type { ConfiguratorSetupFormState, PreviewLayoutType, TypeSettings } from './types';
import { ThemeStyleAction } from './ThemeStyleAction';
import { isThemeStyleVariable, type ConfiguratorSetupThemeStyling } from './theme-style';
import { getAvailableSelectorDiscoveryTargets, getSelectorDiscoveryCurrentValue, isSelectorDiscoveryLayoutKey } from './selector-discovery';
import { PlacementValidation } from './PlacementValidation';

export interface ConfiguratorSetupProps {
  /** Host-owned verification and chat tools; never saves the draft automatically. */
  renderStorefrontTools?: (context: { page?: { previewActions: ReactNode; advancedActions: ReactNode; previewProduct?: ReactNode; themeName?: string; preparation: 'preparing' | 'unavailable' | 'ready' | 'saved' }; actionsContainer?: HTMLElement | null; finalCheckContainer?: HTMLElement | null; request: { payload: ConfiguratorSetupPayload; activeLayout: PreviewLayoutType }; customCss: string; onCustomCssChange: (css: string) => void; onRuntimeConfigChange: (config: ConfiguratorSetupPayload[PreviewLayoutType]) => { payload: ConfiguratorSetupPayload; activeLayout: PreviewLayoutType } }) => ReactNode;
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
  /** Guided step 2: shows and changes the product the site preview opens on. Settings still save to the selected target. */
  previewProductControl?: ReactNode;
  /** Reports the hydrated product type so hosts can select its matching preview product. */
  onPreviewLayoutChange?: (layout: PreviewLayoutType) => void;
  compatibility?: ConfiguratorSetupCompatibility;
  /** Optional host-owned theme analysis; suggestions only change the local draft on approval. */
  themeStyling?: ConfiguratorSetupThemeStyling;
  /**
   * Guided host selection is presented for confirmation against the current draft. `resume`: the store finished this
   * type before and is reopening it, so its saved settings (`initialConfig`) are kept as they are, with no preset.
   */
  guidedSelection?: { layout: PreviewLayoutType; preset: SetupPresetId; resume?: boolean };
  /** Guided: match the site by itself now (the host sets this each time the store arrives at this step). */
  guidedAutoMatch?: boolean;
  /** Guided: the automatic match finished (applied or not), so the host can stop asking for it. */
  onGuidedAutoMatchEnd?: () => void;
  /**
   * Shopify hosts: the store's themes, enabling per-theme placement overrides in the editor.
   * `currentThemeId` is the theme being set up (guided setup); hosts without themes omit this.
   */
  selectorThemes?: { themes: SelectorOverrideTheme[]; currentThemeId?: string };
  /** Host-owned element (e.g. a wizard footer) that receives the only Save button, styled with `className`. */
  saveSlot?: { container: HTMLElement | null; className?: string };
  /** Label for every Save button, e.g. "Finalise" when saving ends the host's setup flow. Defaults to "Save". */
  saveLabel?: string;
  className?: string;
}

export type { ConfiguratorSetupPayload, StorefrontIntegrationConfig, ConfiguratorSetupLivePreviewConfig, ConfiguratorSetupCompatibility };

/** How long after the last edit the full editor sends the draft to an open preview tab. */
const AUTO_UPDATE_DELAY_MS = 1500;

/**
 * `simple` (guided setup): one button. Show blocking availability messages, what to do while a locked store is being unlocked, and a retry action. `primary`: the filled button style.
 * `toolbar` (full editor): a compact button for the bar above the preview. Its status message shows on hover, errors stay visible beside it,
 * and placement warnings render into `toolbar.reportContainer` (the sidebar), next to the selectors they are about.
 */
export function LivePreviewAction({ config, state, simple, primary, toolbar }: { config: ConfiguratorSetupLivePreviewConfig; state: ConfiguratorSetupFormState; simple?: boolean; primary?: boolean; toolbar?: { reportContainer: HTMLElement | null } }) {
  const [pending, setPending] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string>();
  const [submitted, setSubmitted] = useState<{ fingerprint: string; contextKey?: string; previousRunId?: string }>();
  const pendingRef = useRef(false);
  const mountedRef = useRef(true);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);
  const checking = retrying || config.availability === 'checking';
  const unavailable = config.availability !== undefined && config.availability !== 'supported' && config.availability !== 'requires-unlock';
  const payload = useMemo(() => buildConfiguratorSetupPayload(state), [state]);
  const fingerprint = useMemo(() => JSON.stringify([state.layout, payload]), [state.layout, payload]);
  const report = config.placementValidation;
  const sameDraft = submitted?.fingerprint === fingerprint && submitted?.contextKey === config.contextKey;
  const currentReport = !pending && sameDraft && report?.activeLayout === state.layout && report.validationRunId !== submitted?.previousRunId ? report : undefined;
  // Full editor: once a preview tab shows a draft, send later edits to it by themselves, shortly after editing stops.
  // Guided setup (`simple`) refreshes its preview after each assistant change instead.
  const autoUpdate = simple ? undefined : config.onAutoUpdate;
  useEffect(() => {
    if (!autoUpdate || config.status !== 'ready') return;
    // A preview opened elsewhere (for example guided setup's chat) already shows the current draft, so its
    // placement report applies to it too.
    if (!submitted) { setSubmitted({ fingerprint, contextKey: config.contextKey }); return; }
    if (sameDraft || pending || checking || unavailable || config.disabled) return;
    const timer = setTimeout(() => {
      setSubmitted({ fingerprint, contextKey: config.contextKey, previousRunId: report?.validationRunId });
      void Promise.resolve(autoUpdate({ payload, activeLayout: state.layout })).catch(() => {});
    }, AUTO_UPDATE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [autoUpdate, config.status, config.contextKey, config.disabled, submitted, sameDraft, pending, checking, unavailable, fingerprint, payload, state.layout, report?.validationRunId]);
  const reportRunId = currentReport?.validationRunId;
  const reportSlot = toolbar?.reportContainer;
  useEffect(() => {
    // In the narrow, stacked layout the sidebar sits away from the bar; bring new warnings into view.
    if (reportRunId && reportSlot?.childElementCount) reportSlot.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
  }, [reportRunId, reportSlot]);
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
  const retryOnClick = simple && unavailable && !!config.onRetry;
  const previewButton = <Button type="button" variant={primary ? 'default' : 'outline'} size={toolbar ? 'sm' : undefined} className={toolbar ? 'h-8 gap-1.5 rounded-full border-input bg-white px-3 text-xs font-medium shadow-none hover:bg-accent [&_svg]:size-3.5' : simple && config.mobile ? undefined : 'w-full'} disabled={pending || config.disabled || checking || (unavailable && !retryOnClick)} onClick={retryOnClick ? retry : request}>
      {pending || checking ? <Spinner aria-hidden size={16} /> : <ExternalLink className="h-4 w-4" />}
      {checking ? (simple ? 'Checking…' : 'Checking site preview…') : pending ? (simple ? 'Opening…' : 'Opening site preview…') : config.label ?? (config.status === 'ready' && !autoUpdate ? 'Update site preview' : 'Open site preview')}
    </Button>;
  if (toolbar) {
    const failed = !!error || config.status === 'error';
    const problem = error || (failed ? config.message : undefined);
    // A message the merchant must act on stays visible: the button is blocked, or a request is waiting on them
    // (for example to bring the preview tab to the front). Anything else, such as "your store has a password",
    // is a hover hint so the bar stays one line.
    const blocked = (unavailable || !!config.disabled) && !checking;
    const visible = !failed && (blocked || pending) ? config.message : undefined;
    const hint = failed || visible ? undefined : config.message;
    // With an open preview the button reads the same as with none, so say when edits are being sent to it.
    const live = !!autoUpdate && config.status === 'ready' && !failed && !blocked && !pending;
    return <div className="flex min-w-0 flex-wrap items-center justify-center gap-2" data-ov25-setup-live-preview="toolbar">
      {/* Shown at once on hover or keyboard focus (a native title waits about a second). On the wrapper, so it also works while the button is disabled.
          Centred with a margin, not a translate: a host on Tailwind v3 defines the same translate class and the two would stack. */}
      <span className="group/preview-hint relative inline-flex">
        {previewButton}
        {hint && <span aria-hidden data-ov25-setup-preview-hint className="pointer-events-none absolute left-1/2 top-full z-50 -ml-32 mt-2 w-64 rounded-md bg-foreground px-3 py-2 text-left text-xs font-normal leading-snug text-background opacity-0 shadow-md group-hover/preview-hint:opacity-100 group-focus-within/preview-hint:opacity-100">{hint}</span>}
      </span>
      {hint && <span className="sr-only" role="status">{hint}</span>}
      {live && <span className="text-xs text-muted-foreground" data-ov25-setup-preview-live>Updates as you edit</span>}
      {config.onRetry && unavailable && <Button type="button" variant="ghost" size="sm" disabled={pending || checking} onClick={retry}>Retry check</Button>}
      {visible && <p role="status" className="max-w-sm text-xs leading-snug text-muted-foreground">{visible}</p>}
      {problem && <p role="alert" className="max-w-sm text-xs leading-snug text-destructive">{problem}</p>}
      {currentReport && toolbar.reportContainer && createPortal(<PlacementValidation report={currentReport} />, toolbar.reportContainer)}
    </div>;
  }
  return <div className="shrink-0 border-t pt-3" data-ov25-setup-live-preview>
    {simple && config.mobile
      ? <div className="flex gap-2" data-ov25-setup-preview-row>{previewButton}<MobilePreviewAction mobile={config.mobile} request={{ payload, activeLayout: state.layout }} /></div>
      : previewButton}
    {(error || (config.message && (!simple || config.status === 'error' || config.disabled || unavailable || config.availability === 'requires-unlock'))) && <p role={error || config.status === 'error' ? 'alert' : 'status'} className={`mt-2 text-xs leading-relaxed ${error || config.status === 'error' ? 'text-destructive' : 'text-muted-foreground'}`}>{error || config.message}</p>}
    {/* Placement checks only surface definite problems, in the full editor. */}
    {currentReport && !simple && <PlacementValidation report={currentReport} />}
    {config.onRetry && unavailable && <Button type="button" variant="ghost" className="mt-1 w-full" disabled={pending || checking} onClick={retry}>Retry check</Button>}
  </div>;
}

/** "View on phone": prepares the same draft preview and shows its link as a QR code. */
// Never greyed out: if the link cannot be prepared, the popover says why. The popover renders
// at the document root (above sticky headers) and flips to whichever side has room.
function MobilePreviewAction({ mobile, request }: { mobile: ConfiguratorSetupMobilePreviewConfig; request: ConfiguratorSetupLivePreviewRequest }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [link, setLink] = useState<string>();
  const [error, setError] = useState<string>();
  const [copied, setCopied] = useState(false);
  const show = async () => {
    if (pending) return;
    setPending(true); setError(undefined); setLink(undefined); setCopied(false);
    try {
      setLink(await mobile.onLink(request));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The phone preview could not be prepared. Try again.');
    } finally {
      setPending(false);
    }
  };
  const copy = async () => {
    if (!link) return;
    try { await navigator.clipboard.writeText(link); setCopied(true); } catch { setError('Copy failed. Scan the code instead.'); }
  };
  return <Popover open={open} onOpenChange={next => { setOpen(next); if (next) void show(); }}>
    <PopoverTrigger asChild>
      <Button type="button" variant="outline" className="shrink-0" disabled={pending && !open} data-ov25-setup-mobile-preview>
        {pending ? <Spinner aria-hidden size={16} /> : <Smartphone className="h-4 w-4" />}View on phone
      </Button>
    </PopoverTrigger>
    <PopoverContent side="bottom" align="end" sideOffset={8} collisionPadding={16} aria-label="View on your phone" className="w-64 rounded-xl shadow-lg">
      <div className="mb-3 flex items-start justify-between gap-2">
        <p className="text-sm font-medium">Scan with your phone</p>
        <button type="button" aria-label="Close" className="-m-1 rounded p-1 text-muted-foreground hover:text-foreground" onClick={() => setOpen(false)}><X className="h-4 w-4" /></button>
      </div>
      {pending && <div className="flex h-40 items-center justify-center"><Spinner aria-hidden size={24} className="text-muted-foreground" /></div>}
      {link && <>
        <div className="mx-auto w-fit rounded-lg bg-white p-2">{mobile.renderQrCode(link)}</div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Opens this draft on your product page. It updates as you make changes here.</p>
        {mobile.note && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{mobile.note}</p>}
        <Button type="button" variant="ghost" size="sm" className="mt-2 w-full" onClick={copy}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? 'Copied' : 'Copy link'}</Button>
      </>}
      {error && <p role="alert" className="text-xs leading-relaxed text-destructive">{error}</p>}
    </PopoverContent>
  </Popover>;
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
  const [guidedError, setGuidedError] = useState<string>();
  // Guided Match my site applies immediately; this captures what to put back on Undo.
  const [actionsContainer, setActionsContainer] = useState<HTMLDivElement | null>(null);
  const [finalCheckContainer, setFinalCheckContainer] = useState<HTMLDivElement | null>(null);
  const [matchUndo, setMatchUndo] = useState<{ layout: PreviewLayoutType; settings: TypeSettings; progress: NonNullable<ConfiguratorSetupFormState['setupProgress']>[PreviewLayoutType]; integration: [string, string][] }>();
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
  const guidedApplied = useRef<string | undefined>(undefined);
  useEffect(() => {
    const selection = props.guidedSelection;
    if (!setup.hasHydrated || !selection) return;
    const key = `${setup.hydrationKey}:${selection.layout}:${selection.preset}:${!!selection.resume}`;
    if (guidedApplied.current === key) return;
    if (formState.layout !== selection.layout) {
      setup.setLayout(selection.layout);
      return;
    }
    guidedApplied.current = key;
    setSelectedPreset(selection.preset);
    const selected = selection.resume ? currentSettings : applySetupPreset(selection.layout, selection.preset, progress?.configured ? currentSettings : undefined, !!progress?.themeStyle);
    const unavailable = describeUnsupportedFeatures(unsupportedSetupFeatures(selected, props.compatibility, setup.initialSettings?.[selection.layout]));
    if (unavailable) {
      setGuidedError(unavailable);
      return;
    }
    setGuidedError(undefined);
    // Preserve edits when the user returns to this step with the same preset, or reopens a finished type.
    if (!selection.resume && progress?.presetId !== selection.preset) setup.applyPreset(selection.preset, !!props.themeStyling);
    setScreen(props.themeStyling ? 'theme' : 'summary');
  }, [setup.hasHydrated, setup.hydrationKey, setup.setLayout, setup.applyPreset, setup.initialSettings, formState.layout, progress, currentSettings, props.compatibility, props.themeStyling, props.guidedSelection?.layout, props.guidedSelection?.preset, props.guidedSelection?.resume]);

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

  const hideInlineSave = props.hideSaveButton || !!props.saveSlot;
  // Guided step 5: until there are settings to show (saved before, saved now, or a match in the draft),
  // only Match my site is available.
  const [savedThisSession, setSavedThisSession] = useState(false);
  const lockedUntilSettings = !!props.guidedSelection && !setup.initialSettings && !savedThisSession && !progress?.themeStyle;
  const guidedSaveDisabled = !!saveUnavailable || lockedUntilSettings;
  // Guided: the site preview comes first. Until it has been opened this visit (here, by an earlier click's tab, or on a
  // phone), the step shows only the preview buttons; Ask for changes, Fine-tune, Final check and Save appear once it has.
  // Only when the preview can actually be opened, so the store is never stuck behind a button that doesn't work.
  const [previewOpened, setPreviewOpened] = useState(false);
  const guidedPreview = props.guidedSelection ? props.livePreview : undefined;
  const previewUsable = !!guidedPreview && !guidedPreview.disabled && !guidedSaveDisabled &&
    (guidedPreview.availability === undefined || guidedPreview.availability === 'supported' || guidedPreview.availability === 'requires-unlock' || guidedPreview.availability === 'checking');
  const chatPage = !!props.guidedSelection && !!props.renderStorefrontTools;
  // After the host's first automatic match, the site is only matched again when the store asks: Match my site again
  // on the chat page. After a match applies, the page talks about the fresh match rather than the saved settings.
  const [matchingAgain, setMatchingAgain] = useState(false);
  const [matchedThisVisit, setMatchedThisVisit] = useState(false);
  const previewFirst = !chatPage && activeScreen === 'theme' && !previewOpened && previewUsable;
  const guidedPreviewConfig = useMemo(() => guidedPreview && {
    ...guidedPreview,
    // Still called synchronously from the click, so the host can open the tab.
    onRequest: (request: ConfiguratorSetupLivePreviewRequest) => { setPreviewOpened(true); return guidedPreview.onRequest(request); },
    mobile: guidedPreview.mobile && { ...guidedPreview.mobile, onLink: (request: ConfiguratorSetupLivePreviewRequest) => { setPreviewOpened(true); return guidedPreview.mobile!.onLink(request); } },
  }, [guidedPreview]);
  // After Match my site is applied, open the site preview in the tab prepared during the click.
  const [autoPreview, setAutoPreview] = useState(false);
  useEffect(() => {
    if (!autoPreview) return;
    setAutoPreview(false);
    const preview = props.livePreview;
    if (!preview || preview.disabled || saveUnavailable) { preview?.onDiscardWindow?.(); return; }
    setPreviewOpened(true);
    void Promise.resolve(preview.onRequest({ payload: buildConfiguratorSetupPayload(formState), activeLayout: formState.layout })).catch(() => undefined);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once, on the render that carries the applied match
  }, [autoPreview]);
  // Drop overrides for themes that were deleted from the store before saving.
  const existingThemeIds = props.selectorThemes?.themes.map(theme => theme.id);
  // Offer overrides only when the deployed plugin resolves them; keep existing ones reviewable after a downgrade.
  // Unknown builds (no compatibility report) may support overrides; a recognised build must list the feature.
  const themeOverridesSupported = !props.compatibility || props.compatibility.supportedFeatures.includes(THEME_SELECTORS_FEATURE);
  const hasThemeOverrides = Object.values(formState.typeSettings).some(settings => settings.themeSelectors && Object.keys(settings.themeSelectors).length);
  const selectorThemes = themeOverridesSupported || hasThemeOverrides ? props.selectorThemes : undefined;
  const onSave = props.onSave && ((payload: ConfiguratorSetupPayload) => { props.onSave!(pruneThemeSelectorsInPayload(payload, existingThemeIds)); setSavedThisSession(true); });
  // Guided Advanced setup takes over the window; its own bar saves and returns to Automatic setup.
  const fullscreenEditor = !!props.guidedSelection && setup.hasHydrated && !onboarding && activeScreen === 'editor';
  // The full editor's site preview button lives in the bar above the preview. Guided setup's chat page has its own.
  const toolbarPreview = !!props.livePreview && !(props.guidedSelection && activeScreen !== 'editor');
  const [placementReportSlot, setPlacementReportSlot] = useState<HTMLElement | null>(null);
  const backToAutomatic = () => setScreen(props.themeStyling ? 'theme' : 'summary');
  const slotSave = props.saveSlot?.container && setup.hasHydrated && !previewFirst && !fullscreenEditor ? createPortal(<SetupSaveControls formState={formState} getExportJson={getExportJson} onSave={onSave} label={props.saveLabel} hideSaveButton={props.hideSaveButton} saveDisabled={guidedSaveDisabled} buttonClassName={props.saveSlot.className} />, props.saveSlot.container) : null;
  const previewActions = props.guidedSelection ? (guidedPreviewConfig
    ? <LivePreviewAction simple primary={previewFirst} config={{ ...guidedPreviewConfig, label: previewFirst ? 'Open preview' : 'Preview site', disabled: guidedPreviewConfig.disabled || guidedSaveDisabled }} state={formState} />
    : <p role="status">Site preview is unavailable.</p>) : undefined;
  // A click: the preview tab may open now, and fills once the match applies.
  const matchAgain = chatPage && props.themeStyling && !props.themeStyling.disabled
    ? () => { props.livePreview?.onPrepareWindow?.(); setMatchingAgain(true); } : undefined;
  const advancedActions = props.guidedSelection ? <>
    {matchAgain && <Button variant="ghost" size="sm" disabled={matchingAgain || !!props.guidedAutoMatch} onClick={matchAgain}><Palette className="h-4 w-4" />Match my site again</Button>}
    <Button variant={chatPage ? 'ghost' : 'outline'} size={chatPage ? 'sm' : 'lg'} disabled={!chatPage && lockedUntilSettings} onClick={() => setScreen('editor')}><SlidersHorizontal className="h-4 w-4" />Advanced setup</Button>
    <SetupSaveControls formState={formState} getExportJson={getExportJson} onSave={onSave} label={props.saveLabel} hideSaveButton={hideInlineSave} saveDisabled={guidedSaveDisabled} />
  </> : undefined;
  return <div ref={rootRef} className={`ov25-setup ${props.className ?? 'h-screen'}${fullscreenEditor ? ' ov25-setup-fullscreen' : ''}`}>
    {slotSave}
    {fullscreenEditor && <header className="ov25-setup-fullscreen-bar">
      <Button variant="ghost" size="sm" autoFocus onClick={backToAutomatic}><ArrowLeft className="h-3.5 w-3.5" />Back to automatic setup</Button>
      <h2 className="ov25-setup-fullscreen-title">Advanced setup</h2>
      <SetupSaveControls formState={formState} getExportJson={getExportJson} onSave={onSave} label={props.saveLabel} hideSaveButton={props.hideSaveButton} saveDisabled={guidedSaveDisabled} buttonClassName={props.saveSlot?.className} />
    </header>}
    {setup.hasHydrated && !onboarding && (props.previewToolbar || toolbarPreview) && <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 border-b bg-white p-3" data-ov25-setup-preview-toolbar>
      {props.previewToolbar}
      {toolbarPreview && props.livePreview && <LivePreviewAction key={`${setup.hydrationKey}:${formState.layout}`} toolbar={{ reportContainer: placementReportSlot }} config={{ ...props.livePreview, disabled: props.livePreview.disabled || !!saveUnavailable }} state={formState} />}
    </div>}
    {!setup.hasHydrated ? <p role="status" className="p-5 text-sm text-muted-foreground">Loading your setup…</p> : guidedError && props.guidedSelection ? <p role="alert" className="p-5 text-sm text-destructive">{guidedError} Return to Choose preset to select a compatible layout.</p> : onboarding ? <main className="ov25-setup-onboarding" data-ov25-setup-step={activeScreen}>
      {!props.guidedSelection && <header className="ov25-setup-onboarding-header">
        <ol className="ov25-setup-steps" aria-label="Setup progress">
          <li aria-current={activeScreen === 'picker' ? 'step' : undefined}><span>1</span>Choose a preset</li>
          {props.themeStyling && <li aria-current={activeScreen === 'theme' ? 'step' : undefined}><span>2</span>Match my site</li>}
          <li><span>{props.themeStyling ? '3' : '2'}</span>Preview & edit</li>
        </ol>
        <ProductTypeSelector layout={formState.layout} onChange={setLayout} compact />
      </header>}
      {activeScreen === 'picker' ? <PresetPicker layout={formState.layout} selected={selectedPreset} onSelect={setSelectedPreset} onApply={choose} onCancel={progress?.configured ? () => setScreen(defaultScreen === 'theme' ? 'theme' : 'summary') : undefined} unavailable={candidateUnavailable} /> : props.themeStyling && <div className="ov25-setup-theme-content">
        <ThemeStyleAction
          key={`${setup.hydrationKey}:${formState.layout}:${props.themeStyling.contextKey}`}
          inlineStorefrontTools={chatPage}
          onActionsContainer={props.renderStorefrontTools ? setActionsContainer : undefined}
          onFinalCheckContainer={props.renderStorefrontTools ? setFinalCheckContainer : undefined}
          storefrontTools={props.renderStorefrontTools?.({ page: chatPage ? {
            previewActions, advancedActions, previewProduct: props.previewProductControl,
            themeName: props.themeStyling.themeSelection?.options.find(option => option.value === props.themeStyling?.themeSelection?.value)?.label.replace(/\s*\(Live\)$/, ''),
            preparation: props.guidedAutoMatch || matchingAgain ? 'preparing' : lockedUntilSettings ? 'unavailable' : props.guidedSelection?.resume && !matchedThisVisit ? 'saved' : 'ready',
          } : undefined, actionsContainer, finalCheckContainer, request: { payload: buildConfiguratorSetupPayload(formState), activeLayout: formState.layout }, customCss: currentSettings.branding.cssString, onCustomCssChange: css => updateNested('branding', 'cssString', css), onRuntimeConfigChange: config => {
            const settings = mergeSerializableIntoTypeSettings(currentSettings, config, formState.layout);
            setup.restoreLayout(formState.layout, { settings, progress: { ...progress, configured: true } });
            return { payload: buildConfiguratorSetupPayload({ ...formState, typeSettings: { ...formState.typeSettings, [formState.layout]: settings } }), activeLayout: formState.layout };
          } })}
          config={props.themeStyling} layout={formState.layout} settings={currentSettings} integration={props.storefrontIntegration} compatibility={props.compatibility}
          matchedLabel={progress?.themeStyle?.label} onBack={props.guidedSelection ? undefined : changePreset} onContinue={continueToPreview}
          previewProduct={props.guidedSelection ? props.previewProductControl : undefined}
          previewFirst={previewFirst}
          themeAction={previewActions}
          actions={advancedActions}
          autoMatch={!!props.guidedSelection && (!!props.guidedAutoMatch || matchingAgain)}
          onAutoMatchEnd={() => { setMatchingAgain(false); props.onGuidedAutoMatchEnd?.(); }}
          onMatchStart={props.guidedSelection && props.livePreview && !props.livePreview.disabled ? () => props.livePreview?.onPrepareWindow?.() : undefined}
          // Every successful guided entry opens or updates the preview, including restored/automatic entries.
          onMatchEnd={props.guidedSelection ? (applied) => {
            if (applied) { setAutoPreview(true); setMatchedThisVisit(true); }
            else if (!applied) props.livePreview?.onDiscardWindow?.();
          } : undefined}
          onUndo={matchUndo && matchUndo.layout === formState.layout ? () => {
            setup.restoreLayout(matchUndo.layout, { settings: matchUndo.settings, progress: { ...matchUndo.progress, configured: matchUndo.progress?.configured ?? true, themeStyle: undefined, themeStep: 'pending' } });
            const integration = props.storefrontIntegration;
            if (integration?.status === 'ready') for (const [key, value] of matchUndo.integration) integration.onChange(key as never, value);
            setMatchUndo(undefined);
          } : undefined}
          onApply={(proposal, options) => {
            // Global placement values stay in the host's unsaved integration draft.
            const integration = props.storefrontIntegration;
            const integrationBefore: [string, string][] = [];
            if (proposal.placement && integration?.status === 'ready') {
              for (const target of getAvailableSelectorDiscoveryTargets(proposal.placement, currentSettings, integration)) {
                if (!isSelectorDiscoveryLayoutKey(target.key)) {
                  integrationBefore.push([target.key, getSelectorDiscoveryCurrentValue(target.key, currentSettings, integration) ?? '']);
                  integration.onChange(target.key, target.selector);
                }
              }
            }
            setMatchUndo((previous) => previous?.layout === formState.layout ? previous : { layout: formState.layout, settings: currentSettings, progress: formState.setupProgress?.[formState.layout], integration: integrationBefore });
            setup.applyThemeStyle(formState.layout, proposal);
            // Placements for a theme that isn't live become that theme's overrides (live selectors untouched).
            const themePlacement = options?.themePlacement;
            if (themePlacement) {
              let next = currentSettings;
              const shown = effectiveSelectors(currentSettings, themePlacement.themeId);
              for (const target of themePlacement.placement.targets) {
                if (!isSelectorDiscoveryLayoutKey(target.key) || !shown[target.key].enabled) continue;
                next = setThemeSelectorOverride(next, themePlacement.themeId, target.key, { ...shown[target.key], selector: target.selector });
              }
              setup.updateSettings('themeSelectors', next.themeSelectors);
            }
            setScreen(props.guidedSelection ? 'theme' : 'summary');
          }} />
      </div>}
    </main> : props.guidedSelection && activeScreen !== 'editor' ? <main className="p-4" data-ov25-setup-step="guided-preview">
      <p>Review your configuration on your site.</p>
      {props.livePreview ? <LivePreviewAction config={{ ...props.livePreview, label: 'Continue to preview', disabled: props.livePreview.disabled || !!saveUnavailable }} state={formState} /> : <p role="status">Site preview is unavailable.</p>}
      <Button variant="outline" onClick={() => setScreen('editor')}><SlidersHorizontal className="h-4 w-4" />Advanced setup</Button>
      <SetupSaveControls formState={formState} getExportJson={getExportJson} onSave={onSave} label={props.saveLabel} hideSaveButton={hideInlineSave} saveDisabled={!!saveUnavailable} />
    </main> : <div className={`ov25-setup-layout ${props.hidePreview ? 'ov25-setup-no-preview' : ''}`}>
      {!props.hidePreview && <main className="ov25-setup-preview"><PreviewArea serializableConfig={serializableConfig} previewBaseUrl={props.previewBaseUrl} useLocalPreview={props.useLocalPreview} /></main>}
      <aside className="ov25-setup-sidebar">
        {/* Guided setup chose the type and preset in earlier steps, so they aren't changed here. */}
        {!props.guidedSelection && <ProductTypeSelector layout={formState.layout} onChange={setLayout} />}
        {activeScreen === 'editor' ? <>
          {/* Guided setup returns from the full-screen bar above. */}
          {!fullscreenEditor && <div className="flex shrink-0 items-center justify-between py-2">
            <Button variant="ghost" size="sm" onClick={() => setScreen('summary')}><ArrowLeft className="h-3.5 w-3.5" />Summary</Button>
            <Button variant="ghost" size="sm" onClick={changePreset}>Change preset</Button>
          </div>}
          <ConfigPanel selectorThemes={selectorThemes?.themes} initialSelectorThemeId={selectorThemes?.currentThemeId} formState={formState} currentSettings={currentSettings} setLayout={setLayout} updateSettings={updateSettings} updateNested={updateNested} getExportJson={getExportJson} onSave={onSave} hideSaveButton={hideInlineSave} storefrontIntegration={props.storefrontIntegration} hideProductType saveDisabled={!!saveUnavailable} />
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
              {progress?.themeStyle && <p className="mt-1 text-center text-xs text-muted-foreground">Matched to {progress.themeStyle.label.split(' — ')[0]}</p>}
            </>}
            {saveUnavailable && <p role="alert" className="mt-4 text-sm text-destructive">{saveUnavailable}</p>}
          </div>
          <SetupSaveControls formState={formState} getExportJson={getExportJson} onSave={onSave} label={props.saveLabel} hideSaveButton={hideInlineSave} saveDisabled={!!saveUnavailable} />
        </>}
        {/* The site preview button is in the bar above the preview; its placement warnings land here. */}
        <div ref={setPlacementReportSlot} className="shrink-0 empty:hidden" data-ov25-setup-placement-report />
      </aside>
    </div>}
    <Dialog open={confirmReplacement} onOpenChange={setConfirmReplacement}>
      <DialogContent><DialogHeader><DialogTitle>Replace customised settings?</DialogTitle><DialogDescription>This preset will replace your layout, gallery, {keepsThemeStyle ? 'element styles' : 'styling'} and custom CSS for this product type. Your selectors, logos, text replacements and product rules will be kept.{keepsThemeStyle ? ' Your colours, fonts and button styling will also be kept.' : ''}</DialogDescription></DialogHeader>
        <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setConfirmReplacement(false)}>Keep current settings</Button><Button onClick={apply}>Replace settings</Button></div>
      </DialogContent>
    </Dialog>
  </div>;
}
