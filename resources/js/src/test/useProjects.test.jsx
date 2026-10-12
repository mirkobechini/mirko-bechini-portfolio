import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import useProjects from '../hooks/useProjects';
import { getProjects } from '../features/modals/projects/services/projectsApi';
import fallbackProjects from '../features/modals/projects/services/fallbackProjects';

// Nessuna chiamata di rete reale
vi.mock('../features/modals/projects/services/projectsApi', () => ({
    getProjects: vi.fn(),
}));
vi.mock('../utils/assets', () => ({ getAssetPath: (path) => `/assets${path}` }));

const CACHE_KEY = 'projects_api_cache_v1'; // stessa chiave dell'hook

const apiProject = { id: 'repo-test', title: 'Repo test', technologies: ['PHP'], live: null, stars: 0 };
const cachedProject = { id: 'cached', title: 'cached', technologies: [] };

// expiryOffsetMs > 0 = cache valida, < 0 = scaduta
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

describe('useProjects', () => {
    it("senza cache chiama l'API, mappa i progetti e li salva in cache", async () => {
        getProjects.mockResolvedValue([apiProject]);

        const { result } = renderHook(() => useProjects());

        expect(result.current.loading).toBe(true);
        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.projects).toHaveLength(1);
        expect(result.current.projects[0].id).toBe('repo-test');
        expect(result.current.projects[0].preview).toBe('/assets/modals/placeholder/project-placeholder.webp');
        expect(result.current.projects[0].live).toBe('#');
        expect(result.current.error).toBeNull();
        expect(JSON.parse(localStorage.getItem(CACHE_KEY)).data).toHaveLength(1);
    });

    it("con cache valida non chiama l'API", async () => {
        seedCache([cachedProject], 60_000);

        const { result } = renderHook(() => useProjects());

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.projects[0].id).toBe('cached');
        expect(getProjects).not.toHaveBeenCalled();
    });

    it('con cache scaduta mostra subito i dati vecchi e poi li aggiorna', async () => {
        seedCache([cachedProject], -1000);
        getProjects.mockResolvedValue([apiProject]);

        const { result } = renderHook(() => useProjects());

        expect(result.current.projects[0].id).toBe('cached');
        await waitFor(() => expect(result.current.projects[0].id).toBe('repo-test'));
        expect(result.current.error).toBeNull();
    });

    it("con cache scaduta e API in errore usa i dati scaduti e valorizza error", async () => {
        seedCache([cachedProject], -1000);
        getProjects.mockRejectedValue(new Error('down'));

        const { result } = renderHook(() => useProjects());

        await waitFor(() => expect(result.current.error).not.toBeNull());
        expect(result.current.projects[0].id).toBe('cached');
    });

    it("senza cache e con API in errore usa i dati statici", async () => {
        getProjects.mockRejectedValue(new Error('down'));

        const { result } = renderHook(() => useProjects());

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.error).not.toBeNull();
        expect(result.current.projects).toEqual(fallbackProjects);
    });

    it("un'API che risponde con lista vuota viene trattata come errore", async () => {
        getProjects.mockResolvedValue([]);

        const { result } = renderHook(() => useProjects());

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.projects).toEqual(fallbackProjects);
        expect(result.current.error).not.toBeNull();
        expect(localStorage.getItem(CACHE_KEY)).toBeNull();
    });

    it("refetch riprova e azzera l'errore", async () => {
        getProjects.mockRejectedValueOnce(new Error('down'));
        const { result } = renderHook(() => useProjects());
        await waitFor(() => expect(result.current.error).not.toBeNull());

        getProjects.mockResolvedValue([apiProject]);
        await act(async () => {
            await result.current.refetch();
        });

        expect(result.current.error).toBeNull();
        expect(result.current.projects[0].id).toBe('repo-test');
    });
});
