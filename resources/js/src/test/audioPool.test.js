import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

describe('audioPool', () => {
    let playPooled;

    beforeAll(async () => {
        // Mock del costruttore Audio prima di importare il modulo
        vi.stubGlobal('Audio', vi.fn(function () {
            this.src = '';
            this.volume = 1;
            this.paused = true;
            this.currentTime = 0;
            this.play = vi.fn(function () { this.paused = false; return Promise.resolve(); });
            this.pause = vi.fn(function () { this.paused = true; });
            this.addEventListener = vi.fn();
        }));

        // Import dinamico dopo aver mockato Audio
        const mod = await import('../utils/audioPool');
        playPooled = mod.playPooled;
    });

    it('exports playPooled function', () => {
        expect(playPooled).toBeDefined();
        expect(typeof playPooled).toBe('function');
    });

    it('returns undefined for falsy src', () => {
        expect(playPooled('')).toBeUndefined();
        expect(playPooled(null)).toBeUndefined();
        expect(playPooled(undefined)).toBeUndefined();
    });

    it('sets src and volume on audio element', () => {
        const result = playPooled('/sound.ogg', { volume: 0.5 });

        expect(result).toBeDefined();
        expect(result.src).toBe('/sound.ogg');
        expect(result.volume).toBe(0.5);
    });

    it('uses default volume 0.3 when not specified', () => {
        const result = playPooled('/sound.ogg');

        expect(result.volume).toBe(0.3);
    });

    it('calls play on the audio element', () => {
        const result = playPooled('/sound.ogg');

        expect(result.play).toHaveBeenCalled();
    });

    it('pauses previous audio on reuse', () => {
        const first = playPooled('/first.ogg');
        const pauseSpy = vi.spyOn(first, 'pause');

        playPooled('/second.ogg');

        expect(pauseSpy).toHaveBeenCalled();
    });

    it('cycles through pool (max 4 instances)', () => {
        const results = [];
        for (let i = 0; i < 6; i++) {
            results.push(playPooled(`/sound${i}.ogg`));
        }

        // Dopo 6 chiamate, i primi 2 vengono riutilizzati
        expect(results[0]).toBe(results[4]);
        expect(results[1]).toBe(results[5]);
        // Il 5° e 6° NON sono gli stessi del 3° e 4°
        expect(results[2]).not.toBe(results[4]);
        expect(results[3]).not.toBe(results[5]);
    });

    it('sets maxDuration timer when specified', () => {
        vi.useFakeTimers();
        const result = playPooled('/sound.ogg', { maxDuration: 500 });

        expect(result.paused).toBe(false);
        // Fast-forward oltre il timeout
        vi.advanceTimersByTime(500);

        expect(result.pause).toHaveBeenCalled();
        expect(result.currentTime).toBe(0);

        vi.useRealTimers();
    });
});