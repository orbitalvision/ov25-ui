import { RotateCcw, X, Plus } from 'lucide-react';
import { ColorInput } from '../../ui/color-input';
import { Slider } from '../../ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Input } from '../../ui/input';
import { cn } from '../../../lib/utils';
import type { StyleVariable } from '../../../lib/config/configurator-style-variables';
import { CORNER_PRESETS, FONT_OPTIONS, FONT_WEIGHT_OPTIONS, DISPLAY_OPTIONS, PROPERTY_INPUT_MAP } from '../../../lib/config/configurator-style-variables';

interface ControlRowProps {
  label: string;
  isModified: boolean;
  onReset: () => void;
  children: React.ReactNode;
}

function ControlRow({ label, isModified, onReset, children }: ControlRowProps) {
  return (
    <div className="group flex items-center justify-between gap-3">
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-sm text-foreground truncate">{label}</span>
        {isModified && (
          <button type="button" onClick={onReset} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" title="Reset to default">
            <RotateCcw className="h-3 w-3 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function StyleColorControl({ variable, value, defaultValue, onChange }: { variable: StyleVariable; value: string | undefined; defaultValue: string; onChange: (value: string) => void }) {
  const current = value || defaultValue;
  const isModified = !!value && value !== defaultValue;
  return (
    <ControlRow label={variable.label} isModified={isModified} onReset={() => onChange('')}>
      <ColorInput value={current} onChange={onChange} className="!w-7 !h-7 !rounded-md !shadow-sm" />
    </ControlRow>
  );
}

export function StyleCornerControl({ variable, value, defaultValue, onChange }: { variable: StyleVariable; value: string | undefined; defaultValue: string; onChange: (value: string) => void }) {
  const current = value || defaultValue;
  const isModified = !!value && value !== defaultValue;
  return (
    <ControlRow label={variable.label} isModified={isModified} onReset={() => onChange('')}>
      <div className="flex gap-1">
        {CORNER_PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => onChange(preset.value)}
            title={preset.label}
            className={cn(
              'w-6 h-6 border transition-all flex items-center justify-center',
              current === preset.value ? 'border-foreground bg-foreground' : 'border-border bg-muted hover:border-foreground/50',
            )}
            style={{ borderRadius: preset.value === '9999px' ? '9999px' : `${Math.min(parseInt(preset.value), 6)}px` }}
          >
            <div
              className={cn('w-3 h-3', current === preset.value ? 'bg-background' : 'bg-foreground/20')}
              style={{ borderRadius: preset.value === '9999px' ? '9999px' : `${Math.min(parseInt(preset.value), 3)}px` }}
            />
          </button>
        ))}
      </div>
    </ControlRow>
  );
}

function parseNumericValue(val: string): number {
  return parseFloat(val) || 0;
}

export function StyleSliderControl({ variable, value, defaultValue, onChange }: { variable: StyleVariable; value: string | undefined; defaultValue: string; onChange: (value: string) => void }) {
  const current = value || defaultValue;
  const numericValue = parseNumericValue(current);
  const isModified = !!value && value !== defaultValue;
  const unit = variable.sliderUnit || 'px';
  const min = variable.sliderMin ?? 0;
  const max = variable.sliderMax ?? 100;
  const step = variable.sliderStep ?? 1;
  const labels = variable.sliderLabels;
  return (
    <div className="space-y-1.5">
      <ControlRow label={variable.label} isModified={isModified} onReset={() => onChange('')}>
        <span className="text-[10px] text-muted-foreground font-mono tabular-nums w-14 text-right">{numericValue}{unit}</span>
      </ControlRow>
      <div className="flex items-center gap-2">
        {labels && <span className="text-[9px] text-muted-foreground shrink-0">{labels[0]}</span>}
        <Slider value={[numericValue]} min={min} max={max} step={step} onValueChange={([v]) => onChange(`${v}${unit}`)} className="flex-1" />
        {labels && <span className="text-[9px] text-muted-foreground shrink-0">{labels[1]}</span>}
      </div>
    </div>
  );
}

export function StyleFontControl({ variable, value, defaultValue, onChange }: { variable: StyleVariable; value: string | undefined; defaultValue: string; onChange: (value: string) => void }) {
  const current = value || defaultValue;
  const isModified = !!value && value !== defaultValue;
  return (
    <ControlRow label={variable.label} isModified={isModified} onReset={() => onChange('')}>
      <Select value={current} onValueChange={onChange}>
        <SelectTrigger className="h-7 w-[130px] text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>
          {FONT_OPTIONS.map((font) => (
            <SelectItem key={font.value} value={font.value}><span style={{ fontFamily: font.value }}>{font.label}</span></SelectItem>
          ))}
        </SelectContent>
      </Select>
    </ControlRow>
  );
}

export function StyleControl({ variable, value, onChange }: { variable: StyleVariable; value: string | undefined; onChange: (value: string) => void }) {
  const props = { variable, value, defaultValue: variable.defaultValue, onChange };
  switch (variable.control) {
    case 'color': return <StyleColorControl {...props} />;
    case 'corner': return <StyleCornerControl {...props} />;
    case 'slider': return <StyleSliderControl {...props} />;
    case 'font': return <StyleFontControl {...props} />;
  }
}

function SmartValueInput({ property, value, onChange }: { property: string; value: string; onChange: (v: string) => void }) {
  const inputType = PROPERTY_INPUT_MAP[property] || 'text';
  switch (inputType) {
    case 'color':
      return (
        <div className="flex items-center gap-1.5 flex-1">
          <ColorInput value={value || '#000000'} onChange={onChange} className="!w-6 !h-6 !rounded-sm !shadow-none" />
          <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="#000000" className="h-7 text-[11px] font-mono flex-1" />
        </div>
      );
    case 'spacing': {
      const num = parseFloat(value) || 0;
      const unit = value.replace(/[\d.-]/g, '') || 'rem';
      return (
        <div className="flex items-center gap-1.5 flex-1">
          <Slider value={[num]} min={0} max={unit === 'px' ? 100 : 6} step={unit === 'px' ? 1 : 0.125} onValueChange={([v]) => onChange(`${v}${unit}`)} className="flex-1" />
          <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-7 text-[11px] font-mono w-[70px] shrink-0" />
        </div>
      );
    }
    case 'size-px': {
      const pxNum = parseFloat(value) || 0;
      return (
        <div className="flex items-center gap-1.5 flex-1">
          <Slider value={[pxNum]} min={0} max={property === 'border-width' ? 10 : 1500} step={property === 'border-width' ? 0.5 : 10} onValueChange={([v]) => onChange(`${v}px`)} className="flex-1" />
          <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-7 text-[11px] font-mono w-[70px] shrink-0" />
        </div>
      );
    }
    case 'opacity': {
      const opVal = parseFloat(value) || 1;
      return (
        <div className="flex items-center gap-1.5 flex-1">
          <Slider value={[opVal]} min={0} max={1} step={0.05} onValueChange={([v]) => onChange(`${v}`)} className="flex-1" />
          <span className="text-[11px] font-mono text-muted-foreground w-[36px] text-right shrink-0">{opVal.toFixed(2)}</span>
        </div>
      );
    }
    case 'font-select':
      return (
        <Select value={value || FONT_OPTIONS[0].value} onValueChange={onChange}>
          <SelectTrigger className="h-7 text-[11px] flex-1"><SelectValue placeholder="Font..." /></SelectTrigger>
          <SelectContent>
            {FONT_OPTIONS.map((f) => (<SelectItem key={f.value} value={f.value} className="text-[11px]"><span style={{ fontFamily: f.value }}>{f.label}</span></SelectItem>))}
          </SelectContent>
        </Select>
      );
    case 'weight-select':
      return (
        <Select value={value || '400'} onValueChange={onChange}>
          <SelectTrigger className="h-7 text-[11px] flex-1"><SelectValue placeholder="Weight..." /></SelectTrigger>
          <SelectContent>
            {FONT_WEIGHT_OPTIONS.map((w) => (<SelectItem key={w.value} value={w.value} className="text-[11px]">{w.label} ({w.value})</SelectItem>))}
          </SelectContent>
        </Select>
      );
    case 'display-select':
      return (
        <Select value={value || 'block'} onValueChange={onChange}>
          <SelectTrigger className="h-7 text-[11px] flex-1"><SelectValue placeholder="Display..." /></SelectTrigger>
          <SelectContent>
            {DISPLAY_OPTIONS.map((d) => (<SelectItem key={d.value} value={d.value} className="text-[11px]">{d.label}</SelectItem>))}
          </SelectContent>
        </Select>
      );
    default:
      return <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="value" className="h-7 text-[11px] font-mono flex-1" />;
  }
}

export function CSSPropertyRow({ property, value, onPropertyChange, onValueChange, onRemove, availableProperties }: {
  property: string; value: string; onPropertyChange: (property: string) => void; onValueChange: (value: string) => void; onRemove: () => void; availableProperties: readonly string[];
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <Select value={property} onValueChange={onPropertyChange}>
          <SelectTrigger className="h-7 w-[120px] text-[11px] font-mono shrink-0"><SelectValue placeholder="property" /></SelectTrigger>
          <SelectContent>
            {availableProperties.map((p) => (<SelectItem key={p} value={p} className="text-[11px] font-mono">{p}</SelectItem>))}
          </SelectContent>
        </Select>
        <SmartValueInput property={property} value={value} onChange={onValueChange} />
        <button type="button" onClick={onRemove} className="shrink-0 p-1 hover:bg-muted rounded"><X className="h-3 w-3 text-muted-foreground" /></button>
      </div>
    </div>
  );
}

export function AddPropertyButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
      <Plus className="h-3 w-3" />
      Add property
    </button>
  );
}
