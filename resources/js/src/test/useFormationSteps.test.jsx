import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import useFormationSteps from '../hooks/useFormationSteps';
import { getFormationSteps } from '../features/modals/library/formationStepsApi';
import formationStepsData from '../features/modals/library/formationStepsData';

vi.mock('../features/modals/library/formationStepsApi', async (importOriginal) => ({
    ...(await importOriginal()),
    getFormationSteps: vi.fn(),
}));

const CACHE_KEY = 'formation_steps_api_cache_v1'; // stessa chiave dell'hook

const apiStep = (id, kind) => ({ id, kind, title: `P${id}`, description: 'd', status: 'next', badge: null });

beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => { });
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('useFormationSteps', () => {
    it("carica i passi dall'API e li divide nelle due colonne", async () => {
        getFormationSteps.mockResolvedValue([apiStep(1, 'focus'), apiStep(2, 'roadmap'), apiStep(3, 'roadmap')]);

        const { result } = renderHook(() => useFormationSteps());

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.focus.map((s) => s.id)).toEqual([1]);
        expect(result.current.roadmap.map((s) => s.id)).toEqual([2, 3]);
        expect(result.current.focus[0].badge).toBe('');
        expect(JSON.parse(localStorage.getItem(CACHE_KEY)).data).toHaveLength(3);
    });

    it("con cache valida mostra subito i dati e li ricontrolla in background", async () => {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data: [apiStep(9, 'focus')], expiry: Date.now() + 60_000 }));

        const { result } = renderHook(() => useFormationSteps());

        expect(result.current.loading).toBe(false); // nessuna attesa: i dati freschi ci sono già
        expect(result.current.focus[0].id).toBe(9);
        await waitFor(() => expect(getFormationSteps).toHaveBeenCalledTimes(1)); // ricontrollo in background
    });

    it("se l'API fallisce e non c'è cache usa formationStepsData.js", async () => {
        getFormationSteps.mockRejectedValue(new Error('down'));

        const { result } = renderHook(() => useFormationSteps());

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.focus).toHaveLength(formationStepsData.filter((s) => s.kind === 'focus').length);
        expect(result.current.roadmap).toHaveLength(formationStepsData.filter((s) => s.kind === 'roadmap').length);
        expect(result.current.error).toBe('Impossibile caricare il percorso di formazione.');
    });
});
