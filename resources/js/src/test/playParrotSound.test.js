import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockPlayPooled = vi.fn();
vi.mock('../utils/audioPool', () => ({
    playPooled: mockPlayPooled,
}));

vi.mock('../utils/assets', () => ({
    getAssetPath: (path) => `/assets${path}`,
}));

describe('playParrotSound', () => {
    let playParrotHover, playParrotClick;

    beforeEach(async () => {
        vi.resetAllMocks();
        vi.resetModules();
        vi.useFakeTimers();
        vi.setSystemTime(1000);
        const mod = await import('../utils/playParrotSound');
        playParrotHover = mod.playParrotHover;
        playParrotClick = mod.playParrotClick;
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('playParrotHover calls playPooled with hover sound', () => {
        playParrotHover();
        expect(mockPlayPooled).toHaveBeenCalledTimes(1);
        expect(mockPlayPooled.mock.calls[0][0]).toBe('/assets/sounds/contacts/parrot_hover.ogg');
        expect(mockPlayPooled.mock.calls[0][1]).toEqual({ volume: 0.3, maxDuration: 500 });
    });

    it('playParrotClick calls playPooled with click sound', () => {
        playParrotClick();
        expect(mockPlayPooled).toHaveBeenCalledTimes(1);
        expect(mockPlayPooled.mock.calls[0][0]).toBe('/assets/sounds/contacts/parrot_click.ogg');
        expect(mockPlayPooled.mock.calls[0][1]).toEqual({ volume: 0.3 });
    });

    it('debounces hover calls within 800ms', () => {
        playParrotHover();
        playParrotHover();
        expect(mockPlayPooled).toHaveBeenCalledTimes(1);
    });

    it('allows hover after debounce period', () => {
        playParrotHover();
        vi.advanceTimersByTime(800);
        playParrotHover();
        expect(mockPlayPooled).toHaveBeenCalledTimes(2);
    });

    it('handles hover and click independently', () => {
        playParrotHover();
        playParrotClick();
        expect(mockPlayPooled).toHaveBeenCalledTimes(2);
    });
});