import type {
  StringReplacementRule,
  StringReplacementRuleTrigger,
  StringReplacementsConfig,
} from 'ov25-ui';

function cleanRulesFromUnknownArray(rules: unknown[]): StringReplacementRule[] {
  const out: StringReplacementRule[] = [];
  for (const r of rules) {
    if (!r || typeof r !== 'object') continue;
    const o = r as Record<string, unknown>;
    const template = typeof o.template === 'string' ? o.template : '';
    const trig = o.trigger;
    let trigger: StringReplacementRuleTrigger | undefined;
    if (trig && typeof trig === 'object' && !Array.isArray(trig)) {
      const t = trig as Record<string, unknown>;
      const name = typeof t.name === 'string' ? t.name.trim() : '';
      const value = t.value == null ? '' : String(t.value);
      if (name) trigger = { name, value };
    }
    out.push(trigger ? { trigger, template } : { template });
  }
  return out;
}

/**
 * Hydrate editor state from saved inject config (full rule lists per key).
 */
export function serializableToFormStringReplacements(
  config: StringReplacementsConfig | undefined,
): StringReplacementsConfig {
  if (!config || typeof config !== 'object') return {};
  const out: StringReplacementsConfig = {};
  for (const [k, rules] of Object.entries(config)) {
    if (!Array.isArray(rules)) continue;
    const cleaned = cleanRulesFromUnknownArray(rules).filter((r) => r.template.trim() !== '');
    if (cleaned.length > 0) out[k] = cleaned;
  }
  return out;
}

/** Build inject `stringReplacements` from form state (drops empty templates). */
export function formStringReplacementsToSerializable(
  form: StringReplacementsConfig | undefined,
): StringReplacementsConfig | undefined {
  if (!form) return undefined;
  const out: StringReplacementsConfig = {};
  for (const [k, rules] of Object.entries(form)) {
    if (!Array.isArray(rules) || rules.length === 0) continue;
    const cleaned: StringReplacementRule[] = [];
    for (const r of rules) {
      const template = (r?.template ?? '').trim();
      if (!template) continue;
      const tn = r?.trigger?.name?.trim();
      if (tn) {
        cleaned.push({ trigger: { name: tn, value: String(r.trigger?.value ?? '') }, template });
      } else {
        cleaned.push({ template });
      }
    }
    if (cleaned.length > 0) out[k] = cleaned;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/**
 * Normalizes `stringReplacements` when loading from localStorage (legacy `key → string`
 * or current `key → StringReplacementRule[]`).
 */
export function normalizeStringReplacementsState(raw: unknown): StringReplacementsConfig {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out: StringReplacementsConfig = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === 'string') {
      const t = v.trim();
      if (t) out[k] = [{ template: t }];
    } else if (Array.isArray(v)) {
      out[k] = cleanRulesFromUnknownArray(v);
    }
  }
  return out;
}
