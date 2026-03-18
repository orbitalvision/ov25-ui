import { useState, useCallback } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, Search, Copy, Check } from 'lucide-react';
import { Input } from '../../ui/input';
import { cn } from '../../../lib/utils';
import { ELEMENT_SELECTORS, ELEMENT_CSS_PROPERTIES, generateElementCSS } from '../../../lib/config/configurator-style-variables';
import { CSSPropertyRow, AddPropertyButton } from './controls';
import { SectionHeader } from '../shared-ui';

interface ElementRuleBuilderProps {
  elementStyles: Record<string, Record<string, string>>;
  onUpdate: (selector: string, properties: Record<string, string>) => void;
}

export function ElementRuleBuilder({ elementStyles, onUpdate }: ElementRuleBuilderProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState('');
  const [copiedAll, setCopiedAll] = useState(false);

  const activeSelectors = Object.keys(elementStyles).filter(
    (s) => Object.keys(elementStyles[s]).length > 0,
  );

  const handleCopyAll = useCallback(async () => {
    const css = generateElementCSS(elementStyles);
    if (!css) return;
    await navigator.clipboard.writeText(css);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  }, [elementStyles]);

  const addSelector = useCallback((selector: string) => {
    if (!elementStyles[selector]) onUpdate(selector, { '': '' });
    setShowPicker(false);
    setSearch('');
  }, [elementStyles, onUpdate]);

  const removeSelector = useCallback((selector: string) => { onUpdate(selector, {}); }, [onUpdate]);

  const updateProperty = useCallback((selector: string, oldProp: string, newProp: string, value: string) => {
    const current = { ...elementStyles[selector] };
    if (oldProp !== newProp) delete current[oldProp];
    current[newProp] = value;
    onUpdate(selector, current);
  }, [elementStyles, onUpdate]);

  const removeProperty = useCallback((selector: string, prop: string) => {
    const current = { ...elementStyles[selector] };
    delete current[prop];
    if (Object.keys(current).length === 0) onUpdate(selector, {});
    else onUpdate(selector, current);
  }, [elementStyles, onUpdate]);

  const addProperty = useCallback((selector: string) => {
    const current = { ...elementStyles[selector] };
    const usedProps = new Set(Object.keys(current));
    const nextProp = ELEMENT_CSS_PROPERTIES.find((p) => !usedProps.has(p)) || '';
    current[nextProp] = '';
    onUpdate(selector, current);
  }, [elementStyles, onUpdate]);

  const filteredSelectors = ELEMENT_SELECTORS.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.selector.toLowerCase().includes(q) || s.label.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <SectionHeader description="Target specific elements with custom CSS properties">Element styles</SectionHeader>
        {activeSelectors.length > 0 && (
          <button type="button" onClick={handleCopyAll} className="inline-flex items-center gap-1 shrink-0 rounded px-1.5 py-0.5 text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Copy all element CSS to clipboard">
            {copiedAll ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
            {copiedAll ? 'Copied' : 'Copy CSS'}
          </button>
        )}
      </div>
      {activeSelectors.map((selector) => {
        const props = elementStyles[selector];
        const meta = ELEMENT_SELECTORS.find((s) => s.selector === selector);
        const entries = Object.entries(props);
        return (
          <RuleCard key={selector} selector={selector} label={meta?.label || selector} entries={entries}
            onUpdateProperty={(oldProp, newProp, value) => updateProperty(selector, oldProp, newProp, value)}
            onRemoveProperty={(prop) => removeProperty(selector, prop)}
            onAddProperty={() => addProperty(selector)}
            onRemoveAll={() => removeSelector(selector)} />
        );
      })}
      {showPicker ? (
        <div className="space-y-2 rounded-md border border-border p-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search elements..." className="h-7 text-xs pl-7" autoFocus />
          </div>
          <div className="max-h-[200px] overflow-y-auto space-y-0.5">
            {filteredSelectors.map((s) => (
              <button key={s.selector} type="button" onClick={() => addSelector(s.selector)}
                className={cn('w-full text-left px-2 py-1 rounded text-[11px] hover:bg-muted transition-colors', activeSelectors.includes(s.selector) && 'opacity-40 pointer-events-none')}>
                <span className="font-medium">{s.label}</span>
                <span className="ml-1.5 text-muted-foreground font-mono">{s.selector}</span>
              </button>
            ))}
            {filteredSelectors.length === 0 && (<p className="text-[11px] text-muted-foreground text-center py-2">No matching elements</p>)}
          </div>
          <button type="button" onClick={() => { setShowPicker(false); setSearch(''); }} className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
        </div>
      ) : (
        <button type="button" onClick={() => setShowPicker(true)} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <Plus className="h-3.5 w-3.5" />
          Add element rule
        </button>
      )}
    </div>
  );
}

function RuleCard({ selector, label, entries, onUpdateProperty, onRemoveProperty, onAddProperty, onRemoveAll }: {
  selector: string; label: string; entries: [string, string][];
  onUpdateProperty: (oldProp: string, newProp: string, value: string) => void;
  onRemoveProperty: (prop: string) => void;
  onAddProperty: () => void; onRemoveAll: () => void;
}) {
  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopyRule = async () => {
    const declarations = entries.filter(([p, v]) => p && v);
    if (!declarations.length) return;
    const css = `${selector} {\n${declarations.map(([p, v]) => `  ${p}: ${v};`).join('\n')}\n}`;
    await navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <div className="flex items-center gap-1.5 px-2 py-1.5 bg-muted/50">
        <button type="button" onClick={() => setOpen(!open)} className="shrink-0">
          {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </button>
        <span className="text-[11px] font-medium truncate flex-1">{label}</span>
        <button type="button" onClick={handleCopyRule} className="shrink-0 p-0.5 hover:bg-muted rounded" title="Copy rule CSS">
          {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
        </button>
        <button type="button" onClick={onRemoveAll} className="shrink-0 p-0.5 hover:bg-destructive/10 rounded" title="Remove rule">
          <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
        </button>
      </div>
      {open && (
        <div className="p-2 space-y-1.5">
          {entries.map(([prop, val]) => (
            <CSSPropertyRow key={prop || '__empty'} property={prop} value={val}
              onPropertyChange={(newProp) => onUpdateProperty(prop, newProp, val)}
              onValueChange={(newVal) => onUpdateProperty(prop, prop, newVal)}
              onRemove={() => onRemoveProperty(prop)}
              availableProperties={ELEMENT_CSS_PROPERTIES} />
          ))}
          <AddPropertyButton onClick={onAddProperty} />
        </div>
      )}
    </div>
  );
}
