import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

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

export function DesktopMobileRow({ label, desktopValue, mobileValue, onDesktopChange, onMobileChange, options, mobileOptions }: {
  label: string;
  desktopValue: string;
  mobileValue: string;
  onDesktopChange: (v: string) => void;
  onMobileChange: (v: string) => void;
  options: { value: string; label: string }[];
  mobileOptions?: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1.5">
      <span className="text-sm text-foreground">{label}</span>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-[10px] text-muted-foreground mb-0.5">Desktop</Label>
          <CompactSelect value={desktopValue} onValueChange={onDesktopChange} options={options} />
        </div>
        <div>
          <Label className="text-[10px] text-muted-foreground mb-0.5">Mobile</Label>
          <CompactSelect value={mobileValue} onValueChange={onMobileChange} options={mobileOptions ?? options} />
        </div>
      </div>
    </div>
  );
}

export function SectionDivider() {
  return <div className="h-px bg-border" />;
}
