import { describe, it, expect, vi } from 'vitest';
import { mapApiProject, mapApiProjects } from '../features/modals/projects/services/projectMapper';

vi.mock('../utils/assets', () => ({ getAssetPath: (path) => `/assets${path}` }));

const apiProject = (overrides = {}) => ({
    id: 'repo',
    title: 'Repo',
    description: 'Descrizione',
    projectScope: 'work',
    type: 'backend',
    technologies: ['PHP'],
    repo: 'https://github.com/mirkobechini/repo',
    live: 'https://repo.example.com',
    stars: 3,
    updatedAt: '2026-01-01T00:00:00+00:00',
    pinned: true,
    group: { id: 1, name: 'Cliente A' },
    ...overrides,
});

describe('mapApiProject', () => {
    it("mantiene i campi dell'API e aggiunge l'anteprima segnaposto", () => {
        const result = mapApiProject(apiProject());

        expect(result).toMatchObject(apiProject());
        expect(result.preview).toBe('/assets/modals/placeholder/project-placeholder.webp');
    });

    it('live mancante diventa "#"', () => {
        expect(mapApiProject(apiProject({ live: null })).live).toBe('#');
    });

    it('applica i valori di sicurezza ai campi mancanti', () => {
        const result = mapApiProject(apiProject({ description: null, technologies: null, stars: null }));

        expect(result.description).toBe('');
        expect(result.technologies).toEqual([]);
        expect(result.stars).toBe(0);
    });
});

describe('anteprima del progetto', () => {
    it('senza anteprima caricata usa il segnaposto e lo segnala', () => {
        const result = mapApiProject(apiProject({ preview: null }));

        expect(result.preview).toBe('/assets/modals/placeholder/project-placeholder.webp');
        expect(result.hasCustomPreview).toBe(false);
    });

    it("con un'anteprima caricata (URL completo o /storage/...) la usa com'è", () => {
        const url = 'https://sito.example.com/storage/projects/previews/a.png';

        expect(mapApiProject(apiProject({ preview: url })).preview).toBe(url);
        expect(mapApiProject(apiProject({ preview: '/storage/projects/previews/a.png' })).preview).toBe('/storage/projects/previews/a.png');
        expect(mapApiProject(apiProject({ preview: url })).hasCustomPreview).toBe(true);
    });
});

describe('mapApiProjects', () => {
    it("conserva l'ordine deciso dal backend", () => {
        const result = mapApiProjects([apiProject({ id: 'b' }), apiProject({ id: 'a' })]);

        expect(result.map((p) => p.id)).toEqual(['b', 'a']);
    });

    it('con lista vuota restituisce una lista vuota', () => {
        expect(mapApiProjects([])).toEqual([]);
    });
});
