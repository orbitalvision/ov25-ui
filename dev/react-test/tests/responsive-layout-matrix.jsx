import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import {
  AlertTriangle,
  Camera,
  Check,
  ExternalLink,
  LoaderCircle,
  Maximize2,
  Monitor,
  RefreshCw,
  Smartphone,
  Tablet,
  X,
} from 'lucide-react';
import { TestBackButton } from '../templates/TestBackButton.jsx';
import { TestPageLayout } from '../templates/TestPageLayout.jsx';
import {
  DEFAULT_VIEWPORT_MATRIX_TARGET,
  VIEWPORT_GROUPS,
  VIEWPORT_PRESETS,
} from '../config/viewport-presets.js';
import '../src/index.css';
import './responsive-layout-matrix.css';

const DEMO_RETAILER_APIKEY = import.meta.env.VITE_DEMO_RETAILER_APIKEY;
const API_ROOT = '/__ov25/viewport-matrix';

const captureFixtureConfig = /** @type {import('ov25-ui').InjectConfiguratorInput} */ ({
  apiKey: () => DEMO_RETAILER_APIKEY,
  productLink: () => '58',
  selectors: {
    gallery: { selector: '.configurator-container', replace: true },
    variants: '#ov25-controls',
    swatches: '#ov25-swatches',
    price: { selector: '#price', replace: true },
    name: { selector: '#name', replace: true },
  },
  carousel: { desktop: 'none', mobile: 'none' },
  configurator: {
    displayMode: { desktop: 'inline', mobile: 'inline' },
    triggerStyle: { desktop: 'single-button', mobile: 'single-button' },
    variants: { displayMode: { desktop: 'tabs', mobile: 'list' } },
  },
  callbacks: {
    addToBasket: () => {},
    buyNow: () => {},
    buySwatches: () => {},
  },
  flags: { hidePricing: false },
});

function CaptureFixture() {
  useEffect(() => {
    document.documentElement.dataset.ov25ViewportMatrixReady = 'true';
    return () => {
      delete document.documentElement.dataset.ov25ViewportMatrixReady;
    };
  }, []);

  return (
    <TestPageLayout
      title="Responsive configurator layout"
      description="Stable viewer-and-controls fixture used by the viewport screenshot matrix."
      injectConfig={captureFixtureConfig}
      showTestBackButton={false}
    />
  );
}

function MatrixGallery() {
  const [manifest, setManifest] = useState(null);
  const [target, setTarget] = useState(DEFAULT_VIEWPORT_MATRIX_TARGET);
  const [isLoading, setIsLoading] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: VIEWPORT_PRESETS.length });
  const [statusMessage, setStatusMessage] = useState('Loading the latest capture…');
  const [error, setError] = useState('');
  const [selectedCapture, setSelectedCapture] = useState(null);
  const dialogRef = useRef(null);
  const refreshTimerRef = useRef(null);

  const capturesById = useMemo(
    () => new Map((manifest?.captures || []).map((capture) => [capture.id, capture])),
    [manifest],
  );

  useEffect(() => {
    refreshManifest();
    return () => window.clearTimeout(refreshTimerRef.current);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (selectedCapture && !dialog.open) dialog.showModal();
    if (!selectedCapture && dialog.open) dialog.close();
  }, [selectedCapture]);

  async function refreshManifest() {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_ROOT}/state`, { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Could not load viewport captures.');
      setManifest(payload.manifest);
      if (payload.manifest?.target) setTarget(payload.manifest.target);
      setIsCapturing(Boolean(payload.capturing));

      if (payload.capturing) {
        setStatusMessage('A viewport capture is already running…');
        window.clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = window.setTimeout(refreshManifest, 1_500);
      } else {
        setStatusMessage(
          payload.manifest
            ? `Latest capture: ${formatDate(payload.manifest.capturedAt)}`
            : 'No screenshots yet. Capture the full matrix to create them.',
        );
      }
    } catch (requestError) {
      setError(errorMessage(requestError));
      setStatusMessage('The screenshot service is unavailable.');
    } finally {
      setIsLoading(false);
    }
  }

  async function captureAll(event) {
    event.preventDefault();
    setIsCapturing(true);
    setError('');
    setProgress({ completed: 0, total: VIEWPORT_PRESETS.length });
    setStatusMessage('Starting Chromium…');

    try {
      const response = await fetch(`${API_ROOT}/capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || 'Could not start the viewport capture.');
      }
      if (!response.body) throw new Error('The capture stream was not available.');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffered = '';

      while (true) {
        const { value, done } = await reader.read();
        buffered += decoder.decode(value || new Uint8Array(), { stream: !done });
        const lines = buffered.split('\n');
        buffered = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          const update = JSON.parse(line);

          if (update.type === 'progress') {
            setProgress({ completed: update.completed, total: update.total });
            setStatusMessage(
              update.phase === 'capturing'
                ? `Capturing ${update.preset.label} · ${update.preset.width}×${update.preset.height}`
                : `Captured ${update.completed} of ${update.total}`,
            );
          } else if (update.type === 'complete') {
            setManifest(update.manifest);
            setProgress({ completed: update.manifest.total, total: update.manifest.total });
            setStatusMessage(`Capture finished: ${formatDate(update.manifest.capturedAt)}`);
          } else if (update.type === 'error') {
            throw new Error(update.error || 'Viewport capture failed.');
          }
        }

        if (done) break;
      }
    } catch (captureError) {
      setError(errorMessage(captureError));
      setStatusMessage('Capture stopped before completing.');
    } finally {
      setIsCapturing(false);
    }
  }

  const capturedCount = manifest?.captures?.filter((capture) => capture.status === 'captured').length || 0;
  const progressPercent = progress.total ? Math.round((progress.completed / progress.total) * 100) : 0;

  return (
    <div className="matrix-page">
      <TestBackButton />
      <main className="matrix-shell">
        <header className="matrix-hero">
          <div className="matrix-hero-copy">
            <span className="matrix-eyebrow">Responsive QA</span>
            <h1>Viewport matrix</h1>
            <p>
              Capture the same configurator in ten common desktop, phone, and tablet viewports,
              then review every result without resizing DevTools.
            </p>
          </div>
          <div className="matrix-summary" aria-label="Capture summary">
            <span>{capturedCount}</span>
            <small>of {VIEWPORT_PRESETS.length} captured</small>
          </div>
        </header>

        <section className="matrix-toolbar" aria-label="Viewport capture controls">
          <form onSubmit={captureAll} className="matrix-capture-form">
            <label htmlFor="matrix-target">Fixture path</label>
            <div className="matrix-target-row">
              <input
                id="matrix-target"
                value={target}
                onChange={(event) => setTarget(event.target.value)}
                list="matrix-target-suggestions"
                spellCheck="false"
                disabled={isCapturing}
              />
              <datalist id="matrix-target-suggestions">
                <option value={DEFAULT_VIEWPORT_MATRIX_TARGET} />
                <option value="/tests/gallery-inline-tabs.html" />
                <option value="/tests/gallery-sheet-list-auto-open.html" />
                <option value="/tests/snap2-inline.html" />
              </datalist>
              <a
                className="matrix-icon-button"
                href={target || DEFAULT_VIEWPORT_MATRIX_TARGET}
                target="_blank"
                rel="noreferrer"
                aria-label="Open fixture in a new tab"
                title="Open fixture"
              >
                <ExternalLink size={17} aria-hidden="true" />
              </a>
              <button className="matrix-primary-button" type="submit" disabled={isCapturing}>
                {isCapturing ? (
                  <LoaderCircle className="matrix-spinner" size={18} aria-hidden="true" />
                ) : (
                  <Camera size={18} aria-hidden="true" />
                )}
                {isCapturing ? 'Capturing…' : 'Capture all 10'}
              </button>
            </div>
          </form>

          <div className="matrix-status" aria-live="polite">
            <div className="matrix-status-copy">
              <span>{statusMessage}</span>
              <button
                type="button"
                className="matrix-refresh-button"
                onClick={refreshManifest}
                disabled={isLoading || isCapturing}
              >
                <RefreshCw size={15} aria-hidden="true" />
                Refresh
              </button>
            </div>
            <div className="matrix-progress-track" aria-hidden="true">
              <span style={{ width: `${isCapturing ? progressPercent : capturedCount ? 100 : 0}%` }} />
            </div>
          </div>

          {error ? (
            <div className="matrix-error" role="alert">
              <AlertTriangle size={18} aria-hidden="true" />
              <span>{error}</span>
            </div>
          ) : null}
        </section>

        {VIEWPORT_GROUPS.map((group) => (
          <ViewportGroup
            key={group.id}
            group={group}
            capturesById={capturesById}
            capturedAt={manifest?.capturedAt}
            onSelect={setSelectedCapture}
          />
        ))}
      </main>

      <dialog
        ref={dialogRef}
        className="matrix-dialog"
        onClose={() => setSelectedCapture(null)}
        onClick={(event) => {
          if (event.target === dialogRef.current) setSelectedCapture(null);
        }}
      >
        {selectedCapture ? (
          <div className="matrix-dialog-panel">
            <header>
              <div>
                <strong>{selectedCapture.label}</strong>
                <span>{selectedCapture.width}×{selectedCapture.height} · {selectedCapture.device}</span>
              </div>
              <button
                type="button"
                className="matrix-icon-button"
                onClick={() => setSelectedCapture(null)}
                aria-label="Close screenshot"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </header>
            <img
              src={withCacheBust(selectedCapture.screenshotUrl, manifest?.capturedAt)}
              alt={`${selectedCapture.label} at ${selectedCapture.width} by ${selectedCapture.height}`}
            />
          </div>
        ) : null}
      </dialog>
    </div>
  );
}

function ViewportGroup({ group, capturesById, capturedAt, onSelect }) {
  const presets = VIEWPORT_PRESETS.filter((preset) => preset.group === group.id);
  const GroupIcon = group.id === 'desktop' ? Monitor : group.id === 'phone' ? Smartphone : Tablet;

  return (
    <section className="matrix-group" aria-labelledby={`matrix-group-${group.id}`}>
      <header className="matrix-group-header">
        <div>
          <GroupIcon size={19} aria-hidden="true" />
          <h2 id={`matrix-group-${group.id}`}>{group.label}</h2>
        </div>
        <span>{presets.length} viewports</span>
      </header>
      <div className="matrix-grid">
        {presets.map((preset) => {
          const capture = capturesById.get(preset.id);
          const captured = capture?.status === 'captured';
          return (
            <article className="matrix-card" key={preset.id}>
              <button
                type="button"
                className="matrix-screenshot-button"
                onClick={() => captured && onSelect(capture)}
                disabled={!captured}
                aria-label={captured ? `Open ${preset.label} screenshot` : `${preset.label} not captured`}
              >
                {captured ? (
                  <>
                    <img
                      src={withCacheBust(capture.screenshotUrl, capturedAt)}
                      alt=""
                      loading="lazy"
                    />
                    <span className="matrix-expand-label">
                      <Maximize2 size={15} aria-hidden="true" />
                      View full size
                    </span>
                  </>
                ) : capture?.status === 'failed' ? (
                  <span className="matrix-empty-state matrix-empty-state-error">
                    <AlertTriangle size={22} aria-hidden="true" />
                    Capture failed
                  </span>
                ) : (
                  <span className="matrix-empty-state">
                    <Camera size={22} aria-hidden="true" />
                    Awaiting capture
                  </span>
                )}
              </button>
              <div className="matrix-card-copy">
                <div>
                  <h3>{preset.label}</h3>
                  <p>{preset.device}</p>
                </div>
                <div className="matrix-card-meta">
                  <span>{preset.width}×{preset.height}</span>
                  <span>{preset.orientation}</span>
                  <span>{preset.hasTouch ? 'touch' : 'hover'}</span>
                </div>
                {capture?.status === 'failed' ? <p className="matrix-card-error">{capture.error}</p> : null}
                {captured ? (
                  <span className="matrix-captured-badge">
                    <Check size={13} aria-hidden="true" /> Captured
                  </span>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function withCacheBust(url, capturedAt) {
  if (!url) return '';
  return `${url}?v=${encodeURIComponent(capturedAt || Date.now())}`;
}

function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function errorMessage(value) {
  return value instanceof Error ? value.message : String(value);
}

const captureMode = new URLSearchParams(window.location.search).get('capture') === '1';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>{captureMode ? <CaptureFixture /> : <MatrixGallery />}</React.StrictMode>,
);

export default captureMode ? CaptureFixture : MatrixGallery;
