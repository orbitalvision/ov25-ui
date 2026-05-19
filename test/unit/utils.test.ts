import { afterEach, describe, it, expect, vi } from 'vitest';
import { waitFor } from '@testing-library/dom';
import { getAnimationButtonText, getIframeSrc } from '../../src/utils/configurator-utils';
import { getDiningIframeSrc, injectDiningConfigurator } from '../../src/utils/inject-dining';
import { injectConfigurator } from '../../src/utils/inject';

class TestCSSStyleSheet {
    replaceSync() {}
}

function installConstructableStylesheetMock() {
    (globalThis as any).CSSStyleSheet = TestCSSStyleSheet;
    (window as any).CSSStyleSheet = TestCSSStyleSheet;
}

describe('configurator-utils', () => {
    afterEach(() => {
        vi.unstubAllEnvs();
        window.history.replaceState({}, '', '/');
    });

    describe('getAnimationButtonText', () => {
        it('returns empty string when animation is not available', () => {
            expect(getAnimationButtonText(false, 'unavailable')).toBe('');
        });

        it('returns "Close" when animation is open', () => {
            expect(getAnimationButtonText(true, 'open')).toBe('Close');
        });

        it('returns "Close" when animation is looping', () => {
            expect(getAnimationButtonText(true, 'loop')).toBe('Close');
        });

        it('returns "Open" when animation is closed', () => {
            expect(getAnimationButtonText(true, 'close')).toBe('Open');
        });

        it('returns "Open" when animation is stopped', () => {
            expect(getAnimationButtonText(true, 'stop')).toBe('Open');
        });
    });

    describe('dining display options', () => {
        it('omits showAttachmentPoints by default', () => {
            window.history.replaceState({}, '', '/test?utm=abc');

            expect(getIframeSrc('key', 'dining-configurator/123')).toBe(
                'https://configurator.orbital.vision/key/dining-configurator/123?utm=abc'
            );
        });

        it('appends showAttachmentPoints=false when disabled', () => {
            window.history.replaceState({}, '', '/test?utm=abc&showAttachmentPoints=true');

            expect(getIframeSrc('key', 'dining-configurator/123?foo=bar', null, '#ffffff', null, false)).toBe(
                'https://configurator.orbital.vision/key/dining-configurator/123?foo=bar&utm=abc&showAttachmentPoints=false&hexBgColor=ffffff'
            );
        });

        it('adds showAttachmentPoints=false to dining embed urls', () => {
            window.history.replaceState({}, '', '/test?configuration_uuid=cfg-1');

            expect(getDiningIframeSrc('key', '55', null, false)).toBe(
                'https://configurator.orbital.vision/key/dining-configurator/55?configuration_uuid=cfg-1&showAttachmentPoints=false'
            );
        });

        it('routes standard iframe urls through the local OV25 path when configurator dev is enabled', () => {
            vi.stubEnv('OV25_CONFIGURATOR_DEV', 'true');
            window.history.replaceState({}, '', '/test?utm=abc');

            expect(getIframeSrc('key', '55')).toBe(
                'http://localhost:3000/configurator/key/55?utm=abc'
            );
        });

        it('routes dining iframe urls through the local OV25 path when configurator dev is enabled', () => {
            vi.stubEnv('OV25_CONFIGURATOR_DEV', 'true');

            expect(getDiningIframeSrc('key', '55', null, false)).toBe(
                'http://localhost:3000/configurator/key/dining-configurator/55?showAttachmentPoints=false'
            );
        });

        it('creates a fixed full-page dining root when no root selector is provided', () => {
            installConstructableStylesheetMock();
            document.body.innerHTML = '';

            injectDiningConfigurator({
                apiKey: 'key',
                diningConfiguratorId: '55',
                displayMode: { desktop: 'full-page' },
                selectors: {},
            });

            const root = document.getElementById('ov25-dining-full-page-root');
            expect(root).toBeTruthy();
            expect(root?.style.position).toBe('fixed');
            expect(root?.shadowRoot).toBeTruthy();
        });

        it('mounts full-page dining into selectors.root when supplied', () => {
            installConstructableStylesheetMock();
            document.body.innerHTML = '<div id="dining-root"></div>';

            injectDiningConfigurator({
                apiKey: 'key',
                diningConfiguratorId: '55',
                displayMode: { desktop: 'full-page' },
                selectors: { root: '#dining-root' },
            });

            const host = document.querySelector('#dining-root .ov25-dining-full-page-host');
            expect(host).toBeTruthy();
            expect((host as HTMLElement).shadowRoot).toBeTruthy();
        });

        it('forces showAttachmentPoints=false for full-page dining embeds', async () => {
            installConstructableStylesheetMock();
            document.body.innerHTML = '';
            window.history.replaceState({}, '', '/test');

            injectDiningConfigurator({
                apiKey: 'key',
                diningConfiguratorId: '55',
                displayMode: { desktop: 'full-page' },
                displayOptions: { showAttachmentPoints: true },
                selectors: {},
            });

            await waitFor(() => {
                const root = document.getElementById('ov25-dining-full-page-root');
                const iframe = root?.shadowRoot?.querySelector('iframe') as HTMLIFrameElement | null;
                expect(iframe?.src).toBe(
                    'https://configurator.orbital.vision/key/dining-configurator/55?showAttachmentPoints=false'
                );
            });
        });

        it('delegates dining product links from injectConfigurator', () => {
            installConstructableStylesheetMock();
            document.body.innerHTML = '';

            injectConfigurator({
                apiKey: 'key',
                productLink: 'dining-configurator/55',
                selectors: {},
                callbacks: {
                    addToBasket: () => {},
                    buyNow: () => {},
                    buySwatches: () => {},
                },
                dining: {
                    displayMode: { desktop: 'full-page' },
                },
                branding: {
                    hideLogo: true,
                },
                flags: {
                    hidePricing: true,
                },
            });

            expect(document.getElementById('ov25-dining-full-page-root')).toBeTruthy();
        });
    });
});
