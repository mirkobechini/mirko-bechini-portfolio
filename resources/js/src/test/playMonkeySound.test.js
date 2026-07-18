import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock playPooled prima di tutto
const mockPlayPooled = vi.fn();
vi.mock('../utils/audioPool', () => ({
    playPooled: mockPlayPooled,
}));

// Asset path mock
vi.mock('../utils/assets', () => ({
    getAssetPath: (path) => `/assets${path}`,
}));

describe('playMonkeySound', () => {
    let playMonkeyHover, playMonkeyClick;

    beforeEach(async () => {
        vi.resetAllMocks();
        vi.resetModules();
        vi.useFakeTimers();
        vi.setSystemTime(1000); // Tempo iniziale > debounce
        const mod = await import('../utils/playMonkeySound');
        playMonkeyHover = mod.playMonkeyHover;
        playMonkeyClick = mod.playMonkeyClick;
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('playMonkeyHover calls playPooled with a monkey sound', () => {
        playMonkeyHover();
        expect(mockPlayPooled).toHaveBeenCalledTimes(1);
        expect(mockPlayPooled.mock.calls[0][0]).toContain('/sounds/about/monkey-');
        expect(mockPlayPooled.mock.calls[0][1]).toEqual({ volume: 0.3, maxDuration: 400 });
    });

    it('playMonkeyClick calls playPooled with a monkey sound', () => {
        playMonkeyClick();
        expect(mockPlayPooled).toHaveBeenCalledTimes(1);
        expect(mockPlayPooled.mock.calls[0][0]).toContain('/sounds/about/monkey-');
        expect(mockPlayPooled.mock.calls[0][1]).toEqual({ volume: 0.3 });
    });

    it('debounces hover calls within 800ms', () => {
        playMonkeyHover();
        playMonkeyHover();
        playMonkeyHover();
        expect(mockPlayPooled).toHaveBeenCalledTimes(1);
    });

    it('allows hover after debounce period', () => {
        playMonkeyHover();
        vi.advanceTimersByTime(800);
        playMonkeyHover();
        expect(mockPlayPooled).toHaveBeenCalledTimes(2);
    });

    it('debounces click calls within 800ms', () => {
        playMonkeyClick();
        vi.advanceTimersByTime(100);
        playMonkeyClick();
        expect(mockPlayPooled).toHaveBeenCalledTimes(1);
    });

    it('handles hover and click independently', () => {
        playMonkeyHover();
        playMonkeyClick();
        expect(mockPlayPooled).toHaveBeenCalledTimes(2);
    });

    it('selects random sound from 3 files', () => {
        const used = new Set();
        for (let i = 0; i < 30; i++) {
            vi.advanceTimersByTime(800);
            playMonkeyHover();
            const src = mockPlayPooled.mock.calls[i][0];
            used.add(src);
        }
        // Con 30 chiamate dovremmo aver visto almeno 2 file diversi
        expect(used.size).toBeGreaterThan(1);
    });
});