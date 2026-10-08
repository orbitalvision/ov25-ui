import { useEffect, useId, useState, type CSSProperties } from 'react';
import { ArrowRight, Check, ChevronDown, Info, Palette, Search } from 'lucide-react';
import { brandingFontAliases, loadBrandingFonts } from 'ov25-ui';
import type { ThemeStyleFont, ThemeStyleProposal } from './theme-style';
import './theme-palette-preview.css';

export interface ThemePalettePreviewProps {
  proposal: ThemeStyleProposal;
  currentStyle?: Record<string, string>;
  currentFonts?: ThemeStyleFont[];
  onApply?: () => void;
  onCancel?: () => void;
  applyDisabled?: boolean;
  unavailableMessage?: string;
}

const DEFAULTS: Record<string, string> = {
  '--ov25-background-color': '#ffffff',
  '--ov25-secondary-background-color': '#f6f6f6',
  '--ov25-text-color': '#000000',
  '--ov25-secondary-text-color': '#000000',
  '--ov25-border-color': '#e5e5e5',
  '--ov25-primary-color': '#ffffff',
  '--ov25-button-text-color': '#000000',
  '--ov25-button-border-color': '#e5e5e5',
  '--ov25-button-border-width': '1px',
  '--ov25-button-border-radius': '0px',
  '--ov25-button-hover-background-color': '#fafafa',
  '--ov25-button-hover-text-color': '#000000',
  '--ov25-cta-color': '#22c55e',
  '--ov25-cta-color-hover': '#16a34a',
  '--ov25-cta-color-light': '#4ade80',
  '--ov25-cta-text-color': '#ffffff',
  '--ov25-cta-text-color-hover': '#ffffff',
  '--ov25-cta-text-color-disabled': '#ffffff',
  '--ov25-cta-border-radius': '9999px',
  '--ov25-cta-border-width': '0px',
  '--ov25-360-font-family': "'IBM Plex Sans', sans-serif",
  '--ov25-body-font-weight': '400',
  '--ov25-heading-font-weight': '600',
  '--ov25-button-font-weight': '500',
  '--ov25-button-letter-spacing': '0px',
  '--ov25-button-text-transform': 'none',
};

function colourLuminance(value: string): number | null {
  const match = /^#([a-f\d]{3}|[a-f\d]{6})$/i.exec(value.trim());
  if (!match) return null;
  const hex = match[1].length === 3 ? [...match[1]].map((c) => `${c}${c}`).join('') : match[1];
  const channels = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrast(foreground: string, background: string): number | null {
  const a = colourLuminance(foreground);
  const b = colourLuminance(background);
  return a === null || b === null ? null : (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function fontLabel(value: string): string {
  return value.split(',')[0].trim().replace(/^['"]|['"]$/g, '');
}

/** A review surface only: applying a palette remains an explicit draft action. */
export function ThemePalettePreview({
  proposal, currentStyle, currentFonts, onApply, onCancel, applyDisabled, unavailableMessage,
}: ThemePalettePreviewProps) {
  const [comparison, setComparison] = useState<'suggested' | 'current'>('suggested');
  const [selectedOption, setSelectedOption] = useState('Natural');
  const [sampleAction, setSampleAction] = useState(false);
  const id = useId();
  const showingCurrent = comparison === 'current' && currentStyle !== undefined;
  const fonts = showingCurrent ? currentFonts : proposal.fonts?.length ? proposal.fonts : currentFonts;
  useEffect(() => { void loadBrandingFonts(fonts); }, [fonts]);
  const style = showingCurrent ? currentStyle : { ...currentStyle, ...proposal.style };
  const value = (key: string, fallback = '') => style[key] || DEFAULTS[key] || fallback;
  const background = value('--ov25-background-color');
  const text = value('--ov25-text-color');
  const button = value('--ov25-cta-color');
  const bodyFont = value('--ov25-360-font-family');
  const headingFont = value('--ov25-heading-font-family', bodyFont);
  const useSolidVariantRing = (!showingCurrent && Boolean(proposal.style['--ov25-highlight-color']))
    || value('--ov25-variant-thumb-ring-mode') === 'solid';
  const aliases = brandingFontAliases(fonts ?? []);
  const previewFont = (family: string) => {
    const alias = aliases.get(fontLabel(family).toLowerCase());
    return alias ? `'${alias}', ${family}` : family;
  };
  const previewVariables = {
    '--ov25-palette-bg': background,
    '--ov25-palette-surface': value('--ov25-secondary-background-color'),
    '--ov25-palette-text': text,
    '--ov25-palette-muted': value('--ov25-secondary-text-color'),
    '--ov25-palette-border': value('--ov25-border-color'),
    '--ov25-palette-heading': value('--ov25-configurator-title-text-color', text),
    '--ov25-palette-price': value('--ov25-configurator-price-text-color', text),
    '--ov25-palette-cta': button,
    '--ov25-palette-cta-hover': value('--ov25-cta-color-hover'),
    '--ov25-palette-cta-text': value('--ov25-cta-text-color'),
    '--ov25-palette-cta-text-hover': value('--ov25-cta-text-color-hover'),
    '--ov25-palette-cta-border': value('--ov25-cta-border-color', button),
    '--ov25-palette-cta-border-width': value('--ov25-cta-border-width'),
    '--ov25-palette-cta-radius': value('--ov25-cta-border-radius'),
    '--ov25-palette-disabled': value('--ov25-cta-color-light'),
    '--ov25-palette-disabled-text': value('--ov25-cta-text-color-disabled'),
    '--ov25-palette-secondary': value('--ov25-primary-color'),
    '--ov25-palette-secondary-text': value('--ov25-button-text-color'),
    '--ov25-palette-secondary-border': value('--ov25-button-border-color'),
    '--ov25-palette-secondary-border-width': value('--ov25-button-border-width'),
    '--ov25-palette-secondary-radius': value('--ov25-button-border-radius'),
    '--ov25-palette-secondary-hover': value('--ov25-button-hover-background-color'),
    '--ov25-palette-secondary-text-hover': value('--ov25-button-hover-text-color'),
    '--ov25-palette-variant-ring': useSolidVariantRing
      ? value('--ov25-highlight-color', '#00fbff')
      : 'linear-gradient(90deg, #26e8fe 0%, #808aff 50%, #a41efe 100%)',
    '--ov25-palette-variant-radius': value('--ov25-variant-thumb-border-radius', '0px'),
    '--ov25-palette-input': value('--ov25-input-background-color', background),
    '--ov25-palette-input-text': value('--ov25-input-text-color', text),
    '--ov25-palette-input-border': value('--ov25-input-border-color', value('--ov25-border-color')),
    '--ov25-palette-placeholder': value('--ov25-input-placeholder-color', value('--ov25-secondary-text-color')),
    '--ov25-palette-focus': value('--ov25-focus-ring-color', text),
    '--ov25-palette-font': previewFont(bodyFont),
    '--ov25-palette-heading-font': previewFont(headingFont),
    '--ov25-palette-button-font': previewFont(value('--ov25-button-font-family', bodyFont)),
    '--ov25-palette-body-weight': value('--ov25-body-font-weight'),
    '--ov25-palette-heading-weight': value('--ov25-heading-font-weight'),
    '--ov25-palette-button-weight': value('--ov25-button-font-weight'),
    '--ov25-palette-button-tracking': value('--ov25-button-letter-spacing'),
    '--ov25-palette-button-case': value('--ov25-button-text-transform'),
  } as CSSProperties;
  const swatches = showingCurrent ? [
    { role: 'Background', color: background, source: 'Current draft' },
    { role: 'Surface', color: value('--ov25-secondary-background-color'), source: 'Current draft' },
    { role: 'Text', color: text, source: 'Current draft' },
    { role: 'Action', color: button, source: 'Current draft' },
    { role: 'Action text', color: value('--ov25-cta-text-color'), source: 'Current draft' },
    { role: 'Border', color: value('--ov25-border-color'), source: 'Current draft' },
  ] : proposal.palette;
  const checks = [
    { label: 'Body text', ratio: contrast(text, background) },
    { label: 'Action text', ratio: contrast(value('--ov25-cta-text-color'), button) },
    { label: 'Action hover', ratio: contrast(value('--ov25-cta-text-color-hover'), value('--ov25-cta-color-hover')) },
  ].filter((check): check is { label: string; ratio: number } => check.ratio !== null);
  const lowContrast = checks.filter((check) => check.ratio < 4.5);

  return <section className="ov25-palette" aria-labelledby={`${id}-title`}>
    <header className="ov25-palette-header">
      <div className="ov25-palette-eyebrow"><Palette size={14} aria-hidden="true" /> YOUR THEME, YOUR COLOURS</div>
      <div className="ov25-palette-title-row">
        <h2 id={`${id}-title`}>{proposal.source.label}</h2>
        <span className="ov25-palette-source">Local theme</span>
      </div>
      <p className="ov25-palette-description">{proposal.summary}</p>
      <p className="ov25-palette-method">{proposal.method === 'ai' ? 'AI-suggested palette' : 'Source-derived palette'}<span aria-hidden="true"> · </span>{proposal.method === 'ai' ? 'Based on the downloaded theme source' : 'Matched from saved theme settings and CSS'}</p>
    </header>

    <div className="ov25-palette-preview-heading">
      <span className="ov25-palette-section-label">Palette &amp; style preview</span>
      {currentStyle && <fieldset className="ov25-palette-comparison">
        <legend className="ov25-palette-sr-only">Compare palette</legend>
        {(['current', 'suggested'] as const).map((mode) => <label key={mode}>
          <input type="radio" name={`${id}-comparison`} value={mode} checked={comparison === mode}
            onChange={() => setComparison(mode)} />
          <span>{mode === 'current' ? 'Current' : 'Suggested'}</span>
        </label>)}
      </fieldset>}
    </div>

    <div className="ov25-palette-board" style={previewVariables}>
      <div className="ov25-palette-specimen">
        <span className="ov25-palette-specimen-label">{showingCurrent ? 'CURRENT DRAFT' : 'SUGGESTED STYLE'}</span>
        <span className="ov25-palette-letterform" aria-hidden="true">Aa<span>.</span></span>
        <h3>A familiar feel.<br />A perfect fit.</h3>
        <p>A little inspiration for how your configurator could feel at home on your store.</p>
        <dl className="ov25-palette-fonts">
          <div><dt>Headings</dt><dd>{fontLabel(headingFont)}</dd></div>
          <div><dt>Body</dt><dd>{fontLabel(bodyFont)}</dd></div>
        </dl>
      </div>

      <div className="ov25-palette-controls">
        <div className="ov25-palette-product-heading"><span>THE EVERYDAY COLLECTION</span><span>01 / 03</span></div>
        <div className="ov25-palette-product-title"><h3>Make it yours</h3><span>£1,250</span></div>
        <p className="ov25-palette-product-copy">Thoughtful details. Your finishing touch.</p>
        <fieldset className="ov25-palette-options">
          <legend>Choose your finish</legend>
          {['Natural', 'Warm', 'Deep'].map((option) => <label key={option}>
            <input type="radio" name={`${id}-finish`} value={option} checked={selectedOption === option}
              onChange={() => setSelectedOption(option)} />
            <span className="ov25-palette-finish">
              <span className="ov25-palette-finish-ring" aria-hidden="true">
                <span className="ov25-palette-finish-swatch" data-finish={option.toLowerCase()} />
              </span>
              <span>{option}</span>
            </span>
          </label>)}
        </fieldset>
        <label className="ov25-palette-search" htmlFor={`${id}-search`}>
          <Search size={15} aria-hidden="true" />
          <input id={`${id}-search`} type="search" placeholder="Find your fabric" aria-label="Sample fabric search" />
        </label>
        <div className="ov25-palette-actions-demo">
          <button type="button" className="ov25-palette-primary" onClick={() => setSampleAction(!sampleAction)}>
            {sampleAction ? 'Added to preview' : 'Add to basket'}{sampleAction ? <Check size={15} aria-hidden="true" /> : <ArrowRight size={15} aria-hidden="true" />}
          </button>
          <button type="button" className="ov25-palette-secondary" onClick={() => setSelectedOption((option) => option === 'Natural' ? 'Warm' : 'Natural')}>
            Explore finishes<ChevronDown size={14} aria-hidden="true" />
          </button>
          <button type="button" className="ov25-palette-primary ov25-palette-disabled" disabled>Unavailable</button>
        </div>
        <p className="ov25-palette-sample-note" aria-live="polite">{sampleAction ? 'Sample interaction only. Nothing added to a basket.' : 'Try the buttons to preview hover and focus states.'}</p>
      </div>
    </div>

    <ul className="ov25-palette-swatches" aria-label={showingCurrent ? 'Current colours' : 'Suggested colours'}>
      {swatches.map((swatch, index) => <li key={`${swatch.role}-${index}`}>
        <span className="ov25-palette-swatch" style={{ backgroundColor: swatch.color }} aria-hidden="true" />
        <span className="ov25-palette-swatch-role">{swatch.role}</span>
        <span className="ov25-palette-swatch-value">{swatch.color.toUpperCase()}</span>
        <span className="ov25-palette-swatch-source" title={swatch.source}>{swatch.source}</span>
      </li>)}
    </ul>

    {checks.length > 0 && <div className="ov25-palette-contrast">
      <span className="ov25-palette-section-label">Text contrast</span>
      <div className="ov25-palette-contrast-items">{checks.map((check) => <span key={check.label} data-pass={check.ratio >= 4.5}>
        {check.ratio >= 4.5 ? <Check size={12} aria-hidden="true" /> : <Info size={12} aria-hidden="true" />}
        {check.label} <strong>{check.ratio.toFixed(1)}:1</strong>
      </span>)}</div>
    </div>}
    {(lowContrast.length > 0 || (!showingCurrent && proposal.warnings.length > 0)) && <div className="ov25-palette-warnings" role="status">
      <Info size={15} aria-hidden="true" />
      <div>
        {lowContrast.length > 0 && <p>{lowContrast.map((check) => check.label).join(', ')} falls below the 4.5:1 contrast target for regular text. Adjust these colours in the style editor.</p>}
        {!showingCurrent && proposal.warnings.map((warning, index) => <p key={index}>{warning}</p>)}
      </div>
    </div>}
    {unavailableMessage && <p className="ov25-palette-unavailable" role="alert">{unavailableMessage}</p>}

    {(onApply || onCancel) && <footer className="ov25-palette-footer">
      <p>Apply to your draft, then fine-tune any colour.<br /><span>Your saved site stays the same until you save.</span></p>
      <div className="ov25-palette-footer-actions">
        {onCancel && <button type="button" className="ov25-palette-cancel" onClick={onCancel}>Cancel</button>}
        {onApply && <button type="button" className="ov25-palette-apply" disabled={applyDisabled || Boolean(unavailableMessage)} onClick={onApply}>Apply to draft<ArrowRight size={15} aria-hidden="true" /></button>}
      </div>
    </footer>}
  </section>;
}
