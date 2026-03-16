import React from 'react';
import { Smartphone, Monitor } from 'lucide-react';

const styles = /** @type {Record<string, React.CSSProperties>} */ ({
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'transparent',
    borderRadius: 0,
    padding: 12,
    zIndex: 999998,
  },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6b7280',
    transition: 'all 0.2s',
    
  },
  active: {
    background: '#1a1a1a',
    color: 'white',
  },
});

export function ViewportSwitcher({ mode, onModeChange }) {
    return <></>
  return (
    <div style={styles.container} role="group" aria-label="Viewport mode" className='ov:pointer-events-none'>
      <button
        type="button"
        onClick={() => onModeChange('mobile')}
        style={{ ...styles.btn, ...(mode === 'mobile' ? styles.active : {}) }}
        aria-pressed={mode === 'mobile'}
        title="Mobile view (phone frame)"
        className='ov:pointer-events-auto'
      >
        <Smartphone size={18} strokeWidth={2} />
      </button>
      <button
        type="button"
        onClick={() => onModeChange('desktop')}
        style={{ ...styles.btn, ...(mode === 'desktop' ? styles.active : {}) }}
        aria-pressed={mode === 'desktop'}
        title="Desktop view"
        className='ov:pointer-events-auto'
      >
        <Monitor size={18} strokeWidth={2} />
      </button>
    </div>
  );
}
