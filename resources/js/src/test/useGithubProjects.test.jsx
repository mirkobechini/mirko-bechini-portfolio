import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import useGithubProjects from '../hooks/useGithubProjects';
import { getRepos } from '../features/modals/projects/services/githubApi';
import fallbackProjects from '../features/modals/projects/services/fallbackProjects';

// Mock del service: nessuna chiamata di rete reale
vi.mock('../features/modals/projects/services/githubApi', () => ({
    getRepos: vi.fn(),
}));
vi.mock('../utils/assets', () => ({ getAssetPath: (path) => `/assets${path}` }));

const CACHE_KEY = 'github_projects_cache_v2'; // stessa chiave dell'hook

// Repo GitHub grezzo, minimo indispensabile per il mapper
const fakeRepo = {
    name: 'repo-test',
    html_url: 'https://github.com/mirkobechini/repo-test',
    language: 'JavaScript',
    topics: [],
    stargazers_count: 0,
    pushed_at: '2026-01-01T00:00:00Z',
};

// Progetto già nel formato card, per riempire la cache
const cachedProject = { id: 'cached', title: 'cached', technologies: [] };

// Scrive la cache a mano: expiryOffsetMs > 0 = valida, < 0 = scaduta
function seedCache(data, expiryOffsetMs) {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, expiry: Date.now() + expiryOffsetMs }));
}

beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => { });
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('useGithubProjects', () => {
    // 1. Primo accesso, niente cache, API ok
    it('senza cache carica i repo, poi loading diventa false', async () => {
        getRepos.mockResolvedValue([fakeRepo]);

        const { result } = renderHook(() => useGithubProjects());

        expect(result.current.loading).toBe(true);

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.projects).toHaveLength(1);
        expect(result.current.projects[0].id).toBe('repo-test');
        expect(result.current.error).toBeNull();
    });

    // 2. Cache valida: nessuna chiamata di rete
    it('con cache valida non chiama getRepos e loading è false', async () => {
        seedCache([cachedProject], 60_000);

        const { result } = renderHook(() => useGithubProjects());

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.projects).toHaveLength(1);
        expect(result.current.projects[0].id).toBe('cached');
        expect(getRepos).not.toHaveBeenCalled();
    });

    // 3. Cache scaduta + API che fallisce: deve usare i dati stale
    it('con cache scaduta e API in errore mostra i dati stale e valorizza error', async () => {
        seedCache([cachedProject], -1000);
        getRepos.mockRejectedValue(new Error('down'));

        const { result } = renderHook(() => useGithubProjects());

        await waitFor(() => expect(result.current.error).not.toBeNull());
        expect(result.current.projects).toHaveLength(1);
        expect(result.current.projects[0].id).toBe('cached');
    });

    // 4. Nessuna cache + API che fallisce: fallback statico
    it('senza cache e con API in errore usa il fallback statico e loading è false', async () => {
        getRepos.mockRejectedValue(new Error('down'));

        const { result } = renderHook(() => useGithubProjects());

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.projects.length).toBeGreaterThan(0);
        expect(result.current.projects[0].id).toBe('gods-backoffice');
        expect(result.current.projects).toEqual(fallbackProjects);

    });

    // 5. refetch dopo un errore
    it('refetch richiama getRepos e aggiorna i progetti', async () => {
        getRepos.mockRejectedValue(new Error('down'));
        seedCache([cachedProject], -1000);

        const { result } = renderHook(() => useGithubProjects());

        await waitFor(() => expect(result.current.error).not.toBeNull());
        getRepos.mockResolvedValue([fakeRepo]);

        await act(async () => {
            await result.current.refetch();
        });

        expect(result.current.projects).toHaveLength(1);
        expect(result.current.projects[0].id).toBe('repo-test');
    });

    // 6. Dopo un fetch riuscito la cache viene scritta
    it('dopo un fetch riuscito salva i dati in localStorage con una scadenza', async () => {
        getRepos.mockResolvedValue([fakeRepo]);

        const { result } = renderHook(() => useGithubProjects());

        await waitFor(() => expect(result.current.loading).toBe(false));

        const cachedData = JSON.parse(localStorage.getItem(CACHE_KEY));
        expect(cachedData.data).toHaveLength(1);
        expect(cachedData.data[0].id).toBe('repo-test');
        expect(cachedData.expiry).toBeGreaterThan(Date.now());
    });
});
