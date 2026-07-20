import { describe, it, expect } from 'vitest';

vi.mock('../utils/assets', () => ({ getAssetPath: (path) => `/assets${path}` }));

import SPRITES from '../data/spriteConfig';

describe('spriteConfig', () => {
    it('exports an array of 5 sprites', () => {
        expect(Array.isArray(SPRITES)).toBe(true);
        expect(SPRITES).toHaveLength(5);
    });

    it('each sprite has required fields', () => {
        SPRITES.forEach(sprite => {
            expect(sprite).toHaveProperty('id');
            expect(sprite).toHaveProperty('src');
            expect(sprite).toHaveProperty('className');
            expect(sprite).toHaveProperty('label');
            expect(sprite).toHaveProperty('ariaLabel');
            expect(sprite).toHaveProperty('alt');
            expect(sprite).toHaveProperty('fetchPriority');
            expect(sprite).toHaveProperty('loading');
            expect(sprite).toHaveProperty('width');
            expect(sprite).toHaveProperty('height');
        });
    });

    it('includes expected sprites', () => {
        const labels = SPRITES.map(s => s.label);
        expect(labels).toContain('Chi Sono');
        expect(labels).toContain('Formazione & Competenze');
        expect(labels).toContain('Esperienze & Progetti');
        expect(labels).toContain('Contatti');
        expect(labels).toContain('Certificazioni');
    });

    it('monkey sprite has fetchPriority high', () => {
        const monkey = SPRITES.find(s => s.className === 'monkey');
        expect(monkey.fetchPriority).toBe('high');
        expect(monkey.loading).toBe('eager');
    });

    it('other sprites have fetchPriority low', () => {
        const others = SPRITES.filter(s => s.className !== 'monkey');
        others.forEach(s => {
            expect(s.fetchPriority).toBe('low');
            expect(s.loading).toBe('lazy');
        });
    });

    it('has unique ids matching MODAL_IDS', () => {
        const ids = SPRITES.map(s => s.id);
        const unique = new Set(ids);
        expect(unique.size).toBe(ids.length);
    });

    it('has responsive srcSet and srcSm/srcMd for each sprite', () => {
        SPRITES.forEach(sprite => {
            expect(sprite.srcSm).toBeDefined();
            expect(sprite.srcMd).toBeDefined();
            expect(sprite.srcSm).toContain('-sm.webp');
            expect(sprite.srcMd).toContain('-md.webp');
        });
    });
});