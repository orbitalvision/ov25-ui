import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ConfiguratorSetup, ThemePalettePreview, LEGACY_SETUP_FEATURES, THEME_STYLE_FEATURE, THEME_FONTS_FEATURE, validateThemeStyleProposal, buildDefaultConfiguratorSetupPayload } from 'ov25-setup';
import 'ov25-setup/dist/index.css';
import './theme-palette.css';

const themes = [
  { id: 'harbour-lifestyle', label: 'Harbour Lifestyle' },
  { id: 'arighi-bianchi', label: 'Arighi Bianchi' },
  { id: 'all-about-tweed', label: 'All About Tweed' },
  { id: 'recline-online', label: 'Recline Online' },
  { id: 'moy-furniture', label: 'Moy Furniture' },
  { id: 'orla-kiely', label: 'Orla Kiely Furniture' },
  { id: 'diamond-furniture', label: 'Diamond Furniture' },
  { id: 'diamond-furniture-design', label: 'Diamond Furniture Design (B2B)' },
  { id: 'the-chair-people', label: 'The Chair People (local export)' },
];
const requestedThemeId = new URLSearchParams(location.search).get('theme');
const initialThemeId = themes.find((entry) => entry.id === requestedThemeId)?.id ?? themes[0].id;
const compatibility = { buildId: 'local-theme-review', supportedFeatures: [...LEGACY_SETUP_FEATURES, THEME_STYLE_FEATURE, THEME_FONTS_FEATURE] };
const live = new URLSearchParams(location.search).has('live');
const savedPlacements = new URLSearchParams(location.search).has('savedPlacements');
const initialSettings = savedPlacements ? buildDefaultConfiguratorSetupPayload() : undefined;
const integrationFields = [
  { key: 'headerSelector', label: 'Store header', type: 'selector' },
  { key: 'desktopCarouselSelector', label: 'Desktop carousel target', type: 'selector' },
  { key: 'mobileCarouselSelector', label: 'Mobile carousel target', type: 'selector' },
  { key: 'addToCartFormSelector', label: 'Add-to-cart form', type: 'selector' },
];
const emptyIntegration = Object.fromEntries(integrationFields.map(({ key }) => [key, '']));

async function readProposal(id, signal, activeLayout = 'standard') {
  const response = live
    ? await fetch('http://127.0.0.1:3011/proposal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ themeId: id, layout: activeLayout }), signal })
    : await fetch(`/theme-style/${id}.json`, { signal });
  if (!response.ok) throw new Error(`Local theme analysis could not be loaded (${response.status}). ${live ? 'Start the OV25 local theme bridge on port 3011.' : 'Generate the local theme proposals first.'}`);
  return validateThemeStyleProposal(await response.json());
}

function App() {
  const [themeId, setThemeId] = useState(initialThemeId);
  const [view, setView] = useState('palette');
  const [proposal, setProposal] = useState();
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [integrationByTheme, setIntegrationByTheme] = useState({});
  const theme = themes.find((entry) => entry.id === themeId);
  useEffect(() => {
    const controller = new AbortController();
    setProposal(undefined);
    setError('');
    readProposal(themeId, controller.signal).then((value) => { if (!controller.signal.aborted) setProposal(value); }).catch((reason) => { if (!controller.signal.aborted) setError(reason.message); });
    return () => controller.abort();
  }, [themeId]);
  return <div className="theme-demo">
    <header className="theme-demo-header">
      <div><span className="theme-demo-eyebrow">OV25 SETUP / LOCAL THEME STUDY</span><h1>A palette that feels like your site.</h1><p>Colours, typography and buttons from your downloaded Shopify theme.</p></div>
      <label className="theme-demo-source">Theme<select value={themeId} onChange={(event) => setThemeId(event.target.value)}>{themes.map((entry) => <option key={entry.id} value={entry.id}>{entry.label}</option>)}</select></label>
    </header>
    <nav className="theme-demo-nav" aria-label="Preview mode">
      <button aria-pressed={view === 'palette'} onClick={() => setView('palette')}>Palette preview</button>
      <button aria-pressed={view === 'setup'} onClick={() => setView('setup')}>Try the setup flow</button>
      <span>{live ? 'Local OV25 analysis' : 'Saved local theme analysis'} · No store connection</span>
    </nav>
    {view === 'palette' ? <main className="theme-demo-board">
      {error ? <p role="alert" className="theme-demo-message">{error}</p> : !proposal ? <p role="status" className="theme-demo-message">Reading palette…</p> : <ThemePalettePreview key={themeId} proposal={proposal} />}
    </main> : <main className="theme-demo-setup">
      <ConfiguratorSetup key={themeId} draftKey={`local-theme:${themeId}:placement:${savedPlacements ? 'existing' : 'new'}`} initialConfig={initialSettings} className="theme-demo-setup-inner" useLocalPreview hidePreview={new URLSearchParams(location.search).has('noProductPreview')}
        compatibility={compatibility}
        storefrontIntegration={{ status: 'ready', platformLabel: 'Local Shopify theme', scopeLabel: `${theme.label} · Store-wide draft`,
          sections: [{ id: 'placement', title: 'Page placement', fields: integrationFields }],
          values: { ...emptyIntegration, ...integrationByTheme[themeId] },
          onChange: (key, value) => setIntegrationByTheme((previous) => ({ ...previous, [themeId]: { ...previous[themeId], [key]: value } })),
        }}
        themeStyling={{ contextKey: themeId, sourceLabel: theme.label,
          placement: { contextKey: themeId, savedSettings: savedPlacements ? 'existing' : 'none', scopeLabel: `${theme.label} · Default product settings and store-wide integration`,
            untouchedIntegrationKeys: integrationFields.map(({ key }) => key).filter((key) => !(key in (integrationByTheme[themeId] ?? {}))) },
          onRequest: ({ signal, activeLayout }) => readProposal(themeId, signal, activeLayout) }}
        onSave={() => setSaved(true)} />
    </main>}
    <footer className="theme-demo-footer">Select a preset, then choose “Match my site”. Applying changes only the draft.{saved ? <span role="status"> Demo saved locally. No store was updated.</span> : ''}</footer>
  </div>;
}
createRoot(document.getElementById('root')).render(<App />);
