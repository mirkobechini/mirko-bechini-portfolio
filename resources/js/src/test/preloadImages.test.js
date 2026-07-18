import { describe, it, expect, vi, beforeEach } from 'vitest';
import { preloadImages } from '../utils/preloadImages';

describe('preloadImages', () => {
    let imageInstances;

    beforeEach(() => {
        imageInstances = [];
        // Mock del costruttore Image per tracciare le istanze create
        const MockImage = vi.fn(function () {
            this.src = '';
            imageInstances.push(this);
        });
        vi.stubGlobal('Image', MockImage);
    });

    it('creates Image elements with correct src', () => {
        preloadImages(['/img1.webp', '/img2.webp']);

        expect(imageInstances.length).toBe(2);
        expect(imageInstances[0].src).toBe('/img1.webp');
        expect(imageInstances[1].src).toBe('/img2.webp');
    });

    it('filters out falsy values', () => {
        preloadImages(['/img.webp', null, undefined, '', '/img2.webp']);

        expect(imageInstances.length).toBe(2);
    });

    it('handles empty array', () => {
        preloadImages([]);
        expect(imageInstances.length).toBe(0);
    });

    it('handles single source', () => {
        preloadImages(['/single.webp']);
        expect(imageInstances.length).toBe(1);
        expect(imageInstances[0].src).toBe('/single.webp');
    });
});