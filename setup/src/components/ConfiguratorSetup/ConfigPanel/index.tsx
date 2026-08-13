import { useState, useCallback } from 'react';
import { Copy, Check, Settings, Paintbrush, Plug, Save } from 'lucide-react';
import { ScrollArea } from '../../ui/scroll-area';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import type { PreviewLayoutType } from '../../../lib/config/preview-config';
import type {
  ConfiguratorSetupFormState, TypeSettings,
  FormCarouselDisplayMode, FormConfiguratorDisplayMode,
  FormConfiguratorDisplayModeMobile, FormVariantDisplayMode,
  FormSelectionDetailsDisplayMode, FormSelectionDetailsMobileDisplayMode,
  FormSnap2VariantPosition, FormSnap2ModulePosition,
} from '../types';
import { SectionHeader, SwitchRow, DesktopMobileRow, CompactSelect } from '../shared-ui';
import { StylePanel } from '../StyleEditor';
import type { ConfiguratorSetupPayload } from '../useConfiguratorSetup';
import { StorefrontIntegrationPanel } from '../StorefrontIntegrationPanel';
import type { StorefrontIntegrationConfig } from '../storefront-integration';

interface ConfigPanelProps {
  formState: ConfiguratorSetupFormState;
  currentSettings: TypeSettings;
  setLayout: (layout: PreviewLayoutType) => void;
  updateSettings: <K extends keyof TypeSettings>(key: K, value: TypeSettings[K]) => void;
  updateNested: (section: keyof TypeSettings, key: string, value: unknown) => void;
  getExportJson: (mode: 'current' | 'all') => object;
  onSave?: (payload: ConfiguratorSetupPayload) => void;
  hideSaveButton?: boolean;
  storefrontIntegration?: StorefrontIntegrationConfig;
}

const LAYOUT_OPTIONS: { value: PreviewLayoutType; label: string; description: string }[] = [
  { value: 'standard', label: 'Standard', description: 'Single product or range' },
  { value: 'snap2', label: 'Snap2', description: 'Modal product builder' },
  {
    value: 'bedConfigurator',
    label: 'Bed',
    description: 'Bed configurator',
  },
];

const LAYOUT_EXPORT_LABELS: Record<PreviewLayoutType, string> = {
  standard: 'Standard',
  snap2: 'Snap2',
  bedConfigurator: 'Bed configurator',
};

const CAROUSEL_OPTIONS = [
  { value: 'none' as FormCarouselDisplayMode, label: 'None', desc: 'No product images' },
  { value: 'carousel' as FormCarouselDisplayMode, label: 'Carousel', desc: 'Horizontal scroll' },
  { value: 'stacked' as FormCarouselDisplayMode, label: 'Stacked', desc: 'Vertical grid' },
];

const DISPLAY_DESKTOP_OPTIONS = [
  { value: 'inline' as FormConfiguratorDisplayMode, label: 'Inline', desc: 'Embedded beside the gallery' },
  { value: 'inline-sticky' as FormConfiguratorDisplayMode, label: 'Inline (sticky)', desc: 'Viewer stays visible while variants scroll' },
  { value: 'sheet' as FormConfiguratorDisplayMode, label: 'Sheet', desc: 'Slides in from the sides.' },
  { value: 'modal' as FormConfiguratorDisplayMode, label: 'Modal', desc: 'Centered overlay dialog' },
  { value: 'variants-only-sheet' as FormConfiguratorDisplayMode, label: 'Variants sheet', desc: 'Sheet with variants only' },
];

const SNAP2_DISPLAY_DESKTOP_OPTIONS = [
  { value: 'modal' as FormConfiguratorDisplayMode, label: 'Dialog', desc: 'Centered overlay dialog' },
  { value: 'inline' as FormConfiguratorDisplayMode, label: 'Inline', desc: 'Embedded beside the gallery' },
];

const DISPLAY_MOBILE_OPTIONS = [
  { value: 'inline' as FormConfiguratorDisplayModeMobile, label: 'Inline', desc: 'Embedded below gallery' },
  { value: 'inline-sticky' as FormConfiguratorDisplayModeMobile, label: 'Inline (sticky)', desc: 'Viewer stays visible while variants scroll' },
  { value: 'drawer' as FormConfiguratorDisplayModeMobile, label: 'Drawer', desc: 'Slides up from bottom' },
  { value: 'modal' as FormConfiguratorDisplayModeMobile, label: 'Modal', desc: 'Centered overlay dialog' },
  { value: 'variants-only-sheet' as FormConfiguratorDisplayModeMobile, label: 'Variants sheet', desc: 'Sheet with variants only' },
];

const SNAP2_DISPLAY_MOBILE_OPTIONS = [
  { value: 'modal' as FormConfiguratorDisplayModeMobile, label: 'Dialog', desc: 'Centered overlay dialog' },
  { value: 'drawer' as FormConfiguratorDisplayModeMobile, label: 'Drawer', desc: 'Slides up from bottom' },
  { value: 'inline' as FormConfiguratorDisplayModeMobile, label: 'Inline', desc: 'Embedded below gallery' },
];

const TRIGGER_OPTIONS = [
  { value: 'single-button', label: 'Single', desc: 'One configure button' },
  { value: 'split-buttons', label: 'Split', desc: 'Separate add & configure' },
];

const VARIANT_OPTIONS = [
  { value: 'tree' as FormVariantDisplayMode, label: 'Tree', desc: 'Nested groups' },
  { value: 'list' as FormVariantDisplayMode, label: 'List', desc: 'Flat list' },
  { value: 'tabs' as FormVariantDisplayMode, label: 'Tabs', desc: 'Tabbed groups' },
  { value: 'accordion' as FormVariantDisplayMode, label: 'Accordion', desc: 'Collapsible groups' },
  { value: 'wizard' as FormVariantDisplayMode, label: 'Wizard', desc: 'Step by step' },
];

const SELECTION_DETAILS_DESKTOP_OPTIONS = [
  { value: 'none' as FormSelectionDetailsDisplayMode, label: 'None', desc: 'Keep direct selection' },
  { value: 'tooltip' as FormSelectionDetailsDisplayMode, label: 'Tooltip', desc: 'Preview on hover or keyboard focus' },
  { value: 'sheet' as FormSelectionDetailsDisplayMode, label: 'Sheet', desc: 'Slide in from the right' },
  { value: 'modal' as FormSelectionDetailsDisplayMode, label: 'Modal', desc: 'Near-fullscreen dialog' },
  { value: 'fullscreen' as FormSelectionDetailsDisplayMode, label: 'Fullscreen', desc: 'Fill the viewport' },
];

const SELECTION_DETAILS_MOBILE_OPTIONS = [
  { value: 'none' as FormSelectionDetailsMobileDisplayMode, label: 'None', desc: 'Keep direct selection' },
  { value: 'modal' as FormSelectionDetailsMobileDisplayMode, label: 'Modal', desc: 'Near-fullscreen dialog' },
  { value: 'fullscreen' as FormSelectionDetailsMobileDisplayMode, label: 'Fullscreen', desc: 'Fill viewport and slide in' },
];

const SNAP2_VARIANT_POSITION_OPTIONS = [
  { value: 'left' as FormSnap2VariantPosition, label: 'Left' },
  { value: 'right' as FormSnap2VariantPosition, label: 'Right' },
];

const SNAP2_MODULE_POSITION_OPTIONS = [
  { value: 'left' as FormSnap2ModulePosition, label: 'Left' },
  { value: 'right' as FormSnap2ModulePosition, label: 'Right' },
  { value: 'bottom' as FormSnap2ModulePosition, label: 'Bottom' },
];

const ELEMENT_TOGGLES: { key: keyof TypeSettings['selectors']; label: string }[] = [
  { key: 'gallery', label: 'Configurator container' },
  { key: 'price', label: 'Price' },
  { key: 'name', label: 'Product name' },
  { key: 'variants', label: 'Variant controls' },
  { key: 'swatches', label: 'Swatches' },
  { key: 'configureButton', label: 'Configure button' },
];

const FLAG_TOGGLES: { key: keyof TypeSettings['flags']; label: string }[] = [
  { key: 'hidePricing', label: 'Hide pricing' },
  { key: 'disableAddToCart', label: 'Disable Add to Cart button' },
  { key: 'disableBuyNow', label: 'Disable Buy Now button' },
  { key: 'hideAr', label: 'Hide AR button' },
  { key: 'hideGestureHint', label: 'Hide 3D Drag Indicator' },
  { key: 'deferThreeD', label: 'Defer 3D loading' },
  { key: 'showOptional', label: 'Show optional variants' },
  { key: 'forceMobile', label: 'Force mobile layout' },
  { key: 'autoOpen', label: 'Auto-open configurator' },
];

function Snap2PositionRow({
  label,
  showDesktop,
  showMobile,
  desktopValue,
  mobileValue,
  onDesktopChange,
  onMobileChange,
  options,
}: {
  label: string;
  showDesktop: boolean;
  showMobile: boolean;
  desktopValue: string;
  mobileValue: string;
  onDesktopChange: (v: string) => void;
  onMobileChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  if (!showDesktop && !showMobile) return null;

  return (
    <div className="space-y-1.5">
      <span className="text-sm text-foreground">{label}</span>
      <div className={`grid gap-2 ${showDesktop && showMobile ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {showDesktop && (
          <div>
            <Label className="text-[10px] text-muted-foreground mb-0.5">Desktop</Label>
            <CompactSelect value={desktopValue} onValueChange={onDesktopChange} options={options} />
          </div>
        )}
        {showMobile && (
          <div>
            <Label className="text-[10px] text-muted-foreground mb-0.5">Mobile</Label>
            <CompactSelect value={mobileValue} onValueChange={onMobileChange} options={options} />
          </div>
        )}
      </div>
    </div>
  );
}

type ExportMode = 'current' | 'all';

function ProductTypeSelector({
  layout,
  onChange,
}: {
  layout: PreviewLayoutType;
  onChange: (layout: PreviewLayoutType) => void;
}) {
  return (
    <section
      className="shrink-0 border-b border-border pb-4"
      data-ov25-setup-product-type
    >
      <SectionHeader description="Choose the configurator experience to edit. Each type keeps its own settings.">
        Product Type
      </SectionHeader>
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {LAYOUT_OPTIONS.map((option) => {
          const selected = layout === option.value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              data-ov25-setup-product-type-option={option.value}
              onClick={() => onChange(option.value)}
              className={`min-h-[4.75rem] rounded-lg border px-2 py-2 text-center transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                selected
                  ? 'border-foreground bg-foreground text-background shadow-sm'
                  : 'border-border bg-background text-muted-foreground hover:border-foreground/30 hover:bg-muted/40'
              }`}
            >
              <span className="block text-xs font-semibold leading-tight">{option.label}</span>
              <span
                className={`mt-1 block text-[10px] leading-tight ${
                  selected ? 'text-background/70' : 'text-muted-foreground/75'
                }`}
              >
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function SettingsSection({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="min-w-0 rounded-xl border border-border bg-muted/20 p-3.5"
      data-ov25-setup-section={id}
    >
      <SectionHeader description={description}>{title}</SectionHeader>
      <div className="mt-3 min-w-0 space-y-3">{children}</div>
    </section>
  );
}

function SelectorControl({
  selectorKey,
  label,
  settings,
  onToggle,
  onSelectorChange,
}: {
  selectorKey: keyof TypeSettings['selectors'];
  label: string;
  settings: TypeSettings['selectors'][keyof TypeSettings['selectors']];
  onToggle: (enabled: boolean) => void;
  onSelectorChange: (selector: string) => void;
}) {
  const inputId = `ov25-setup-selector-${selectorKey}`;
  return (
    <div className="min-w-0 space-y-2 rounded-lg border border-border bg-background p-2.5">
      <SwitchRow label={label} checked={settings.enabled} onCheckedChange={onToggle} />
      <div className="min-w-0">
        <Label htmlFor={inputId} className="mb-1 text-[10px] text-muted-foreground">
          CSS selector
        </Label>
        <Input
          id={inputId}
          type="text"
          value={settings.selector}
          onChange={(event) => onSelectorChange(event.target.value)}
          aria-label={`${label} selector`}
          className="h-8 min-w-0 font-mono text-[11px]"
        />
      </div>
    </div>
  );
}

export function ConfigPanel({ formState, currentSettings, setLayout, updateSettings, updateNested, getExportJson, onSave, hideSaveButton, storefrontIntegration }: ConfigPanelProps) {
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [exportMode, setExportMode] = useState<ExportMode>('current');
  const [modalCopied, setModalCopied] = useState(false);
  const isSnap2 = formState.layout === 'snap2';
  const isBed = formState.layout === 'bedConfigurator';
  const showSnap2DesktopPositionControls = isSnap2 && currentSettings.configurator.displayModeDesktop === 'modal';
  const showSnap2PositionControls = showSnap2DesktopPositionControls;

  const handleSelectorToggle = (key: keyof TypeSettings['selectors'], enabled: boolean) => {
    updateNested('selectors', key, { ...currentSettings.selectors[key], enabled });
  };

  const handleSelectorChange = (key: keyof TypeSettings['selectors'], selector: string) => {
    updateNested('selectors', key, { ...currentSettings.selectors[key], selector });
  };

  const getExportString = useCallback(() => {
    const json = getExportJson(exportMode);
    return JSON.stringify(json, null, 2);
  }, [getExportJson, exportMode]);

  const handleSave = useCallback(async () => {
    if (onSave) {
      const json = getExportJson('all') as ConfiguratorSetupPayload;
      onSave(json);
      return;
    }
    const text = getExportString();
    await navigator.clipboard.writeText(text);
    setSaveModalOpen(true);
  }, [getExportString, getExportJson, onSave]);

  const handleModalCopy = useCallback(async () => {
    const text = getExportString();
    await navigator.clipboard.writeText(text);
    setModalCopied(true);
    setTimeout(() => setModalCopied(false), 2000);
  }, [getExportString]);

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden" data-ov25-setup-config-panel>
      <ProductTypeSelector layout={formState.layout} onChange={setLayout} />

      <Tabs
        defaultValue="settings"
        className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
        data-ov25-setup-editor-tabs
      >
      <div className="shrink-0 pt-3">
        <TabsList className={`w-full h-9 p-1 bg-muted rounded-full grid ${storefrontIntegration ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <TabsTrigger
            value="settings"
            className="rounded-full text-xs font-semibold text-muted-foreground gap-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#26E8FE] data-[state=active]:via-[#808AFF] data-[state=active]:to-[#A41EFE] data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            <Settings className="h-3.5 w-3.5" />
            Settings
          </TabsTrigger>
          <TabsTrigger
            value="style"
            className="rounded-full text-xs font-semibold text-muted-foreground gap-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#26E8FE] data-[state=active]:via-[#808AFF] data-[state=active]:to-[#A41EFE] data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            <Paintbrush className="h-3.5 w-3.5" />
            Style
          </TabsTrigger>
          {storefrontIntegration && (
            <TabsTrigger
              value="integration"
              data-ov25-setup-integration-tab
              className="rounded-full text-xs font-semibold text-muted-foreground gap-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#26E8FE] data-[state=active]:via-[#808AFF] data-[state=active]:to-[#A41EFE] data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <Plug className="h-3.5 w-3.5" />
              Global
            </TabsTrigger>
          )}
        </TabsList>
      </div>

      <TabsContent value="settings" className="mt-0 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <ScrollArea className="h-full min-h-0 min-w-0">
          <div className="min-w-0 max-w-full space-y-3 py-3 pr-4">
            <SettingsSection
              id="display-layout"
              title="Display & layout"
              description="Choose where the configurator appears and how product imagery is arranged."
            >
              <DesktopMobileRow
                label="Configurator display"
                desktopValue={currentSettings.configurator.displayModeDesktop}
                mobileValue={currentSettings.configurator.displayModeMobile}
                onDesktopChange={(v) => updateNested('configurator', 'displayModeDesktop', v)}
                onMobileChange={(v) => updateNested('configurator', 'displayModeMobile', v)}
                options={isSnap2 ? SNAP2_DISPLAY_DESKTOP_OPTIONS : DISPLAY_DESKTOP_OPTIONS}
                mobileOptions={isSnap2 ? SNAP2_DISPLAY_MOBILE_OPTIONS : DISPLAY_MOBILE_OPTIONS}
              />
              {showSnap2PositionControls && (
                <div className="space-y-3 border-t border-border pt-3">
                  <Snap2PositionRow
                    label="Variant position"
                    showDesktop={showSnap2DesktopPositionControls}
                    showMobile={false}
                    desktopValue={currentSettings.configurator.snap2VariantPositionDesktop}
                    mobileValue={currentSettings.configurator.snap2VariantPositionMobile}
                    onDesktopChange={(v) => updateNested('configurator', 'snap2VariantPositionDesktop', v)}
                    onMobileChange={(v) => updateNested('configurator', 'snap2VariantPositionMobile', v)}
                    options={SNAP2_VARIANT_POSITION_OPTIONS}
                  />
                  <Snap2PositionRow
                    label="Module position"
                    showDesktop={showSnap2DesktopPositionControls}
                    showMobile={false}
                    desktopValue={currentSettings.configurator.snap2ModulePositionDesktop}
                    mobileValue={currentSettings.configurator.snap2ModulePositionMobile}
                    onDesktopChange={(v) => updateNested('configurator', 'snap2ModulePositionDesktop', v)}
                    onMobileChange={(v) => updateNested('configurator', 'snap2ModulePositionMobile', v)}
                    options={SNAP2_MODULE_POSITION_OPTIONS}
                  />
                </div>
              )}
              <div className="space-y-3 border-t border-border pt-3">
                <SectionHeader description="Product images shown alongside the 3D viewer">
                  Image gallery
                </SectionHeader>
                <DesktopMobileRow
                  label="Gallery layout"
                  desktopValue={currentSettings.carousel.desktop}
                  mobileValue={currentSettings.carousel.mobile}
                  onDesktopChange={(v) => updateNested('carousel', 'desktop', v)}
                  onMobileChange={(v) => updateNested('carousel', 'mobile', v)}
                  options={CAROUSEL_OPTIONS}
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Max images (desktop)</Label>
                    <Input
                      type="number"
                      min={1}
                      value={currentSettings.carousel.maxImagesDesktop}
                      onChange={(e) => updateNested('carousel', 'maxImagesDesktop', parseInt(e.target.value) || 4)}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Max images (mobile)</Label>
                    <Input
                      type="number"
                      min={1}
                      value={currentSettings.carousel.maxImagesMobile}
                      onChange={(e) => updateNested('carousel', 'maxImagesMobile', parseInt(e.target.value) || 6)}
                      className="h-7 text-xs"
                    />
                  </div>
                </div>
              </div>
            </SettingsSection>

            <SettingsSection
              id="variant-experience"
              title="Variant experience"
              description="Control how customers open, browse, and inspect product options."
            >
              <DesktopMobileRow
                label="Configure trigger"
                desktopValue={currentSettings.configurator.triggerStyleDesktop}
                mobileValue={currentSettings.configurator.triggerStyleMobile}
                onDesktopChange={(v) => updateNested('configurator', 'triggerStyleDesktop', v)}
                onMobileChange={(v) => updateNested('configurator', 'triggerStyleMobile', v)}
                options={TRIGGER_OPTIONS}
              />
              <DesktopMobileRow
                label="Variant layout"
                desktopValue={currentSettings.configurator.variantDisplayDesktop}
                mobileValue={currentSettings.configurator.variantDisplayMobile}
                onDesktopChange={(v) => updateNested('configurator', 'variantDisplayDesktop', v)}
                onMobileChange={(v) => updateNested('configurator', 'variantDisplayMobile', v)}
                options={VARIANT_OPTIONS}
              />
              <DesktopMobileRow
                label="Selection details"
                desktopValue={currentSettings.configurator.selectionDetailsDisplayModeDesktop}
                mobileValue={currentSettings.configurator.selectionDetailsDisplayModeMobile}
                onDesktopChange={(v) => updateNested('configurator', 'selectionDetailsDisplayModeDesktop', v)}
                onMobileChange={(v) => updateNested('configurator', 'selectionDetailsDisplayModeMobile', v)}
                options={SELECTION_DETAILS_DESKTOP_OPTIONS}
                mobileOptions={SELECTION_DETAILS_MOBILE_OPTIONS}
              />
              {isSnap2 && (
                <SwitchRow
                  label="Starting configuration"
                  checked={!!currentSettings.snap2UseStartingConfig}
                  onCheckedChange={(v) => updateSettings('snap2UseStartingConfig', v)}
                />
              )}
              <div>
                <Label className="text-[10px] text-muted-foreground">Hide variant options (comma-separated)</Label>
                <p className="text-[10px] text-muted-foreground/80 mt-0.5 mb-1">
                  Option ids or names to omit from the variant UI (e.g. fabric, size). Iframe defaults stay applied.
                </p>
                <Input
                  type="text"
                  value={currentSettings.configurator.variantHideOptionsCsv}
                  onChange={(e) => updateNested('configurator', 'variantHideOptionsCsv', e.target.value)}
                  placeholder="e.g. fabric, size"
                  className="h-7 text-xs"
                />
              </div>
              {isBed && currentSettings.bed && (
                <div className="space-y-3 border-t border-border pt-3">
                  <SectionHeader description="Allow individual bed sections to remain unselected.">
                    Bed — allow “None”
                  </SectionHeader>
                  <SwitchRow
                    label="Headboard"
                    checked={currentSettings.bed.allowNoneHeadboard}
                    onCheckedChange={(v) => updateNested('bed', 'allowNoneHeadboard', v)}
                  />
                  <SwitchRow
                    label="Base"
                    checked={currentSettings.bed.allowNoneBase}
                    onCheckedChange={(v) => updateNested('bed', 'allowNoneBase', v)}
                  />
                  <SwitchRow
                    label="Mattress"
                    checked={currentSettings.bed.allowNoneMattress}
                    onCheckedChange={(v) => updateNested('bed', 'allowNoneMattress', v)}
                  />
                  <SectionHeader description="Only show selections whose bed size matches the current model.">
                    Bed — matching sizes
                  </SectionHeader>
                  <SwitchRow
                    label="Headboard"
                    checked={currentSettings.bed.filterMatchingSizeHeadboard}
                    onCheckedChange={(v) => updateNested('bed', 'filterMatchingSizeHeadboard', v)}
                  />
                  <SwitchRow
                    label="Base"
                    checked={currentSettings.bed.filterMatchingSizeBase}
                    onCheckedChange={(v) => updateNested('bed', 'filterMatchingSizeBase', v)}
                  />
                  <SwitchRow
                    label="Mattress"
                    checked={currentSettings.bed.filterMatchingSizeMattress}
                    onCheckedChange={(v) => updateNested('bed', 'filterMatchingSizeMattress', v)}
                  />
                </div>
              )}
            </SettingsSection>

            {!isSnap2 && (
              <SettingsSection
                id="storefront-selectors"
                title="Storefront selectors"
                description="Choose the existing page elements OV25 should use or replace. These values are saved in setup JSON."
              >
                {ELEMENT_TOGGLES.map(({ key, label }) => (
                  <SelectorControl
                    key={key}
                    selectorKey={key}
                    label={label}
                    settings={currentSettings.selectors[key]}
                    onToggle={(enabled) => handleSelectorToggle(key, enabled)}
                    onSelectorChange={(selector) => handleSelectorChange(key, selector)}
                  />
                ))}
              </SettingsSection>
            )}

            <SettingsSection
              id="behaviour"
              title="Behaviour"
              description="Fine-tune loading, commerce controls, visibility, and responsive overrides."
            >
              {FLAG_TOGGLES.map(({ key, label }) => (
                <SwitchRow
                  key={key}
                  label={label}
                  checked={currentSettings.flags[key]}
                  onCheckedChange={(v) => updateNested('flags', key, v)}
                />
              ))}
            </SettingsSection>
            <div className="h-4" />
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="style" className="mt-0 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <StylePanel currentSettings={currentSettings} updateSettings={updateSettings} updateNested={updateNested} />
      </TabsContent>

      {storefrontIntegration && (
        <TabsContent value="integration" className="mt-0 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <StorefrontIntegrationPanel config={storefrontIntegration} />
        </TabsContent>
      )}

      {!hideSaveButton && (
        <div className="shrink-0 pt-3 pb-1">
          <button
            type="button"
            onClick={handleSave}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-green-400 hover:bg-green-500 text-white font-semibold py-2.5 text-sm transition-colors shadow-sm"
          >
            <Save className="h-4 w-4" />
            Save
          </button>
        </div>
      )}

      <Dialog open={saveModalOpen} onOpenChange={setSaveModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Configurator Settings</DialogTitle>
            <DialogDescription>
              Your settings have been copied to clipboard. Paste this JSON into your inject configuration to apply these settings on your storefront.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 pt-1">
            <div className="flex bg-muted rounded-full p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setExportMode('current')}
                className={`px-3 py-1.5 rounded-full transition-colors ${
                  exportMode === 'current' ? 'bg-foreground text-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {LAYOUT_EXPORT_LABELS[formState.layout]} only
              </button>
              <button
                type="button"
                onClick={() => setExportMode('all')}
                className={`px-3 py-1.5 rounded-full transition-colors ${
                  exportMode === 'all' ? 'bg-foreground text-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All layouts
              </button>
            </div>
            <button
              type="button"
              onClick={handleModalCopy}
              className="ml-auto inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
            >
              {modalCopied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
              {modalCopied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-auto rounded-md border bg-muted/50">
            <pre className="p-4 text-xs font-mono whitespace-pre overflow-x-auto">
              {getExportString()}
            </pre>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {exportMode === 'all'
              ? `This includes settings for all layout types (${Object.keys(formState.typeSettings).join(', ')}). Use the top-level keys to apply settings per layout type.`
              : `This includes settings for the "${formState.layout}" layout only. Use this object directly in your inject call.`}
          </p>
        </DialogContent>
      </Dialog>
    </Tabs>
    </div>
  );
}
