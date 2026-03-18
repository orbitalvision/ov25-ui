import { useState, useCallback } from 'react';
import { Copy, Check, Settings, Paintbrush, Save } from 'lucide-react';
import { ScrollArea } from '../../ui/scroll-area';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { PREVIEW_PRODUCT_LINKS } from '../../../lib/config/preview-config';
import type { PreviewLayoutType } from '../../../lib/config/preview-config';
import type {
  ConfiguratorSetupFormState, TypeSettings,
  FormCarouselDisplayMode, FormConfiguratorDisplayMode,
  FormConfiguratorDisplayModeMobile, FormVariantDisplayMode,
} from '../types';
import { SectionHeader, SwitchRow, DesktopMobileRow, SectionDivider } from '../shared-ui';
import { StylePanel } from '../StyleEditor';
import type { ConfiguratorSetupPayload } from '../useConfiguratorSetup';

interface ConfigPanelProps {
  formState: ConfiguratorSetupFormState;
  currentSettings: TypeSettings;
  setLayout: (layout: PreviewLayoutType) => void;
  updateSettings: <K extends keyof TypeSettings>(key: K, value: TypeSettings[K]) => void;
  updateNested: (section: keyof TypeSettings, key: string, value: unknown) => void;
  getExportJson: (mode: 'current' | 'all') => object;
  onSave?: (payload: ConfiguratorSetupPayload) => void;
  hideSaveButton?: boolean;
}

const LAYOUT_OPTIONS: { value: PreviewLayoutType; label: string; description: string }[] = [
  { value: 'standard', label: 'Standard', description: 'Single product / range configurator' },
  { value: 'snap2', label: 'Snap2', description: 'Modal-based configurator' },
];

const CAROUSEL_OPTIONS = [
  { value: 'none' as FormCarouselDisplayMode, label: 'None', desc: 'No product images' },
  { value: 'carousel' as FormCarouselDisplayMode, label: 'Carousel', desc: 'Horizontal scroll' },
  { value: 'stacked' as FormCarouselDisplayMode, label: 'Stacked', desc: 'Vertical grid' },
];

const DISPLAY_DESKTOP_OPTIONS = [
  { value: 'inline' as FormConfiguratorDisplayMode, label: 'Inline', desc: 'Embedded beside the gallery' },
  { value: 'sheet' as FormConfiguratorDisplayMode, label: 'Sheet', desc: 'Slides up from the bottom' },
  { value: 'variants-only-sheet' as FormConfiguratorDisplayMode, label: 'Variants sheet', desc: 'Sheet with variants only' },
];

const DISPLAY_MOBILE_OPTIONS = [
  { value: 'inline' as FormConfiguratorDisplayModeMobile, label: 'Inline', desc: 'Embedded below gallery' },
  { value: 'drawer' as FormConfiguratorDisplayModeMobile, label: 'Drawer', desc: 'Slides up from bottom' },
  { value: 'variants-only-sheet' as FormConfiguratorDisplayModeMobile, label: 'Variants sheet', desc: 'Sheet with variants only' },
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

const ELEMENT_TOGGLES: { key: keyof TypeSettings['selectors']; label: string }[] = [
  { key: 'gallery', label: 'Gallery' },
  { key: 'price', label: 'Price' },
  { key: 'name', label: 'Product name' },
  { key: 'variants', label: 'Variant controls' },
  { key: 'swatches', label: 'Swatches' },
  { key: 'configureButton', label: 'Configure button' },
];

const FLAG_TOGGLES: { key: keyof TypeSettings['flags']; label: string }[] = [
  { key: 'hidePricing', label: 'Hide pricing' },
  { key: 'hideAr', label: 'Hide AR button' },
  { key: 'deferThreeD', label: 'Defer 3D loading' },
  { key: 'showOptional', label: 'Show optional variants' },
  { key: 'forceMobile', label: 'Force mobile layout' },
  { key: 'autoOpen', label: 'Auto-open configurator' },
];

type ExportMode = 'current' | 'all';

export function ConfigPanel({ formState, currentSettings, setLayout, updateSettings, updateNested, getExportJson, onSave, hideSaveButton }: ConfigPanelProps) {
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [exportMode, setExportMode] = useState<ExportMode>('current');
  const [modalCopied, setModalCopied] = useState(false);
  const isSnap2 = formState.layout === 'snap2';

  const handleSelectorToggle = (key: keyof TypeSettings['selectors'], enabled: boolean) => {
    updateNested('selectors', key, { ...currentSettings.selectors[key], enabled });
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
    <Tabs defaultValue="settings" className="h-full flex flex-col">
      <div className="shrink-0">
        <TabsList className="w-full h-9 p-1 bg-muted rounded-full grid grid-cols-2">
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
        </TabsList>
      </div>

      <TabsContent value="settings" className="flex-1 min-h-0 mt-0">
        <ScrollArea className="h-full">
          <div className="space-y-6 py-2 pr-4">

            {/* --- Configurator --- */}
            <SectionDivider />
            <div className="space-y-3">
              <SectionHeader description="How the variant selector appears and behaves on your product page">Configurator</SectionHeader>
              <DesktopMobileRow
                label="Display mode"
                desktopValue={currentSettings.configurator.displayModeDesktop}
                mobileValue={currentSettings.configurator.displayModeMobile}
                onDesktopChange={(v) => updateNested('configurator', 'displayModeDesktop', v)}
                onMobileChange={(v) => updateNested('configurator', 'displayModeMobile', v)}
                options={DISPLAY_DESKTOP_OPTIONS}
                mobileOptions={DISPLAY_MOBILE_OPTIONS}
              />
              <DesktopMobileRow
                label="Trigger style"
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
            </div>

            {/* --- Image Gallery --- */}
            <SectionDivider />
            <div className="space-y-3">
              <SectionHeader description="Product images shown alongside the 3D viewer">Image Gallery</SectionHeader>
              <DesktopMobileRow
                label="Layout"
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

            {/* --- Product Type --- */}
            <SectionDivider />
            <div className="space-y-3">
              <SectionHeader description="The type of configurator experience for this product">Product Type</SectionHeader>
              <div className="flex gap-1.5">
                {LAYOUT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setLayout(opt.value)}
                    className={`flex-1 rounded-md px-2.5 py-2 text-center transition-all border ${
                      formState.layout === opt.value
                        ? 'border-foreground bg-foreground text-background shadow-sm'
                        : 'border-border bg-white text-muted-foreground hover:border-foreground/30'
                    }`}
                  >
                    <div className="text-xs font-medium">{opt.label}</div>
                    <div className={`text-[9px] mt-0.5 ${formState.layout === opt.value ? 'text-background/70' : 'text-muted-foreground/60'}`}>{opt.description}</div>
                  </button>
                ))}
              </div>
              {isSnap2 && (
                <SwitchRow
                  label="Starting configuration"
                  checked={!!currentSettings.snap2UseStartingConfig}
                  onCheckedChange={(v) => updateSettings('snap2UseStartingConfig', v)}
                />
              )}
            </div>

            {/* --- Branding --- */}
            <SectionDivider />
            <div className="space-y-3">
              <SectionHeader description="Your brand logo displayed in the configurator header">Branding</SectionHeader>
              <div>
                <Label className="text-[10px] text-muted-foreground">Logo URL</Label>
                <Input
                  placeholder="https://..."
                  value={currentSettings.branding.logoURL}
                  onChange={(e) => updateNested('branding', 'logoURL', e.target.value)}
                  className="h-7 text-xs mt-0.5"
                />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">Mobile logo URL</Label>
                <Input
                  placeholder="https://..."
                  value={currentSettings.branding.mobileLogoURL}
                  onChange={(e) => updateNested('branding', 'mobileLogoURL', e.target.value)}
                  className="h-7 text-xs mt-0.5"
                />
              </div>
            </div>

            {/* --- Elements --- */}
            <SectionDivider />
            <div className="space-y-2.5">
              <SectionHeader description="Toggle which UI elements the configurator injects into your page">Elements</SectionHeader>
              {ELEMENT_TOGGLES.map(({ key, label }) => (
                <SwitchRow
                  key={key}
                  label={label}
                  checked={currentSettings.selectors[key].enabled}
                  onCheckedChange={(v) => handleSelectorToggle(key, v)}
                />
              ))}
            </div>

            {/* --- Behaviour --- */}
            <SectionDivider />
            <div className="space-y-2.5">
              <SectionHeader description="Fine-tune loading behaviour, visibility, and layout overrides">Behaviour</SectionHeader>
              {FLAG_TOGGLES.map(({ key, label }) => (
                <SwitchRow
                  key={key}
                  label={label}
                  checked={currentSettings.flags[key]}
                  onCheckedChange={(v) => updateNested('flags', key, v)}
                />
              ))}
            </div>
            <div className="h-4" />
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="style" className="flex-1 min-h-0 mt-0">
        <StylePanel currentSettings={currentSettings} updateSettings={updateSettings} updateNested={updateNested} />
      </TabsContent>

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
                {formState.layout === 'snap2' ? 'Snap2' : 'Standard'} only
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
  );
}
