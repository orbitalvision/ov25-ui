import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, CheckCircle2, ChevronRight, CircleHelp, ExternalLink, Layers3, LoaderCircle, LockKeyhole, Palette, Plus, Search, Settings2, Sparkles, Store, WandSparkles } from 'lucide-react';
import { getDefaultPresetId, getSetupPresets } from '../../../setup/src/components/ConfiguratorSetup/presets';
import './shopify-guided-setup.css';

const STEPS = ['Choose theme', 'Configurator type', 'Choose preset', 'Link products', 'Automatic setup'];
const THEMES = [
  { id: 'live', name: 'Studio', detail: 'Live theme', live: true },
  { id: 'draft', name: 'Studio redesign', detail: 'Unpublished theme', live: false },
  { id: 'draft-2', name: 'Spring collection', detail: 'Unpublished theme', live: false },
];
const TYPES = [
  { id: 'standard', label: 'Standard', description: 'A single product with options, like a sofa or chair.', mark: '01', shape: 'sofa' },
  { id: 'snap2', label: 'Snap2', description: 'A modular product made from configurable pieces.', mark: '02', shape: 'modular' },
  { id: 'bedConfigurator', label: 'Bed', description: 'A complete bed with choices for each component.', mark: '03', shape: 'bed' },
];
const SHOP_PRODUCTS = [
  { id: 's1', name: 'The Rowan sofa', detail: 'Active · Online store', colour: '#dacdc0' },
  { id: 's2', name: 'The Willow armchair', detail: 'Active · Online store', colour: '#d5d2c5' },
  { id: 's3', name: 'The Atlas sofa', detail: 'Draft', colour: '#d9c8bc' },
];
const OV_PRODUCTS = [
  { id: 'o1', name: 'Rowan sofa', manufacturer: 'Willow & Co.', range: 'Rowan', colour: '#d9cec2' },
  { id: 'o2', name: 'Willow armchair', manufacturer: 'Willow & Co.', range: 'Willow', colour: '#cdd0bd' },
  { id: 'o3', name: 'Atlas sofa', manufacturer: 'The Loft Collection', range: 'Atlas', colour: '#d9c7b9' },
];
const stepsLabel = 'Setup progress';

function Stepper({ current, furthest, onSelect }) {
  return <nav className="gs-stepper" aria-label={stepsLabel}>
    <div className="gs-mobile-step">Step {current + 1} of {STEPS.length}<span>{STEPS[current]}</span></div>
    <ol>{STEPS.map((label, index) => <li key={label} className={`gs-step ${index === current ? 'is-current' : ''} ${index < current ? 'is-complete' : ''}`}>
      <button type="button" onClick={() => onSelect(index)} disabled={index > furthest} aria-current={index === current ? 'step' : undefined}>
        <span className="gs-step-number">{index < current ? <Check size={14} strokeWidth={2.4} /> : index + 1}</span>
        <span>{label}</span>
      </button><ChevronRight className="gs-step-arrow" size={15} aria-hidden="true" />
    </li>)}</ol>
  </nav>;
}

function Heading({ eyebrow, title, children }) {
  return <div className="gs-heading"><span className="gs-eyebrow">{eyebrow}</span><h1>{title}</h1><p>{children}</p></div>;
}

function Footer({ back, next, nextLabel = 'Continue', disabled = false, note }) {
  return <div className="gs-footer"><div>{back && <button type="button" className="gs-btn gs-btn-quiet" onClick={back}><ArrowLeft size={16} /> Back</button>}</div><div className="gs-footer-right">{note && <span className="gs-footer-note">{note}</span>}<button type="button" className="gs-btn gs-btn-primary" onClick={next} disabled={disabled}>{nextLabel}<ArrowRight size={16} /></button></div></div>;
}

function TypeIllustration({ shape }) {
  return <div className={`gs-type-illustration gs-illustration-${shape}`} aria-hidden="true">
    <div className="gs-type-art"><div className="gs-art-window"><div className="gs-art-circle" /><div className="gs-art-ground" /><div className="gs-art-product"><i /><i /><i /></div></div><div className="gs-art-options"><i /><i /><i /><i /></div></div>
  </div>;
}

function PresetIllustration({ id }) {
  return <div className={`gs-preset-illustration gs-preset-${id}`} aria-hidden="true"><div className="gs-preset-browser"><div className="gs-browser-bar"><i /><i /><i /></div><div className="gs-preset-scene"><div className="gs-preset-object"><div /><span /></div><div className="gs-preset-panel"><b /><i /><i /><i /><em /></div>{id === 'guided' && <div className="gs-preset-dialog"><b /><i /><i /><i /><em /></div>}{id === 'overview' && <div className="gs-overview-grid"><i /><i /><i /><i /></div>}</div></div></div>;
}

function ProductRow({ item, detail, linkedTo, onClick, disabled = false }) {
  return <button type="button" className="gs-product-row" onClick={onClick} disabled={disabled}>
    <span className="gs-product-thumb" style={{ '--thumb': item.colour }}><span /></span>
    <span className="gs-product-info"><strong>{item.name}</strong><small>{detail}</small></span>
    {linkedTo && <span className="gs-linked-badge"><Check size={13} /> Linked<span className="gs-linked-name"> to {linkedTo}</span></span>}
    {!disabled && <ChevronRight className="gs-product-chevron" size={16} />}
  </button>;
}

/** Design-only product linking; its state is supplied by the host so the same
 * surface can later be used separately from the setup flow. */
function ProductLinker({ shopProducts, ovProducts, links, onLinksChange }) {
  const [direction, setDirection] = useState('ov25');
  const [sourceId, setSourceId] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [range, setRange] = useState('');
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const catalogueHeading = useRef(null);
  useEffect(() => { catalogueHeading.current?.focus({ preventScroll: true }); }, [direction, sourceId, manufacturer, range]);
  const source = (direction === 'ov25' ? ovProducts : shopProducts).find(item => item.id === sourceId);
  const existing = direction === 'shopify' && source && links.find(link => link.shopId === source.id);
  const displayedQuery = query.trim().toLowerCase();
  const filter = (items) => items.filter(item => item.name.toLowerCase().includes(displayedQuery));
  const shopLink = id => links.find(link => link.shopId === id);
  const linkedShopName = link => shopProducts.find(item => item.id === link.shopId)?.name;
  const linkedOvName = link => ovProducts.find(item => item.id === link.ovId)?.name;
  const countForOv = id => links.filter(link => link.ovId === id);
  const goBack = () => {
    if (range) setRange('');
    else if (manufacturer) setManufacturer('');
    else setSourceId('');
    setQuery('');
  };
  const setCatalogue = next => { setDirection(next); setSourceId(''); setManufacturer(''); setRange(''); setQuery(''); setMessage(''); };
  const selectSource = item => { setSourceId(item.id); setQuery(''); setMessage(''); };
  const createLink = (shop, ov) => {
    if (!shop || !ov || shopLink(shop.id)) return;
    onLinksChange([...links, { shopId: shop.id, ovId: ov.id }]);
    setMessage(`${shop.name} is linked to ${ov.name}.`);
    setSourceId(''); setManufacturer(''); setRange(''); setQuery('');
  };
  const manufacturers = [...new Set(ovProducts.map(product => product.manufacturer))];
  const ranges = [...new Set(ovProducts.filter(product => product.manufacturer === manufacturer).map(product => product.range))];
  const resultProducts = ovProducts.filter(product => product.manufacturer === manufacturer && product.range === range);
  const visibleCount = !source ? filter(direction === 'ov25' ? ovProducts : shopProducts).length
    : direction === 'ov25' ? filter(shopProducts).length
    : !manufacturer ? manufacturers.filter(name => name.toLowerCase().includes(displayedQuery)).length
    : !range ? ranges.filter(name => name.toLowerCase().includes(displayedQuery)).length
    : filter(resultProducts).length;
  return <div className="gs-linking">
    <div className="gs-link-header"><div className="gs-tabs" role="group" aria-label="Choose product catalogue">
      <button type="button" className={direction === 'ov25' ? 'is-active' : ''} aria-pressed={direction === 'ov25'} onClick={() => setCatalogue('ov25')}>OV25 products</button>
      <button type="button" className={direction === 'shopify' ? 'is-active' : ''} aria-pressed={direction === 'shopify'} onClick={() => setCatalogue('shopify')}>Shopify products</button>
    </div><span className="gs-demo-text">Example products</span></div>
    {message && <div className="gs-linked-notice" role="status"><CheckCircle2 size={16} /> {message}</div>}
    <section className="gs-surface gs-catalogue" aria-label="Product linking">
      {source && <button type="button" className="gs-catalogue-back" onClick={goBack}><ArrowLeft size={15} /> {range ? 'Back to ranges' : manufacturer ? 'Back to manufacturers' : `Back to ${direction === 'ov25' ? 'OV25' : 'Shopify'} products`}</button>}
      <div className="gs-catalogue-heading"><div><h2 ref={catalogueHeading} tabIndex={-1}>{!source ? direction === 'ov25' ? 'OV25 products' : 'Shopify products' : existing ? 'Product linked' : direction === 'ov25' ? 'Choose a Shopify product' : !manufacturer ? 'Choose a manufacturer' : !range ? 'Choose a range' : 'Choose an OV25 product'}</h2>
        <p>{!source ? 'Choose a product to find its match.' : existing ? 'This Shopify product already has a linked configurator.' : <>Linking <strong>{source.name}</strong> · {direction === 'ov25' ? 'OV25 product' : 'Shopify product'}</>}</p></div>
        {!source && <span className="gs-link-count">{links.length} {links.length === 1 ? 'product linked' : 'products linked'}</span>}
      </div>
      {manufacturer && <div className="gs-product-path"><span>{manufacturer}</span>{range && <><ChevronRight size={13} /><span>{range}</span></>}</div>}
      {source && direction === 'ov25' && <button type="button" className="gs-create-product" disabled><span className="gs-create-icon"><Plus size={17} /></span><span><strong>Create new product</strong><small>Create a Shopify product for {source.name}</small></span><span className="gs-coming-label">Not connected</span></button>}
      {existing ? <div className="gs-existing-link"><span className="gs-linked-badge"><Check size={13} /> Linked</span><div><strong>{linkedOvName(existing)}</strong><small>OV25 product</small></div></div> : <>
        <label className="gs-search gs-catalogue-search"><Search size={16} /><span className="gs-sr-only">Search {source && direction === 'shopify' && !range ? manufacturer ? 'ranges' : 'manufacturers' : 'products'}</span><input placeholder={source && direction === 'shopify' && !range ? manufacturer ? 'Search ranges' : 'Search manufacturers' : 'Search products'} value={query} onChange={e => setQuery(e.target.value)} /></label>
        <div className="gs-catalogue-list">
          {!source && direction === 'ov25' && filter(ovProducts).map(item => { const matches = countForOv(item.id); return <ProductRow key={item.id} item={item} detail={`${item.manufacturer} · ${item.range}`} linkedTo={matches.length ? matches.length === 1 ? linkedShopName(matches[0]) : `${matches.length} Shopify products` : ''} onClick={() => selectSource(item)} />; })}
          {!source && direction === 'shopify' && filter(shopProducts).map(item => { const link = shopLink(item.id); return <ProductRow key={item.id} item={item} detail={item.detail} linkedTo={link && linkedOvName(link)} onClick={() => selectSource(item)} />; })}
          {source && direction === 'ov25' && filter(shopProducts).map(item => { const link = shopLink(item.id); return <ProductRow key={item.id} item={item} detail={item.detail} linkedTo={link && linkedOvName(link)} disabled={!!link} onClick={() => createLink(item, source)} />; })}
          {source && direction === 'shopify' && !manufacturer && manufacturers.filter(name => name.toLowerCase().includes(displayedQuery)).map(name => { const count = new Set(ovProducts.filter(product => product.manufacturer === name).map(product => product.range)).size; return <button type="button" className="gs-folder-row" key={name} onClick={() => { setManufacturer(name); setQuery(''); }}><span className="gs-folder-icon"><Layers3 size={17} /></span><span className="gs-product-info"><strong>{name}</strong><small>{count} {count === 1 ? 'range' : 'ranges'}</small></span><ChevronRight className="gs-product-chevron" size={16} /></button>; })}
          {source && direction === 'shopify' && manufacturer && !range && ranges.filter(name => name.toLowerCase().includes(displayedQuery)).map(name => { const count = ovProducts.filter(product => product.manufacturer === manufacturer && product.range === name).length; return <button type="button" className="gs-folder-row" key={name} onClick={() => { setRange(name); setQuery(''); }}><span className="gs-folder-icon"><Layers3 size={17} /></span><span className="gs-product-info"><strong>{name}</strong><small>{count} {count === 1 ? 'product' : 'products'}</small></span><ChevronRight className="gs-product-chevron" size={16} /></button>; })}
          {source && direction === 'shopify' && range && filter(resultProducts).map(item => <ProductRow key={item.id} item={item} detail={`${item.manufacturer} · ${item.range}`} onClick={() => createLink(source, item)} />)}
          {visibleCount === 0 && <p className="gs-empty">No matches found.</p>}
        </div>
      </>}
    </section>
    <p className="gs-catalogue-note"><CircleHelp size={15} /> Links in this design preview use sample data and do not change Shopify.</p>
  </div>;
}

function App() {
  const productsDemo = new URLSearchParams(window.location.search).get('step') === 'products';
  const [step, setStep] = useState(productsDemo ? 3 : 0);
  const [furthest, setFurthest] = useState(productsDemo ? 3 : 0);
  const [themeId, setThemeId] = useState(productsDemo ? 'live' : '');
  const [type, setType] = useState(productsDemo ? 'standard' : '');
  const [preset, setPreset] = useState(productsDemo ? getDefaultPresetId('standard') : '');
  const [links, setLinks] = useState([]);
  const [analysis, setAnalysis] = useState('intro');
  const [colours, setColours] = useState({ button: '#2c493d', text: '#ffffff', accent: '#718c73', background: '#f7f7f4' });
  const [radius, setRadius] = useState('8');
  const [selectedViewport, setSelectedViewport] = useState('desktop');
  const headingRef = useRef(null);
  const timer = useRef();
  const theme = THEMES.find(item => item.id === themeId);
  const selectedType = TYPES.find(item => item.id === type);
  const selectedPreset = type && getSetupPresets(type).find(item => item.id === preset);
  const shopProducts = type === 'bedConfigurator' ? SHOP_PRODUCTS.map(item => ({ ...item, name: item.name.replace('sofa', 'bed').replace('armchair', 'bed') })) : SHOP_PRODUCTS;
  const ovProducts = OV_PRODUCTS.map(item => ({ ...item, name: type === 'bedConfigurator' ? item.name.replace('sofa', 'bed').replace('armchair', 'bed') : item.name, detail: `${selectedType?.label ?? 'Standard'} configurator` }));
  const shownProduct = shopProducts.find(item => item.id === links[0]?.shopId);
  const go = (next) => { setStep(next); setFurthest(value => Math.max(value, next)); };
  const chooseType = (id) => { if (id !== type) { setType(id); setPreset(getDefaultPresetId(id)); setLinks([]); setAnalysis('intro'); setFurthest(value => Math.min(value, 1)); } };
  useEffect(() => { headingRef.current?.focus({ preventScroll: true }); }, [step]);
  useEffect(() => () => clearTimeout(timer.current), []);
  const showExample = () => { setAnalysis('running'); timer.current = setTimeout(() => setAnalysis('result'), 850); };
  const colourField = (key, label) => <label className="gs-colour-field"><span>{label}</span><span className="gs-colour-control"><input aria-label={label} type="color" value={colours[key]} onChange={e => setColours({ ...colours, [key]: e.target.value })} /><code>{colours[key].toUpperCase()}</code></span></label>;

  return <div className="gs-app">
    <header className="gs-topbar"><div className="gs-top-inner"><div className="gs-brand"><span className="gs-brand-mark">ov<span>25</span></span><span className="gs-brand-divider" /><span className="gs-brand-label">Shopify setup</span></div><a className="gs-top-link" href="/tests/configurator-setup.html" target="_blank" rel="noreferrer">Open full settings <ArrowUpRight size={15} /></a></div></header>
    <div className="gs-shell"><Stepper current={step} furthest={furthest} onSelect={setStep} />
      <div className="gs-prototype-note"><CircleHelp size={15} /><span><strong>Design preview.</strong> Themes and products shown are examples. No Shopify changes or AI calls are made.</span></div>
      <main className="gs-content" ref={headingRef} tabIndex={-1}>
        {step === 0 && <><Heading eyebrow="01 / YOUR STOREFRONT" title="Choose your theme">Pick the Shopify theme you want to set up. We’ll help you prepare it for your configurator.</Heading>
          <div className="gs-theme-layout"><section className="gs-surface gs-theme-card"><div className="gs-card-heading"><span className="gs-icon-tile"><Store size={20} /></span><div><h2>Your Shopify themes</h2><p>Choose the theme you want to work on.</p></div></div>
            <label className="gs-select-label" htmlFor="theme">Theme</label><div className="gs-select-wrap"><select id="theme" value={themeId} onChange={e => setThemeId(e.target.value)}><option value="">Select a theme</option>{THEMES.map(item => <option key={item.id} value={item.id}>{item.name}{item.live ? ' · Live' : ''}</option>)}</select><ChevronRight size={16} /></div>
            {theme && <div className="gs-theme-selected"><span className="gs-theme-icon"><Layers3 size={18} /></span><div><strong>{theme.name}</strong><small>{theme.detail}</small></div><span className={`gs-pill ${theme.live ? 'gs-pill-live' : ''}`}>{theme.live ? 'Live' : 'Unpublished'}</span></div>}
            <div className="gs-card-divider" /><div className="gs-inline-action"><div><strong>Want a separate copy?</strong><p>Prepare a copy before making changes.</p></div><button type="button" className="gs-btn gs-btn-secondary" disabled>Copy theme <span>Coming later</span></button></div>
          </section><aside className="gs-surface gs-checklist"><div className="gs-checklist-title"><span>THEME PREPARATION</span><span className="gs-example-pill">EXAMPLE</span></div><h2>Get your theme ready</h2><p>These steps help the configurator appear on your product pages.</p><div className="gs-check-row"><span className="gs-check-index">1</span><div><strong>Activate the OV25 plugin</strong><small>Turn on OV25 in the theme editor.</small></div></div><div className="gs-check-row"><span className="gs-check-index">2</span><div><strong>Create a product template</strong><small>Use a dedicated page for configurable products.</small></div></div><div className="gs-check-row"><span className="gs-check-index">3</span><div><strong>Add product page blocks</strong><small>Add controls, price, name and samples.</small></div></div><div className="gs-checklist-bottom"><LockKeyhole size={15} /><span>Theme preparation will connect to Shopify in the guided flow.</span></div></aside></div>
          <Footer next={() => go(1)} disabled={!themeId} note={!themeId ? 'Select a theme to continue' : undefined} /></>}
        {step === 1 && <><Heading eyebrow="02 / CONFIGURATOR TYPE" title="What are you configuring?">Choose the type that best describes your product. You can set up other types later.</Heading><div className="gs-types">{TYPES.map(item => <button type="button" key={item.id} className={`gs-choice gs-type-card ${type === item.id ? 'is-selected' : ''}`} onClick={() => chooseType(item.id)} aria-pressed={type === item.id}><TypeIllustration shape={item.shape} /><div className="gs-type-copy"><span className="gs-choice-mark">{type === item.id && <Check size={15} />}</span><span className="gs-type-kicker">CONFIGURATOR {item.mark}</span><strong>{item.label}</strong><p>{item.description}</p></div></button>)}</div><p className="gs-small-note"><CircleHelp size={15} /> Select one configurator type for this setup.</p><Footer back={() => go(0)} next={() => go(2)} disabled={!type} /></>}
        {step === 2 && <><Heading eyebrow="03 / YOUR LAYOUT" title="Choose a starting point">Select how customers will configure their product. You can always change your preset later.</Heading><div className="gs-context-chip"><span>{selectedType?.label ?? 'Standard'}</span> configurator <button type="button" onClick={() => go(1)}>Change</button></div><div className="gs-presets">{getSetupPresets(type || 'standard').map(item => <button type="button" key={item.id} className={`gs-choice gs-preset-card ${preset === item.id ? 'is-selected' : ''}`} onClick={() => setPreset(item.id)} aria-pressed={preset === item.id}><PresetIllustration id={item.id} /><div className="gs-preset-copy"><span className="gs-choice-mark">{preset === item.id && <Check size={15} />}</span><strong>{item.name}</strong><p>{item.description}</p></div></button>)}</div><Footer back={() => go(1)} next={() => go(3)} disabled={!preset} /></>}
        {step === 3 && <><Heading eyebrow="04 / YOUR PRODUCTS" title="Connect your products">Start with an OV25 or Shopify product, then choose its match. You can link as many products as you need.</Heading><ProductLinker shopProducts={shopProducts} ovProducts={ovProducts} links={links} onLinksChange={setLinks} /><Footer back={() => go(2)} next={() => { setAnalysis('intro'); go(4); }} disabled={links.length === 0} note={links.length === 0 ? 'Link a product to continue' : undefined} /></>}
        {step === 4 && <><Heading eyebrow="05 / AUTOMATIC SETUP" title="Make it feel like your store">We’ll use your chosen theme and layout to prepare your configurator.</Heading>
          {analysis !== 'result' ? <div className="gs-surface gs-analysis-intro"><span className="gs-magic-icon"><WandSparkles size={25} /></span><div><span className="gs-eyebrow">AUTOMATIC SETUP</span><h2>{analysis === 'running' ? 'Preparing your example…' : 'Everything is ready to come together.'}</h2><p>{analysis === 'running' ? 'Showing how progress will look in the finished flow.' : 'We’ll match your theme’s styling and find where the configurator belongs on your product page.'}</p><div className="gs-analysis-list"><span><CheckCircle2 size={16} /> Match your theme colours and buttons</span><span><CheckCircle2 size={16} /> Find product page placements</span><span><CheckCircle2 size={16} /> Prepare your selected layout</span></div><button type="button" className="gs-btn gs-btn-primary gs-analysis-button" disabled={analysis === 'running'} onClick={showExample}>{analysis === 'running' ? <><LoaderCircle className="gs-spin" size={16} /> Preparing example</> : <>Show example result <ArrowRight size={16} /></>}</button><small>This design preview does not scan your theme or call AI.</small></div></div> : <div className="gs-result"><div className="gs-result-main"><div className="gs-result-title"><div><span className="gs-eyebrow">EXAMPLE RESULT</span><h2>Your configurator is ready to preview</h2><p>{theme?.name ?? "Your theme"} · {selectedType?.label ?? "Configurator"} · {selectedPreset?.name ?? "Preset"}</p></div><button type="button" className="gs-btn gs-btn-secondary" onClick={() => setAnalysis('intro')}><Sparkles size={15} /> Run again</button></div><div className="gs-preview-frame"><div className="gs-preview-toolbar"><span>CONFIGURATOR PREVIEW</span><div className="gs-viewport-tabs"><button type="button" className={selectedViewport === 'desktop' ? 'active' : ''} onClick={() => setSelectedViewport('desktop')}>Desktop</button><button type="button" className={selectedViewport === 'mobile' ? 'active' : ''} onClick={() => setSelectedViewport('mobile')}>Mobile</button></div></div><div className={`gs-preview-stage ${selectedViewport === 'mobile' ? 'is-mobile' : ''}`} style={{ '--sample-bg': colours.background, '--sample-button': colours.button, '--sample-button-text': colours.text, '--sample-accent': colours.accent, '--sample-radius': `${radius}px` }}><div className="gs-sample-page"><div className="gs-sample-picture"><div className="gs-sample-shape"><i /><i /><i /></div><span>3D product preview</span></div><div className="gs-sample-details"><span className="gs-sample-overline">YOUR PRODUCT</span><strong>{shownProduct?.name ?? "Your product"}</strong><span className="gs-sample-price">£1,200</span><span className="gs-sample-divider" /><b>Choose a fabric</b><div className="gs-sample-swatches"><i /><i /><i /><i /></div><button type="button" tabIndex={-1}>Add to cart</button></div></div></div></div><div className="gs-result-actions"><button type="button" className="gs-btn gs-btn-primary" disabled><ExternalLink size={16} /> Open site preview</button><span>Site preview will be connected in the guided flow.</span></div></div><aside className="gs-surface gs-result-sidebar"><div className="gs-card-heading"><span className="gs-icon-tile"><Palette size={19} /></span><div><h2>Fine-tune the look</h2><p>A few quick adjustments.</p></div></div><div className="gs-colour-fields">{colourField('button', 'Button fill')}{colourField('text', 'Button text')}{colourField('accent', 'Accent')}{colourField('background', 'Background')}</div><div className="gs-radius-row"><label htmlFor="corner-radius">Button corners</label><select id="corner-radius" value={radius} onChange={e => setRadius(e.target.value)}><option value="0">Square</option><option value="8">Slightly rounded</option><option value="18">Rounded</option><option value="999">Pill</option></select></div><div className="gs-card-divider" /><a className="gs-btn gs-btn-secondary gs-full-settings" href="/tests/configurator-setup.html" target="_blank" rel="noreferrer"><Settings2 size={16} /> Edit full settings <ArrowUpRight size={14} /></a><p className="gs-sidebar-help">Open the existing settings editor in a new tab.</p><button type="button" className="gs-btn gs-btn-primary gs-save" disabled>Save settings</button><p className="gs-sidebar-help">Saving will be connected in the guided flow.</p></aside></div>}
          <Footer back={() => go(3)} next={() => go(2)} nextLabel="Change preset" /></>}
      </main><div className="gs-bottom"><span>OV25 <span className="gs-bottom-dot">●</span> SHOPIFY</span><span>Need help? <a href="mailto:support@orbital.vision">Contact support</a></span></div>
    </div>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
