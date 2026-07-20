import { describe, it, expect } from 'vitest';

vi.mock('../utils/assets', () => ({ getAssetPath: (path) => `/assets${path}` }));

import skillsData from '../features/modals/library/skillsData';

describe('skillsData', () => {
    it('exports an array of skills', () => {
        expect(Array.isArray(skillsData)).toBe(true);
        expect(skillsData.length).toBeGreaterThan(0);
    });

    it('each skill has required fields', () => {
        skillsData.forEach(s => {
            expect(s).toHaveProperty('id');
            expect(s).toHaveProperty('skill');
            expect(s).toHaveProperty('icon');
            expect(s).toHaveProperty('category');
            expect(s).toHaveProperty('color');
        });
    });

    it('has unique ids', () => {
        const ids = skillsData.map(s => s.id);
        const unique = new Set(ids);
        expect(unique.size).toBe(ids.length);
    });

    it('has unique skill names', () => {
        const names = skillsData.map(s => s.skill);
        const unique = new Set(names);
        expect(unique.size).toBe(names.length);
    });

    it('each skill has a valid color hex', () => {
        skillsData.forEach(s => {
            expect(s.color).toMatch(/^#[0-9A-Fa-f]{3,6}$/);
        });
    });

    it('has skills across multiple categories', () => {
        const categories = [...new Set(skillsData.map(s => s.category))];
        expect(categories.length).toBeGreaterThan(1);
    });

    it('some skills have functions and relatedProjects', () => {
        const withFunctions = skillsData.filter(s => s.functions);
        const withProjects = skillsData.filter(s => s.relatedProjects);
        expect(withFunctions.length).toBeGreaterThan(0);
        expect(withProjects.length).toBeGreaterThan(0);
    });
});