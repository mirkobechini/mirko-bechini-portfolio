import { describe, it, expect } from 'vitest';
import MODAL_DATA from '../features/modals/modalRegistry';

describe('modalRegistry', () => {
    it('exports an array of 5 modals', () => {
        expect(Array.isArray(MODAL_DATA)).toBe(true);
        expect(MODAL_DATA).toHaveLength(5);
    });

    it('each modal has required fields', () => {
        MODAL_DATA.forEach(modal => {
            expect(modal).toHaveProperty('id');
            expect(modal).toHaveProperty('title');
            expect(modal).toHaveProperty('theme');
            expect(modal).toHaveProperty('componentKey');
            expect(typeof modal.id).toBe('number');
            expect(typeof modal.title).toBe('string');
            expect(typeof modal.theme).toBe('string');
            expect(typeof modal.componentKey).toBe('string');
        });
    });

    it('has unique ids', () => {
        const ids = MODAL_DATA.map(m => m.id);
        const unique = new Set(ids);
        expect(unique.size).toBe(ids.length);
    });

    it('has unique componentKeys', () => {
        const keys = MODAL_DATA.map(m => m.componentKey);
        const unique = new Set(keys);
        expect(unique.size).toBe(keys.length);
    });

    it('includes expected modals', () => {
        const titles = MODAL_DATA.map(m => m.title);
        expect(titles).toContain('About Me');
        expect(titles).toContain('Formazione & Competenze');
        expect(titles).toContain('Esperienze & Progetti');
        expect(titles).toContain('Certificazioni');
        expect(titles).toContain('Contatti');
    });
});