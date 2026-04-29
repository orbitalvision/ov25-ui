/**
 * @typedef {{ variantsDesktop: string; variantsMobile: string; modulesDesktop: string; modulesMobile: string }} Snap2LayoutQuery
 */

/**
 * @param {Partial<Snap2LayoutQuery>} defaults - Used when URL params are missing or invalid.
 * @returns {Snap2LayoutQuery}
 */
export function readSnap2LayoutQuery(defaults) {
  const q = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const d = {
    variantsDesktop: String(defaults.variantsDesktop ?? 'RIGHT').toUpperCase(),
    variantsMobile: String(defaults.variantsMobile ?? 'RIGHT').toUpperCase(),
    modulesDesktop: String(defaults.modulesDesktop ?? 'BOTTOM').toUpperCase(),
    modulesMobile: String(defaults.modulesMobile ?? 'BOTTOM').toUpperCase(),
  };
  const pick = (key, allowed, fallback) => {
    const raw = (q.get(key) ?? '').toString().toUpperCase();
    return allowed.includes(raw) ? raw : fallback;
  };
  return {
    variantsDesktop: pick('vd', ['LEFT', 'RIGHT'], d.variantsDesktop),
    variantsMobile: pick('vm', ['LEFT', 'RIGHT'], d.variantsMobile),
    modulesDesktop: pick('md', ['LEFT', 'RIGHT', 'BOTTOM'], d.modulesDesktop),
    modulesMobile: pick('mm', ['LEFT', 'RIGHT', 'BOTTOM'], d.modulesMobile),
  };
}

/**
 * Updates query params and reloads so `injectConfigurator` picks up new Snap2 rail positions (single clean inject).
 * @param {Partial<Snap2LayoutQuery>} defaults
 * @param {Partial<Snap2LayoutQuery>} patch
 */
export function applySnap2LayoutQueryPatch(defaults, patch) {
  const cur = { ...readSnap2LayoutQuery(defaults), ...patch };
  const u = new URL(window.location.href);
  u.searchParams.set('vd', cur.variantsDesktop.toLowerCase());
  u.searchParams.set('vm', cur.variantsMobile.toLowerCase());
  u.searchParams.set('md', cur.modulesDesktop.toLowerCase());
  u.searchParams.set('mm', cur.modulesMobile.toLowerCase());
  window.location.href = u.href;
}

const segBase =
  'ov:inline-flex ov:items-center ov:justify-center ov:min-w-[2.25rem] ov:px-2 ov:py-1 ov:rounded-md ov:border ov:text-xs ov:font-medium ov:transition-colors';

/**
 * Dev toolbar: Snap2 variant sheet side (`vd` / `vm`) and module panel position (`md` / `mm`) via URL; reloads to re-inject.
 * @param {{ defaults: Partial<Snap2LayoutQuery>; className?: string }} props
 */
export function Snap2PositionControls({ defaults, className = '' }) {
  const cur = readSnap2LayoutQuery(defaults);

  /** @param {keyof Snap2LayoutQuery} key */
  const seg = (key, value, label) => {
    const active = cur[key] === value;
    return (
      <button
        key={`${key}-${value}`}
        type="button"
        aria-pressed={active}
        className={`${segBase} ${
          active
            ? 'ov:bg-[#1a1a1a] ov:text-white ov:border-[#1a1a1a]'
            : 'ov:bg-white ov:text-[#1a1a1a] ov:border-gray-300 hover:ov:border-gray-400'
        }`}
        onClick={() => applySnap2LayoutQueryPatch(defaults, { [key]: value })}
      >
        {label}
      </button>
    );
  };

  return (
    <div
      className={`ov:flex ov:flex-col ov:gap-2 ov:rounded-lg ov:border ov:border-gray-200 ov:bg-gray-50 ov:p-3 ov:text-[#1a1a1a] ${className}`}
    >
      <p className="ov:text-xs ov:text-[#525252] ov:m-0">
        Variant sheet (vd/vm) and module panel (md/mm). Reloads the page to re-inject.
      </p>
      <div className="ov:flex ov:flex-wrap ov:items-center ov:gap-x-4 ov:gap-y-2">
        <div className="ov:flex ov:flex-wrap ov:items-center ov:gap-2">
          <span className="ov:text-xs ov:font-semibold ov:text-[#525252] ov:whitespace-nowrap">Variants desktop</span>
          <div className="ov:flex ov:flex-wrap ov:gap-1">{seg('variantsDesktop', 'LEFT', 'L')}{seg('variantsDesktop', 'RIGHT', 'R')}</div>
        </div>
        <div className="ov:flex ov:flex-wrap ov:items-center ov:gap-2">
          <span className="ov:text-xs ov:font-semibold ov:text-[#525252] ov:whitespace-nowrap">Variants mobile</span>
          <div className="ov:flex ov:flex-wrap ov:gap-1">{seg('variantsMobile', 'LEFT', 'L')}{seg('variantsMobile', 'RIGHT', 'R')}</div>
        </div>
      </div>
      <div className="ov:flex ov:flex-wrap ov:items-center ov:gap-x-4 ov:gap-y-2">
        <div className="ov:flex ov:flex-wrap ov:items-center ov:gap-2">
          <span className="ov:text-xs ov:font-semibold ov:text-[#525252] ov:whitespace-nowrap">Modules desktop</span>
          <div className="ov:flex ov:flex-wrap ov:gap-1">
            {seg('modulesDesktop', 'LEFT', 'L')}
            {seg('modulesDesktop', 'RIGHT', 'R')}
            {seg('modulesDesktop', 'BOTTOM', 'B')}
          </div>
        </div>
        <div className="ov:flex ov:flex-wrap ov:items-center ov:gap-2">
          <span className="ov:text-xs ov:font-semibold ov:text-[#525252] ov:whitespace-nowrap">Modules mobile</span>
          <div className="ov:flex ov:flex-wrap ov:gap-1">
            {seg('modulesMobile', 'LEFT', 'L')}
            {seg('modulesMobile', 'RIGHT', 'R')}
            {seg('modulesMobile', 'BOTTOM', 'B')}
          </div>
        </div>
      </div>
    </div>
  );
}
