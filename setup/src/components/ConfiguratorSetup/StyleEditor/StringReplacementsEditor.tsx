import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Search, Trash2 } from 'lucide-react';
import type { StringReplacementDefinition, StringReplacementRule, StringReplacementsConfig } from 'ov25-ui';
import { STRING_REPLACEMENT_DEFINITIONS } from 'ov25-ui';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { cn } from '../../../lib/utils';
import { AddPropertyButton } from './controls';
import { SectionHeader } from '../shared-ui';

type StringReplacementsEditorProps = {
  stringReplacements: StringReplacementsConfig;
  onRulesChange: (key: string, rules: StringReplacementRule[]) => void;
};

/** Names inside `${...}` that are not in `allowed`. */
function invalidInterpolationNames(template: string, allowed: ReadonlySet<string>): string[] {
  const bad = new Set<string>();
  const re = /\$\{\s*([A-Za-z0-9_]+)\s*\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(template)) !== null) {
    const name = m[1];
    if (!allowed.has(name)) bad.add(name);
  }
  return [...bad];
}

function textareaRefKey(defKey: string, ruleIndex: number) {
  return `${defKey}:${ruleIndex}`;
}

/** Radix Select requires non-empty item values; maps to "no trigger" in rule state. */
const TRIGGER_SELECT_NONE = '__ov25_no_trigger__';

export function StringReplacementsEditor({ stringReplacements, onRulesChange }: StringReplacementsEditorProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState('');

  const activeKeys = useMemo(
    () => Object.keys(stringReplacements).filter((k) => (stringReplacements[k]?.length ?? 0) > 0),
    [stringReplacements],
  );

  const defByKey = useMemo(() => {
    const m = new Map<string, StringReplacementDefinition>();
    for (const d of STRING_REPLACEMENT_DEFINITIONS) m.set(d.key, d);
    return m;
  }, []);

  const addStringKey = useCallback(
    (key: string) => {
      if ((stringReplacements[key]?.length ?? 0) > 0) return;
      onRulesChange(key, [{ template: '' }]);
      setShowPicker(false);
      setSearch('');
    },
    [stringReplacements, onRulesChange],
  );

  const removeStringKey = useCallback(
    (key: string) => {
      onRulesChange(key, []);
    },
    [onRulesChange],
  );

  const filteredDefinitions = useMemo(() => {
    const q = search.trim().toLowerCase();
    return STRING_REPLACEMENT_DEFINITIONS.filter((d) => {
      if (!q) return true;
      return (
        d.label.toLowerCase().includes(q) ||
        d.key.toLowerCase().includes(q) ||
        d.defaultTemplate.toLowerCase().includes(q)
      );
    });
  }, [search]);

  return (
    <div className="space-y-3 min-w-0 max-w-full overflow-x-hidden">
      <SectionHeader description="Replace any piece of text in the configurator with a custom, dynamic value.">
        Text overrides
      </SectionHeader>
      <p className="text-[10px] text-muted-foreground leading-relaxed -mt-1">
        Rules run in order. Triggered rules match when that variable equals the value (case-insensitive). Rules without
        a trigger are defaults; the first default wins if no trigger matched.
      </p>

      {activeKeys.map((key) => {
        const catalogDef = defByKey.get(key);
        const rules = stringReplacements[key] ?? [];
        if (rules.length === 0) return null;
        const def: StringReplacementDefinition =
          catalogDef ??
          ({
            key,
            label: key,
            defaultTemplate: '',
            interpolationValues: [],
          } as StringReplacementDefinition);
        return (
          <StringRuleCard
            key={key}
            def={def}
            rules={rules}
            onRulesChange={(next) => onRulesChange(key, next)}
            onRemoveAll={() => removeStringKey(key)}
          />
        );
      })}

      {showPicker ? (
        <div className="space-y-2 rounded-md border border-border p-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by label, key, or default text..."
              className="h-7 text-xs pl-7"
              autoFocus
            />
          </div>
          <div className="max-h-[200px] overflow-y-auto space-y-0.5">
            {filteredDefinitions.map((d) => (
              <button
                key={d.key}
                type="button"
                onClick={() => addStringKey(d.key)}
                className={cn(
                  'w-full text-left px-2 py-1.5 rounded text-[11px] hover:bg-muted transition-colors',
                  activeKeys.includes(d.key) && 'opacity-40 pointer-events-none',
                )}
              >
                <span className="font-medium block">{d.label}</span>
                <span
                  className="block text-[10px] text-muted-foreground font-normal mt-0.5 line-clamp-2 break-words"
                  title={d.defaultTemplate || undefined}
                >
                  {d.defaultTemplate || '—'}
                </span>
              </button>
            ))}
            {filteredDefinitions.length === 0 && (
              <p className="text-[11px] text-muted-foreground text-center py-2">No matching strings</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setShowPicker(false);
              setSearch('');
            }}
            className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add text override
        </button>
      )}
    </div>
  );
}

function StringRuleCard({
  def,
  rules,
  onRulesChange,
  onRemoveAll,
}: {
  def: StringReplacementDefinition;
  rules: StringReplacementRule[];
  onRulesChange: (rules: StringReplacementRule[]) => void;
  onRemoveAll: () => void;
}) {
  const [open, setOpen] = useState(true);
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const pendingCursorRef = useRef<{ ruleIndex: number; pos: number } | null>(null);

  useLayoutEffect(() => {
    const p = pendingCursorRef.current;
    if (!p) return;
    const ta = textareaRefs.current[textareaRefKey(def.key, p.ruleIndex)];
    if (!ta) return;
    ta.focus();
    ta.setSelectionRange(p.pos, p.pos);
    pendingCursorRef.current = null;
  }, [def.key, rules]);

  const setRules = useCallback(
    (next: StringReplacementRule[]) => {
      onRulesChange(next);
    },
    [onRulesChange],
  );

  const addOverride = useCallback(() => {
    if (def.interpolationValues.length === 0 && rules.length >= 1) return;
    setRules([...rules, { template: '' }]);
  }, [def.interpolationValues.length, rules, setRules]);

  const removeRule = useCallback(
    (ruleIndex: number) => {
      setRules(rules.filter((_, i) => i !== ruleIndex));
    },
    [rules, setRules],
  );

  const patchRule = useCallback(
    (ruleIndex: number, patch: Partial<StringReplacementRule>) => {
      const next = rules.map((r, i) => {
        if (i !== ruleIndex) return r;
        const merged = { ...r, ...patch };
        if (patch.trigger === undefined && 'trigger' in patch) {
          delete (merged as { trigger?: StringReplacementRule['trigger'] }).trigger;
        }
        return merged;
      });
      setRules(next);
    },
    [rules, setRules],
  );

  const insertInterpolation = useCallback(
    (ruleIndex: number, varName: string) => {
      const current = rules[ruleIndex]?.template ?? '';
      const insert = '${' + varName + '}';
      const ta = textareaRefs.current[textareaRefKey(def.key, ruleIndex)];
      if (ta) {
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const nextTemplate = current.slice(0, start) + insert + current.slice(end);
        pendingCursorRef.current = { ruleIndex, pos: start + insert.length };
        patchRule(ruleIndex, { template: nextTemplate });
      } else {
        patchRule(ruleIndex, { template: current + insert });
      }
    },
    [def.key, rules, patchRule],
  );

  const allowedNames = new Set(def.interpolationValues.map((iv) => iv.name));
  const canTrigger = def.interpolationValues.length > 0;

  return (
    <div className="rounded-md border border-border overflow-hidden min-w-0 max-w-full">
      <div className="flex items-center gap-1.5 px-2 py-1.5 bg-muted/50">
        <button type="button" onClick={() => setOpen(!open)} className="shrink-0">
          {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </button>
        <span className="text-[11px] font-medium truncate flex-1">{def.label}</span>
        <button
          type="button"
          onClick={onRemoveAll}
          className="shrink-0 p-0.5 hover:bg-destructive/10 rounded"
          title="Remove all overrides for this string"
        >
          <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
        </button>
      </div>
      {open && (
        <div className="p-2 space-y-2 min-w-0 max-w-full text-xs">
          <div>
            <span className="text-muted-foreground text-[11px]">{canTrigger ? 'Default template' : 'Default value'}</span>
            <div className="mt-0.5 font-mono text-[11px] break-all text-foreground">{def.defaultTemplate}</div>
          </div>

          {rules.length > 0 ? (
            <div className="mt-2 min-w-0 border-t border-border pt-2">
              <div className="divide-y divide-border min-w-0">
                {rules.map((rule, ruleIndex) => {
                  const template = rule.template ?? '';
                  const invalidNames = invalidInterpolationNames(template, allowedNames);
                  const triggerName = rule.trigger?.name ?? '';
                  return (
                    <div key={`${def.key}-${ruleIndex}`} className="min-w-0 space-y-2 py-2 first:pt-0 last:pb-0">
                      {canTrigger ? (
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-muted-foreground text-[11px] font-medium">Override {ruleIndex + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeRule(ruleIndex)}
                            className="shrink-0 p-0.5 hover:bg-destructive/10 rounded"
                            aria-label={`Remove override ${ruleIndex + 1}`}
                          >
                            <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                          </button>
                        </div>
                      ) : null}

                      {canTrigger && (
                        <div className="space-y-1.5">
                          <span className="text-muted-foreground text-[11px]">Trigger (optional)</span>
                          <Select
                            value={triggerName || TRIGGER_SELECT_NONE}
                            onValueChange={(v) => {
                              if (v === TRIGGER_SELECT_NONE) {
                                patchRule(ruleIndex, { trigger: undefined });
                              } else {
                                patchRule(ruleIndex, {
                                  trigger: {
                                    name: v,
                                    value: rule.trigger?.name === v ? (rule.trigger?.value ?? '') : '',
                                  },
                                });
                              }
                            }}
                          >
                            <SelectTrigger
                              id={`ov25-trig-${def.key}-${ruleIndex}`}
                              className="h-7 w-full min-w-0 text-[11px] shrink-0 rounded-md px-2"
                            >
                              <SelectValue placeholder="When to apply…" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={TRIGGER_SELECT_NONE} className="text-[11px]">
                                Always (no trigger)
                              </SelectItem>
                              {def.interpolationValues.map((iv) => (
                                <SelectItem key={iv.name} value={iv.name} className="text-[11px] font-mono">
                                  {iv.name}
                                  {iv.description ? ` — ${iv.description}` : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {triggerName ? (
                            <input
                              type="text"
                              className="box-border w-full min-w-0 rounded-md border border-input bg-background px-2 py-1.5 font-mono text-[11px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                              placeholder="Value to match"
                              value={rule.trigger?.value ?? ''}
                              onChange={(e) =>
                                patchRule(ruleIndex, {
                                  trigger: { name: triggerName, value: e.target.value },
                                })
                              }
                            />
                          ) : null}
                        </div>
                      )}

                      {def.interpolationValues.length > 0 ? (
                        <div>
                          <span className="text-muted-foreground text-[11px]">Insert variables</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {def.interpolationValues.map((iv) => (
                              <button
                                key={iv.name}
                                type="button"
                                className="inline-flex rounded-full border border-border bg-background px-2 py-0.5 font-mono text-[10px] text-foreground hover:bg-muted cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  insertInterpolation(ruleIndex, iv.name);
                                }}
                              >
                                {'${' + iv.name + '}'}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      <div>
                        <label htmlFor={`ov25-str-${def.key}-${ruleIndex}`} className="text-muted-foreground text-[11px]">
                          Template
                        </label>
                        {invalidNames.length > 0 && (
                          <div className="mt-1.5 space-y-0.5 text-[11px] text-destructive" role="alert">
                            {invalidNames.map((name) => (
                              <div key={name}>{`${name} is not available for this string`}</div>
                            ))}
                          </div>
                        )}
                        <textarea
                          ref={(el) => {
                            textareaRefs.current[textareaRefKey(def.key, ruleIndex)] = el;
                          }}
                          id={`ov25-str-${def.key}-${ruleIndex}`}
                          rows={3}
                          aria-invalid={invalidNames.length > 0}
                          className={cn(
                            'mt-1 box-border min-h-[4.5rem] w-full min-w-0 max-w-full resize-y rounded-md border bg-background px-2 py-1.5 font-mono text-[11px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                            invalidNames.length > 0 ? 'border-destructive' : 'border-input',
                          )}
                          placeholder={def.defaultTemplate}
                          value={template}
                          onChange={(e) => patchRule(ruleIndex, { template: e.target.value })}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {canTrigger ? <AddPropertyButton onClick={addOverride} label="Add new Override" /> : null}
        </div>
      )}
    </div>
  );
}
