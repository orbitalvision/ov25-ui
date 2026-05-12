import type { StringReplacementRule } from '../../types/string-replacements.js';

export type StringInterpolationVars = Record<string, string | number | null | undefined>;

type ResolveStringReplacementInput = {
  rules?: StringReplacementRule[];
  fallback: string;
  vars?: StringInterpolationVars;
};

// trimmed lowercase
const normalize = (value: string | null | undefined): string =>
  String(value ?? '').trim().toLowerCase();

// interpolates the template with the variables
const interpolateTemplate = (template: string, vars: StringInterpolationVars | undefined): string => {
  if (!vars) return template;
  return template.replace(/\$\{\s*([A-Za-z0-9_]+)\s*\}/g, (_match, variableName: string) => {
    const variableValue = vars[variableName];
    return variableValue == null ? '' : String(variableValue); // if the variable is not found, return an empty string
  });
};

/**
 * Resolves a string replacement from pre-selected rules.
 * @param rules - Rules for a single replacement key.
 * @param fallback - The fallback value if the key is not found.
 * @param vars - The variables to use for interpolation.
 * @returns The resolved string.
 */
export function resolveStringReplacement({
  rules,
  fallback,
  vars,
}: ResolveStringReplacementInput): string {
  if (!rules || rules.length === 0) {
    return fallback;
  }

  let catchAllTemplate: string | undefined;

  for (const rule of rules) {
    if (!rule?.template) continue;

    // Store the first catch-all and only use it if no triggered rules match.
    if (!rule.trigger) {
      if (catchAllTemplate == null) {
        catchAllTemplate = rule.template;
      }
      continue;
    }

    // Triggered rule: compare selected interpolation var against configured trigger value.
    const runtimeValue = vars?.[rule.trigger.name];
    if (normalize(runtimeValue == null ? '' : String(runtimeValue)) === normalize(rule.trigger.value)) {
      return interpolateTemplate(rule.template, vars);
    }
  }

  if (catchAllTemplate != null) {
    return interpolateTemplate(catchAllTemplate, vars);
  }

  return fallback;
}
