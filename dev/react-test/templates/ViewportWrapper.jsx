import React, { useState, useCallback } from 'react';
import { ViewportSwitcher } from './ViewportSwitcher.jsx';

const STORAGE_KEY = 'ov25-viewport-mode';
const SCREEN_WIDTH = 414;
const SCREEN_HEIGHT = 896;
const BEZEL = 10;

function getInitialMode() {
  if (typeof window === 'undefined') return 'desktop';
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'mobile' || saved === 'desktop') return saved;
  } catch (_) {}
  return 'desktop';
}

function getEmbedUrl() {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  params.set('viewport', 'mobile');
  return `${window.location.pathname}?${params}`;
}

const phoneFrameStyles = /** @type {Record<string, React.CSSProperties>} */ ({
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 80px)',
    padding: 24,
  },
  frame: {
    width: SCREEN_WIDTH + BEZEL * 2,
    padding: BEZEL,
    background: '#c7c7cc',
    borderRadius: 44,
    position: 'relative',
  },
  screen: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    background: '#fff',
    borderRadius: 36,
    overflow: 'hidden',
    position: 'relative',
  },
});

const PHONE_FRAME_CLASS = 'viewport-phone-frame';

export function ViewportWrapper({ children }) {
  const isIframe = typeof window !== 'undefined' && window !== window.top;
  const [mode, setModeState] = useState(getInitialMode);

  const setMode = useCallback((next) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (_) {}
    const params = new URLSearchParams(window.location.search);
    if (next === 'mobile') {
      params.set('viewport', 'mobile');
    } else {
      params.delete('viewport');
    }
    const url = params.toString()
      ? `${window.location.pathname}?${params}`
      : window.location.pathname;
    window.location.href = url;
  }, []);

  if (isIframe) {
    return children;
  }

  if (mode === 'desktop') {
    return (
      <>
        {children}
        <ViewportSwitcher mode={mode} onModeChange={setMode} />
      </>
    );
  }

  return (
    <>
      <div style={phoneFrameStyles.wrapper}>
        <div className={PHONE_FRAME_CLASS} style={phoneFrameStyles.frame}>
          <div style={phoneFrameStyles.screen}>
            <iframe
              src={getEmbedUrl()}
              title="Mobile preview"
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            />
          </div>
        </div>
      </div>
      <ViewportSwitcher mode={mode} onModeChange={setMode} />
    </>
  );
}
