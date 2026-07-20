import { describe, it, expect } from 'vitest';

vi.mock('../utils/assets', () => ({ getAssetPath: (path) => `/assets${path}` }));

import educationData from '../features/modals/library/educationData';

describe('educationData', () => {
    it('exports an array', () => {
        expect(Array.isArray(educationData)).toBe(true);
        expect(educationData.length).toBeGreaterThan(0);
    });

    it('each entry has required fields', () => {
        educationData.forEach(e => {
            expect(e).toHaveProperty('id');
            expect(e).toHaveProperty('course');
            expect(e).toHaveProperty('description');
            expect(e).toHaveProperty('organization');
            expect(e).toHaveProperty('period');
            expect(e).toHaveProperty('skills');
            expect(e).toHaveProperty('modules');
            expect(Array.isArray(e.skills)).toBe(true);
            expect(Array.isArray(e.modules)).toBe(true);
        });
    });

    it('has unique ids', () => {
        const ids = educationData.map(e => e.id);
        const unique = new Set(ids);
        expect(unique.size).toBe(ids.length);
    });
});