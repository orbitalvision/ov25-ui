import { useState, useRef, useEffect } from 'react';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ChevronDown, Check } from 'lucide-react';

export function SectionHeader({ children, description }: { children: React.ReactNode; description?: string }) {
  return (
    <div>
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{children}</h3>
      {description && (
        <p className="text-[11px] text-muted-foreground font-normal normal-case tracking-normal mt-0.5">{description}</p>
      )}
    </div>
  );
}

export function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-foreground">{label}</span>
      {children}
    </div>
  );
}

export function SwitchRow({ label, checked, onCheckedChange }: { label: string; checked: boolean; onCheckedChange: (v: boolean) => void }) {
  return (
    <Row label={label}>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </Row>
  );
}

export function CompactSelect({ value, onValueChange, options }: { value: string; onValueChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-7 w-[110px] text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export type DescriptiveOption = { value: string; label: string; desc?: string };

/**
 * Dropdown that shows a label + description for each option in a popover.
 * Falls back to a regular CompactSelect when no descriptions are present.
 */
export function DescriptiveSelect({ value, onValueChange, options }: {
  value: string; onValueChange: (v: string) => void; options: DescriptiveOption[];
}) {
  const hasDescriptions = options.some((o) => o.desc);
  if (!hasDescriptions) {
    return <CompactSelect value={value} onValueChange={onValueChange} options={options} />;
  }

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between h-7 w-[130px] rounded-md border border-input bg-background px-2 text-xs shadow-sm hover:bg-accent hover:text-accent-foreground"
      >
        <span className="truncate">{selected?.label ?? value}</span>
        <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-[220px] rounded-md border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onValueChange(opt.value); setOpen(false); }}
              className={`flex items-start gap-2 w-full rounded-sm px-2 py-1.5 text-left transition-colors ${
                opt.value === value ? 'bg-accent' : 'hover:bg-accent/50'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium">{opt.label}</div>
                {opt.desc && <div className="text-[10px] text-muted-foreground leading-tight">{opt.desc}</div>}
              </div>
              {opt.value === value && <Check className="h-3.5 w-3.5 shrink-0 mt-0.5 text-foreground" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function DesktopMobileRow({ label, desktopValue, mobileValue, onDesktopChange, onMobileChange, options, mobileOptions }: {
  label: string;
  desktopValue: string;
  mobileValue: string;
  onDesktopChange: (v: string) => void;
  onMobileChange: (v: string) => void;
  options: DescriptiveOption[];
  mobileOptions?: DescriptiveOption[];
}) {
  const hasDescriptions = options.some((o) => o.desc);
  return (
    <div className="space-y-1.5">
      <span className="text-sm text-foreground">{label}</span>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-[10px] text-muted-foreground mb-0.5">Desktop</Label>
          {hasDescriptions
            ? <DescriptiveSelect value={desktopValue} onValueChange={onDesktopChange} options={options} />
            : <CompactSelect value={desktopValue} onValueChange={onDesktopChange} options={options} />}
        </div>
        <div>
          <Label className="text-[10px] text-muted-foreground mb-0.5">Mobile</Label>
          {hasDescriptions
            ? <DescriptiveSelect value={mobileValue} onValueChange={onMobileChange} options={mobileOptions ?? options} />
            : <CompactSelect value={mobileValue} onValueChange={onMobileChange} options={mobileOptions ?? options} />}
        </div>
      </div>
    </div>
  );
}

export function SectionDivider() {
  return <div className="h-px bg-border" />;
}
