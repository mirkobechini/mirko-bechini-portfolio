import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import useSkills from '../hooks/useSkills';
import { getSkills } from '../features/modals/library/skillsApi';
import skillsData from '../features/modals/library/skillsData';

vi.mock('../features/modals/library/skillsApi', async (importOriginal) => ({
    ...(await importOriginal()),
    getSkills: vi.fn(),
}));
vi.mock('../utils/assets', () => ({ getAssetPath: (path) => `/assets${path}` }));

const CACHE_KEY = 'skills_api_cache_v1'; // stessa chiave dell'hook

const apiSkill = { id: 9, skill: 'PHP', icon: '/modals/skills/icons/php.webp', category: 'Backend', color: '#777BB4', functions: [], relatedProjects: [] };

beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => { });
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('useSkills', () => {
    it("carica le skill dall'API e le mappa", async () => {
        getSkills.mockResolvedValue([apiSkill]);

        const { result } = renderHook(() => useSkills());

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.skills).toHaveLength(1);
        expect(result.current.skills[0].icon).toBe('/assets/modals/skills/icons/php.webp');
        expect(result.current.error).toBeNull();
        expect(JSON.parse(localStorage.getItem(CACHE_KEY)).data).toHaveLength(1);
    });

    it("con cache valida mostra subito i dati e li ricontrolla in background", async () => {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data: [{ id: 1, skill: 'Cache' }], expiry: Date.now() + 60_000 }));

        const { result } = renderHook(() => useSkills());

        expect(result.current.loading).toBe(false); // nessuna attesa: i dati freschi ci sono già
        expect(result.current.skills[0].skill).toBe('Cache');
        await waitFor(() => expect(getSkills).toHaveBeenCalledTimes(1)); // ricontrollo in background
    });

    it("se l'API fallisce e non c'è cache usa skillsData.js", async () => {
        getSkills.mockRejectedValue(new Error('down'));

        const { result } = renderHook(() => useSkills());

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.skills).toEqual(skillsData);
        expect(result.current.error).toBe('Impossibile caricare le competenze.');
    });
});
