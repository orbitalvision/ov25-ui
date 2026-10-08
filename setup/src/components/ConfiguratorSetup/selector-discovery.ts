import type { TypeSettings } from './types';
import type { StorefrontIntegrationConfig } from './storefront-integration';

export const SELECTOR_DISCOVERY_TARGETS = {
  gallery: { label: 'Product gallery', role: 'Where the product viewer appears', scope: 'layout' },
  variants: { label: 'Configuration controls', role: 'Where shoppers choose product options', scope: 'layout' },
  price: { label: 'Product price', role: 'Where the configured price appears', scope: 'layout' },
  name: { label: 'Product name', role: 'Where the product title appears', scope: 'layout' },
  swatches: { label: 'Colour and material swatches', role: 'Where finish choices appear', scope: 'layout' },
  configureButton: { label: 'Configure button', role: 'The button that opens the configurator', scope: 'layout' },
  headerSelector: { label: 'Store header', role: 'The header used to position sticky content', scope: 'storefront' },
  desktopCarouselSelector: { label: 'Desktop product gallery', role: 'The existing gallery on larger screens', scope: 'storefront' },
  mobileCarouselSelector: { label: 'Mobile product gallery', role: 'The existing gallery on smaller screens', scope: 'storefront' },
  addToCartFormSelector: { label: 'Add-to-cart form', role: 'The product form used when adding to the basket', scope: 'storefront' },
} as const;

export type SelectorDiscoveryKey = keyof typeof SELECTOR_DISCOVERY_TARGETS;
export type SelectorDiscoveryLayoutKey = Extract<SelectorDiscoveryKey, keyof TypeSettings['selectors']>;
export interface SelectorDiscoveryTarget {
  key: SelectorDiscoveryKey;
  selector: string;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
  sourceFiles: string[];
}

/** A proposal contains selector strings and their evidence, never code or CSS. */
export interface SelectorDiscoveryProposal {
  schemaVersion: 1;
  source: { id: string; label: string; kind: 'local-theme'; fingerprint: string; files: string[] };
  method: 'ai' | 'source';
  generatedAt: string;
  warnings: string[];
  targets: SelectorDiscoveryTarget[];
}

export interface ConfiguratorSetupSelectorDiscovery {
  /** Change with the shop, product or source theme to invalidate pending suggestions. */
  contextKey: string;
  savedSettings: 'none' | 'existing' | 'unknown';
  scopeLabel?: string;
  /** Globals the host confirms have never been edited in this draft. Omit to require review. */
  untouchedIntegrationKeys?: readonly Exclude<SelectorDiscoveryKey, SelectorDiscoveryLayoutKey>[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);
const hasOnlyKeys = (value: Record<string, unknown>, keys: readonly string[]) =>
  Object.keys(value).every((key) => keys.includes(key));
const boundedText = (value: unknown, maximum: number): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= maximum && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value);
const fileList = (value: unknown): value is string[] => Array.isArray(value) && value.length > 0 && value.length <= 48 &&
  value.every((file) => boundedText(file, 500) && !/^(?:\/|[a-z]+:)/i.test(file) && !file.includes('\\') && !file.split('/').includes('..')) && new Set(value).size === value.length;

/** Split only at selector-list/relationship boundaries, preserving quoted attribute values. */
function terminalCompounds(selector: string): string[] {
  const compounds: string[] = [];
  let current = '';
  let last = '';
  let quote = '';
  const brackets: string[] = [];
  for (let index = 0; index < selector.length; index += 1) {
    const char = selector[index];
    if (char === '\\') { current += char + (selector[++index] ?? ''); continue; }
    if (quote) { current += char; if (char === quote) quote = ''; continue; }
    if (char === '"' || char === "'") { quote = char; current += char; continue; }
    if (char === '[' || char === '(') brackets.push(char);
    if ((char === ']' && brackets.pop() !== '[') || (char === ')' && brackets.pop() !== '(')) return [];
    if (brackets.length === 0 && (char === ',' || /[\s>+~]/.test(char))) {
      if (current.trim()) last = current.trim();
      current = '';
      if (char === ',') { compounds.push(last); last = ''; }
    } else current += char;
  }
  if (quote || brackets.length) return [];
  compounds.push(current.trim() || last);
  return compounds;
}

export function isSafeSelectorDiscoverySelector(selector: string): boolean {
  if (!boundedText(selector, 500) || /[{};\u0000]/.test(selector) || selector.includes('::')) return false;
  // Keep the analysis contract deliberately small. Selector-list pseudo classes can conceal
  // a broad alternative such as :is(.product, body), and escapes can disguise root names.
  if (/\\|\/(?:\*|\/)|:(?:is|where|not|has)\s*\(/i.test(selector)) return false;
  const compounds = terminalCompounds(selector);
  if (!compounds.length || compounds.some((part) => !part ||
    /^(?:\*|(?:html|body|main)(?=$|[.#[:]))/i.test(part) ||
    /(?:[.#](?:root|app)(?![\w-])|:(?:root|scope)(?![\w-]))/i.test(part) ||
    /\[\s*(?:id\s*=\s*["']?(?:root|app)|role\s*=\s*["']?main)["']?\s*\]/i.test(part))) return false;
  try {
    if (typeof document === 'undefined') return false;
    document.createDocumentFragment().querySelector(selector);
    return true;
  } catch { return false; }
}

/** Validate responses and cached proposals at the shared UI boundary. Unknown fields fail closed. */
export function validateSelectorDiscoveryProposal(value: unknown): SelectorDiscoveryProposal {
  const invalid = () => new Error('The theme analysis returned invalid page placements. Please try again.');
  if (!isRecord(value) || !hasOnlyKeys(value, ['schemaVersion', 'source', 'method', 'generatedAt', 'warnings', 'targets']) ||
      value.schemaVersion !== 1 || !isRecord(value.source) ||
      !hasOnlyKeys(value.source, ['id', 'label', 'kind', 'fingerprint', 'files']) || value.source.kind !== 'local-theme' ||
      !boundedText(value.source.id, 100) || !boundedText(value.source.label, 200) || !boundedText(value.source.fingerprint, 128) ||
      !fileList(value.source.files) || !['ai', 'source'].includes(value.method as string) ||
      !boundedText(value.generatedAt, 100) || !Number.isFinite(Date.parse(value.generatedAt)) ||
      !Array.isArray(value.warnings) || value.warnings.length > 32 || value.warnings.some((warning) => !boundedText(warning, 1000)) ||
      !Array.isArray(value.targets) || value.targets.length > Object.keys(SELECTOR_DISCOVERY_TARGETS).length) throw invalid();
  const files = new Set(value.source.files);
  const seen = new Set<string>();
  for (const target of value.targets) {
    if (!isRecord(target) || !hasOnlyKeys(target, ['key', 'selector', 'confidence', 'reason', 'sourceFiles']) ||
        typeof target.key !== 'string' || !Object.prototype.hasOwnProperty.call(SELECTOR_DISCOVERY_TARGETS, target.key) || seen.has(target.key) ||
        typeof target.selector !== 'string' || !isSafeSelectorDiscoverySelector(target.selector) ||
        !['high', 'medium', 'low'].includes(target.confidence as string) || !boundedText(target.reason, 1000) ||
        !fileList(target.sourceFiles) || target.sourceFiles.some((file) => !files.has(file))) throw invalid();
    seen.add(target.key);
  }
  return structuredClone(value) as unknown as SelectorDiscoveryProposal;
}

export function isSelectorDiscoveryLayoutKey(key: SelectorDiscoveryKey): key is SelectorDiscoveryLayoutKey {
  return SELECTOR_DISCOVERY_TARGETS[key].scope === 'layout';
}

export function getSelectorDiscoveryCurrentValue(key: SelectorDiscoveryKey, settings: TypeSettings, integration?: StorefrontIntegrationConfig): string {
  if (isSelectorDiscoveryLayoutKey(key)) return settings.selectors[key].selector;
  const value = integration?.status === 'ready' ? integration.values[key] : undefined;
  return typeof value === 'string' ? value : '';
}

export function getSelectorDiscoveryTargetAvailability(key: SelectorDiscoveryKey, settings: TypeSettings, integration?: StorefrontIntegrationConfig): { available: boolean; reason?: string } {
  if (isSelectorDiscoveryLayoutKey(key)) return settings.selectors[key].enabled
    ? { available: true }
    : { available: false, reason: 'This placement is disabled for the current layout.' };
  if (!integration) return { available: false, reason: 'Storefront settings are not available.' };
  if (integration.status === 'loading') return { available: false, reason: 'Storefront settings are still loading.' };
  if (integration.status === 'error') return { available: false, reason: 'Storefront settings could not be loaded.' };
  if (integration.readOnly) return { available: false, reason: 'Storefront settings are read-only.' };
  const field = integration.sections.flatMap((section) => section.fields).find((entry) => entry.key === key);
  if (field?.type !== 'selector' || typeof integration.values[key] !== 'string') return { available: false, reason: 'This storefront selector field is not available.' };
  return { available: true };
}

/** Only exact supported fields are eligible: never guess a host field mapping or enable a selector. */
export function getAvailableSelectorDiscoveryTargets(proposal: SelectorDiscoveryProposal, settings: TypeSettings, integration?: StorefrontIntegrationConfig): SelectorDiscoveryTarget[] {
  return proposal.targets.filter((target) => getSelectorDiscoveryTargetAvailability(target.key, settings, integration).available &&
    getSelectorDiscoveryCurrentValue(target.key, settings, integration).trim() !== target.selector.trim());
}

/** Apply layout selector strings only. Host-owned storefront values must use the host's onChange. */
export function applySelectorDiscoveryProposal(settings: TypeSettings, proposal: SelectorDiscoveryProposal): TypeSettings {
  const valid = validateSelectorDiscoveryProposal(proposal);
  const selectors = { ...settings.selectors };
  for (const target of valid.targets) {
    if (isSelectorDiscoveryLayoutKey(target.key) && selectors[target.key].enabled) {
      selectors[target.key] = { ...selectors[target.key], selector: target.selector };
    }
  }
  return { ...settings, selectors };
}
