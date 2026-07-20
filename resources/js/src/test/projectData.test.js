import { describe, it, expect } from 'vitest';
import projectData from '../features/modals/projects/projectData';

describe('projectData', () => {
    it('exports an array of projects', () => {
        expect(Array.isArray(projectData)).toBe(true);
        expect(projectData.length).toBeGreaterThan(0);
    });

    it('each project has required fields', () => {
        projectData.forEach(p => {
            expect(p).toHaveProperty('id');
            expect(p).toHaveProperty('title');
            expect(p).toHaveProperty('description');
            expect(p).toHaveProperty('type');
            expect(p).toHaveProperty('projectScope');
            expect(p).toHaveProperty('technologies');
            expect(p).toHaveProperty('repo');
            expect(p).toHaveProperty('live');
            expect(Array.isArray(p.technologies)).toBe(true);
        });
    });

    it('has valid type values', () => {
        projectData.forEach(p => {
            expect(['frontend', 'backend', 'fullstack']).toContain(p.type);
        });
    });

    it('has valid projectScope values', () => {
        projectData.forEach(p => {
            expect(['personal', 'work']).toContain(p.projectScope);
        });
    });

    it('has unique ids', () => {
        const ids = projectData.map(p => p.id);
        const unique = new Set(ids);
        expect(unique.size).toBe(ids.length);
    });

    it('each project has technologies array with content', () => {
        projectData.forEach(p => {
            expect(p.technologies.length).toBeGreaterThan(0);
        });
    });

    it('has unique titles', () => {
        const titles = projectData.map(p => p.title);
        const unique = new Set(titles);
        expect(unique.size).toBe(titles.length);
    });
});