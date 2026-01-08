import { describe, it, expect } from 'vitest';
import { getAnimationButtonText } from '../../src/utils/configurator-utils';

describe('configurator-utils', () => {
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
});
