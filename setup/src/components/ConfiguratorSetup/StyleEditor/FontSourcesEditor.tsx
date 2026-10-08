import type { BrandingFont } from 'ov25-ui';
import { Input } from '../../ui/input';
import { SectionHeader } from '../shared-ui';

export function FontSourcesEditor({ fonts = [], onChange }: {
  fonts?: BrandingFont[];
  onChange: (fonts: BrandingFont[]) => void;
}) {
  const update = (index: number, patch: Partial<BrandingFont>) => {
    onChange(fonts.map((font, current) => current === index ? {...font, ...patch} : font));
  };
  return (
    <div className="space-y-2 rounded-md border border-border p-3">
      <SectionHeader description="Observed theme files. Font selectors use these files with fallbacks if a file cannot load.">
        Theme font files
      </SectionHeader>
      {fonts.map((font, index) => (
        <div key={index} className="space-y-2 border-b border-border pb-3 last:border-0">
          <Input
            aria-label={`Font ${index + 1} family`}
            value={font.family}
            placeholder="Family name"
            className="h-8 text-xs"
            onChange={event => update(index, {family: event.target.value})}
          />
          <Input
            aria-label={`Font ${index + 1} URL`}
            type="url"
            value={font.url}
            placeholder="https://…/font.woff2"
            className="h-8 text-xs"
            onChange={event => update(index, {url: event.target.value})}
          />
          <div className="flex items-center gap-2">
            <Input
              aria-label={`Font ${index + 1} weight`}
              value={font.weight ?? '400'}
              placeholder="400 or 100 900"
              className="h-8 text-xs"
              onChange={event => update(index, {weight: event.target.value})}
            />
            <select
              aria-label={`Font ${index + 1} style`}
              value={font.style ?? 'normal'}
              className="h-8 rounded border border-border bg-background text-xs"
              onChange={event => update(index, {style: event.target.value as BrandingFont['style']})}
            >
              <option value="normal">Normal</option>
              <option value="italic">Italic</option>
              <option value="oblique">Oblique</option>
            </select>
            <button type="button" className="text-xs text-muted-foreground" onClick={() => onChange(fonts.filter((_, current) => current !== index))}>
              Remove
            </button>
          </div>
          {font.unicodeRange && (
            <Input
              aria-label={`Font ${index + 1} character range`}
              value={font.unicodeRange}
              className="h-8 text-xs"
              onChange={event => update(index, {unicodeRange: event.target.value || undefined})}
            />
          )}
        </div>
      ))}
      <button
        type="button"
        className="text-xs underline"
        disabled={fonts.length >= 16}
        onClick={() => onChange([...fonts, {family: '', url: '', weight: '400', style: 'normal'}])}
      >
        Add font file
      </button>
    </div>
  );
}
