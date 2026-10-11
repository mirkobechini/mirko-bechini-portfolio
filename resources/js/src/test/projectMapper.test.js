import { describe, it, expect, vi } from 'vitest';
import { transformRepos, mapRepoToProject, filterRepos } from '../features/modals/projects/services/projectMapper';

vi.mock('../utils/assets', () => ({ getAssetPath: (path) => `/assets${path}` }));

// Meta controllato dal test: così non dipende dai dati reali di projectsMeta.js
vi.mock('../features/modals/projects/services/projectsMeta', () => ({
    default: {
        'hidden-repo': { exclude: true },
        'pinned-old': { type: 'backend', projectScope: 'work', pinned: true, description: 'Fissato' },
        'plain-new': { type: 'frontend', projectScope: 'personal' },
    },
}));

const repo = (overrides = {}) => ({
    name: 'x',
    description: null,
    html_url: 'https://github.com/mirkobechini/x',
    homepage: null,
    language: null,
    topics: [],
    stargazers_count: 0,
    pushed_at: '2026-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    ...overrides,
});

describe('filterRepos', () => {
    it('esclude i repo con exclude: true e tiene gli altri (anche senza meta)', () => {
        const result = filterRepos([repo({ name: 'hidden-repo' }), repo({ name: 'plain-new' }), repo({ name: 'sconosciuto' })]);

        expect(result.map((r) => r.name)).toEqual(['plain-new', 'sconosciuto']);
    });
});

describe('mapRepoToProject', () => {
    it('senza meta usa i default: fullstack, personal, placeholder, descrizione del repo', () => {
        const result = mapRepoToProject(repo({ description: 'Desc GitHub' }), {});

        expect(result.type).toBe('fullstack');
        expect(result.projectScope).toBe('personal');
        expect(result.description).toBe('Desc GitHub');
        expect(result.preview).toBe('/assets/modals/placeholder/project-placeholder.webp');
        expect(result.pinned).toBe(false);
    });

    it('la descrizione del meta ha la precedenza su quella di GitHub', () => {
        const result = mapRepoToProject(repo({ description: 'EN' }), { description: 'IT' });

        expect(result.description).toBe('IT');
    });

    it('senza nessuna descrizione restituisce una stringa vuota', () => {
        expect(mapRepoToProject(repo(), {}).description).toBe('');
    });

    it('unisce linguaggio, topics ed extra senza duplicati', () => {
        const result = mapRepoToProject(
            repo({ language: 'PHP', topics: ['laravel', 'PHP'] }),
            { extraTechnologies: ['laravel', 'AI'] }
        );

        expect(result.technologies).toEqual(['PHP', 'laravel', 'AI']);
    });

    it('usa pushed_at per updatedAt, con fallback su updated_at', () => {
        expect(mapRepoToProject(repo(), {}).updatedAt).toBe('2026-01-01T00:00:00Z');
        expect(mapRepoToProject(repo({ pushed_at: null }), {}).updatedAt).toBe('2025-01-01T00:00:00Z');
    });

    it('stars vale 0 se GitHub non lo fornisce', () => {
        expect(mapRepoToProject(repo({ stargazers_count: undefined }), {}).stars).toBe(0);
    });
});

describe('transformRepos - ordinamento', () => {
    it('mette prima i pinned, anche se meno recenti', () => {
        const result = transformRepos([
            repo({ name: 'plain-new', pushed_at: '2026-06-01T00:00:00Z' }),
            repo({ name: 'pinned-old', pushed_at: '2020-01-01T00:00:00Z' }),
        ]);

        expect(result.map((p) => p.id)).toEqual(['pinned-old', 'plain-new']);
    });

    it('a parità di pinned ordina per data, dal più recente', () => {
        const result = transformRepos([
            repo({ name: 'a', pushed_at: '2024-01-01T00:00:00Z' }),
            repo({ name: 'b', pushed_at: '2026-01-01T00:00:00Z' }),
            repo({ name: 'c', pushed_at: '2025-01-01T00:00:00Z' }),
        ]);

        expect(result.map((p) => p.id)).toEqual(['b', 'c', 'a']);
    });

    it('i repo senza data finiscono in fondo', () => {
        const result = transformRepos([
            repo({ name: 'senza-data', pushed_at: null, updated_at: null }),
            repo({ name: 'con-data' }),
        ]);

        expect(result.map((p) => p.id)).toEqual(['con-data', 'senza-data']);
    });

    it('scarta i repo esclusi dal meta', () => {
        const result = transformRepos([repo({ name: 'hidden-repo' }), repo({ name: 'altro' })]);

        expect(result.map((p) => p.id)).toEqual(['altro']);
    });

    it('con lista vuota restituisce una lista vuota', () => {
        expect(transformRepos([])).toEqual([]);
    });
});
