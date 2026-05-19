import React from 'react';
import { Network } from 'lucide-react';
import { useDiningUI, type DiningBuilderMode } from '../../contexts/dining-ui-context.js';

const STYLE_OPTIONS: Array<{
  mode: DiningBuilderMode;
  title: string;
  action: string;
  imageKey: 'fullRange' | 'mixAndMatch';
  fallbackImageUrl: string;
}> = [
  {
    mode: 'full-range',
    title: 'Fixed designs, traditional ranges',
    action: 'Shop the Full Range',
    imageKey: 'fullRange',
    fallbackImageUrl: 'https://cdn.orbital.vision/london-website-general-purpose/pre-prepared.png',
  },
  {
    mode: 'mix-and-match',
    title: 'The customisable experience',
    action: 'Camden Mix and Match',
    imageKey: 'mixAndMatch',
    fallbackImageUrl: 'https://cdn.orbital.vision/london-website-general-purpose/mix-and-match.png',
  },
];

export const DiningStyleLanding: React.FC = () => {
  const { builderMode, setBuilderMode, nextStep, isMobile, styleImages } = useDiningUI();

  const chooseMode = (mode: DiningBuilderMode) => {
    setBuilderMode(mode);
    nextStep();
  };

  return (
    <section
      data-ov25-dining-style-page
      style={{
        width: '100%',
        height: '100%',
        minHeight: 0,
        overflowY: 'auto',
        backgroundColor: 'var(--ov25-background-color, #ffffff)',
        padding: isMobile ? '34px 18px 28px' : '70px 32px 48px',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: isMobile ? 24 : 42,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          {!isMobile && (
            <div
              style={{
                width: 44,
                height: 44,
                margin: '0 auto 18px',
                borderRadius: 'var(--ov25-rounded-lg, 8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--ov25-secondary-background-color, #f4f5f2)',
                color: 'var(--ov25-text-color, #202020)',
              }}
            >
              <Network size={22} strokeWidth={1.7} />
            </div>
          )}
          <h1
            style={{
              margin: 0,
              fontSize: isMobile ? 26 : 34,
              lineHeight: 1.08,
              fontWeight: 800,
              color: 'var(--ov25-text-color, #202020)',
              letterSpacing: 0,
            }}
          >
            First choose your style
          </h1>
          <p
            style={{
              margin: '10px 0 0',
              fontSize: isMobile ? 14 : 16,
              color: 'var(--ov25-secondary-text-color, #666)',
            }}
          >
            How would you like to start?
          </p>
        </div>

        <div
          style={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
            gap: isMobile ? 14 : 8,
          }}
        >
          {STYLE_OPTIONS.map(option => {
            const selected = builderMode === option.mode;
            const imageUrl = styleImages?.[option.imageKey] || option.fallbackImageUrl;
            return (
              <button
                key={option.mode}
                type="button"
                data-ov25-dining-style-hero-card
                data-selected={selected ? 'true' : 'false'}
                onClick={() => chooseMode(option.mode)}
                style={{
                  position: 'relative',
                  minHeight: isMobile ? 290 : 560,
                  border: selected
                    ? '2px solid var(--ov25-cta-color, #008864)'
                    : '1px solid var(--ov25-border-color, #e1e1e1)',
                  borderRadius: 0,
                  overflow: 'hidden',
                  padding: 0,
                  backgroundColor: 'var(--ov25-secondary-background-color, #f4f4f4)',
                  cursor: 'pointer',
                  fontFamily: 'var(--ov25-font-family, "IBM Plex Sans", sans-serif)',
                  color: 'var(--ov25-text-color, #111)',
                  textAlign: 'center',
                  transition: 'border-color 160ms ease, transform 120ms ease',
                }}
              >
                <img
                  src={imageUrl}
                  alt=""
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.32) 62%, rgba(0,0,0,0.48) 100%)',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: isMobile ? '28px 20px' : '44px',
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      maxWidth: 620,
                      fontSize: isMobile ? 32 : 48,
                      lineHeight: 1.04,
                      fontWeight: 300,
                      color: '#ffffff',
                      textShadow: '0 2px 18px rgba(0,0,0,0.28)',
                      letterSpacing: 0,
                    }}
                  >
                    {option.title}
                  </span>
                  <span
                    style={{
                      marginTop: 34,
                      minWidth: 190,
                      minHeight: 52,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 24px',
                      borderRadius: 'var(--ov25-rounded-lg, 8px)',
                      backgroundColor: 'var(--ov25-background-color, #ffffff)',
                      color: '#111111',
                      fontSize: 13,
                      fontWeight: 600,
                      boxShadow: '0 10px 30px rgba(0,0,0,0.14)',
                    }}
                  >
                    {option.action}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
