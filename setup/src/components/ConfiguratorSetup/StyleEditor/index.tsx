import { useState, useCallback, useMemo } from 'react';
import { ChevronDown, ChevronRight, RotateCcw } from 'lucide-react';
import { ScrollArea } from '../../ui/scroll-area';
import { CSSEditor } from '../../ui/css-editor';
import { STYLE_GROUPS } from '../../../lib/config/configurator-style-variables';
import type { TypeSettings } from '../types';
import { SectionHeader, SectionDivider } from '../shared-ui';
import { StyleControl } from './controls';
import { ElementRuleBuilder } from './ElementRuleBuilder';

interface StylePanelProps {
  currentSettings: TypeSettings;
  updateSettings: <K extends keyof TypeSettings>(key: K, value: TypeSettings[K]) => void;
  updateNested: (section: keyof TypeSettings, key: string, value: unknown) => void;
}

function CollapsibleGroup({ label, description, defaultOpen = true, children }: {
  label: string; description: string; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="space-y-2.5">
      <button type="button" onClick={() => setOpen(!open)} className="flex items-center gap-1.5 w-full text-left">
        {open ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
        <SectionHeader description={description}>{label}</SectionHeader>
      </button>
      {open && <div className="space-y-2.5">{children}</div>}
    </div>
  );
}

export function StylePanel({ currentSettings, updateSettings, updateNested }: StylePanelProps) {
  const hasOverrides = useMemo(() => {
    return Object.keys(currentSettings.style).length > 0 || Object.keys(currentSettings.elementStyles).length > 0;
  }, [currentSettings.style, currentSettings.elementStyles]);

  const handleResetAll = useCallback(() => {
    updateSettings('style', {});
    updateSettings('elementStyles', {});
  }, [updateSettings]);

  const handleStyleChange = useCallback((variable: string, value: string) => {
    if (!value) {
      const next = { ...currentSettings.style };
      delete next[variable];
      updateSettings('style', next);
      return;
    }
    updateNested('style', variable, value);
  }, [currentSettings.style, updateSettings, updateNested]);

  const handleElementStyleUpdate = useCallback((selector: string, properties: Record<string, string>) => {
    if (Object.keys(properties).length === 0) {
      const next = { ...currentSettings.elementStyles };
      delete next[selector];
      updateSettings('elementStyles', next);
    } else {
      updateNested('elementStyles', selector, properties);
    }
  }, [currentSettings.elementStyles, updateSettings, updateNested]);

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 py-2 pr-4">
        {hasOverrides && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleResetAll}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Reset all styles
            </button>
          </div>
        )}
        {STYLE_GROUPS.map((group, i) => (
          <div key={group.id}>
            <CollapsibleGroup label={group.label} description={group.description} defaultOpen={i < 2}>
              {group.variables.map((v) => (
                <StyleControl key={v.variable} variable={v} value={currentSettings.style[v.variable]} onChange={(val) => handleStyleChange(v.variable, val)} />
              ))}
            </CollapsibleGroup>
            {i < STYLE_GROUPS.length - 1 && <div className="mt-6"><SectionDivider /></div>}
          </div>
        ))}
        <SectionDivider />
        <ElementRuleBuilder elementStyles={currentSettings.elementStyles} onUpdate={handleElementStyleUpdate} />
        <SectionDivider />
        <div className="space-y-2">
          <SectionHeader description="Raw CSS that overrides everything above">Custom CSS</SectionHeader>
          <CSSEditor
            placeholder=".ov25-variant-control { ... }"
            value={currentSettings.branding.cssString}
            onChange={(val) => updateNested('branding', 'cssString', val)}
          />
        </div>
        <div className="h-4" />
      </div>
    </ScrollArea>
  );
}
