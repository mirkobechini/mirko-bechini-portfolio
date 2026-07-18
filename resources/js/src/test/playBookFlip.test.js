import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockPlayPooled = vi.fn();
vi.mock('../utils/audioPool', () => ({
    playPooled: mockPlayPooled,
}));

vi.mock('../utils/assets', () => ({
    getAssetPath: (path) => `/assets${path}`,
}));

describe('playBookFlip', () => {
    let playBookFlip;

    beforeEach(async () => {
        vi.resetAllMocks();
        vi.resetModules();
        vi.useFakeTimers();
        vi.setSystemTime(1000);
        playBookFlip = (await import('../utils/playBookFlip')).default;
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('calls playPooled with page turn sound', () => {
        playBookFlip();
        expect(mockPlayPooled).toHaveBeenCalledTimes(1);
        expect(mockPlayPooled.mock.calls[0][0]).toBe('/assets/sounds/library/page-turn.ogg');
        expect(mockPlayPooled.mock.calls[0][1]).toEqual({ volume: 0.3 });
    });

    it('debounces calls within 300ms', () => {
        playBookFlip();
        playBookFlip();
        playBookFlip();
        expect(mockPlayPooled).toHaveBeenCalledTimes(1);
    });

    it('allows play after debounce period', () => {
        playBookFlip();
        vi.advanceTimersByTime(300);
        playBookFlip();
        expect(mockPlayPooled).toHaveBeenCalledTimes(2);
    });
});